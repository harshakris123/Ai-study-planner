import { useEffect, useState } from 'react';
import { Plus, BookOpen } from 'lucide-react';
import { useSubjectStore } from '@/store/subjectStore';
import { subjectService } from '@/services/subjectService';
import { Subject, CreateSubjectRequest } from '@/types';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Modal from '@/components/common/Modal';
import SubjectCard from '@/components/subjects/SubjectCard';
import SubjectForm from '@/components/subjects/SubjectForm';
import AppLayout from '@/components/layout/AppLayout'; // ADD THIS
import { showSuccess, showError } from '@/utils/toast'; // ADD THIS

export default function SubjectsPage() {
  const { subjects, setSubjects, addSubject, updateSubject, removeSubject } =
    useSubjectStore();

  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | undefined>();
  const [deleteConfirm, setDeleteConfirm] = useState<Subject | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const response = await subjectService.getAll();
      setSubjects(response.subjects);
    } catch (error) {
      showError('Failed to fetch subjects'); // CHANGED
      console.error('Failed to fetch subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubject = async (data: CreateSubjectRequest) => {
    try {
      setSubmitting(true);
      const response = await subjectService.create(data);
      addSubject(response.subject);
      setModalOpen(false);
      showSuccess('Subject created successfully!'); // CHANGED
    } catch (error: any) {
      showError(error.response?.data?.error || 'Failed to create subject'); // CHANGED
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateSubject = async (data: CreateSubjectRequest) => {
    if (!editingSubject) return;

    try {
      setSubmitting(true);
      const response = await subjectService.update(editingSubject.id, data);
      updateSubject(editingSubject.id, response.subject);
      setModalOpen(false);
      setEditingSubject(undefined);
      showSuccess('Subject updated successfully!'); // CHANGED
    } catch (error: any) {
      showError(error.response?.data?.error || 'Failed to update subject'); // CHANGED
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubject = async (subject: Subject) => {
    try {
      await subjectService.delete(subject.id);
      removeSubject(subject.id);
      setDeleteConfirm(null);
      showSuccess('Subject deleted successfully!'); // CHANGED
    } catch (error: any) {
      showError(error.response?.data?.error || 'Failed to delete subject'); // CHANGED
    }
  };

  const openCreateModal = () => {
    setEditingSubject(undefined);
    setModalOpen(true);
  };

  const openEditModal = (subject: Subject) => {
    setEditingSubject(subject);
    setModalOpen(true);
  };

  return (
    <AppLayout> {/* WRAP WITH LAYOUT */}
      <div className="bg-gray-50 min-h-screen">
        {/* Header - Remove the old navigation header, keep only this */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Subjects</h1>
                <p className="text-gray-600 mt-1">
                  {subjects.length} {subjects.length === 1 ? 'subject' : 'subjects'}
                </p>
              </div>
              <button onClick={openCreateModal} className="btn-primary flex items-center gap-2">
                <Plus size={20} />
                Add Subject
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <LoadingSpinner />
          ) : subjects.length === 0 ? (
            <div className="text-center py-16">
              <div className="flex justify-center mb-4">
                <div className="bg-gray-100 p-6 rounded-full">
                  <BookOpen size={48} className="text-gray-400" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No subjects yet
              </h3>
              <p className="text-gray-600 mb-6">
                Create your first subject to start planning your studies
              </p>
              <button onClick={openCreateModal} className="btn-primary">
                Create Subject
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects.map((subject) => (
                <SubjectCard
                  key={subject.id}
                  subject={subject}
                  onEdit={openEditModal}
                  onDelete={(s) => setDeleteConfirm(s)}
                  onClick={(s) => window.location.href = `/subjects/${s.id}`}
                />
              ))}
            </div>
          )}
        </main>

        {/* Modals remain the same */}
        <Modal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditingSubject(undefined);
          }}
          title={editingSubject ? 'Edit Subject' : 'Create New Subject'}
        >
          <SubjectForm
            subject={editingSubject}
            onSubmit={editingSubject ? handleUpdateSubject : handleCreateSubject}
            onCancel={() => {
              setModalOpen(false);
              setEditingSubject(undefined);
            }}
            loading={submitting}
          />
        </Modal>

        <Modal
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          title="Delete Subject"
          size="sm"
        >
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete "{deleteConfirm?.name}"? This will also
            delete all associated topics and study sessions.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setDeleteConfirm(null)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={() => deleteConfirm && handleDeleteSubject(deleteConfirm)}
              className="btn-danger"
            >
              Delete
            </button>
          </div>
        </Modal>
      </div>
    </AppLayout>
  );
}