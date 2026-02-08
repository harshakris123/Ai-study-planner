import { useState, useEffect } from 'react';
import { Topic } from '@/types';

interface TopicFormProps {
  topic?: Topic;
  onSubmit: (data: { name: string; estimatedHours: number }) => void;
  onCancel: () => void;
  loading: boolean;
}

export default function TopicForm({
  topic,
  onSubmit,
  onCancel,
  loading,
}: TopicFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    estimatedHours: 2,
  });

  useEffect(() => {
    if (topic) {
      setFormData({
        name: topic.name,
        estimatedHours: topic.estimatedHours,
      });
    }
  }, [topic]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Topic Name *
        </label>
        <input
          type="text"
          required
          className="input-field"
          placeholder="e.g., Arrays and Strings"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Estimated Hours *
        </label>
        <input
          type="number"
          required
          min="0.5"
          step="0.5"
          className="input-field"
          value={formData.estimatedHours}
          onChange={(e) =>
            setFormData({
              ...formData,
              estimatedHours: parseFloat(e.target.value),
            })
          }
        />
      </div>

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
          {loading ? 'Saving...' : topic ? 'Update Topic' : 'Add Topic'}
        </button>
      </div>
    </form>
  );
}