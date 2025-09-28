import React, { useState, useEffect } from 'react';
import { User, Award, Clock, TrendingUp, BookOpen, LogOut, Calendar, Star, Target, Users, Filter, Search, Bell, Settings, BarChart3, Trophy, Zap, CheckCircle, ArrowRight, Play, Briefcase, GraduationCap, Upload } from 'lucide-react';
import { OfferingsGrid } from './OfferingsGrid';
import { InterviewScheduler } from './InterviewScheduler';
import { ProductPurchaseModal } from './ProductPurchaseModal';
import { downloadCertificate } from '../../utils/certificateGenerator';
import { InterviewProduct, InterviewSchedule, UserPurchase } from '../../types/products';
import { interviewProducts } from '../../data/products';
import { ResumeUpload } from '../ResumeUpload';
import { InterviewInterface } from '../InterviewInterface';
import { EvaluationInterface } from '../EvaluationInterface';
import { analyzeResume } from '../../utils/resumeAnalyzer';
import { InterviewSession, InterviewResponse, ResumeAnalysis } from '../../types/interview';

interface JobseekerDashboardProps {
  user: any;
  sessions: InterviewSession[];
  certificates: Certificate[];
  onLogout: () => void;
  onStartInterview: (position: string) => void;
}

export const JobseekerDashboard: React.FC<JobseekerDashboardProps> = ({
  user,
  sessions,
  certificates,
  onLogout,
  onStartInterview
}) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedProduct, setSelectedProduct] = useState<InterviewProduct | null>(null);
  const [showScheduler, setShowScheduler] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [userPurchases, setUserPurchases] = useState<UserPurchase[]>([]);
  const [userStats, setUserStats] = useState({
    completedInterviews: 3,
    averageScore: 78,
    certificatesEarned: 2,
    hoursSpent: 4.5,
    streak: 5,
    rank: 'Advanced'
  });
  const [recentActivity, setRecentActivity] = useState([
    { type: 'completed', title: 'Software Developer Interview', score: 85, date: '2 days ago' },
    { type: 'scheduled', title: 'Data Scientist Assessment', date: 'Tomorrow 2:00 PM' },
    { type: 'certificate', title: 'Frontend Developer Certificate', date: '1 week ago' }
  ]);
  
  // Filter certificates for current user
  const userCertificates = certificates.filter(cert => 
    cert.candidateName === user.name || cert.candidateEmail === user.email
  );

  // Load user purchases from localStorage
  useEffect(() => {
    const savedPurchases = localStorage.getItem(`userPurchases_${user.id}`);
    if (savedPurchases) {
      try {
        const purchases = JSON.parse(savedPurchases).map((p: any) => ({
          ...p,
          purchasedAt: new Date(p.purchasedAt),
          expiresAt: p.expiresAt ? new Date(p.expiresAt) : undefined,
          usedAt: p.usedAt ? new Date(p.usedAt) : undefined
        }));
        setUserPurchases(purchases);
      } catch (error) {
        console.error('Failed to load user purchases:', error);
      }
    }
  }, [user.id]);

  // Save purchases to localStorage
  useEffect(() => {
    localStorage.setItem(`userPurchases_${user.id}`, JSON.stringify(userPurchases));
  }, [userPurchases, user.id]);

  const handleSelectProduct = (product: InterviewProduct) => {
    setSelectedProduct(product);
    
    // Check if user has purchased this product
    const hasPurchased = userPurchases.some(purchase => 
      purchase.productId === product.id && 
      (purchase.status === 'active' || purchase.status === 'used')
    );
    
    if (hasPurchased) {
      // Start interview directly
      onStartInterview(product.name);
    } else {
      // Show purchase modal
      setShowPurchaseModal(true);
    }
  };

  const handlePurchase = (paymentData: any) => {
    // Create purchase record
    const purchase: UserPurchase = {
      id: `purchase-${Date.now()}`,
      userId: user.id,
      productId: selectedProduct!.id,
      paymentId: paymentData.id,
      status: 'active',
      purchasedAt: new Date()
    };
    
    setUserPurchases(prev => [...prev, purchase]);
    setShowPurchaseModal(false);
    
    // Start interview immediately after purchase
    onStartInterview(selectedProduct!.name);
  };

  const handleSchedule = (schedule: Omit<InterviewSchedule, 'id' | 'createdAt'>) => {
    console.log('Scheduled interview:', schedule);
    setShowScheduler(false);
    setSelectedProduct(null);
    // In real app, this would save to backend
    alert(`✅ Interview scheduled for ${schedule.scheduledAt.toLocaleString()}`);
  };

  const handleStartNow = (product: InterviewProduct) => {
    setShowScheduler(false);
    setSelectedProduct(null);
    onStartInterview(product.name);
  };

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Welcome Section with Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl p-8 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name}! 👋</h1>
              <p className="text-blue-100 text-lg">Ready to advance your career with AI-powered interviews?</p>
            </div>
            <div className="text-right">
              <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2 backdrop-blur-sm">
                <div className="text-2xl font-bold">{userStats.rank}</div>
                <div className="text-sm text-blue-100">Current Level</div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center mb-2">
                <Trophy className="w-5 h-5 mr-2 text-yellow-300" />
                <span className="text-sm text-blue-100">Completed</span>
              </div>
              <div className="text-2xl font-bold">{userStats.completedInterviews}</div>
            </div>
            
            <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center mb-2">
                <BarChart3 className="w-5 h-5 mr-2 text-green-300" />
                <span className="text-sm text-blue-100">Avg Score</span>
              </div>
              <div className="text-2xl font-bold">{userStats.averageScore}%</div>
            </div>
            
            <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center mb-2">
                <Award className="w-5 h-5 mr-2 text-purple-300" />
                <span className="text-sm text-blue-100">Certificates</span>
              </div>
              <div className="text-2xl font-bold">{userStats.certificatesEarned}</div>
            </div>
            
            <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center mb-2">
                <Zap className="w-5 h-5 mr-2 text-orange-300" />
                <span className="text-sm text-blue-100">Streak</span>
              </div>
              <div className="text-2xl font-bold">{userStats.streak} days</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <div 
          onClick={() => setActiveTab('products')}
          className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 cursor-pointer border border-gray-100 hover:border-blue-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 group-hover:bg-blue-200 transition-colors rounded-lg p-3">
              <Play className="w-6 h-6 text-blue-600" />
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Start New Interview</h3>
          <p className="text-gray-600 text-sm">Choose from premium interview products</p>
        </div>

        <div 
          onClick={() => setActiveTab('schedule')}
          className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 cursor-pointer border border-gray-100 hover:border-green-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 group-hover:bg-green-200 transition-colors rounded-lg p-3">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Schedule Interview</h3>
          <p className="text-gray-600 text-sm">Plan your assessment for later</p>
        </div>

        <div 
          onClick={() => setActiveTab('certificates')}
          className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 cursor-pointer border border-gray-100 hover:border-purple-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 group-hover:bg-purple-200 transition-colors rounded-lg p-3">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">View Certificates</h3>
          <p className="text-gray-600 text-sm">Download your achievements</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Recent Activity</h3>
        <div className="space-y-4">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                  activity.type === 'completed' ? 'bg-green-100' :
                  activity.type === 'scheduled' ? 'bg-blue-100' : 'bg-purple-100'
                }`}>
                  {activity.type === 'completed' && <CheckCircle className="w-5 h-5 text-green-600" />}
                  {activity.type === 'scheduled' && <Calendar className="w-5 h-5 text-blue-600" />}
                  {activity.type === 'certificate' && <Award className="w-5 h-5 text-purple-600" />}
                </div>
                <div>
                  <div className="font-medium text-gray-800">{activity.title}</div>
                  <div className="text-sm text-gray-600">{activity.date}</div>
                </div>
              </div>
              {activity.score && (
                <div className="text-right">
                  <div className="font-semibold text-green-600">{activity.score}%</div>
                  <div className="text-xs text-gray-500">Score</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Progress Section */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Skill Progress</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Technical Skills</span>
                <span className="font-medium">85%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Communication</span>
                <span className="font-medium">72%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '72%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Problem Solving</span>
                <span className="font-medium">90%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '90%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recommended Next Steps</h3>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-blue-50 rounded-lg">
              <Briefcase className="w-5 h-5 text-blue-600 mr-3" />
              <div>
                <div className="font-medium text-blue-800">Senior Developer Assessment</div>
                <div className="text-sm text-blue-600">Based on your technical scores</div>
              </div>
            </div>
            <div className="flex items-center p-3 bg-green-50 rounded-lg">
              <GraduationCap className="w-5 h-5 text-green-600 mr-3" />
              <div>
                <div className="font-medium text-green-800">Leadership Skills Interview</div>
                <div className="text-sm text-green-600">Advance to management roles</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">AI</span>
                  </div>
                  <span className="ml-2 text-xl font-bold text-gray-800">InterviewBot</span>
                </div>
              </div>
              
              <div className="hidden md:block ml-10">
                <div className="flex items-baseline space-x-4">
                  {[
                    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                    { id: 'products', label: 'Interview Products', icon: BookOpen },
                    { id: 'schedule', label: 'Schedule', icon: Calendar },
                    { id: 'certificates', label: 'Certificates', icon: Award },
                    { id: 'profile', label: 'Profile', icon: User }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <tab.icon className="w-4 h-4 mr-2" />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">{user.name.charAt(0)}</span>
                </div>
                <span className="text-sm font-medium text-gray-700">{user.name}</span>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center px-3 py-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-1" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'products' && (
          <OfferingsGrid 
            onSelectOffering={handleSelectProduct}
            resumeAnalysis={resumeAnalysis}
            userPurchases={userPurchases}
          />
        )}
        {activeTab === 'schedule' && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">Schedule Management</h3>
            <p className="text-gray-600">Your scheduled interviews will appear here</p>
          </div>
        )}
        {activeTab === 'certificates' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Your Certificates</h2>
              <div className="text-sm text-gray-500">
                {userCertificates.length} certificate{userCertificates.length !== 1 ? 's' : ''} earned
              </div>
            </div>
            
            {userCertificates.length === 0 ? (
              <div className="text-center py-12">
                <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">No Certificates Yet</h3>
                <p className="text-gray-600 mb-4">Complete an interview to earn your first certificate</p>
                <button
                  onClick={() => setActiveTab('products')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Start Your First Interview
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userCertificates.map((certificate) => (
                  <div key={certificate.id} className="bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
                      <div className="flex items-center justify-between">
                        <Award className="w-8 h-8" />
                        <span className="text-sm font-medium">Certificate</span>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-gray-800 mb-2">{certificate.position}</h3>
                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex justify-between">
                          <span>Score:</span>
                          <span className={`font-bold ${
                            certificate.score >= 80 ? 'text-green-600' :
                            certificate.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {certificate.score}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Issue Date:</span>
                          <span>{new Date(certificate.issueDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Certificate ID:</span>
                          <span className="font-mono text-xs">{certificate.certificateNumber}</span>
                        </div>
                        {certificate.evaluationMethod && (
                          <div className="flex justify-between">
                            <span>Method:</span>
                            <span className="text-xs">{certificate.evaluationMethod}</span>
                          </div>
                        )}
                      </div>
                      
                      <button
                        onClick={async () => {
                          console.log('🔍 Certificate download clicked');
                          console.log('📜 Certificate data:', certificate);
                          
                          try {
                            const relatedSession = sessions.find(s => 
                                s.candidateName === certificate.candidateName && 
                                s.position === certificate.position
                              );
                            console.log('📊 Related session:', relatedSession);
                            console.log('📥 About to call downloadCertificate...');
                            const { downloadCertificate } = await import('../../utils/certificateGenerator');
                            downloadCertificate(certificate, relatedSession);
                            console.log('✅ downloadCertificate completed');
                          } catch (error) {
                            console.error('Certificate download failed:', error);
                            alert(`❌ Certificate download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
                          }
                        }}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 flex items-center justify-center"
                      >
                        <Award className="w-4 h-4 mr-2" />
                        Download Certificate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {activeTab === 'profile' && (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">Profile Settings</h3>
            <p className="text-gray-600">Manage your account preferences</p>
          </div>
        )}
      </main>

      {/* Interview Scheduler Modal */}
      {showScheduler && selectedProduct && (
        <InterviewScheduler
          offering={selectedProduct}
          onSchedule={handleSchedule}
          onStartNow={() => handleStartNow(selectedProduct)}
          onCancel={() => {
            setShowScheduler(false);
            setSelectedProduct(null);
          }}
        />
      )}

      {/* Purchase Modal */}
      {showPurchaseModal && selectedProduct && (
        <ProductPurchaseModal
          product={selectedProduct}
          onPurchase={handlePurchase}
          onStartTest={() => {
            setShowPurchaseModal(false);
            onStartInterview(selectedProduct.name);
          }}
          onClose={() => {
            setShowPurchaseModal(false);
            setSelectedProduct(null);
          }}
        />
      )}
    </div>
  );
};