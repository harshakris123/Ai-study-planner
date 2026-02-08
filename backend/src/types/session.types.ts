export interface CreateSessionRequest {
  subjectId: string;
  topicId?: string;
  scheduledStart: string; // ISO date string
  scheduledEnd: string; // ISO date string
  notes?: string;
}

export interface UpdateSessionRequest {
  scheduledStart?: string;
  scheduledEnd?: string;
  actualStart?: string;
  actualEnd?: string;
  status?: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'MISSED';
  focusScore?: number; // 1-10
  notes?: string;
}

export interface SessionResponse {
  id: string;
  userId: string;
  subjectId: string;
  topicId: string | null;
  scheduledStart: Date;
  scheduledEnd: Date;
  actualStart: Date | null;
  actualEnd: Date | null;
  status: string;
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
}