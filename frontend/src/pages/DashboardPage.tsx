import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  TrendingUp,
  Target,
  Plus,
  Brain,
} from 'lucide-react';

import { subjectService } from '@/services/subjectService';
import { aiService } from '@/services/aiService';

import {
  Subject,
  SubjectStats,
  CognitiveLoadResponse,
  ScheduleResponse,
} from '@/types';

import LoadingSpinner from '@/components/common/LoadingSpinner';
import StatsCard from '@/components/dashboard/StatsCard';
import UpcomingDeadlines from '@/components/dashboard/UpcomingDeadlines';
import ProgressChart from '@/components/dashboard/ProgressChart';
import RecentSubjects from '@/components/dashboard/RecentSubjects';
import AppLayout from '@/components/layout/AppLayout';
import { showError, showSuccess } from '@/utils/toast';
import { getApiErrorMessage } from '@/utils/error';

export default function DashboardPage() {
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [stats, setStats] = useState<SubjectStats | null>(null);
  const [loading, setLoading] = useState(true);

  const [cognitiveLoad, setCognitiveLoad] =
    useState<CognitiveLoadResponse | null>(null);

  const [scheduleInfo, setScheduleInfo] =
    useState<ScheduleResponse | null>(null);

  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    fetchLoad();
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
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
      }
      showError('Failed to fetch dashboard data');
      console.error('Dashboard data fetch failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLoad = async () => {
    try {
      const result = await aiService.getTodayLoad();
      console.log('LOAD RESPONSE:', result);

      if (result) {
        setCognitiveLoad({
          loadScore: result.totalLoadScore ?? result.loadScore ?? 0,
          state: result.notes ?? result.state ?? 'Fresh',
        });
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
      }
      console.error('Load fetch failed:', error);
    }
  };

  const handleGeneratePlan = async () => {
    try {
      setAiLoading(true);

      const result = await aiService.generatePlan();
      console.log('AI PLAN RESPONSE:', result);

      if (!result || !result.adaptiveAdjustments) {
        throw new Error('Invalid AI plan response');
      }

      setScheduleInfo(result);
      showSuccess('AI schedule generated successfully!');
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
      }

      console.error('Generate Plan Error:', error);

      showError(
        getApiErrorMessage(error, 'Failed to generate AI plan')
      );
    } finally {
      setAiLoading(false);
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
    <AppLayout>
      <div className="bg-gray-50 min-h-screen">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!hasSubjects ? (
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
                Get started by creating your first subject.
              </p>

              <button
                onClick={() => navigate('/subjects')}
                className="btn-primary inline-flex items-center gap-2"
              >
                <Plus size={20} />
                Create Your First Subject
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Dashboard
                </h2>
                <p className="text-gray-600">
                  Your study overview at a glance
                </p>
              </div>

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

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Brain className="text-blue-600" />
                    <h3 className="text-lg font-semibold">
                      Cognitive Load
                    </h3>
                  </div>

                  {cognitiveLoad ? (
                    <>
                      <p className="text-4xl font-bold text-blue-600">
                        {Number(cognitiveLoad.loadScore || 0).toFixed(2)}
                      </p>
                      <p className="text-gray-600 mt-2">
                        State: {cognitiveLoad.state}
                      </p>
                    </>
                  ) : (
                    <p className="text-gray-600">
                      No load data available yet.
                    </p>
                  )}
                </div>

                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    AI Scheduler
                  </h3>

                  <button
                    onClick={handleGeneratePlan}
                    disabled={aiLoading || !hasSubjects}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg"
                  >
                    {aiLoading ? 'Generating...' : 'Generate AI Plan'}
                  </button>

                  {scheduleInfo && (
                    <div className="mt-4 text-sm space-y-2">
                      <p>
                        Load State:{' '}
                        <span className="font-semibold">
                          {scheduleInfo.adaptiveAdjustments.loadState}
                        </span>
                      </p>

                      <p>
                        Daily Budget:{' '}
                        {scheduleInfo.adaptiveAdjustments.originalDailyBudget}
                        →
                        {scheduleInfo.adaptiveAdjustments.adjustedDailyBudget}{' '}
                        mins
                      </p>

                      <p>
                        Break Duration:{' '}
                        {scheduleInfo.adaptiveAdjustments.originalBreakMinutes}
                        →
                        {scheduleInfo.adaptiveAdjustments.adjustedBreakMinutes}{' '}
                        mins
                      </p>

                      <p>
                        Sessions Generated:{' '}
                        {scheduleInfo.totalSessions}
                      </p>

                      {scheduleInfo.warning && (
                        <p className="text-amber-600 font-medium">
                          {scheduleInfo.warning}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <ProgressChart subjects={subjects} />
                <UpcomingDeadlines subjects={subjects} />
              </div>

              <RecentSubjects subjects={subjects} />
            </>
          )}
        </main>
      </div>
    </AppLayout>
  );
}
