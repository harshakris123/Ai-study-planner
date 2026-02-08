import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Calendar,
  Clock,
  Target,
  Edit,
  ListPlus,
} from 'lucide-react';
import { subjectService } from '@/services/subjectService';
import { topicService } from '@/services/topicService';
import { Subject, Topic } from '@/types';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Modal from '@/components/common/Modal';
import TopicList from '@/components/topics/TopicList';
import TopicForm from '@/components/topics/TopicForm';
import BulkTopicForm from '@/components/topics/BulkTopicForm';
import { format } from 'date-fns';

export default function SubjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [subject, setSubject] = useState<Subject | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | undefined>();
  const [deleteConfirm, setDeleteConfirm] = useState<Topic | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchSubjectAndTopics();
    }
  }, [id]);

  const fetchSubjectAndTopics = async () => {
    try {
      setLoading(true);
      const [subjectRes, topicsRes] = await Promise.all([
        subjectService.getById(id!),
        topicService.getBySubject(id!),
      ]);
      setSubject(subjectRes.subject);
      setTopics(topicsRes.topics);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      navigate('/subjects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTopic = async (data: {
    name: string;
    estimatedHours: number;
  }) => {
    try {
      setSubmitting(true);
      const response = await topicService.create({
        subjectId: id!,
        ...data,
      });
      setTopics([...topics, response.topic]);
      setModalOpen(false);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to create topic');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkCreate = async (
    topicsData: Array<{ name: string; estimatedHours: number }>
  ) => {
    try {
      setSubmitting(true);
      const response = await topicService.bulkCreate({
        subjectId: id!,
        topics: topicsData,
      });
      setTopics(response.topics);
      setBulkModalOpen(false);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to create topics');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateTopic = async (data: {
    name: string;
    estimatedHours: number;
  }) => {
    if (!editingTopic) return;

    try {
      setSubmitting(true);
      const response = await topicService.update(editingTopic.id, data);
      setTopics(
        topics.map((t) => (t.id === editingTopic.id ? response.topic : t))
      );
      setModalOpen(false);
      setEditingTopic(undefined);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to update topic');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleComplete = async (topic: Topic) => {
  try {
    const response = await topicService.toggleComplete(topic.id);
    const updatedTopic = response.topic;
    
    setTopics(topics.map((t) => (t.id === topic.id ? updatedTopic : t)));

    // Auto-update subject hours based on topic completion
    if (subject) {
      const hoursDifference = updatedTopic.isCompleted 
        ? topic.estimatedHours 
        : -topic.estimatedHours;
      
      const newHoursCompleted = Math.max(
        0, 
        subject.hoursCompleted + hoursDifference
      );

      // Update subject hours
      await subjectService.update(subject.id, {
        hoursCompleted: newHoursCompleted,
      });

      // Update local state
      setSubject({
        ...subject,
        hoursCompleted: newHoursCompleted,
        progress: subject.totalHoursRequired > 0
          ? Math.round((newHoursCompleted / subject.totalHoursRequired) * 100)
          : 0,
      });
    }
  } catch (error: any) {
    alert(error.response?.data?.error || 'Failed to update topic');
  }
};

  const handleDeleteTopic = async (topic: Topic) => {
    try {
      await topicService.delete(topic.id);
      setTopics(topics.filter((t) => t.id !== topic.id));
      setDeleteConfirm(null);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete topic');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!subject) {
    return null;
  }

  const completedTopics = topics.filter((t) => t.isCompleted).length;
  const totalTopics = topics.length;
  const topicCompletionRate =
    totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/subjects')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {subject.name}
              </h1>
              <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Clock size={16} />
                  {subject.hoursCompleted}h / {subject.totalHoursRequired}h
                </span>
                {subject.deadline && (
                  <span className="flex items-center gap-1">
                    <Calendar size={16} />
                    Due {format(new Date(subject.deadline), 'MMM d, yyyy')}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => navigate(`/subjects/${id}/edit`)}
              className="btn-outline flex items-center gap-2"
            >
              <Edit size={20} />
              Edit Subject
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Stats */}
          <div className="lg:col-span-1 space-y-6">
            {/* Progress Card */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Overall Progress</h3>
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Completion</span>
                  <span className="font-semibold">{subject.progress}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${subject.progress}%`,
                      backgroundColor: subject.color,
                    }}
                  ></div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Topics Completed</span>
                  <span className="font-semibold">
                    {completedTopics} / {totalTopics}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Topic Progress</span>
                  <span className="font-semibold">{topicCompletionRate}%</span>
                </div>
              </div>
            </div>

            {/* Prerequisites Card */}
            {subject.prerequisites && subject.prerequisites.length > 0 && (
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Prerequisites</h3>
                <div className="space-y-2">
                  {subject.prerequisites.map((prereq) => (
                    <div
                      key={prereq.id}
                      className="p-3 bg-gray-50 rounded-lg text-sm"
                    >
                      <div className="font-medium">{prereq.name}</div>
                      {prereq.progress !== undefined && (
                        <div className="text-gray-600 mt-1">
                          {prereq.progress}% complete
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Topics */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Target size={24} />
                  Topics
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setBulkModalOpen(true)}
                    className="btn-outline flex items-center gap-2"
                  >
                    <ListPlus size={20} />
                    Bulk Add
                  </button>
                  <button
                    onClick={() => {
                      setEditingTopic(undefined);
                      setModalOpen(true);
                    }}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Plus size={20} />
                    Add Topic
                  </button>
                </div>
              </div>

              <TopicList
                topics={topics}
                onToggleComplete={handleToggleComplete}
                onEdit={(topic) => {
                  setEditingTopic(topic);
                  setModalOpen(true);
                }}
                onDelete={(topic) => setDeleteConfirm(topic)}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Single Topic Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingTopic(undefined);
        }}
        title={editingTopic ? 'Edit Topic' : 'Add New Topic'}
      >
        <TopicForm
          topic={editingTopic}
          onSubmit={editingTopic ? handleUpdateTopic : handleCreateTopic}
          onCancel={() => {
            setModalOpen(false);
            setEditingTopic(undefined);
          }}
          loading={submitting}
        />
      </Modal>

      {/* Bulk Add Modal */}
      <Modal
        isOpen={bulkModalOpen}
        onClose={() => setBulkModalOpen(false)}
        title="Add Multiple Topics"
        size="lg"
      >
        <BulkTopicForm
          onSubmit={handleBulkCreate}
          onCancel={() => setBulkModalOpen(false)}
          loading={submitting}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Topic"
        size="sm"
      >
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete "{deleteConfirm?.name}"?
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeleteConfirm(null)} className="btn-secondary">
            Cancel
          </button>
          <button
            onClick={() => deleteConfirm && handleDeleteTopic(deleteConfirm)}
            className="btn-danger"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}