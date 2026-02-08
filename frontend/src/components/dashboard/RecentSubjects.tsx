import { Subject } from '@/types';
import { BookOpen, Clock, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

interface RecentSubjectsProps {
  subjects: Subject[];
}

export default function RecentSubjects({ subjects }: RecentSubjectsProps) {
  const navigate = useNavigate();

  // Show 4 most recently created subjects
  const recentSubjects = subjects.slice(0, 4);

  if (recentSubjects.length === 0) {
    return null;
  }

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <BookOpen size={20} />
          Recent Subjects
        </h3>
        <button
          onClick={() => navigate('/subjects')}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          View All →
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recentSubjects.map((subject) => (
          <div
            key={subject.id}
            onClick={() => navigate(`/subjects/${subject.id}`)}
            className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all cursor-pointer"
          >
            <div
              className="h-1 rounded-full mb-3"
              style={{ backgroundColor: subject.color }}
            ></div>
            <h4 className="font-medium text-gray-900 mb-2">{subject.name}</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Clock size={14} />
                <span>
                  {subject.hoursCompleted}h / {subject.totalHoursRequired}h
                </span>
              </div>
              {subject.deadline && (
                <div className="flex items-center gap-2">
                  <Calendar size={14} />
                  <span>{format(new Date(subject.deadline), 'MMM d')}</span>
                </div>
              )}
            </div>
            <div className="mt-3">
              <div className="progress-bar h-2">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${subject.progress}%`,
                    backgroundColor: subject.color,
                  }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {subject.progress}% complete
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}