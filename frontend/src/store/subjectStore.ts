import { create } from 'zustand';
import { Subject } from '@/types';

interface SubjectState {
  subjects: Subject[];
  selectedSubject: Subject | null;
  loading: boolean;
  setSubjects: (subjects: Subject[]) => void;
  setSelectedSubject: (subject: Subject | null) => void;
  setLoading: (loading: boolean) => void;
  addSubject: (subject: Subject) => void;
  updateSubject: (id: string, subject: Subject) => void;
  removeSubject: (id: string) => void;
}

export const useSubjectStore = create<SubjectState>((set) => ({
  subjects: [],
  selectedSubject: null,
  loading: false,

  setSubjects: (subjects) => set({ subjects }),
  
  setSelectedSubject: (subject) => set({ selectedSubject: subject }),
  
  setLoading: (loading) => set({ loading }),
  
  addSubject: (subject) =>
    set((state) => ({ subjects: [subject, ...state.subjects] })),
  
  updateSubject: (id, updatedSubject) =>
    set((state) => ({
      subjects: state.subjects.map((s) =>
        s.id === id ? updatedSubject : s
      ),
    })),
  
  removeSubject: (id) =>
    set((state) => ({
      subjects: state.subjects.filter((s) => s.id !== id),
    })),
}));