import { Subject } from '@/types';
import { Calendar, Clock, Target, Trash2, Edit } from 'lucide-react';
import { format } from 'date-fns';

interface SubjectCardProps {
  subject: Subject;
  onEdit: (subject: Subject) => void;
  onDelete: (subject: Subject) => void;
  onClick: (subject: Subject) => void;
}

export default function SubjectCard({
  subject,
  onEdit,
  onDelete,
  onClick,
}: SubjectCardProps) {
  const difficultyLabels = ['', 'Very Easy', 'Easy', 'Medium', 'Hard', 'Very Hard'];
  const difficultyColors = [
    '',
    'bg-green-100 text-green-800',
    'bg-blue-100 text-blue-800',
    'bg-yellow-100 text-yellow-800',
    'bg-orange-100 text-orange-800',
    'bg-red-100 text-red-800',
  ];

  return (
    <div
      className="card-hover cursor-pointer"
      onClick={() => onClick(subject)}
    >
      {/* Color bar */}
      <div
        className="h-2 rounded-t-xl -mt-6 -mx-6 mb-4"
        style={{ backgroundColor: subject.color }}
      ></div>

      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {subject.name}
          </h3>
          <span
            className={`badge ${
              difficultyColors[subject.difficultyLevel]
            }`}
          >
            {difficultyLabels[subject.difficultyLevel]}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(subject);
            }}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(subject);
            }}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
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

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock size={16} />
          <span>
            {subject.hoursCompleted}h / {subject.totalHoursRequired}h
          </span>
        </div>

        {subject.deadline && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar size={16} />
            <span>{format(new Date(subject.deadline), 'MMM d, yyyy')}</span>
          </div>
        )}

        {subject.topics && subject.topics.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Target size={16} />
            <span>{subject.topics.length} topics</span>
          </div>
        )}
      </div>
    </div>
  );
}