import api from './api';
import { Subject, CreateSubjectRequest, SubjectStats } from '@/types';

export const subjectService = {
  // Get all subjects
  getAll: async (): Promise<{ subjects: Subject[]; total: number }> => {
    const response = await api.get('/subjects');
    return response.data;
  },

  // Get subject by ID
  getById: async (id: string): Promise<{ subject: Subject }> => {
    const response = await api.get(`/subjects/${id}`);
    return response.data;
  },

  // Create subject
  create: async (data: CreateSubjectRequest): Promise<{ subject: Subject }> => {
    const response = await api.post('/subjects', data);
    return response.data;
  },

  // Update subject
  update: async (
    id: string,
    data: Partial<CreateSubjectRequest>
  ): Promise<{ subject: Subject }> => {
    const response = await api.put(`/subjects/${id}`, data);
    return response.data;
  },

  // Delete subject
  delete: async (id: string): Promise<void> => {
    await api.delete(`/subjects/${id}`);
  },

  // Get subject stats
  getStats: async (): Promise<{ stats: SubjectStats }> => {
    const response = await api.get('/subjects/stats');
    return response.data;
  },
};