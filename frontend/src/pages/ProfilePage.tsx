import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Calendar, ArrowLeft, Save } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import AppLayout from '@/components/layout/AppLayout';
import { format } from 'date-fns';

export default function ProfilePage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  return (
    <AppLayout>
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>

          <div className="card">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <User size={40} className="text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {user?.fullName}
                </h1>
                <p className="text-gray-600">{user?.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="input-field bg-gray-50 cursor-not-allowed">
                  {user?.fullName}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="input-field bg-gray-50 cursor-not-allowed flex items-center gap-2">
                  <Mail size={18} className="text-gray-400" />
                  {user?.email}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Member Since
                </label>
                <div className="input-field bg-gray-50 cursor-not-allowed flex items-center gap-2">
                  <Calendar size={18} className="text-gray-400" />
                  {user?.createdAt && format(new Date(user.createdAt), 'MMMM d, yyyy')}
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                Profile editing will be available in a future update. For now, you can
                manage your study preferences from the Preferences page.
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => navigate('/preferences')}
                className="btn-primary"
              >
                Go to Preferences
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}