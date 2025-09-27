import React, { useState } from 'react';
import { Calendar, Clock, Bell, Mail, Smartphone, Monitor } from 'lucide-react';
import { InterviewOffering, InterviewSchedule } from '../../types/offerings';

interface InterviewSchedulerProps {
  offering: InterviewOffering;
  onSchedule: (schedule: Omit<InterviewSchedule, 'id' | 'createdAt'>) => void;
  onStartNow: () => void;
  onCancel: () => void;
}

export const InterviewScheduler: React.FC<InterviewSchedulerProps> = ({
  offering,
  onSchedule,
  onStartNow,
  onCancel
}) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notificationPreferences, setNotificationPreferences] = useState({
    email: true,
    sms: false,
    push: true
  });

  // Generate available time slots (9 AM to 6 PM, every hour)
  const timeSlots = [];
  for (let hour = 9; hour <= 18; hour++) {
    const time = `${hour.toString().padStart(2, '0')}:00`;
    timeSlots.push(time);
  }

  // Generate next 30 days (excluding weekends for demo)
  const availableDates = [];
  const today = new Date();
  for (let i = 1; i <= 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    // Skip weekends
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      availableDates.push(date.toISOString().split('T')[0]);
    }
  }

  const handleSchedule = () => {
    if (!selectedDate || !selectedTime) {
      alert('Please select both date and time');
      return;
    }

    const scheduledAt = new Date(`${selectedDate}T${selectedTime}:00`);
    
    const schedule: Omit<InterviewSchedule, 'id' | 'createdAt'> = {
      userId: 'current-user', // This would come from auth context
      offeringId: offering.id,
      scheduledAt,
      status: 'scheduled',
      reminderSent: false,
      notificationPreferences
    };

    onSchedule(schedule);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Schedule Your Interview</h2>
          <p className="text-gray-600">{offering.title}</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Interview Details */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">Interview Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center text-blue-700">
                <Clock className="w-4 h-4 mr-2" />
                Duration: {offering.duration} minutes
              </div>
              <div className="flex items-center text-blue-700">
                <Monitor className="w-4 h-4 mr-2" />
                {offering.questionCount} questions
              </div>
            </div>
          </div>

          {/* Quick Start Option */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2">Start Immediately</h3>
            <p className="text-green-700 text-sm mb-3">
              Ready to begin? You can start your interview right now without scheduling.
            </p>
            <button
              onClick={onStartNow}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Start Interview Now
            </button>
          </div>

          {/* Schedule for Later */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800">Or Schedule for Later</h3>
            
            {/* Date Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose a date</option>
                  {availableDates.map(date => {
                    const dateObj = new Date(date);
                    const formatted = dateObj.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    });
                    return (
                      <option key={date} value={date}>
                        {formatted}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Time Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Time
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!selectedDate}
                >
                  <option value="">Choose a time</option>
                  {timeSlots.map(time => (
                    <option key={time} value={time}>
                      {new Date(`2024-01-01T${time}:00`).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notification Preferences */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Reminder Notifications
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={notificationPreferences.email}
                    onChange={(e) => setNotificationPreferences(prev => ({
                      ...prev,
                      email: e.target.checked
                    }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Mail className="w-4 h-4 ml-2 mr-2 text-gray-500" />
                  <span className="text-sm text-gray-700">Email reminder (24 hours before)</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={notificationPreferences.sms}
                    onChange={(e) => setNotificationPreferences(prev => ({
                      ...prev,
                      sms: e.target.checked
                    }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Smartphone className="w-4 h-4 ml-2 mr-2 text-gray-500" />
                  <span className="text-sm text-gray-700">SMS reminder (1 hour before)</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={notificationPreferences.push}
                    onChange={(e) => setNotificationPreferences(prev => ({
                      ...prev,
                      push: e.target.checked
                    }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Bell className="w-4 h-4 ml-2 mr-2 text-gray-500" />
                  <span className="text-sm text-gray-700">Push notification (15 minutes before)</span>
                </label>
              </div>
            </div>

            {/* Schedule Confirmation */}
            {selectedDate && selectedTime && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2">Confirm Schedule</h4>
                <p className="text-yellow-700 text-sm">
                  Interview scheduled for {new Date(`${selectedDate}T${selectedTime}:00`).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })} at {new Date(`2024-01-01T${selectedTime}:00`).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSchedule}
            disabled={!selectedDate || !selectedTime}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Schedule Interview
          </button>
        </div>
      </div>
    </div>
  );
};