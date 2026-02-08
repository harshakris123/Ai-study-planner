export interface CreateSubjectRequest {
  name: string;
  difficultyLevel: number; // 1-5
  totalHoursRequired: number;
  deadline?: string; // ISO date string
  color?: string;
  prerequisiteIds?: string[]; // Array of subject IDs that are prerequisites
}

export interface UpdateSubjectRequest {
  name?: string;
  difficultyLevel?: number;
  totalHoursRequired?: number;
  hoursCompleted?: number;
  deadline?: string;
  color?: string;
  prerequisiteIds?: string[];
}

export interface SubjectResponse {
  id: string;
  name: string;
  difficultyLevel: number;
  totalHoursRequired: number;
  hoursCompleted: number;
  deadline: string | null;
  color: string;
  progress: number; // Percentage
  prerequisites?: {
    id: string;
    name: string;
  }[];
  topics?: {
    id: string;
    name: string;
    estimatedHours: number;
    isCompleted: boolean;
  }[];
}