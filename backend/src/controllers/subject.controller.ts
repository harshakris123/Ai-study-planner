import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { CreateSubjectRequest, UpdateSubjectRequest } from '../types/subject.types';

export class SubjectController {
  // Create a new subject
  static async createSubject(req: Request, res: Response) {
    try {
      // @ts-ignore
      const userId = req.user.userId;
      const { 
        name, 
        difficultyLevel, 
        totalHoursRequired, 
        deadline, 
        color,
        prerequisiteIds 
      }: CreateSubjectRequest = req.body;

      // Validation
      if (!name || !difficultyLevel || !totalHoursRequired) {
        return res.status(400).json({
          error: 'Name, difficulty level, and total hours are required',
        });
      }

      if (difficultyLevel < 1 || difficultyLevel > 5) {
        return res.status(400).json({
          error: 'Difficulty level must be between 1 and 5',
        });
      }

      if (totalHoursRequired <= 0) {
        return res.status(400).json({
          error: 'Total hours must be greater than 0',
        });
      }

      // Create subject
      const subject = await prisma.subject.create({
        data: {
          userId,
          name,
          difficultyLevel,
          totalHoursRequired,
          deadline: deadline ? new Date(deadline) : null,
          color: color || '#3B82F6',
        },
      });

      // Add prerequisites if provided
      if (prerequisiteIds && prerequisiteIds.length > 0) {
        await prisma.prerequisite.createMany({
          data: prerequisiteIds.map(prereqId => ({
            subjectId: subject.id,
            prerequisiteSubjectId: prereqId,
          })),
        });
      }

      // Fetch complete subject with prerequisites
      const completeSubject = await prisma.subject.findUnique({
        where: { id: subject.id },
        include: {
          prerequisites: {
            include: {
              prerequisiteSubject: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      return res.status(201).json({
        message: 'Subject created successfully',
        subject: {
          ...completeSubject,
          progress: 0,
          prerequisites: completeSubject?.prerequisites.map(p => p.prerequisiteSubject) || [],
        },
      });
    } catch (error) {
      console.error('Create subject error:', error);
      return res.status(500).json({
        error: 'Internal server error',
      });
    }
  }

  // Get all subjects for a user
  static async getAllSubjects(req: Request, res: Response) {
    try {
      // @ts-ignore
      const userId = req.user.userId;

      const subjects = await prisma.subject.findMany({
        where: { userId },
        include: {
          prerequisites: {
            include: {
              prerequisiteSubject: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          topics: {
            select: {
              id: true,
              name: true,
              estimatedHours: true,
              isCompleted: true,
              order: true,
            },
            orderBy: {
              order: 'asc',
            },
          },
          _count: {
            select: {
              topics: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Calculate progress for each subject
      const subjectsWithProgress = subjects.map(subject => ({
        ...subject,
        progress: subject.totalHoursRequired > 0 
          ? Math.round((subject.hoursCompleted / subject.totalHoursRequired) * 100)
          : 0,
        prerequisites: subject.prerequisites.map(p => p.prerequisiteSubject),
      }));

      return res.status(200).json({
        subjects: subjectsWithProgress,
        total: subjects.length,
      });
    } catch (error) {
      console.error('Get all subjects error:', error);
      return res.status(500).json({
        error: 'Internal server error',
      });
    }
  }

  // Get a single subject by ID
  static async getSubjectById(req: Request, res: Response) {
    try {
      // @ts-ignore
      const userId = req.user.userId;
      const id = req.params.id as string;

      const subject = await prisma.subject.findFirst({
        where: { 
          id,
          userId, // Ensure user owns this subject
        },
        include: {
          prerequisites: {
            include: {
              prerequisiteSubject: {
                select: {
                  id: true,
                  name: true,
                  hoursCompleted: true,
                  totalHoursRequired: true,
                },
              },
            },
          },
          topics: {
            select: {
              id: true,
              name: true,
              estimatedHours: true,
              isCompleted: true,
              order: true,
            },
            orderBy: {
              order: 'asc',
            },
          },
          studySessions: {
            select: {
              id: true,
              scheduledStart: true,
              scheduledEnd: true,
              status: true,
            },
            orderBy: {
              scheduledStart: 'desc',
            },
            take: 10, // Get last 10 sessions
          },
        },
      });

      if (!subject) {
        return res.status(404).json({
          error: 'Subject not found',
        });
      }

      // Calculate progress
      const progress = subject.totalHoursRequired > 0
        ? Math.round((subject.hoursCompleted / subject.totalHoursRequired) * 100)
        : 0;

      return res.status(200).json({
        subject: {
          ...subject,
          progress,
          prerequisites: subject.prerequisites.map(p => ({
            ...p.prerequisiteSubject,
            progress: p.prerequisiteSubject.totalHoursRequired > 0
              ? Math.round((p.prerequisiteSubject.hoursCompleted / p.prerequisiteSubject.totalHoursRequired) * 100)
              : 0,
          })),
        },
      });
    } catch (error) {
      console.error('Get subject by ID error:', error);
      return res.status(500).json({
        error: 'Internal server error',
      });
    }
  }

  // Update a subject
  static async updateSubject(req: Request, res: Response) {
    try {
      // @ts-ignore
      const userId = req.user.userId;
      const { id } = req.params as { id: string };
      const updateData: UpdateSubjectRequest = req.body;

      // Check if subject exists and belongs to user
      const existingSubject = await prisma.subject.findFirst({
        where: { id, userId },
      });

      if (!existingSubject) {
        return res.status(404).json({
          error: 'Subject not found',
        });
      }

      // Validate difficulty level if provided
      if (updateData.difficultyLevel && (updateData.difficultyLevel < 1 || updateData.difficultyLevel > 5)) {
        return res.status(400).json({
          error: 'Difficulty level must be between 1 and 5',
        });
      }

      // Prepare update object
      const updateObject: any = {};
      
      if (updateData.name !== undefined) updateObject.name = updateData.name;
      if (updateData.difficultyLevel !== undefined) updateObject.difficultyLevel = updateData.difficultyLevel;
      if (updateData.totalHoursRequired !== undefined) updateObject.totalHoursRequired = updateData.totalHoursRequired;
      if (updateData.hoursCompleted !== undefined) updateObject.hoursCompleted = updateData.hoursCompleted;
      if (updateData.color !== undefined) updateObject.color = updateData.color;
      if (updateData.deadline !== undefined) {
        updateObject.deadline = updateData.deadline ? new Date(updateData.deadline) : null;
      }

      // Update subject
      const updatedSubject = await prisma.subject.update({
        where: { id },
        data: updateObject,
      });

      // Handle prerequisites update if provided
      if (updateData.prerequisiteIds !== undefined) {
        // Delete existing prerequisites
        await prisma.prerequisite.deleteMany({
          where: { subjectId: id },
        });

        // Add new prerequisites
        if (updateData.prerequisiteIds.length > 0) {
          await prisma.prerequisite.createMany({
            data: updateData.prerequisiteIds.map(prereqId => ({
              subjectId: id,
              prerequisiteSubjectId: prereqId,
            })),
          });
        }
      }

      // Fetch complete updated subject
      const completeSubject = await prisma.subject.findUnique({
        where: { id },
        include: {
          prerequisites: {
            include: {
              prerequisiteSubject: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          topics: {
            select: {
              id: true,
              name: true,
              estimatedHours: true,
              isCompleted: true,
            },
          },
        },
      });

      const progress = completeSubject!.totalHoursRequired > 0
        ? Math.round((completeSubject!.hoursCompleted / completeSubject!.totalHoursRequired) * 100)
        : 0;

      return res.status(200).json({
        message: 'Subject updated successfully',
        subject: {
          ...completeSubject,
          progress,
          prerequisites: completeSubject?.prerequisites.map(p => p.prerequisiteSubject) || [],
        },
      });
    } catch (error) {
      console.error('Update subject error:', error);
      return res.status(500).json({
        error: 'Internal server error',
      });
    }
  }

  // Delete a subject
  static async deleteSubject(req: Request, res: Response) {
    try {
      // @ts-ignore
      const userId = req.user.userId;
      const { id } = req.params as { id: string };

      // Check if subject exists and belongs to user
      const subject = await prisma.subject.findFirst({
        where: { id, userId },
      });

      if (!subject) {
        return res.status(404).json({
          error: 'Subject not found',
        });
      }

      // Delete subject (cascade will handle prerequisites, topics, sessions)
      await prisma.subject.delete({
        where: { id },
      });

      return res.status(200).json({
        message: 'Subject deleted successfully',
      });
    } catch (error) {
      console.error('Delete subject error:', error);
      return res.status(500).json({
        error: 'Internal server error',
      });
    }
  }

  // Get subject statistics
  static async getSubjectStats(req: Request, res: Response) {
    try {
      // @ts-ignore
      const userId = req.user.userId;

      const subjects = await prisma.subject.findMany({
        where: { userId },
        select: {
          id: true,
          name: true,
          difficultyLevel: true,
          totalHoursRequired: true,
          hoursCompleted: true,
          deadline: true,
        },
      });

      const totalSubjects = subjects.length;
      const totalHoursRequired = subjects.reduce((sum, s) => sum + s.totalHoursRequired, 0);
      const totalHoursCompleted = subjects.reduce((sum, s) => sum + s.hoursCompleted, 0);
      const overallProgress = totalHoursRequired > 0 
        ? Math.round((totalHoursCompleted / totalHoursRequired) * 100)
        : 0;

      // Count subjects by difficulty
      const difficultyDistribution = {
        easy: subjects.filter(s => s.difficultyLevel <= 2).length,
        medium: subjects.filter(s => s.difficultyLevel === 3).length,
        hard: subjects.filter(s => s.difficultyLevel >= 4).length,
      };

      // Find subjects with upcoming deadlines (within next 7 days)
      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const upcomingDeadlines = subjects
        .filter(s => s.deadline && s.deadline >= now && s.deadline <= nextWeek)
        .map(s => ({
          id: s.id,
          name: s.name,
          deadline: s.deadline,
        }));

      return res.status(200).json({
        stats: {
          totalSubjects,
          totalHoursRequired,
          totalHoursCompleted,
          overallProgress,
          difficultyDistribution,
          upcomingDeadlines,
        },
      });
    } catch (error) {
      console.error('Get subject stats error:', error);
      return res.status(500).json({
        error: 'Internal server error',
      });
    }
  }
}