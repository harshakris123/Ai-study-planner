// Auth Types
export interface User {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

// Subject Types
export interface Subject {
  id: string;
  userId: string;
  name: string;
  difficultyLevel: number;
  totalHoursRequired: number;
  hoursCompleted: number;
  deadline: string | null;
  color: string;
  progress: number;
  prerequisites?: PrerequisiteSubject[];
  topics?: Topic[];
  createdAt: string;
  updatedAt: string;
}

export interface PrerequisiteSubject {
  id: string;
  name: string;
  progress?: number;
}

export interface CreateSubjectRequest {
  name: string;
  difficultyLevel: number;
  totalHoursRequired: number;
  deadline?: string;
  color?: string;
  prerequisiteIds?: string[];
}

// Topic Types
export interface Topic {
  id: string;
  subjectId: string;
  name: string;
  estimatedHours: number;
  isCompleted: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTopicRequest {
  subjectId: string;
  name: string;
  estimatedHours: number;
  order?: number;
}

// Session Types
export type SessionStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'MISSED';

export interface StudySession {
  id: string;
  userId: string;
  subjectId: string;
  topicId: string | null;
  scheduledStart: string;
  scheduledEnd: string;
  actualStart: string | null;
  actualEnd: string | null;
  status: SessionStatus;
  focusScore: number | null;
  notes: string | null;
  subject: {
    id: string;
    name: string;
    color: string;
  };
  topic?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateSessionRequest {
  subjectId: string;
  topicId?: string;
  scheduledStart: string;
  scheduledEnd: string;
  notes?: string;
}

// Preferences Types
export type LearningPace = 'SLOW' | 'MEDIUM' | 'FAST';

export interface UserPreferences {
  id: string;
  userId: string;
  studyHoursPerDay: number;
  preferredStudyTimes: string[];
  breakDuration: number;
  maxContinuousStudy: number;
  learningPace: LearningPace;
  createdAt: string;
  updatedAt: string;
}

export interface UpdatePreferencesRequest {
  studyHoursPerDay?: number;
  preferredStudyTimes?: string[];
  breakDuration?: number;
  maxContinuousStudy?: number;
  learningPace?: LearningPace;
}

// Stats Types
export interface SubjectStats {
  totalSubjects: number;
  totalHoursRequired: number;
  totalHoursCompleted: number;
  overallProgress: number;
  difficultyDistribution: {
    easy: number;
    medium: number;
    hard: number;
  };
  upcomingDeadlines: Array<{
    id: string;
    name: string;
    deadline: string;
  }>;
}

export interface SessionStats {
  totalSessions: number;
  completedSessions: number;
  missedSessions: number;
  inProgressSessions: number;
  scheduledSessions: number;
  totalHoursStudied: number;
  averageFocusScore: number;
  completionRate: number;
}