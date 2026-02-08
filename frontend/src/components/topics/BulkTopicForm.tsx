import { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface BulkTopicFormProps {
  onSubmit: (topics: Array<{ name: string; estimatedHours: number }>) => void;
  onCancel: () => void;
  loading: boolean;
}

export default function BulkTopicForm({
  onSubmit,
  onCancel,
  loading,
}: BulkTopicFormProps) {
  const [topics, setTopics] = useState([
    { name: '', estimatedHours: 2 },
    { name: '', estimatedHours: 2 },
    { name: '', estimatedHours: 2 },
  ]);

  const addTopic = () => {
    setTopics([...topics, { name: '', estimatedHours: 2 }]);
  };

  const removeTopic = (index: number) => {
    if (topics.length > 1) {
      setTopics(topics.filter((_, i) => i !== index));
    }
  };

  const updateTopic = (
    index: number,
    field: 'name' | 'estimatedHours',
    value: string | number
  ) => {
    const updated = [...topics];
    updated[index] = { ...updated[index], [field]: value };
    setTopics(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validTopics = topics.filter((t) => t.name.trim() !== '');
    if (validTopics.length > 0) {
      onSubmit(validTopics);
    }
  };

  const validTopicsCount = topics.filter((t) => t.name.trim() !== '').length;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          Add multiple topics at once. Each topic needs a name and estimated hours to complete.
        </p>
      </div>

      {/* Topics List */}
      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {topics.map((topic, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-start gap-3">
              {/* Number Badge */}
              <div className="flex-shrink-0 w-8 h-10 flex items-center justify-center bg-gray-100 text-gray-600 font-semibold rounded-lg mt-0.5">
                {index + 1}
              </div>

              {/* Form Fields */}
              <div className="flex-1 space-y-2">
                {/* Topic Name */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Topic Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    placeholder="e.g., Arrays and Strings"
                    value={topic.name}
                    onChange={(e) => updateTopic(index, 'name', e.target.value)}
                  />
                </div>

                {/* Estimated Hours */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Estimated Hours *
                  </label>
                  <input
                    type="number"
                    required
                    min="0.5"
                    step="0.5"
                    className="input-field w-32"
                    placeholder="2"
                    value={topic.estimatedHours}
                    onChange={(e) =>
                      updateTopic(
                        index,
                        'estimatedHours',
                        parseFloat(e.target.value) || 0
                      )
                    }
                  />
                </div>
              </div>

              {/* Remove Button */}
              <button
                type="button"
                onClick={() => removeTopic(index)}
                className="flex-shrink-0 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-6"
                disabled={topics.length === 1}
                title="Remove topic"
              >
                <X size={20} />
              </button>
            </div>

            {/* Divider */}
            {index < topics.length - 1 && (
              <div className="border-b border-gray-200"></div>
            )}
          </div>
        ))}
      </div>

      {/* Add More Button */}
      <button
        type="button"
        onClick={addTopic}
        className="btn-outline w-full flex items-center justify-center gap-2"
      >
        <Plus size={20} />
        Add Another Topic
      </button>

      {/* Summary */}
      {validTopicsCount > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800">
            Ready to add <span className="font-semibold">{validTopicsCount}</span>{' '}
            {validTopicsCount === 1 ? 'topic' : 'topics'}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary"
          disabled={loading || validTopicsCount === 0}
        >
          {loading
            ? 'Adding...'
            : `Add ${validTopicsCount} ${validTopicsCount === 1 ? 'Topic' : 'Topics'}`}
        </button>
      </div>
    </form>
  );
}