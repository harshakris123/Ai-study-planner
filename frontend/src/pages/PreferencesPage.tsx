import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, RotateCcw, Settings } from 'lucide-react';
import { UserPreferences, UpdatePreferencesRequest } from '@/types';
import api from '@/services/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function PreferencesPage() {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState<UpdatePreferencesRequest>({
    studyHoursPerDay: 4,
    preferredStudyTimes: [],
    breakDuration: 15,
    maxContinuousStudy: 90,
    learningPace: 'MEDIUM',
  });

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const response = await api.get('/preferences');
      setPreferences(response.data.preferences);
      setFormData({
        studyHoursPerDay: response.data.preferences.studyHoursPerDay,
        preferredStudyTimes: response.data.preferences.preferredStudyTimes,
        breakDuration: response.data.preferences.breakDuration,
        maxContinuousStudy: response.data.preferences.maxContinuousStudy,
        learningPace: response.data.preferences.learningPace,
      });
    } catch (error) {
      console.error('Failed to fetch preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put('/preferences', formData);
      alert('Preferences saved successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Reset preferences to default values?')) return;

    try {
      setSaving(true);
      await api.post('/preferences/reset');
      fetchPreferences();
      alert('Preferences reset to defaults!');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to reset preferences');
    } finally {
      setSaving(false);
    }
  };

  const toggleStudyTime = (time: string) => {
    const current = formData.preferredStudyTimes || [];
    if (current.includes(time)) {
      setFormData({
        ...formData,
        preferredStudyTimes: current.filter((t) => t !== time),
      });
    } else {
      setFormData({
        ...formData,
        preferredStudyTimes: [...current, time],
      });
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const studyTimes = [
    { value: 'morning', label: 'Morning (6 AM - 12 PM)', icon: '🌅' },
    { value: 'afternoon', label: 'Afternoon (12 PM - 6 PM)', icon: '☀️' },
    { value: 'evening', label: 'Evening (6 PM - 10 PM)', icon: '🌆' },
    { value: 'night', label: 'Night (10 PM - 2 AM)', icon: '🌙' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <div className="flex items-center gap-3">
              <Settings size={28} className="text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Study Preferences</h1>
                <p className="text-sm text-gray-600">Customize your learning experience</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Study Hours Per Day */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Daily Study Target</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Study Hours Per Day
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0.5"
                  max="12"
                  step="0.5"
                  className="flex-1"
                  value={formData.studyHoursPerDay}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      studyHoursPerDay: parseFloat(e.target.value),
                    })
                  }
                />
                <span className="text-2xl font-bold text-blue-600 w-20 text-center">
                  {formData.studyHoursPerDay}h
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Recommended: 4-6 hours per day for effective learning
              </p>
            </div>
          </div>

          {/* Preferred Study Times */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Preferred Study Times</h3>
            <p className="text-sm text-gray-600 mb-4">
              Select when you're most productive (can select multiple)
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {studyTimes.map((time) => (
                <button
                  key={time.value}
                  type="button"
                  onClick={() => toggleStudyTime(time.value)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    formData.preferredStudyTimes?.includes(time.value)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{time.icon}</span>
                    <div>
                      <div className="font-medium">{time.label.split('(')[0]}</div>
                      <div className="text-sm text-gray-500">
                        ({time.label.split('(')[1]}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Learning Pace */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Learning Pace</h3>
            <p className="text-sm text-gray-600 mb-4">
              How quickly do you typically grasp new concepts?
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                {
                  value: 'SLOW',
                  label: 'Steady & Thorough',
                  desc: 'Take time to deeply understand',
                },
                {
                  value: 'MEDIUM',
                  label: 'Balanced',
                  desc: 'Mix of depth and speed',
                },
                {
                  value: 'FAST',
                  label: 'Quick Learner',
                  desc: 'Grasp concepts rapidly',
                },
              ].map((pace) => (
                <button
                  key={pace.value}
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      learningPace: pace.value as 'SLOW' | 'MEDIUM' | 'FAST',
                    })
                  }
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.learningPace === pace.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium mb-1">{pace.label}</div>
                  <div className="text-sm text-gray-600">{pace.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Break Settings */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Break Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Break Duration (minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="60"
                  step="5"
                  className="input-field"
                  value={formData.breakDuration}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      breakDuration: parseInt(e.target.value),
                    })
                  }
                />
                <p className="text-sm text-gray-500 mt-1">
                  Recommended: 10-15 minutes
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Continuous Study (minutes)
                </label>
                <input
                  type="number"
                  min="15"
                  max="240"
                  step="15"
                  className="input-field"
                  value={formData.maxContinuousStudy}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxContinuousStudy: parseInt(e.target.value),
                    })
                  }
                />
                <p className="text-sm text-gray-500 mt-1">
                  Recommended: 60-90 minutes (Pomodoro technique)
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center">
            <button
              onClick={handleReset}
              className="btn-outline flex items-center gap-2"
              disabled={saving}
            >
              <RotateCcw size={20} />
              Reset to Defaults
            </button>
            <button
              onClick={handleSave}
              className="btn-primary flex items-center gap-2"
              disabled={saving}
            >
              <Save size={20} />
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}