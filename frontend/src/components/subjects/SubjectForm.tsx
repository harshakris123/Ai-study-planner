import { useState, useEffect } from 'react';
import { Subject, CreateSubjectRequest } from '@/types';
import { useSubjectStore } from '@/store/subjectStore';

interface SubjectFormProps {
  subject?: Subject;
  onSubmit: (data: CreateSubjectRequest) => void;
  onCancel: () => void;
  loading: boolean;
}

const COLORS = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F97316', // Orange
];

export default function SubjectForm({
  subject,
  onSubmit,
  onCancel,
  loading,
}: SubjectFormProps) {
  const { subjects } = useSubjectStore();
  
    const [formData, setFormData] = useState<any>({
    name: '',
    difficultyLevel: 3,
    totalHoursRequired: 40,
    hoursCompleted: 0,
    deadline: '',
    color: COLORS[0],
    prerequisiteIds: [],
    });

    useEffect(() => {
    if (subject) {
        setFormData({
        name: subject.name,
        difficultyLevel: subject.difficultyLevel,
        totalHoursRequired: subject.totalHoursRequired,
        hoursCompleted: subject.hoursCompleted, // ADD THIS
        deadline: subject.deadline
            ? new Date(subject.deadline).toISOString().split('T')[0]
            : '',
        color: subject.color,
        prerequisiteIds: subject.prerequisites?.map((p) => p.id) || [],
        });
    }
    }, [subject]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Subject Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Subject Name *
        </label>
        <input
          type="text"
          required
          className="input-field"
          placeholder="e.g., Data Structures and Algorithms"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>

      {/* Difficulty Level */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Difficulty Level *
        </label>
        <select
          className="input-field"
          value={formData.difficultyLevel}
          onChange={(e) =>
            setFormData({
              ...formData,
              difficultyLevel: Number(e.target.value),
            })
          }
        >
          <option value={1}>Very Easy</option>
          <option value={2}>Easy</option>
          <option value={3}>Medium</option>
          <option value={4}>Hard</option>
          <option value={5}>Very Hard</option>
        </select>
      </div>

      {/* Total Hours */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Total Hours Required *
        </label>
        <input
          type="number"
          required
          min="1"
          className="input-field"
          placeholder="40"
          value={formData.totalHoursRequired}
          onChange={(e) =>
            setFormData({
              ...formData,
              totalHoursRequired: Number(e.target.value),
            })
          }
        />
      </div>
            <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
            Hours Completed
        </label>
        <input
            type="number"
            min="0"
            step="0.5"
            className="input-field"
            placeholder="0"
            value={formData.hoursCompleted || 0}
            onChange={(e) =>
            setFormData({
                ...formData,
                hoursCompleted: Number(e.target.value),
            })
            }
        />
        <p className="text-xs text-gray-500 mt-1">
            Update this as you complete study sessions
        </p>
        </div>
      {/* Deadline */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Deadline (Optional)
        </label>
        <input
          type="date"
          className="input-field"
          value={formData.deadline}
          onChange={(e) =>
            setFormData({ ...formData, deadline: e.target.value })
          }
        />
      </div>

      {/* Color */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Color
        </label>
        <div className="flex gap-2 flex-wrap">
          {COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className={`w-10 h-10 rounded-lg border-2 transition-all ${
                formData.color === color
                  ? 'border-gray-900 scale-110'
                  : 'border-gray-300'
              }`}
              style={{ backgroundColor: color }}
              onClick={() => setFormData({ ...formData, color })}
            />
          ))}
        </div>
      </div>

      {/* Prerequisites */}
      {subjects.length > 0 && !subject && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Prerequisites (Optional)
          </label>
          <select
            multiple
            className="input-field h-32"
            value={formData.prerequisiteIds || []}
            onChange={(e) => {
              const selected = Array.from(
                e.target.selectedOptions,
                (option) => option.value
              );
              setFormData({ ...formData, prerequisiteIds: selected });
            }}
          >
            {subjects
              .filter((s) => !subject || s.id !== subject.id)
              .map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Hold Ctrl (Cmd on Mac) to select multiple
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
          disabled={loading}
        >
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving...' : subject ? 'Update Subject' : 'Create Subject'}
        </button>
      </div>
      
    </form>
  );
}