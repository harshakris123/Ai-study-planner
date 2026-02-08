import api from './api';
import { Topic, CreateTopicRequest } from '@/types';

export const topicService = {
  // Get all topics for a subject
  getBySubject: async (subjectId: string): Promise<{
    topics: Topic[];
    stats: {
      total: number;
      completed: number;
      completionPercentage: number;
    };
  }> => {
    const response = await api.get(`/topics/subject/${subjectId}`);
    return response.data;
  },

  // Create topic
  create: async (data: CreateTopicRequest): Promise<{ topic: Topic }> => {
    const response = await api.post('/topics', data);
    return response.data;
  },

  // Bulk create topics
  bulkCreate: async (data: {
    subjectId: string;
    topics: Array<{ name: string; estimatedHours: number }>;
  }): Promise<{ topics: Topic[] }> => {
    const response = await api.post('/topics/bulk', data);
    return response.data;
  },

  // Update topic
  update: async (
    id: string,
    data: Partial<CreateTopicRequest>
  ): Promise<{ topic: Topic }> => {
    const response = await api.put(`/topics/${id}`, data);
    return response.data;
  },

  // Delete topic
  delete: async (id: string): Promise<void> => {
    await api.delete(`/topics/${id}`);
  },

  // Toggle completion
  toggleComplete: async (id: string): Promise<{ topic: Topic }> => {
    const response = await api.patch(`/topics/${id}/toggle`);
    return response.data;
  },

  // Reorder topics
  reorder: async (
    subjectId: string,
    topicIds: string[]
  ): Promise<{ topics: Topic[] }> => {
    const response = await api.put(`/topics/subject/${subjectId}/reorder`, {
      topicIds,
    });
    return response.data;
  },
};