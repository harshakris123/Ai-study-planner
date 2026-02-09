import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, TrendingUp, Target, Plus } from 'lucide-react';
import { subjectService } from '@/services/subjectService';
import { Subject, SubjectStats } from '@/types';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import StatsCard from '@/components/dashboard/StatsCard';
import UpcomingDeadlines from '@/components/dashboard/UpcomingDeadlines';
import ProgressChart from '@/components/dashboard/ProgressChart';
import RecentSubjects from '@/components/dashboard/RecentSubjects';
import AppLayout from '@/components/layout/AppLayout'; // ADD
import { showError } from '@/utils/toast'; // ADD

export default function DashboardPage() {
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [stats, setStats] = useState<SubjectStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [subjectsRes, statsRes] = await Promise.all([
        subjectService.getAll(),
        subjectService.getStats(),
      ]);
      setSubjects(subjectsRes.subjects);
      setStats(statsRes.stats);
    } catch (error) {
      showError('Failed to fetch dashboard data'); // CHANGED
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <LoadingSpinner />
      </AppLayout>
    );
  }

  const hasSubjects = subjects.length > 0;

  return (
    <AppLayout> {/* WRAP */}
      <div className="bg-gray-50 min-h-screen">
        {/* Remove the old header, AppLayout handles it */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!hasSubjects ? (
            // Empty State
            <div className="text-center py-16">
              <div className="flex justify-center mb-4">
                <div className="bg-blue-100 p-6 rounded-full">
                  <BookOpen size={64} className="text-blue-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome to AI Study Planner!
              </h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Get started by creating your first subject. Organize your learning,
                track progress, and achieve your goals!
              </p>
              <button
                onClick={() => navigate('/subjects')}
                className="btn-primary inline-flex items-center gap-2"
              >
                <Plus size={20} />
                Create Your First Subject
              </button>

              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                <div className="card text-center">
                  <div className="flex justify-center mb-3">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <Target size={24} className="text-blue-600" />
                    </div>
                  </div>
                  <h3 className="font-semibold mb-1">Set Goals</h3>
                  <p className="text-sm text-gray-600">
                    Define subjects, topics, and deadlines
                  </p>
                </div>
                <div className="card text-center">
                  <div className="flex justify-center mb-3">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <TrendingUp size={24} className="text-green-600" />
                    </div>
                  </div>
                  <h3 className="font-semibold mb-1">Track Progress</h3>
                  <p className="text-sm text-gray-600">
                    Monitor your learning journey
                  </p>
                </div>
                <div className="card text-center">
                  <div className="flex justify-center mb-3">
                    <div className="bg-purple-100 p-3 rounded-lg">
                      <Clock size={24} className="text-purple-600" />
                    </div>
                  </div>
                  <h3 className="font-semibold mb-1">Study Smart</h3>
                  <p className="text-sm text-gray-600">
                    AI-powered recommendations
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
                <p className="text-gray-600">Your study overview at a glance</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard
                  title="Total Subjects"
                  value={stats?.totalSubjects || 0}
                  subtitle={`${stats?.difficultyDistribution.hard || 0} hard subjects`}
                  icon={BookOpen}
                  color="blue"
                />
                <StatsCard
                  title="Study Hours"
                  value={`${stats?.totalHoursCompleted || 0}h`}
                  subtitle={`of ${stats?.totalHoursRequired || 0}h total`}
                  icon={Clock}
                  color="green"
                />
                <StatsCard
                  title="Overall Progress"
                  value={`${stats?.overallProgress || 0}%`}
                  subtitle="Across all subjects"
                  icon={TrendingUp}
                  color="purple"
                />
                <StatsCard
                  title="Upcoming Deadlines"
                  value={stats?.upcomingDeadlines.length || 0}
                  subtitle="In the next 7 days"
                  icon={Target}
                  color="orange"
                />
              </div>

              {/* Charts and Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <ProgressChart subjects={subjects} />
                <UpcomingDeadlines subjects={subjects} />
              </div>

              {/* Recent Subjects */}
              <RecentSubjects subjects={subjects} />
            </>
          )}
        </main>
      </div>
    </AppLayout>
  );
}