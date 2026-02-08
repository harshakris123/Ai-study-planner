import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export class PreferencesController {
  // Get user preferences
  static async getPreferences(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;

      let preferences = await prisma.userPreferences.findUnique({
        where: { userId },
      });

      // If preferences don't exist, create default ones
      if (!preferences) {
        preferences = await prisma.userPreferences.create({
          data: { userId },
        });
      }

      return res.status(200).json({
        preferences,
      });
    } catch (error) {
      console.error('Get preferences error:', error);
      return res.status(500).json({
        error: 'Internal server error',
      });
    }
  }

  // Update user preferences
  static async updatePreferences(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const updateData = req.body;

      // Validation
      if (updateData.studyHoursPerDay !== undefined) {
        if (updateData.studyHoursPerDay < 0.5 || updateData.studyHoursPerDay > 24) {
          return res.status(400).json({
            error: 'Study hours per day must be between 0.5 and 24',
          });
        }
      }

      if (updateData.breakDuration !== undefined) {
        if (updateData.breakDuration < 5 || updateData.breakDuration > 60) {
          return res.status(400).json({
            error: 'Break duration must be between 5 and 60 minutes',
          });
        }
      }

      if (updateData.maxContinuousStudy !== undefined) {
        if (updateData.maxContinuousStudy < 15 || updateData.maxContinuousStudy > 240) {
          return res.status(400).json({
            error: 'Max continuous study must be between 15 and 240 minutes',
          });
        }
      }

      if (updateData.learningPace !== undefined) {
        const validPaces = ['SLOW', 'MEDIUM', 'FAST'];
        if (!validPaces.includes(updateData.learningPace)) {
          return res.status(400).json({
            error: 'Learning pace must be SLOW, MEDIUM, or FAST',
          });
        }
      }

      if (updateData.preferredStudyTimes !== undefined) {
        if (!Array.isArray(updateData.preferredStudyTimes)) {
          return res.status(400).json({
            error: 'Preferred study times must be an array',
          });
        }
        const validTimes = ['morning', 'afternoon', 'evening', 'night'];
        const invalidTimes = updateData.preferredStudyTimes.filter(
          (time: string) => !validTimes.includes(time)
        );
        if (invalidTimes.length > 0) {
          return res.status(400).json({
            error: 'Invalid study time(s): ' + invalidTimes.join(', '),
          });
        }
      }

      // Prepare update object
      const updateObject: any = {};
      if (updateData.studyHoursPerDay !== undefined) 
        updateObject.studyHoursPerDay = updateData.studyHoursPerDay;
      if (updateData.breakDuration !== undefined) 
        updateObject.breakDuration = updateData.breakDuration;
      if (updateData.maxContinuousStudy !== undefined) 
        updateObject.maxContinuousStudy = updateData.maxContinuousStudy;
      if (updateData.learningPace !== undefined) 
        updateObject.learningPace = updateData.learningPace;
      if (updateData.preferredStudyTimes !== undefined) 
        updateObject.preferredStudyTimes = updateData.preferredStudyTimes;

      // Update or create preferences
      const preferences = await prisma.userPreferences.upsert({
        where: { userId },
        update: updateObject,
        create: {
          userId,
          ...updateObject,
        },
      });

      return res.status(200).json({
        message: 'Preferences updated successfully',
        preferences,
      });
    } catch (error) {
      console.error('Update preferences error:', error);
      return res.status(500).json({
        error: 'Internal server error',
      });
    }
  }

  // Reset preferences to default
  static async resetPreferences(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;

      const preferences = await prisma.userPreferences.upsert({
        where: { userId },
        update: {
          studyHoursPerDay: 4,
          preferredStudyTimes: [],
          breakDuration: 15,
          maxContinuousStudy: 90,
          learningPace: 'MEDIUM',
        },
        create: {
          userId,
        },
      });

      return res.status(200).json({
        message: 'Preferences reset to default',
        preferences,
      });
    } catch (error) {
      console.error('Reset preferences error:', error);
      return res.status(500).json({
        error: 'Internal server error',
      });
    }
  }
}