import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { LogOut, BookOpen, Clock, TrendingUp, Target, Plus } from 'lucide-react';
import { subjectService } from '@/services/subjectService';
import { Subject, SubjectStats } from '@/types';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import StatsCard from '@/components/dashboard/StatsCard';
import UpcomingDeadlines from '@/components/dashboard/UpcomingDeadlines';
import ProgressChart from '@/components/dashboard/ProgressChart';
import RecentSubjects from '@/components/dashboard/RecentSubjects';

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
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
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const hasSubjects = subjects.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                AI Study Planner
              </h1>
              <p className="text-gray-600 mt-1">Welcome back, {user?.fullName}!</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/subjects')}
                className="btn-outline flex items-center gap-2"
              >
                <BookOpen size={20} />
                My Subjects
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
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
          // Dashboard with Data
          <>
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
  );
}