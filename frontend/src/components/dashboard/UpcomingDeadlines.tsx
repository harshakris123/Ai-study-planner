import { Subject } from '@/types';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import { format, differenceInDays, isPast, isFuture } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface UpcomingDeadlinesProps {
  subjects: Subject[];
}

export default function UpcomingDeadlines({ subjects }: UpcomingDeadlinesProps) {
  const navigate = useNavigate();

  // Filter subjects with deadlines and sort by date
  const subjectsWithDeadlines = subjects
    .filter((s) => s.deadline)
    .sort(
      (a, b) =>
        new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime()
    )
    .slice(0, 5); // Show only 5 upcoming

  if (subjectsWithDeadlines.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar size={20} />
          Upcoming Deadlines
        </h3>
        <div className="text-center py-8 text-gray-500">
          <Calendar size={48} className="mx-auto mb-2 text-gray-400" />
          <p>No upcoming deadlines</p>
        </div>
      </div>
    );
  }

  const getDeadlineStatus = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const daysUntil = differenceInDays(deadlineDate, today);

    if (isPast(deadlineDate)) {
      return {
        label: 'Overdue',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
      };
    } else if (daysUntil <= 3) {
      return {
        label: `${daysUntil} days left`,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
      };
    } else if (daysUntil <= 7) {
      return {
        label: `${daysUntil} days left`,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
      };
    } else {
      return {
        label: `${daysUntil} days left`,
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
      };
    }
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Calendar size={20} />
        Upcoming Deadlines
      </h3>
      <div className="space-y-3">
        {subjectsWithDeadlines.map((subject) => {
          const status = getDeadlineStatus(subject.deadline!);
          return (
            <div
              key={subject.id}
              onClick={() => navigate(`/subjects/${subject.id}`)}
              className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${status.bgColor} ${status.borderColor}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">
                    {subject.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                    <Clock size={14} />
                    <span>
                      {format(new Date(subject.deadline!), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <div className="mt-2">
                    <div className="progress-bar h-1.5">
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
                <div className="flex-shrink-0">
                  <span className={`text-xs font-semibold ${status.color}`}>
                    {status.label}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}