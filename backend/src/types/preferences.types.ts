export interface UpdatePreferencesRequest {
  studyHoursPerDay?: number;
  preferredStudyTimes?: string[]; // ["morning", "afternoon", "evening", "night"]
  breakDuration?: number; // minutes
  maxContinuousStudy?: number; // minutes
  learningPace?: 'SLOW' | 'MEDIUM' | 'FAST';
}

export interface PreferencesResponse {
  id: string;
  userId: string;
  studyHoursPerDay: number;
  preferredStudyTimes: string[];
  breakDuration: number;
  maxContinuousStudy: number;
  learningPace: string;
  createdAt: Date;
  updatedAt: Date;
}