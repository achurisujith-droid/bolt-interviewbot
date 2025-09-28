import React, { useState, useEffect } from 'react';
import { Users, DollarSign, TrendingUp, Award, Link, Copy, Mail, Phone, Building, Calendar, BarChart3, Target, CheckCircle, ExternalLink, Clock } from 'lucide-react';
import { Recruiter, ReferralEarning } from '../../types/products';

interface RecruiterPortalProps {
  recruiter: Recruiter;
  onLogout: () => void;
  onGenerateLink: (candidateEmail: string, position: string) => string;
}

export const RecruiterPortal: React.FC<RecruiterPortalProps> = ({
  recruiter,
  onLogout,
  onGenerateLink
}) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [referralLink, setReferralLink] = useState('');
  const [earnings, setEarnings] = useState<ReferralEarning[]>([]);
  const [candidateEmail, setCandidateEmail] = useState('');
  const [candidatePosition, setCandidatePosition] = useState('');
  const [generatedLinks, setGeneratedLinks] = useState<Array<{
    email: string;
    position: string;
    link: string;
    createdAt: Date;
  }>>([]);
  const [stats, setStats] = useState({
    totalReferrals: 24,
    successfulInterviews: 18,
    totalEarnings: 1250.00,
    pendingEarnings: 320.00,
    thisMonthEarnings: 480.00,
    conversionRate: 75
  });

  useEffect(() => {
    // Generate referral link
    const baseUrl = window.location.origin;
    const link = `${baseUrl}?ref=${recruiter.referralCode}`;
    setReferralLink(link);

    // Load mock earnings data
    const mockEarnings: ReferralEarning[] = [
      {
        id: 'earn-1',
        recruiterId: recruiter.id,
        candidateId: 'candidate-1',
        productId: 'video-premium',
        amount: 79.99,
        commission: 15.99,
        status: 'paid',
        createdAt: new Date('2024-01-15'),
        paidAt: new Date('2024-01-20'),
        referralCode: recruiter.referralCode
      },
      {
        id: 'earn-2',
        recruiterId: recruiter.id,
        candidateId: 'candidate-2',
        productId: 'audio-basic',
        amount: 29.99,
        commission: 5.99,
        status: 'pending',
        createdAt: new Date('2024-01-18'),
        referralCode: recruiter.referralCode
      }
    ];
    setEarnings(mockEarnings);
    
    // Load generated links from localStorage
    const savedLinks = localStorage.getItem(`recruiterLinks_${recruiter.id}`);
    if (savedLinks) {
      try {
        const links = JSON.parse(savedLinks).map((l: any) => ({
          ...l,
          createdAt: new Date(l.createdAt)
        }));
        setGeneratedLinks(links);
      } catch (error) {
        console.error('Failed to load generated links:', error);
      }
    }
  }, [recruiter]);

  // Save generated links to localStorage
  useEffect(() => {
    localStorage.setItem(`recruiterLinks_${recruiter.id}`, JSON.stringify(generatedLinks));
  }, [generatedLinks, recruiter.id]);

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    alert('✅ Referral link copied to clipboard!');
  };

  const handleGenerateInterviewLink = () => {
    if (!candidateEmail || !candidatePosition) {
      alert('Please enter both candidate email and position');
      return;
    }

    const link = onGenerateLink(candidateEmail, candidatePosition);
    const newLink = {
      email: candidateEmail,
      position: candidatePosition,
      link,
      createdAt: new Date()
    };

    setGeneratedLinks(prev => [newLink, ...prev]);
    setCandidateEmail('');
    setCandidatePosition('');
    
    // Copy to clipboard
    navigator.clipboard.writeText(link);
    alert(`✅ Interview link generated and copied!\n\nCandidate: ${candidateEmail}\nPosition: ${candidatePosition}`);
  };

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 rounded-2xl p-8 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome, {recruiter.name}! 💼</h1>
              <p className="text-green-100 text-lg">Track your referrals and earnings from AI interview assessments</p>
              <p className="text-green-200 text-sm mt-1">{recruiter.company}</p>
            </div>
            <div className="text-right">
              <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2 backdrop-blur-sm">
                <div className="text-2xl font-bold">{recruiter.commissionRate}%</div>
                <div className="text-sm text-green-100">Commission Rate</div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center mb-2">
                <Users className="w-5 h-5 mr-2 text-green-300" />
                <span className="text-sm text-green-100">Total Referrals</span>
              </div>
              <div className="text-2xl font-bold">{stats.totalReferrals}</div>
            </div>
            
            <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center mb-2">
                <CheckCircle className="w-5 h-5 mr-2 text-green-300" />
                <span className="text-sm text-green-100">Successful</span>
              </div>
              <div className="text-2xl font-bold">{stats.successfulInterviews}</div>
            </div>
            
            <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center mb-2">
                <DollarSign className="w-5 h-5 mr-2 text-green-300" />
                <span className="text-sm text-green-100">Total Earned</span>
              </div>
              <div className="text-2xl font-bold">${stats.totalEarnings}</div>
            </div>
            
            <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center mb-2">
                <TrendingUp className="w-5 h-5 mr-2 text-green-300" />
                <span className="text-sm text-green-100">This Month</span>
              </div>
              <div className="text-2xl font-bold">${stats.thisMonthEarnings}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Referral Link Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <Link className="w-5 h-5 mr-2 text-blue-600" />
          Your Referral Link
        </h3>
        <div className="flex items-center space-x-3">
          <input
            type="text"
            value={referralLink}
            readOnly
            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg font-mono text-sm"
          />
          <button
            onClick={copyReferralLink}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy
          </button>
        </div>
        <p className="text-gray-600 text-sm mt-3">
          Share this link with candidates. You'll earn {recruiter.commissionRate}% commission on every successful purchase.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Generate Interview Link */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center mb-4">
            <div className="bg-blue-100 rounded-lg p-3 mr-4">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">Generate Interview</h4>
              <p className="text-gray-600 text-sm">Create direct links</p>
            </div>
          </div>
          <div className="space-y-3">
            <input
              type="email"
              placeholder="candidate@email.com"
              value={candidateEmail}
              onChange={(e) => setCandidateEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <input
              type="text"
              placeholder="Position (e.g., Software Developer)"
              value={candidatePosition}
              onChange={(e) => setCandidatePosition(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <button
              onClick={handleGenerateInterviewLink}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors text-sm"
            >
              Generate & Copy Link
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center mb-4">
            <div className="bg-blue-100 rounded-lg p-3 mr-4">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">Email Campaign</h4>
              <p className="text-gray-600 text-sm">Send to your network</p>
            </div>
          </div>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors">
            Create Email Template
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center mb-4">
            <div className="bg-green-100 rounded-lg p-3 mr-4">
              <Phone className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">Direct Outreach</h4>
              <p className="text-gray-600 text-sm">Personal referrals</p>
            </div>
          </div>
          <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors">
            Contact Candidates
          </button>
        </div>
      </div>

      {/* Generated Links */}
      {generatedLinks.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Generated Interview Links</h3>
          <div className="space-y-4">
            {generatedLinks.slice(0, 10).map((linkData, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <div className="font-medium text-gray-800">{linkData.email}</div>
                  <div className="text-sm text-gray-600">{linkData.position}</div>
                  <div className="text-xs text-gray-500">{linkData.createdAt.toLocaleString()}</div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(linkData.link);
                      alert('✅ Link copied to clipboard!');
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Copy Link
                  </button>
                  <button
                    onClick={() => window.open(linkData.link, '_blank')}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Test Link
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Earnings */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Recent Earnings</h3>
        <div className="space-y-4">
          {earnings.slice(0, 5).map((earning) => (
            <div key={earning.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                  earning.status === 'paid' ? 'bg-green-100' : 'bg-yellow-100'
                }`}>
                  {earning.status === 'paid' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Clock className="w-5 h-5 text-yellow-600" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-gray-800">
                    Interview Purchase - {earning.productId.replace('-', ' ').toUpperCase()}
                  </div>
                  <div className="text-sm text-gray-600">
                    {earning.createdAt.toLocaleDateString()} • 
                    <span className={`ml-1 ${earning.status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                      {earning.status.charAt(0).toUpperCase() + earning.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-green-600">${earning.commission.toFixed(2)}</div>
                <div className="text-xs text-gray-500">from ${earning.amount.toFixed(2)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderEarnings = () => (
    <div className="space-y-6">
      {/* Earnings Summary */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total Earnings</p>
              <p className="text-3xl font-bold">${stats.totalEarnings.toFixed(2)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Pending</p>
              <p className="text-3xl font-bold">${stats.pendingEarnings.toFixed(2)}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">This Month</p>
              <p className="text-3xl font-bold">${stats.thisMonthEarnings.toFixed(2)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-200" />
          </div>
        </div>
      </div>

      {/* Earnings History */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Earnings History</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sale Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {earnings.map(earning => (
                <tr key={earning.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {earning.createdAt.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {earning.productId.replace('-', ' ').toUpperCase()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${earning.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    ${earning.commission.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      earning.status === 'paid' ? 'bg-green-100 text-green-800' :
                      earning.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {earning.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderReferrals = () => (
    <div className="space-y-6">
      {/* Interview Link Generator */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Generate Interview Links</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Candidate Email
              </label>
              <input
                type="email"
                value={candidateEmail}
                onChange={(e) => setCandidateEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="candidate@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Position
              </label>
              <input
                type="text"
                value={candidatePosition}
                onChange={(e) => setCandidatePosition(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Software Developer"
              />
            </div>
            
            <button
              onClick={handleGenerateInterviewLink}
              disabled={!candidateEmail || !candidatePosition}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg font-medium transition-colors"
            >
              Generate Interview Link
            </button>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-3">How it works:</h4>
            <ol className="text-sm text-blue-700 space-y-2">
              <li>1. Enter candidate's email and position</li>
              <li>2. System generates unique interview link</li>
              <li>3. Link is automatically copied to clipboard</li>
              <li>4. Send link to candidate via email/message</li>
              <li>5. Earn {recruiter.commissionRate}% commission when they complete</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Referral Tools */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Referral Tools</h3>
        
        <div className="space-y-6">
          {/* Referral Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Referral Link</label>
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={referralLink}
                readOnly
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg font-mono text-sm"
              />
              <button
                onClick={copyReferralLink}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </button>
            </div>
          </div>

          {/* Email Templates */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">Email Template - Job Seekers</h4>
              <div className="bg-gray-50 p-3 rounded text-sm text-gray-600 mb-3">
                "Hi [Name], I wanted to share an amazing AI interview platform that can help boost your career. Get professional evaluation and certificates from top-tier AI technology. Use my referral link: {referralLink}"
              </div>
              <button 
                onClick={() => {
                  const template = `Hi [Name], I wanted to share an amazing AI interview platform that can help boost your career. Get professional evaluation and certificates from top-tier AI technology. Use my referral link: ${referralLink}`;
                  navigator.clipboard.writeText(template);
                  alert('✅ Email template copied to clipboard!');
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded font-medium transition-colors"
              >
                Copy Email Template
              </button>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">Social Media Post</h4>
              <div className="bg-gray-50 p-3 rounded text-sm text-gray-600 mb-3">
                "🚀 Advance your career with AI-powered interviews! Get professional evaluation, detailed feedback, and certificates. Try it now: {referralLink} #CareerGrowth #AIInterview"
              </div>
              <button 
                onClick={() => {
                  const template = `🚀 Advance your career with AI-powered interviews! Get professional evaluation, detailed feedback, and certificates. Try it now: ${referralLink} #CareerGrowth #AIInterview`;
                  navigator.clipboard.writeText(template);
                  alert('✅ Social media post copied to clipboard!');
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded font-medium transition-colors"
              >
                Copy Social Post
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Performance Metrics</h3>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h4 className="font-medium text-gray-700 mb-4">Conversion Rate</h4>
            <div className="flex items-center mb-2">
              <div className="flex-1 bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-green-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${stats.conversionRate}%` }}
                />
              </div>
              <span className="ml-3 text-sm font-medium text-gray-800">{stats.conversionRate}%</span>
            </div>
            <p className="text-sm text-gray-600">
              {stats.successfulInterviews} successful out of {stats.totalReferrals} referrals
            </p>
          </div>

          <div>
            <h4 className="font-medium text-gray-700 mb-4">Monthly Trend</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">January</span>
                <span className="font-medium text-green-600">$480.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">December</span>
                <span className="font-medium text-gray-600">$320.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">November</span>
                <span className="font-medium text-gray-600">$450.00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">R</span>
                  </div>
                  <span className="ml-2 text-xl font-bold text-gray-800">Recruiter Portal</span>
                </div>
              </div>
              
              <div className="hidden md:block ml-10">
                <div className="flex items-baseline space-x-4">
                  {[
                    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                    { id: 'referrals', label: 'Referrals', icon: Users },
                    { id: 'earnings', label: 'Earnings', icon: DollarSign },
                    { id: 'links', label: 'Generated Links', icon: TrendingUp }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'bg-green-100 text-green-700'
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
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">{recruiter.name.charAt(0)}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-700">{recruiter.name}</div>
                  <div className="text-xs text-gray-500">{recruiter.company}</div>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center px-3 py-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'referrals' && renderReferrals()}
        {activeTab === 'earnings' && renderEarnings()}
        {activeTab === 'links' && (
          <div className="text-center py-12">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Generated Interview Links</h3>
              {generatedLinks.length === 0 ? (
                <div>
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No interview links generated yet</p>
                  <button
                    onClick={() => setActiveTab('referrals')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
                  >
                    Generate Your First Link
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {generatedLinks.map((linkData, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-800">{linkData.email}</div>
                        <div className="text-sm text-gray-600">{linkData.position}</div>
                        <div className="text-xs text-gray-500">{linkData.createdAt.toLocaleString()}</div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(linkData.link);
                            alert('✅ Link copied!');
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                        >
                          Copy
                        </button>
                        <button
                          onClick={() => window.open(linkData.link, '_blank')}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                        >
                          Test
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};