import { Request, Response } from 'express';
import { AISchedulerService } from '../services/aiScheduler.service';
import { CognitiveLoadService } from '../services/cognitiveLoad.service';

export class AIController {
  static async generatePlan(req: Request, res: Response) {
    try {
      // @ts-ignore
      const userId = req.user.userId;

      const result = await AISchedulerService.generatePlan(userId);

      return res.status(200).json({
        message: 'Study plan generated successfully',
        ...result,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
      }
      console.error('Generate plan error:', error);
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }
  static async calculateLoad(req: Request, res: Response) {
  try {
    // @ts-ignore
    const userId = req.user.userId;

    const result = await CognitiveLoadService.calculateDailyLoad(userId);

    return res.status(200).json({
      message: 'Cognitive load calculated successfully',
      ...result,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message);
    }
    console.error('Calculate load error:', error);

    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}

static async getTodayLoad(req: Request, res: Response) {
  try {
    // @ts-ignore
    const userId = req.user.userId;

    const result = await CognitiveLoadService.getTodayLoad(userId);

    return res.status(200).json(result);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message);
    }
    console.error('Get load error:', error);

    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}
}

