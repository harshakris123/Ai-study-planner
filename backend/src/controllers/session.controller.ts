import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export class SessionController {
  // Create a new study session
  static async createSession(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { subjectId, topicId, scheduledStart, scheduledEnd, notes } = req.body;

      // Validation
      if (!subjectId || !scheduledStart || !scheduledEnd) {
        return res.status(400).json({
          error: 'Subject ID, scheduled start, and scheduled end are required',
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

      // Verify topic if provided
      if (topicId) {
        const topic = await prisma.topic.findFirst({
          where: { id: topicId, subjectId },
        });

        if (!topic) {
          return res.status(404).json({
            error: 'Topic not found',
          });
        }
      }

      // Validate dates
      const start = new Date(scheduledStart);
      const end = new Date(scheduledEnd);

      if (end <= start) {
        return res.status(400).json({
          error: 'Scheduled end must be after scheduled start',
        });
      }

      // Create session
      const session = await prisma.studySession.create({
        data: {
          userId,
          subjectId,
          topicId: topicId || null,
          scheduledStart: start,
          scheduledEnd: end,
          notes: notes || null,
        },
        include: {
          subject: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
          topic: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return res.status(201).json({
        message: 'Study session created successfully',
        session,
      });
    } catch (error) {
      console.error('Create session error:', error);
      return res.status(500).json({
        error: 'Internal server error',
      });
    }
  }

  // Get all sessions for a user
  static async getAllSessions(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { status, subjectId, startDate, endDate } = req.query;

      // Build filter
      const where: any = { userId };

      if (status) {
        where.status = status;
      }

      if (subjectId) {
        where.subjectId = subjectId;
      }

      if (startDate || endDate) {
        where.scheduledStart = {};
        if (startDate) {
          where.scheduledStart.gte = new Date(startDate as string);
        }
        if (endDate) {
          where.scheduledStart.lte = new Date(endDate as string);
        }
      }

      const sessions = await prisma.studySession.findMany({
        where,
        include: {
          subject: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
          topic: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          scheduledStart: 'desc',
        },
      });

      return res.status(200).json({
        sessions,
        total: sessions.length,
      });
    } catch (error) {
      console.error('Get all sessions error:', error);
      return res.status(500).json({
        error: 'Internal server error',
      });
    }
  }

  // Get session by ID
  static async getSessionById(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const id = req.params.id as string;

      const session = await prisma.studySession.findFirst({
        where: { id, userId },
        include: {
          subject: {
            select: {
              id: true,
              name: true,
              color: true,
              difficultyLevel: true,
            },
          },
          topic: {
            select: {
              id: true,
              name: true,
              estimatedHours: true,
              isCompleted: true,
            },
          },
        },
      });

      if (!session) {
        return res.status(404).json({
          error: 'Session not found',
        });
      }

      return res.status(200).json({
        session,
      });
    } catch (error) {
      console.error('Get session by ID error:', error);
      return res.status(500).json({
        error: 'Internal server error',
      });
    }
  }

  // Update a session
  static async updateSession(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const id = req.params.id as string;
      const updateData = req.body;

      // Check if session exists and belongs to user
      const existingSession = await prisma.studySession.findFirst({
        where: { id, userId },
      });

      if (!existingSession) {
        return res.status(404).json({
          error: 'Session not found',
        });
      }

      // Validate focus score if provided
      if (updateData.focusScore !== undefined) {
        if (updateData.focusScore < 1 || updateData.focusScore > 10) {
          return res.status(400).json({
            error: 'Focus score must be between 1 and 10',
          });
        }
      }

      // Validate status if provided
      if (updateData.status !== undefined) {
        const validStatuses = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'MISSED'];
        if (!validStatuses.includes(updateData.status)) {
          return res.status(400).json({
            error: 'Invalid status',
          });
        }
      }

      // Prepare update object
      const updateObject: any = {};
      if (updateData.scheduledStart !== undefined) 
        updateObject.scheduledStart = new Date(updateData.scheduledStart);
      if (updateData.scheduledEnd !== undefined) 
        updateObject.scheduledEnd = new Date(updateData.scheduledEnd);
      if (updateData.actualStart !== undefined) 
        updateObject.actualStart = updateData.actualStart ? new Date(updateData.actualStart) : null;
      if (updateData.actualEnd !== undefined) 
        updateObject.actualEnd = updateData.actualEnd ? new Date(updateData.actualEnd) : null;
      if (updateData.status !== undefined) 
        updateObject.status = updateData.status;
      if (updateData.focusScore !== undefined) 
        updateObject.focusScore = updateData.focusScore;
      if (updateData.notes !== undefined) 
        updateObject.notes = updateData.notes;

      // Update session
      const updatedSession = await prisma.studySession.update({
        where: { id },
        data: updateObject,
        include: {
          subject: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
          topic: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return res.status(200).json({
        message: 'Session updated successfully',
        session: updatedSession,
      });
    } catch (error) {
      console.error('Update session error:', error);
      return res.status(500).json({
        error: 'Internal server error',
      });
    }
  }

  // Delete a session
  static async deleteSession(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const id = req.params.id as string;

      // Check if session exists and belongs to user
      const session = await prisma.studySession.findFirst({
        where: { id, userId },
      });

      if (!session) {
        return res.status(404).json({
          error: 'Session not found',
        });
      }

      await prisma.studySession.delete({
        where: { id },
      });

      return res.status(200).json({
        message: 'Session deleted successfully',
      });
    } catch (error) {
      console.error('Delete session error:', error);
      return res.status(500).json({
        error: 'Internal server error',
      });
    }
  }

  // Start a session
  static async startSession(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const id = req.params.id as string;

      const session = await prisma.studySession.findFirst({
        where: { id, userId },
      });

      if (!session) {
        return res.status(404).json({
          error: 'Session not found',
        });
      }

      const updatedSession = await prisma.studySession.update({
        where: { id },
        data: {
          status: 'IN_PROGRESS',
          actualStart: new Date(),
        },
        include: {
          subject: true,
          topic: true,
        },
      });

      return res.status(200).json({
        message: 'Session started',
        session: updatedSession,
      });
    } catch (error) {
      console.error('Start session error:', error);
      return res.status(500).json({
        error: 'Internal server error',
      });
    }
  }

  // Complete a session
  static async completeSession(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const id = req.params.id as string;
      const { focusScore, notes } = req.body;

      const session = await prisma.studySession.findFirst({
        where: { id, userId },
      });

      if (!session) {
        return res.status(404).json({
          error: 'Session not found',
        });
      }

      // Validate focus score if provided
      if (focusScore !== undefined && (focusScore < 1 || focusScore > 10)) {
        return res.status(400).json({
          error: 'Focus score must be between 1 and 10',
        });
      }

      const updatedSession = await prisma.studySession.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          actualEnd: new Date(),
          focusScore: focusScore || null,
          notes: notes || session.notes,
        },
        include: {
          subject: true,
          topic: true,
        },
      });

      // Calculate hours studied and update subject
      if (updatedSession.actualStart && updatedSession.actualEnd) {
        const hoursStudied = 
          (updatedSession.actualEnd.getTime() - updatedSession.actualStart.getTime()) / 
          (1000 * 60 * 60);

        await prisma.subject.update({
          where: { id: updatedSession.subjectId },
          data: {
            hoursCompleted: {
              increment: hoursStudied,
            },
          },
        });
      }

      return res.status(200).json({
        message: 'Session completed',
        session: updatedSession,
      });
    } catch (error) {
      console.error('Complete session error:', error);
      return res.status(500).json({
        error: 'Internal server error',
      });
    }
  }

  // Get session statistics
  static async getSessionStats(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;

      const sessions = await prisma.studySession.findMany({
        where: { userId },
        select: {
          status: true,
          actualStart: true,
          actualEnd: true,
          focusScore: true,
        },
      });

      const totalSessions = sessions.length;
      const completedSessions = sessions.filter(s => s.status === 'COMPLETED').length;
      const missedSessions = sessions.filter(s => s.status === 'MISSED').length;
      const inProgressSessions = sessions.filter(s => s.status === 'IN_PROGRESS').length;

      // Calculate total study hours
      let totalHoursStudied = 0;
      sessions.forEach(session => {
        if (session.actualStart && session.actualEnd) {
          const hours = 
            (session.actualEnd.getTime() - session.actualStart.getTime()) / 
            (1000 * 60 * 60);
          totalHoursStudied += hours;
        }
      });

      // Calculate average focus score
      const sessionsWithFocus = sessions.filter(s => s.focusScore !== null);
      const avgFocusScore = sessionsWithFocus.length > 0
        ? sessionsWithFocus.reduce((sum, s) => sum + (s.focusScore || 0), 0) / sessionsWithFocus.length
        : 0;

      return res.status(200).json({
        stats: {
          totalSessions,
          completedSessions,
          missedSessions,
          inProgressSessions,
          scheduledSessions: totalSessions - completedSessions - missedSessions - inProgressSessions,
          totalHoursStudied: Math.round(totalHoursStudied * 10) / 10,
          averageFocusScore: Math.round(avgFocusScore * 10) / 10,
          completionRate: totalSessions > 0 
            ? Math.round((completedSessions / totalSessions) * 100) 
            : 0,
        },
      });
    } catch (error) {
      console.error('Get session stats error:', error);
      return res.status(500).json({
        error: 'Internal server error',
      });
    }
  }
}