@@ .. @@
-import React, { useState } from 'react';
-import { User, Award, Clock, TrendingUp, BookOpen, LogOut } from 'lucide-react';
+import React, { useState, useEffect } from 'react';
+import { User, Award, Clock, TrendingUp, BookOpen, LogOut, Calendar, Star, Target, Users, Filter, Search, Bell, Settings, BarChart3, Trophy, Zap, CheckCircle, ArrowRight, Play, Briefcase, GraduationCap } from 'lucide-react';
+import { OfferingsGrid } from './OfferingsGrid';
+import { InterviewScheduler } from './InterviewScheduler';
+import { InterviewOffering, InterviewSchedule } from '../../types/offerings';
+import { defaultOfferings } from '../../data/offerings';
 
 interface JobseekerDashboardProps {
   user: any;
   onLogout: () => void;
   onStartInterview: () => void;
 }
 
 export const JobseekerDashboard: React.FC<JobseekerDashboardProps> = ({
   user,
   onLogout,
   onStartInterview
 }) => {
+  const [activeTab, setActiveTab] = useState('dashboard');
+  const [selectedOffering, setSelectedOffering] = useState<InterviewOffering | null>(null);
+  const [showScheduler, setShowScheduler] = useState(false);
+  const [userStats, setUserStats] = useState({
+    completedInterviews: 3,
+    averageScore: 78,
+    certificatesEarned: 2,
+    hoursSpent: 4.5,
+    streak: 5,
+    rank: 'Advanced'
+  });
+  const [recentActivity, setRecentActivity] = useState([
+    { type: 'completed', title: 'Software Developer Interview', score: 85, date: '2 days ago' },
+    { type: 'scheduled', title: 'Data Scientist Assessment', date: 'Tomorrow 2:00 PM' },
+    { type: 'certificate', title: 'Frontend Developer Certificate', date: '1 week ago' }
+  ]);
+
+  const handleSelectOffering = (offering: InterviewOffering) => {
+    setSelectedOffering(offering);
+    setShowScheduler(true);
+  };
+
+  const handleSchedule = (schedule: Omit<InterviewSchedule, 'id' | 'createdAt'>) => {
+    console.log('Scheduled interview:', schedule);
+    setShowScheduler(false);
+    setSelectedOffering(null);
+    // In real app, this would save to backend
+    alert(`✅ Interview scheduled for ${schedule.scheduledAt.toLocaleString()}`);
+  };
+
+  const handleStartNow = () => {
+    setShowScheduler(false);
+    setSelectedOffering(null);
+    onStartInterview();
+  };
+
+  const renderDashboard = () => (
+    <div className="space-y-8">
+      {/* Welcome Section with Gradient */}
+      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl p-8 text-white">
+        <div className="absolute inset-0 bg-black opacity-10"></div>
+        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
+        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
+        
+        <div className="relative z-10">
+          <div className="flex items-center justify-between mb-6">
+            <div>
+              <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name}! 👋</h1>
+              <p className="text-blue-100 text-lg">Ready to advance your career with AI-powered interviews?</p>
+            </div>
+            <div className="text-right">
+              <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2 backdrop-blur-sm">
+                <div className="text-2xl font-bold">{userStats.rank}</div>
+                <div className="text-sm text-blue-100">Current Level</div>
+              </div>
+            </div>
+          </div>
+          
+          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
+            <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
+              <div className="flex items-center mb-2">
+                <Trophy className="w-5 h-5 mr-2 text-yellow-300" />
+                <span className="text-sm text-blue-100">Completed</span>
+              </div>
+              <div className="text-2xl font-bold">{userStats.completedInterviews}</div>
+            </div>
+            
+            <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
+              <div className="flex items-center mb-2">
+                <BarChart3 className="w-5 h-5 mr-2 text-green-300" />
+                <span className="text-sm text-blue-100">Avg Score</span>
+              </div>
+              <div className="text-2xl font-bold">{userStats.averageScore}%</div>
+            </div>
+            
+            <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
+              <div className="flex items-center mb-2">
+                <Award className="w-5 h-5 mr-2 text-purple-300" />
+                <span className="text-sm text-blue-100">Certificates</span>
+              </div>
+              <div className="text-2xl font-bold">{userStats.certificatesEarned}</div>
+            </div>
+            
+            <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
+              <div className="flex items-center mb-2">
+                <Zap className="w-5 h-5 mr-2 text-orange-300" />
+                <span className="text-sm text-blue-100">Streak</span>
+              </div>
+              <div className="text-2xl font-bold">{userStats.streak} days</div>
+            </div>
+          </div>
+        </div>
+      </div>
+
+      {/* Quick Actions */}
+      <div className="grid md:grid-cols-3 gap-6">
+        <div 
+          onClick={() => setActiveTab('interviews')}
+          className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 cursor-pointer border border-gray-100 hover:border-blue-200"
+        >
+          <div className="flex items-center justify-between mb-4">
+            <div className="bg-blue-100 group-hover:bg-blue-200 transition-colors rounded-lg p-3">
+              <Play className="w-6 h-6 text-blue-600" />
+            </div>
+            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
+          </div>
+          <h3 className="text-lg font-semibold text-gray-800 mb-2">Start New Interview</h3>
+          <p className="text-gray-600 text-sm">Choose from 10+ specialized assessments</p>
+        </div>
+
+        <div 
+          onClick={() => setActiveTab('schedule')}
+          className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 cursor-pointer border border-gray-100 hover:border-green-200"
+        >
+          <div className="flex items-center justify-between mb-4">
+            <div className="bg-green-100 group-hover:bg-green-200 transition-colors rounded-lg p-3">
+              <Calendar className="w-6 h-6 text-green-600" />
+            </div>
+            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
+          </div>
+          <h3 className="text-lg font-semibold text-gray-800 mb-2">Schedule Interview</h3>
+          <p className="text-gray-600 text-sm">Plan your assessment for later</p>
+        </div>

+        <div 
+          onClick={() => setActiveTab('certificates')}
+          className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 cursor-pointer border border-gray-100 hover:border-purple-200"
+        >
+          <div className="flex items-center justify-between mb-4">
+            <div className="bg-purple-100 group-hover:bg-purple-200 transition-colors rounded-lg p-3">
+              <Award className="w-6 h-6 text-purple-600" />
+            </div>
+            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
+          </div>
+          <h3 className="text-lg font-semibold text-gray-800 mb-2">View Certificates</h3>
+          <p className="text-gray-600 text-sm">Download your achievements</p>
+        </div>
+      </div>

+      {/* Recent Activity */}
+      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
+        <h3 className="text-xl font-semibold text-gray-800 mb-6">Recent Activity</h3>
+        <div className="space-y-4">
+          {recentActivity.map((activity, index) => (
+            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
+              <div className="flex items-center">
+                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
+                  activity.type === 'completed' ? 'bg-green-100' :
+                  activity.type === 'scheduled' ? 'bg-blue-100' : 'bg-purple-100'
+                }`}>
+                  {activity.type === 'completed' && <CheckCircle className="w-5 h-5 text-green-600" />}
+                  {activity.type === 'scheduled' && <Calendar className="w-5 h-5 text-blue-600" />}
+                  {activity.type === 'certificate' && <Award className="w-5 h-5 text-purple-600" />}
+                </div>
+                <div>
+                  <div className="font-medium text-gray-800">{activity.title}</div>
+                  <div className="text-sm text-gray-600">{activity.date}</div>
+                </div>
+              </div>
+              {activity.score && (
+                <div className="text-right">
+                  <div className="font-semibold text-green-600">{activity.score}%</div>
+                  <div className="text-xs text-gray-500">Score</div>
+                </div>
+              )}
+            </div>
+          ))}
+        </div>
+      </div>

+      {/* Progress Section */}
+      <div className="grid md:grid-cols-2 gap-6">
+        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
+          <h3 className="text-lg font-semibold text-gray-800 mb-4">Skill Progress</h3>
+          <div className="space-y-4">
+            <div>
+              <div className="flex justify-between text-sm mb-1">
+                <span className="text-gray-600">Technical Skills</span>
+                <span className="font-medium">85%</span>
+              </div>
+              <div className="w-full bg-gray-200 rounded-full h-2">
+                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
+              </div>
+            </div>
+            <div>
+              <div className="flex justify-between text-sm mb-1">
+                <span className="text-gray-600">Communication</span>
+                <span className="font-medium">72%</span>
+              </div>
+              <div className="w-full bg-gray-200 rounded-full h-2">
+                <div className="bg-green-600 h-2 rounded-full" style={{ width: '72%' }}></div>
+              </div>
+            </div>
+            <div>
+              <div className="flex justify-between text-sm mb-1">
+                <span className="text-gray-600">Problem Solving</span>
+                <span className="font-medium">90%</span>
+              </div>
+              <div className="w-full bg-gray-200 rounded-full h-2">
+                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '90%' }}></div>
+              </div>
+            </div>
+          </div>
+        </div>

+        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
+          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recommended Next Steps</h3>
+          <div className="space-y-3">
+            <div className="flex items-center p-3 bg-blue-50 rounded-lg">
+              <Briefcase className="w-5 h-5 text-blue-600 mr-3" />
+              <div>
+                <div className="font-medium text-blue-800">Senior Developer Assessment</div>
+                <div className="text-sm text-blue-600">Based on your technical scores</div>
+              </div>
+            </div>
+            <div className="flex items-center p-3 bg-green-50 rounded-lg">
+              <GraduationCap className="w-5 h-5 text-green-600 mr-3" />
+              <div>
+                <div className="font-medium text-green-800">Leadership Skills Interview</div>
+                <div className="text-sm text-green-600">Advance to management roles</div>
+              </div>
+            </div>
+          </div>
+        </div>
+      </div>
+    </div>
+  );

   return (
-    <div className="min-h-screen bg-gray-100 p-6">
-      <div className="max-w-4xl mx-auto">
-        <div className="bg-white rounded-lg shadow-md p-8">
-          <div className="flex justify-between items-center mb-8">
-            <div>
-              <h1 className="text-3xl font-bold text-gray-800">Welcome, {user.name}!</h1>
-              <p className="text-gray-600">Ready to showcase your skills?</p>
-            </div>
-            <button
-              onClick={onLogout}
-              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
-            >
-              <LogOut className="w-4 h-4 mr-2" />
-              Logout
-            </button>
-          </div>
-
-          <div className="grid md:grid-cols-3 gap-6 mb-8">
-            <div className="bg-blue-50 rounded-lg p-6 text-center">
-              <User className="w-12 h-12 text-blue-600 mx-auto mb-4" />
-              <h3 className="text-lg font-semibold text-gray-800 mb-2">Profile</h3>
-              <p className="text-gray-600 text-sm">Manage your account settings</p>
-            </div>
-            
-            <div className="bg-green-50 rounded-lg p-6 text-center">
-              <Award className="w-12 h-12 text-green-600 mx-auto mb-4" />
-              <h3 className="text-lg font-semibold text-gray-800 mb-2">Certificates</h3>
-              <p className="text-gray-600 text-sm">View your achievements</p>
-            </div>
-            
-            <div className="bg-purple-50 rounded-lg p-6 text-center">
-              <TrendingUp className="w-12 h-12 text-purple-600 mx-auto mb-4" />
-              <h3 className="text-lg font-semibold text-gray-800 mb-2">Progress</h3>
-              <p className="text-gray-600 text-sm">Track your improvement</p>
-            </div>
-          </div>
-
-          <div className="text-center">
-            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-8 text-white mb-6">
-              <BookOpen className="w-16 h-16 mx-auto mb-4" />
-              <h2 className="text-2xl font-bold mb-2">Start Your AI Interview</h2>
-              <p className="text-blue-100 mb-6">
-                Upload your resume and get personalized questions based on your experience
-              </p>
-              <button
-                onClick={onStartInterview}
-                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
-              >
-                Begin Interview Process
-              </button>
-            </div>
-            
-            <div className="text-sm text-gray-500">
-              <p>✨ AI-powered evaluation with GPT-4o</p>
-              <p>📄 Resume-based personalized questions</p>
-              <p>🏆 Instant certificate generation</p>
-            </div>
-          </div>
-        </div>
-      </div>
-    </div>
+    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
+      {/* Navigation Header */}
+      <nav className="bg-white shadow-sm border-b border-gray-200">
+        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
+          <div className="flex justify-between items-center h-16">
+            <div className="flex items-center">
+              <div className="flex-shrink-0">
+                <div className="flex items-center">
+                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
+                    <span className="text-white font-bold text-sm">AI</span>
+                  </div>
+                  <span className="ml-2 text-xl font-bold text-gray-800">InterviewBot</span>
+                </div>
+              </div>
+              
+              <div className="hidden md:block ml-10">
+                <div className="flex items-baseline space-x-4">
+                  {[
+                    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
+                    { id: 'interviews', label: 'Interviews', icon: BookOpen },
+                    { id: 'schedule', label: 'Schedule', icon: Calendar },
+                    { id: 'certificates', label: 'Certificates', icon: Award },
+                    { id: 'profile', label: 'Profile', icon: User }
+                  ].map(tab => (
+                    <button
+                      key={tab.id}
+                      onClick={() => setActiveTab(tab.id)}
+                      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
+                        activeTab === tab.id
+                          ? 'bg-blue-100 text-blue-700'
+                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
+                      }`}
+                    >
+                      <tab.icon className="w-4 h-4 mr-2" />
+                      {tab.label}
+                    </button>
+                  ))}
+                </div>
+              </div>
+            </div>
+            
+            <div className="flex items-center space-x-4">
+              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
+                <Bell className="w-5 h-5" />
+              </button>
+              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
+                <Settings className="w-5 h-5" />
+              </button>
+              <div className="flex items-center space-x-3">
+                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
+                  <span className="text-white font-medium text-sm">{user.name.charAt(0)}</span>
+                </div>
+                <span className="text-sm font-medium text-gray-700">{user.name}</span>
+              </div>
+              <button
+                onClick={onLogout}
+                className="flex items-center px-3 py-2 text-gray-500 hover:text-gray-700 transition-colors"
+              >
+                <LogOut className="w-4 h-4 mr-1" />
+                <span className="text-sm">Logout</span>
+              </button>
+            </div>
+          </div>
+        </div>
+      </nav>

+      {/* Main Content */}
+      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
+        {activeTab === 'dashboard' && renderDashboard()}
+        {activeTab === 'interviews' && (
+          <OfferingsGrid 
+            onSelectOffering={handleSelectOffering}
+          />
+        )}
+        {activeTab === 'schedule' && (
+          <div className="text-center py-12">
+            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
+            <h3 className="text-lg font-medium text-gray-800 mb-2">Schedule Management</h3>
+            <p className="text-gray-600">Your scheduled interviews will appear here</p>
+          </div>
+        )}
+        {activeTab === 'certificates' && (
+          <div className="text-center py-12">
+            <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
+            <h3 className="text-lg font-medium text-gray-800 mb-2">Your Certificates</h3>
+            <p className="text-gray-600">Earned certificates will be displayed here</p>
+          </div>
+        )}
+        {activeTab === 'profile' && (
+          <div className="text-center py-12">
+            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
+            <h3 className="text-lg font-medium text-gray-800 mb-2">Profile Settings</h3>
+            <p className="text-gray-600">Manage your account preferences</p>
+          </div>
+        )}
+      </main>

+      {/* Interview Scheduler Modal */}
+      {showScheduler && selectedOffering && (
+        <InterviewScheduler
+          offering={selectedOffering}
+          onSchedule={handleSchedule}
+          onStartNow={handleStartNow}
+          onCancel={() => {
+            setShowScheduler(false);
+            setSelectedOffering(null);
+          }}
+        />
+      )}
+    </div>
   );
 };