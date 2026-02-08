import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export class TopicController {
  // Create a new topic for a subject
  static async createTopic(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { subjectId, name, estimatedHours, order } = req.body;

      // Validation
      if (!subjectId || !name || !estimatedHours) {
        return res.status(400).json({
          error: 'Subject ID, name, and estimated hours are required',
        });
      }

      if (estimatedHours <= 0) {
        return res.status(400).json({
          error: 'Estimated hours must be greater than 0',
        });
      }

      // Verify subject exists and belongs to user
      const subject = await prisma.subject.findFirst({
        where: { id: subjectId, userId },
      });

      if (!subject) {
        return res.status(404).json({
          error: 'Subject not found',
        });
      }

      // Get the next order number if not provided
      let topicOrder = order;
      if (topicOrder === undefined) {
        const lastTopic = await prisma.topic.findFirst({
          where: { subjectId },
          orderBy: { order: 'desc' },
        });
        topicOrder = lastTopic ? lastTopic.order + 1 : 1;
      }

      // Create topic
      const topic = await prisma.topic.create({
        data: {
          subjectId,
          name,
          estimatedHours,
          order: topicOrder,
        },
      });

      return res.status(201).json({
        message: 'Topic created successfully',
        topic,
      });
    } catch (error) {
      console.error('Create topic error:', error);
      return res.status(500).json({
        error: 'Internal server error',
      });
    }
  }

  // Get all topics for a subject
  static async getTopicsBySubject(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const subjectId = req.params.subjectId as string;

      // Verify subject exists and belongs to user
      const subject = await prisma.subject.findFirst({
        where: { id: subjectId, userId },
      });

      if (!subject) {
        return res.status(404).json({
          error: 'Subject not found',
        });
      }

      // Get all topics for this subject
      const topics = await prisma.topic.findMany({
        where: { subjectId },
        orderBy: { order: 'asc' },
      });

      // Calculate completion stats
      const totalTopics = topics.length;
      const completedTopics = topics.filter(t => t.isCompleted).length;
      const completionPercentage = totalTopics > 0 
        ? Math.round((completedTopics / totalTopics) * 100)
        : 0;

      return res.status(200).json({
        topics,
        stats: {
          total: totalTopics,
          completed: completedTopics,
          completionPercentage,
        },
      });
    } catch (error) {
      console.error('Get topics by subject error:', error);
      return res.status(500).json({
        error: 'Internal server error',
      });
    }
  }

  // Get a single topic by ID
  static async getTopicById(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const id = req.params.id as string;

      const topic = await prisma.topic.findFirst({
        where: { id },
        include: {
          subject: {
            select: {
              id: true,
              name: true,
              userId: true,
            },
          },
        },
      });

      if (!topic) {
        return res.status(404).json({
          error: 'Topic not found',
        });
      }

      // Verify user owns the subject
      if (topic.subject.userId !== userId) {
        return res.status(403).json({
          error: 'Access denied',
        });
      }

      return res.status(200).json({
        topic,
      });
    } catch (error) {
      console.error('Get topic by ID error:', error);
      return res.status(500).json({
        error: 'Internal server error',
      });
    }
  }

  // Update a topic
  static async updateTopic(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const id = req.params.id as string;
      const updateData = req.body;

      // Get topic with subject info
      const topic = await prisma.topic.findFirst({
        where: { id },
        include: {
          subject: {
            select: {
              id: true,
              userId: true,
            },
          },
        },
      });

      if (!topic) {
        return res.status(404).json({
          error: 'Topic not found',
        });
      }

      // Verify user owns the subject
      if (topic.subject.userId !== userId) {
        return res.status(403).json({
          error: 'Access denied',
        });
      }

      // Validate estimated hours if provided
      if (updateData.estimatedHours !== undefined && updateData.estimatedHours <= 0) {
        return res.status(400).json({
          error: 'Estimated hours must be greater than 0',
        });
      }

      // Prepare update object
      const updateObject: any = {};
      if (updateData.name !== undefined) updateObject.name = updateData.name;
      if (updateData.estimatedHours !== undefined) updateObject.estimatedHours = updateData.estimatedHours;
      if (updateData.isCompleted !== undefined) updateObject.isCompleted = updateData.isCompleted;
      if (updateData.order !== undefined) updateObject.order = updateData.order;

      // Update topic
      const updatedTopic = await prisma.topic.update({
        where: { id },
        data: updateObject,
      });

      return res.status(200).json({
        message: 'Topic updated successfully',
        topic: updatedTopic,
      });
    } catch (error) {
      console.error('Update topic error:', error);
      return res.status(500).json({
        error: 'Internal server error',
      });
    }
  }

  // Delete a topic
  static async deleteTopic(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const id = req.params.id as string;

      // Get topic with subject info
      const topic = await prisma.topic.findFirst({
        where: { id },
        include: {
          subject: {
            select: {
              userId: true,
            },
          },
        },
      });

      if (!topic) {
        return res.status(404).json({
          error: 'Topic not found',
        });
      }

      // Verify user owns the subject
      if (topic.subject.userId !== userId) {
        return res.status(403).json({
          error: 'Access denied',
        });
      }

      // Delete topic
      await prisma.topic.delete({
        where: { id },
      });

      return res.status(200).json({
        message: 'Topic deleted successfully',
      });
    } catch (error) {
      console.error('Delete topic error:', error);
      return res.status(500).json({
        error: 'Internal server error',
      });
    }
  }

  // Reorder topics
  static async reorderTopics(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const subjectId = req.params.subjectId as string;
      const { topicIds } = req.body;

      if (!topicIds || !Array.isArray(topicIds)) {
        return res.status(400).json({
          error: 'Topic IDs array is required',
        });
      }

      // Verify subject exists and belongs to user
      const subject = await prisma.subject.findFirst({
        where: { id: subjectId, userId },
      });

      if (!subject) {
        return res.status(404).json({
          error: 'Subject not found',
        });
      }

      // Update order for each topic
      const updatePromises = topicIds.map((topicId, index) =>
        prisma.topic.updateMany({
          where: {
            id: topicId,
            subjectId, // Ensure topic belongs to this subject
          },
          data: {
            order: index + 1,
          },
        })
      );

      await Promise.all(updatePromises);

      // Fetch updated topics
      const updatedTopics = await prisma.topic.findMany({
        where: { subjectId },
        orderBy: { order: 'asc' },
      });

      return res.status(200).json({
        message: 'Topics reordered successfully',
        topics: updatedTopics,
      });
    } catch (error) {
      console.error('Reorder topics error:', error);
      return res.status(500).json({
        error: 'Internal server error',
      });
    }
  }

  // Mark topic as completed/incomplete
  static async toggleTopicCompletion(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const id = req.params.id as string;

      // Get topic with subject info
      const topic = await prisma.topic.findFirst({
        where: { id },
        include: {
          subject: {
            select: {
              userId: true,
            },
          },
        },
      });

      if (!topic) {
        return res.status(404).json({
          error: 'Topic not found',
        });
      }

      // Verify user owns the subject
      if (topic.subject.userId !== userId) {
        return res.status(403).json({
          error: 'Access denied',
        });
      }

      // Toggle completion status
      const updatedTopic = await prisma.topic.update({
        where: { id },
        data: {
          isCompleted: !topic.isCompleted,
        },
      });

      return res.status(200).json({
        message: `Topic marked as ${updatedTopic.isCompleted ? 'completed' : 'incomplete'}`,
        topic: updatedTopic,
      });
    } catch (error) {
      console.error('Toggle topic completion error:', error);
      return res.status(500).json({
        error: 'Internal server error',
      });
    }
  }

  // Bulk create topics
  static async bulkCreateTopics(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { subjectId, topics } = req.body;

      if (!subjectId || !topics || !Array.isArray(topics) || topics.length === 0) {
        return res.status(400).json({
          error: 'Subject ID and topics array are required',
        });
      }

      // Verify subject exists and belongs to user
      const subject = await prisma.subject.findFirst({
        where: { id: subjectId, userId },
      });

      if (!subject) {
        return res.status(404).json({
          error: 'Subject not found',
        });
      }

      // Get the current max order
      const lastTopic = await prisma.topic.findFirst({
        where: { subjectId },
        orderBy: { order: 'desc' },
      });
      let currentOrder = lastTopic ? lastTopic.order : 0;

      // Prepare topic data
      const topicsData = topics.map((topic: any) => ({
        subjectId,
        name: topic.name,
        estimatedHours: topic.estimatedHours,
        order: ++currentOrder,
      }));

      // Create all topics
      const createdTopics = await prisma.topic.createMany({
        data: topicsData,
      });

      // Fetch all created topics
      const allTopics = await prisma.topic.findMany({
        where: { subjectId },
        orderBy: { order: 'asc' },
      });

      return res.status(201).json({
        message: `${createdTopics.count} topics created successfully`,
        topics: allTopics,
      });
    } catch (error) {
      console.error('Bulk create topics error:', error);
      return res.status(500).json({
        error: 'Internal server error',
      });
    }
  }
}