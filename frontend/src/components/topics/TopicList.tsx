import { Topic } from '@/types';
import { CheckCircle2, Circle, Clock, Edit, Trash2 } from 'lucide-react';

interface TopicListProps {
  topics: Topic[];
  onToggleComplete: (topic: Topic) => void;
  onEdit: (topic: Topic) => void;
  onDelete: (topic: Topic) => void;
}

export default function TopicList({
  topics,
  onToggleComplete,
  onEdit,
  onDelete,
}: TopicListProps) {
  if (topics.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No topics yet. Add your first topic to get started!
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {topics.map((topic) => (
        <div
          key={topic.id}
          className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
            topic.isCompleted
              ? 'bg-green-50 border-green-200'
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          {/* Checkbox */}
          <button
            onClick={() => onToggleComplete(topic)}
            className="flex-shrink-0"
          >
            {topic.isCompleted ? (
              <CheckCircle2 size={24} className="text-green-600" />
            ) : (
              <Circle size={24} className="text-gray-400 hover:text-gray-600" />
            )}
          </button>

          {/* Topic Info */}
          <div className="flex-1 min-w-0">
            <h4
              className={`font-medium ${
                topic.isCompleted
                  ? 'text-gray-500 line-through'
                  : 'text-gray-900'
              }`}
            >
              {topic.name}
            </h4>
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
              <Clock size={14} />
              <span>{topic.estimatedHours}h estimated</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => onEdit(topic)}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit size={18} />
            </button>
            <button
              onClick={() => onDelete(topic)}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}