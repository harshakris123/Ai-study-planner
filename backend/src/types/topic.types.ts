export interface CreateTopicRequest {
  subjectId: string;
  name: string;
  estimatedHours: number;
  order?: number;
}

export interface UpdateTopicRequest {
  name?: string;
  estimatedHours?: number;
  isCompleted?: boolean;
  order?: number;
}

export interface ReorderTopicsRequest {
  topicIds: string[]; // Array of topic IDs in new order
}

export interface TopicResponse {
  id: string;
  subjectId: string;
  name: string;
  estimatedHours: number;
  isCompleted: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}