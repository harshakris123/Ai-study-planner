import prisma from '../utils/prisma';

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getLoadState(score: number) {
  if (score <= 30) return 'Fresh';
  if (score <= 60) return 'Normal';
  if (score <= 80) return 'Fatigued';
  return 'Burnout Risk';
}

export class CognitiveLoadService {
  static async calculateDailyLoad(userId: string) {
    const today = new Date();
    const dayStart = startOfDay(today);
    const nextDay = addDays(dayStart, 1);
    

    const preferences = await prisma.userPreferences.findUnique({
      where: { userId },
    });
    const allSessions = await prisma.studySession.findMany({
    where: { userId }
    });

    console.log("ALL USER SESSIONS:", allSessions);
    
    if (!preferences) {
      throw new Error('User preferences not found');
    }

    const sessions = await prisma.studySession.findMany({
      where: {
        userId,
        status: 'COMPLETED',
        actualEnd: {
          gte: dayStart,
          lt: nextDay,
        },
      },
      include: {
        subject: true,  
      },
    });
    console.log('NOW:', today);
    console.log('DAY START:', dayStart);
    console.log('NEXT DAY:', nextDay);
    console.log('SESSIONS FOUND:', sessions.length);
    console.log('SESSIONS DATA:', sessions);

    if (sessions.length === 0) {
      const loadScore = 0;
      const state = getLoadState(loadScore);

      const log = await prisma.cognitiveLoadLog.upsert({
        where: {
          userId_date: {
            userId,
            date: dayStart,
          },
        },
        update: {
          totalLoadScore: loadScore,
          subjectsStudied: [],
          notes: state,
        },
        create: {
          userId,
          date: dayStart,
          totalLoadScore: loadScore,
          subjectsStudied: [],
          notes: state,
        },
      });

      return {
        loadScore,
        state,
        sessionCount: 0,
        log,
      };
    }

    let totalStudyMinutes = 0;
    let totalDifficulty = 0;
    let focusSum = 0;
    let focusCount = 0;

    const subjectsStudied = new Set<string>();

    for (const session of sessions) {
      if (session.actualStart && session.actualEnd) {
        const duration =
          (session.actualEnd.getTime() - session.actualStart.getTime()) /
          (1000 * 60);

        totalStudyMinutes += Math.max(0, duration);
      }

      totalDifficulty += session.subject.difficultyLevel;
      subjectsStudied.add(session.subjectId);

      if (session.focusScore !== null) {
        focusSum += session.focusScore;
        focusCount += 1;
      }
    }

    const totalStudyHours = totalStudyMinutes / 60;
    const avgDifficulty = totalDifficulty / sessions.length;
    const avgFocus = focusCount > 0 ? focusSum / focusCount : 7;

    const studyHoursScore = clamp((totalStudyHours / 8) * 100, 0, 100);
    const difficultyScore = clamp((avgDifficulty / 5) * 100, 0, 100);

    const expectedBreaks =
      totalStudyMinutes / preferences.maxContinuousStudy;
    const breakPenalty = clamp(expectedBreaks * 20, 0, 100);

    const focusPenalty = clamp(((10 - avgFocus) / 9) * 100, 0, 100);

    const loadScore = Number(
      (
        0.35 * studyHoursScore +
        0.30 * difficultyScore +
        0.15 * breakPenalty +
        0.20 * focusPenalty
      ).toFixed(2)
    );

    const state = getLoadState(loadScore);

    const log = await prisma.cognitiveLoadLog.upsert({
      where: {
        userId_date: {
          userId,
          date: dayStart,
        },
      },
      update: {
        totalLoadScore: loadScore,
        subjectsStudied: Array.from(subjectsStudied),
        notes: state,
      },
      create: {
        userId,
        date: dayStart,
        totalLoadScore: loadScore,
        subjectsStudied: Array.from(subjectsStudied),
        notes: state,
      },
    });

    return {
      loadScore,
      state,
      totalStudyHours,
      avgDifficulty,
      avgFocus,
      sessionCount: sessions.length,
      log,
    };
  }

  static async getTodayLoad(userId: string) {
    const today = startOfDay(new Date());

    return prisma.cognitiveLoadLog.findUnique({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
    });
  }
}