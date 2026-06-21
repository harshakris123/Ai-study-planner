import prisma from '../utils/prisma';

type PreferredStudyTime = 'morning' | 'afternoon' | 'evening' | 'night';

type SlotWindow = {
  label: string;
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  crossesMidnight: boolean;
};

type TopicCandidate = {
  id: string;
  subjectId: string;
  name: string;
  estimatedHours: number;
  isCompleted: boolean;
  order: number;
};

type SubjectCandidate = {
  id: string;
  name: string;
  difficultyLevel: number;
  totalHoursRequired: number;
  hoursCompleted: number;
  deadline: Date | null;
  color: string;
  createdAt: Date;
  remainingMinutes: number;
  daysLeft: number;
  priority: number;
  topics: TopicCandidate[];
};

type TaskCandidate = {
  subjectId: string;
  subjectName: string;
  subjectColor: string;
  topicId: string | null;
  topicName: string | null;
  topicOrder: number | null;
  remainingMinutes: number;
  daysLeft: number;
  priority: number;
};

type LoadState = 'Fresh' | 'Normal' | 'Fatigued' | 'Burnout Risk';

const SLOT_WINDOWS: Record<PreferredStudyTime, SlotWindow> = {
  morning: {
    label: 'morning',
    startHour: 6,
    startMinute: 0,
    endHour: 12,
    endMinute: 0,
    crossesMidnight: false,
  },
  afternoon: {
    label: 'afternoon',
    startHour: 12,
    startMinute: 0,
    endHour: 18,
    endMinute: 0,
    crossesMidnight: false,
  },
  evening: {
    label: 'evening',
    startHour: 18,
    startMinute: 0,
    endHour: 22,
    endMinute: 0,
    crossesMidnight: false,
  },
  night: {
    label: 'night',
    startHour: 22,
    startMinute: 0,
    endHour: 2,
    endMinute: 0,
    crossesMidnight: true,
  },
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

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

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function makeDate(baseDay: Date, hour: number, minute: number) {
  const d = new Date(baseDay);
  d.setHours(hour, minute, 0, 0);
  return d;
}

function diffMinutes(start: Date, end: Date) {
  return Math.max(0, Math.floor((end.getTime() - start.getTime()) / (1000 * 60)));
}

function normalizePreferredStudyTimes(raw: unknown): SlotWindow[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    return [SLOT_WINDOWS.morning];
  }

  const slots: SlotWindow[] = [];
  const seen = new Set<string>();

  for (const item of raw) {
    if (typeof item !== 'string') continue;

    const key = item.toLowerCase() as PreferredStudyTime;
    if (SLOT_WINDOWS[key] && !seen.has(key)) {
      seen.add(key);
      slots.push(SLOT_WINDOWS[key]);
    }
  }

  return slots.length > 0 ? slots : [SLOT_WINDOWS.morning];
}

function slotToRange(day: Date, slot: SlotWindow) {
  const start = makeDate(day, slot.startHour, slot.startMinute);
  const end = makeDate(day, slot.endHour, slot.endMinute);

  if (slot.crossesMidnight || end <= start) {
    end.setDate(end.getDate() + 1);
  }

  return { start, end };
}

function scoreSubject(
  subject: {
    difficultyLevel: number;
    totalHoursRequired: number;
    hoursCompleted: number;
    deadline: Date | null;
    createdAt: Date;
  },
  today: Date
) {
  const remainingMinutes = Math.max(
    0,
    Math.round((subject.totalHoursRequired - subject.hoursCompleted) * 60)
  );

  const daysLeft = subject.deadline
    ? Math.max(
        1,
        Math.ceil((subject.deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      )
    : 30;

  const remainingHours = remainingMinutes / 60;

  const urgencyScore = subject.deadline ? clamp(30 / daysLeft, 1, 10) : 3;
  const difficultyScore = clamp(subject.difficultyLevel * 2, 1, 10);
  const remainingScore = clamp(remainingHours / 2, 1, 10);

  const priority =
    0.45 * urgencyScore +
    0.30 * difficultyScore +
    0.25 * remainingScore;

  return {
    remainingMinutes,
    daysLeft,
    priority,
  };
}

function getLoadState(score: number): LoadState {
  if (score <= 30) return 'Fresh';
  if (score <= 60) return 'Normal';
  if (score <= 80) return 'Fatigued';
  return 'Burnout Risk';
}

function applyCognitiveLoadAdjustments(
  loadScore: number,
  dailyBudgetMinutes: number,
  breakMinutes: number
) {
  const loadState = getLoadState(loadScore);

  let adjustedDailyBudget = dailyBudgetMinutes;
  let adjustedBreakMinutes = breakMinutes;
  let difficultyThreshold = 5;

  if (loadScore <= 30) {
    adjustedDailyBudget = dailyBudgetMinutes;
    adjustedBreakMinutes = breakMinutes;
    difficultyThreshold = 5;
  } else if (loadScore <= 60) {
    adjustedDailyBudget = Math.round(dailyBudgetMinutes * 0.9);
    adjustedBreakMinutes = Math.round(breakMinutes * 1.2);
    difficultyThreshold = 5;
  } else if (loadScore <= 80) {
    adjustedDailyBudget = Math.round(dailyBudgetMinutes * 0.75);
    adjustedBreakMinutes = Math.round(breakMinutes * 1.5);
    difficultyThreshold = 4;
  } else {
    adjustedDailyBudget = Math.round(dailyBudgetMinutes * 0.5);
    adjustedBreakMinutes = Math.round(breakMinutes * 2);
    difficultyThreshold = 3;
  }

  return {
    loadState,
    adjustedDailyBudget,
    adjustedBreakMinutes,
    difficultyThreshold,
  };
}

function buildTasks(
  subjects: SubjectCandidate[],
  difficultyThreshold: number
): TaskCandidate[] {
  const tasks: TaskCandidate[] = [];

  for (const subject of subjects) {
    const subjectRemaining = subject.remainingMinutes;
    if (subjectRemaining <= 0) continue;

    const isHardSubject = subject.difficultyLevel > difficultyThreshold;

    const incompleteTopics = subject.topics
      .filter((topic) => !topic.isCompleted)
      .sort((a, b) => a.order - b.order);

    if (incompleteTopics.length === 0) {
      tasks.push({
        subjectId: subject.id,
        subjectName: subject.name,
        subjectColor: subject.color,
        topicId: null,
        topicName: isHardSubject ? 'Light Revision' : null,
        topicOrder: null,
        remainingMinutes: isHardSubject
          ? Math.round(subjectRemaining * 0.5)
          : subjectRemaining,
        daysLeft: subject.daysLeft,
        priority: isHardSubject ? subject.priority * 0.7 : subject.priority,
      });
      continue;
    }

    const topicTotalMinutes = incompleteTopics.reduce(
      (sum, topic) => sum + Math.max(1, Math.round(topic.estimatedHours * 60)),
      0
    );

    const scale = topicTotalMinutes > 0 ? subjectRemaining / topicTotalMinutes : 1;

    for (const topic of incompleteTopics) {
      const baseMinutes = Math.max(1, Math.round(topic.estimatedHours * 60));
      const allocatedMinutes = Math.max(15, Math.round(baseMinutes * scale));

      tasks.push({
        subjectId: subject.id,
        subjectName: subject.name,
        subjectColor: subject.color,
        topicId: topic.id,
        topicName: isHardSubject ? `Revision: ${topic.name}` : topic.name,
        topicOrder: topic.order,
        remainingMinutes: isHardSubject
          ? Math.max(15, Math.round(allocatedMinutes * 0.5))
          : allocatedMinutes,
        daysLeft: subject.daysLeft,
        priority: isHardSubject ? subject.priority * 0.7 : subject.priority,
      });
    }
  }

  return tasks
    .filter((task) => task.remainingMinutes > 0)
    .sort(
      (a, b) =>
        b.priority - a.priority ||
        a.daysLeft - b.daysLeft ||
        (a.topicOrder ?? Number.MAX_SAFE_INTEGER) - (b.topicOrder ?? Number.MAX_SAFE_INTEGER)
    );
}

function pickNextTask(tasks: TaskCandidate[]) {
  const active = tasks
    .filter((task) => task.remainingMinutes > 0)
    .sort(
      (a, b) =>
        b.priority - a.priority ||
        a.daysLeft - b.daysLeft ||
        (a.topicOrder ?? Number.MAX_SAFE_INTEGER) - (b.topicOrder ?? Number.MAX_SAFE_INTEGER)
    );

  return active[0] ?? null;
}

export class AISchedulerService {
  static async generatePlan(userId: string) {
    const preferences = await prisma.userPreferences.findUnique({
      where: { userId },
    });

    if (!preferences) {
      throw new Error('User preferences not found');
    }

    const latestLoad = await prisma.cognitiveLoadLog.findFirst({
      where: { userId },
      orderBy: { date: 'desc' },
    });

    const subjectsRaw = await prisma.subject.findMany({
      where: { userId },
      include: {
        topics: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: [{ deadline: 'asc' }, { createdAt: 'asc' }],
    });

    if (subjectsRaw.length === 0) {
      throw new Error('No subjects found');
    }

    const today = new Date();
    const planningStart = addDays(startOfDay(today), 1);
    const planningEnd = addDays(planningStart, 7);

    const subjects: SubjectCandidate[] = subjectsRaw
      .map((subject) => {
        const scored = scoreSubject(subject, today);

        return {
          id: subject.id,
          name: subject.name,
          difficultyLevel: subject.difficultyLevel,
          totalHoursRequired: subject.totalHoursRequired,
          hoursCompleted: subject.hoursCompleted,
          deadline: subject.deadline,
          color: subject.color,
          createdAt: subject.createdAt,
          remainingMinutes: scored.remainingMinutes,
          daysLeft: scored.daysLeft,
          priority: scored.priority,
          topics: subject.topics.map((topic) => ({
            id: topic.id,
            subjectId: topic.subjectId,
            name: topic.name,
            estimatedHours: topic.estimatedHours,
            isCompleted: topic.isCompleted,
            order: topic.order,
          })),
        };
      })
      .filter((subject) => subject.remainingMinutes > 0)
      .sort((a, b) => b.priority - a.priority || a.daysLeft - b.daysLeft);

    if (subjects.length === 0) {
      throw new Error('All subjects are already completed');
    }

    const slots = normalizePreferredStudyTimes(preferences.preferredStudyTimes);

    const baseDailyBudgetMinutes = Math.max(
      60,
      Math.round((preferences.studyHoursPerDay || 4) * 60)
    );

    const baseBreakMinutes = Math.max(
      0,
      preferences.breakDuration || 0
    );

    const loadScore = latestLoad?.totalLoadScore ?? 0;

    const adaptiveConfig = applyCognitiveLoadAdjustments(
      loadScore,
      baseDailyBudgetMinutes,
      baseBreakMinutes
    );

    const dailyBudgetMinutes = adaptiveConfig.adjustedDailyBudget;
    const breakMinutes = adaptiveConfig.adjustedBreakMinutes;
    const maxContinuousMinutes = Math.max(
      30,
      Math.min(preferences.maxContinuousStudy || 90, 180)
    );

    const tasks = buildTasks(subjects, adaptiveConfig.difficultyThreshold);
    if (tasks.length === 0) {
      throw new Error('No pending topics or subjects found');
    }

    await prisma.studySession.deleteMany({
      where: {
        userId,
        status: 'SCHEDULED',
        scheduledStart: {
          gte: planningStart,
          lt: planningEnd,
        },
        notes: {
          contains: 'Auto-generated study plan',
        },
      },
    });

    const generatedSessions: any[] = [];
    let dayOffset = 0;

    while (tasks.some((task) => task.remainingMinutes > 0) && dayOffset < 7) {
      const day = addDays(planningStart, dayOffset);
      let remainingDayMinutes = dailyBudgetMinutes;

      for (const slot of slots) {
        if (remainingDayMinutes <= 0) break;

        const { start, end } = slotToRange(day, slot);
        let current = new Date(start);

        while (remainingDayMinutes > 0 && current < end) {
          const task = pickNextTask(tasks);
          if (!task) break;

          const slotRemainingMinutes = diffMinutes(current, end);
          if (slotRemainingMinutes <= 0) break;

          const chunkMinutes = Math.min(
            task.remainingMinutes,
            remainingDayMinutes,
            slotRemainingMinutes,
            maxContinuousMinutes
          );
          
          if (chunkMinutes < 20) {
          task.remainingMinutes = 0;
            continue;
          }
          if (chunkMinutes <= 0) break;

          const scheduledStart = new Date(current);
          const scheduledEnd = addMinutes(scheduledStart, chunkMinutes);

          const session = await prisma.studySession.create({
            data: {
              userId,
              subjectId: task.subjectId,
              topicId: task.topicId,
              scheduledStart,
              scheduledEnd,
              status: 'SCHEDULED',
              notes: `Auto-generated study plan for ${task.subjectName}${
                task.topicName ? ` - ${task.topicName}` : ''
              }`,
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

          generatedSessions.push(session);

          task.remainingMinutes = Math.max(0, task.remainingMinutes - chunkMinutes);
          remainingDayMinutes -= chunkMinutes;

          current = addMinutes(scheduledEnd, breakMinutes);
        }
      }

      dayOffset += 1;
    }

    const unallocatedMinutes = tasks.reduce(
      (sum, task) => sum + Math.max(0, task.remainingMinutes),
      0
    );

    return {
      sessions: generatedSessions,
      totalSessions: generatedSessions.length,
      generatedMinutes: generatedSessions.reduce((sum, session) => {
        return sum + diffMinutes(session.scheduledStart, session.scheduledEnd);
      }, 0),
      unallocatedMinutes,
      planningStart,
      planningEnd,
      warning:
        unallocatedMinutes > 0
          ? 'Not all content could be scheduled within the weekly window. Consider reducing scope or increasing available study time.'
          : null,
      adaptiveAdjustments: {
        loadScore,
        loadState: adaptiveConfig.loadState,
        originalDailyBudget: baseDailyBudgetMinutes,
        adjustedDailyBudget: dailyBudgetMinutes,
        originalBreakMinutes: baseBreakMinutes,
        adjustedBreakMinutes: breakMinutes,
        difficultyThreshold: adaptiveConfig.difficultyThreshold,
      },
    };
  }
}