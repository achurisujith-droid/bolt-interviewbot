import React, { useState } from 'react';
import { Users, BarChart3, Award, Calendar, Eye, Download, Upload, Trash2, Wifi, AlertTriangle, RefreshCw, Mic, Video } from 'lucide-react';
import { InterviewSession, Certificate } from '../types/interview';
import { InterviewLinkGenerator } from './InterviewLinkGenerator';
import { OpenAITest } from './OpenAITest';
import { DetailedEvaluationReport } from './DetailedEvaluationReport';
import { ReEvaluationInterface } from './ReEvaluationInterface';
import { InterviewMethodComparison } from './InterviewMethodComparison';
import { downloadCertificate } from '../utils/certificateGenerator';

interface AdminDashboardProps {
  sessions: InterviewSession[];
  certificates: Certificate[];
  onGenerateLink: (candidateEmail: string, position: string) => string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  sessions,
  certificates,
  onGenerateLink
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSession, setSelectedSession] = useState<InterviewSession | null>(null);
  const [showDetailedReport, setShowDetailedReport] = useState(false);
  const [showReEvaluation, setShowReEvaluation] = useState(false);

  const completedSessions = sessions.filter(s => s.status === 'evaluated');
  const averageScore = completedSessions.length > 0 
    ? Math.round(completedSessions.reduce((sum, s) => sum + (s.score || 0), 0) / completedSessions.length)
    : 0;

  // Detect duplicate certificates
  const detectDuplicates = () => {
    const duplicates: { [key: string]: Certificate[] } = {};
    
    certificates.forEach(cert => {
      const key = `${cert.candidateName}-${cert.position}`;
      if (!duplicates[key]) {
        duplicates[key] = [];
      }
      duplicates[key].push(cert);
    });
    
    return Object.entries(duplicates).filter(([_, certs]) => certs.length > 1);
  };

  const duplicateCertificates = detectDuplicates();

  const handleViewDetails = (session: InterviewSession) => {
    setSelectedSession(session);
    setShowDetailedReport(true);
  };

  const handleReEvaluate = (session: InterviewSession) => {
    setSelectedSession(session);
    setShowReEvaluation(true);
  };

  const handleReEvaluationComplete = (updatedSession: InterviewSession, newCertificate: Certificate) => {
    // This would typically update the sessions and certificates in the parent component
    // For now, we'll just close the modal and show success
    setShowReEvaluation(false);
    setSelectedSession(null);
    alert(`✅ Re-evaluation complete! New score: ${updatedSession.score}%`);
  };
  const clearAllData = () => {
    const confirmMessage = `⚠️ DANGER: This will permanently delete ALL data:
    
• ${sessions.length} interview sessions
• ${certificates.length} certificates
• All transcripts and evaluations

This action CANNOT be undone!

Are you absolutely sure you want to continue?`;
    
    if (confirm(confirmMessage)) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const exportData = () => {
    const data = {
      sessions,
      certificates,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `interview-data-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.sessions && data.certificates) {
          localStorage.setItem('interviewSessions', JSON.stringify(data.sessions));
          localStorage.setItem('certificates', JSON.stringify(data.certificates));
          alert('✅ Data imported successfully! Refreshing page...');
          window.location.reload();
        } else {
          alert('❌ Invalid backup file format');
        }
      } catch (error) {
        alert('❌ Failed to import data: Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };
  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-blue-500 text-white rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Sessions</p>
              <p className="text-3xl font-bold">{sessions.length}</p>
            </div>
            <Users className="w-8 h-8 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-green-500 text-white rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Completed</p>
              <p className="text-3xl font-bold">{completedSessions.length}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-green-200" />
          </div>
        </div>
        
        <div className="bg-purple-500 text-white rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Certificates</p>
              <p className="text-3xl font-bold">{certificates.length}</p>
            </div>
            <Award className="w-8 h-8 text-purple-200" />
          </div>
        </div>
        
        <div className="bg-yellow-500 text-white rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100">Avg Score</p>
              <p className="text-3xl font-bold">{averageScore}%</p>
            </div>
            <BarChart3 className="w-8 h-8 text-yellow-200" />
          </div>
        </div>
      </div>
      
      <InterviewLinkGenerator onGenerateLink={onGenerateLink} />
      
      {/* Quick Test Buttons */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Test Audio Interview</h3>
        <div className="flex space-x-4">
          <button
            onClick={() => {
              const testSession = {
                id: `test-${Date.now()}`,
                candidateName: 'Test Candidate',
                candidateEmail: 'test@example.com',
                position: 'Software Developer',
                status: 'pending' as const,
                createdAt: new Date(),
                responses: []
              };
              // Trigger audio interview
              window.location.href = `?session=${testSession.id}&name=${testSession.candidateName}&email=${testSession.candidateEmail}&position=${testSession.position}`;
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <Mic className="w-4 h-4 mr-2" />
            Test AI Audio Interview
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Quick button to test the AI audio interview without generating links
        </p>
      </div>
      
      {/* Duplicate Detection Alert */}
      {duplicateCertificates.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800 mb-2">
                Duplicate Certificates Detected
              </h3>
              <div className="space-y-1">
                {duplicateCertificates.map(([key, certs]) => (
                  <p key={key} className="text-sm text-yellow-700">
                    • <strong>{certs[0].candidateName}</strong> ({certs[0].position}): 
                    {certs.map(c => ` ${c.score}%`).join(', ')} - {certs.length} certificates
                  </p>
                ))}
              </div>
              <p className="text-xs text-yellow-600 mt-2">
                Multiple certificates found for the same candidate and position. This may indicate duplicate interviews.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Data Management</h2>
          <div className="text-sm text-gray-500">
            {sessions.length} sessions • {certificates.length} certificates
          </div>
        </div>
        
        {/* Data Status */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Current Data Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium text-blue-700">Sessions:</span>
              <span className="ml-1 text-blue-600">{sessions.length}</span>
            </div>
            <div>
              <span className="font-medium text-blue-700">Certificates:</span>
              <span className="ml-1 text-blue-600">{certificates.length}</span>
            </div>
            <div>
              <span className="font-medium text-blue-700">With Transcripts:</span>
              <span className="ml-1 text-blue-600">
                {sessions.filter(s => s.responses.some(r => r.transcript)).length}
              </span>
            </div>
            <div>
              <span className="font-medium text-blue-700">Storage:</span>
              <span className="ml-1 text-blue-600">
                {typeof Storage !== "undefined" ? 'Available' : 'Not Available'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={exportData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </button>
          
          <label className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm flex items-center cursor-pointer">
            <Upload className="w-4 h-4 mr-2" />
            Import Data
            <input
              type="file"
              accept=".json"
              onChange={importData}
              className="hidden"
            />
          </label>
          
          <button
            onClick={() => {
              console.log('🔍 Current localStorage data:');
              console.log('🔑 All keys:', Object.keys(localStorage));
              console.log('📊 Total items:', localStorage.length);
              
              const sessionsData = localStorage.getItem('interviewSessions');
              const certificatesData = localStorage.getItem('certificates');
              
              console.log('📊 Sessions data:', sessionsData);
              console.log('🎓 Certificates data:', certificatesData);
              
              if (sessionsData) {
                try {
                  const parsed = JSON.parse(sessionsData);
                  console.log('✅ Sessions parsed successfully:', parsed.length, 'items');
                  
                  // Check for completed sessions without certificates
                  const completedSessions = parsed.filter(s => s.status === 'completed' || s.status === 'evaluated');
                  console.log('🎯 Completed sessions:', completedSessions);
                  
                  completedSessions.forEach(session => {
                    console.log(`📋 Session: ${session.candidateName} - ${session.position}`);
                    console.log(`   Score: ${session.score}%`);
                    console.log(`   Status: ${session.status}`);
                    console.log(`   Completed: ${session.completedAt}`);
                    console.log(`   Responses: ${session.responses?.length || 0}`);
                   console.log(`   Interview Type: ${session.interviewType || 'audio'}`);
                  });
                } catch (e) {
                  console.error('❌ Sessions data corrupted:', e);
                }
              }
              
              if (certificatesData) {
                try {
                  const parsed = JSON.parse(certificatesData);
                  console.log('✅ Certificates parsed successfully:', parsed.length, 'items');
                  parsed.forEach(cert => {
                    console.log(`🏆 Certificate: ${cert.candidateName} - ${cert.position} - ${cert.score}%`);
                  });
                } catch (e) {
                  console.error('❌ Certificates data corrupted:', e);
                }
              }
              
              // Check for any interview-related data
              console.log('🔍 Searching for backup data...');
              Object.keys(localStorage).forEach(key => {
                if (key.toLowerCase().includes('interview') || 
                    key.toLowerCase().includes('session') || 
                    key.toLowerCase().includes('cert') ||
                    key.toLowerCase().includes('backup')) {
                  console.log(`🔍 Found: ${key}:`, localStorage.getItem(key));
                }
              });
              
              // Generate missing certificates
              if (sessionsData) {
                try {
                  const sessions = JSON.parse(sessionsData);
                  const existingCerts = certificatesData ? JSON.parse(certificatesData) : [];
                  
                 // Look for ALL sessions with scores, including video interviews
                 const completedSessions = sessions.filter(s => {
                   const hasScore = s.score !== undefined && s.score !== null;
                   const isCompleted = s.status === 'completed' || s.status === 'evaluated';
                   const hasResponses = s.responses && s.responses.length > 0;
                   
                   console.log(`🔍 Checking session ${s.candidateName}:`, {
                     hasScore,
                     score: s.score,
                     isCompleted,
                     status: s.status,
                     hasResponses,
                     responseCount: s.responses?.length || 0,
                     interviewType: s.interviewType || 'audio'
                   });
                   
                   return hasScore && (isCompleted || hasResponses);
                 });
                  
                  const missingSessions = completedSessions.filter(session => {
                    return !existingCerts.some(cert => 
                      cert.candidateName === session.candidateName && 
                      cert.position === session.position
                    );
                  });
                  
                  console.log('🔍 Missing certificates for:', missingSessions.length, 'sessions');
                 missingSessions.forEach(session => {
                   console.log(`📋 Missing cert for: ${session.candidateName} - ${session.position} - ${session.score}% (${session.interviewType || 'audio'})`);
                 });
                  
                  if (missingSessions.length > 0) {
                    console.log('🔧 Generating missing certificates...');
                    
                    const newCertificates = missingSessions.map(session => ({
                      id: `cert-recovered-${session.id}`,
                      candidateName: session.candidateName,
                      position: session.position,
                      score: session.score,
                      issueDate: new Date(session.completedAt || session.createdAt),
                     certificateNumber: `AI-CERT-${Date.now().toString().slice(-8)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
                     evaluationMethod: session.interviewType === 'video' ? 'Video Interview with AI Agent' : 'Audio Interview with GPT-4o'
                    }));
                    
                    const allCertificates = [...existingCerts, ...newCertificates];
                    localStorage.setItem('certificates', JSON.stringify(allCertificates));
                    
                    console.log('✅ Generated', newCertificates.length, 'missing certificates');
                   
                   const videoInterviews = newCertificates.filter(c => c.evaluationMethod?.includes('Video'));
                   const audioInterviews = newCertificates.filter(c => !c.evaluationMethod?.includes('Video'));
                   
                   let message = `🔧 Generated ${newCertificates.length} missing certificates!\n\n`;
                   if (videoInterviews.length > 0) {
                     message += `📹 Video Interviews: ${videoInterviews.length}\n`;
                     videoInterviews.forEach(c => {
                       message += `   • ${c.candidateName} - ${c.score}%\n`;
                     });
                   }
                   if (audioInterviews.length > 0) {
                     message += `🎤 Audio Interviews: ${audioInterviews.length}\n`;
                     audioInterviews.forEach(c => {
                       message += `   • ${c.candidateName} - ${c.score}%\n`;
                     });
                   }
                   message += `\nRefresh to see them in the certificates list!`;
                   
                   alert(message);
                    
                    setTimeout(() => window.location.reload(), 1000);
                    return;
                  }
                } catch (error) {
                  console.error('❌ Failed to generate missing certificates:', error);
                }
              }
              
              // Show summary in alert
              const summary = `
📊 Data Summary:
• Sessions: ${sessions.length}
• Certificates: ${certificates.length}
• localStorage keys: ${Object.keys(localStorage).length}
• Sessions stored: ${sessionsData ? 'Yes' : 'No'}
• Certificates stored: ${certificatesData ? 'Yes' : 'No'}

Check console (F12) for detailed information.
              `;
              alert(summary);
            }}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm flex items-center"
          >
            <Eye className="w-4 h-4 mr-2" />
            Debug & Fix Missing Certificates
          </button>
          
          <button
            onClick={() => {
              console.log('🔄 Attempting data recovery...');
              
              // Try to recover from backups
              const allKeys = Object.keys(localStorage);
              const backupSessionKeys = allKeys.filter(key => key.startsWith('backup_sessions_'));
              const backupCertKeys = allKeys.filter(key => key.startsWith('backup_certificates_'));
              
              console.log('🔍 Found backup session keys:', backupSessionKeys);
              console.log('🔍 Found backup certificate keys:', backupCertKeys);
              
              let recoveredSessions = 0;
              let recoveredCertificates = 0;
              
              // Recover latest session backup
              if (backupSessionKeys.length > 0) {
                const latestSessionKey = backupSessionKeys.sort().pop();
                const backupData = localStorage.getItem(latestSessionKey!);
                if (backupData) {
                  try {
                    localStorage.setItem('interviewSessions', backupData);
                    const parsed = JSON.parse(backupData);
                    recoveredSessions = parsed.length;
                    console.log('✅ Recovered sessions from:', latestSessionKey);
                  } catch (error) {
                    console.error('❌ Failed to recover sessions:', error);
                  }
                }
              }
              
              // Recover latest certificate backup
              if (backupCertKeys.length > 0) {
                const latestCertKey = backupCertKeys.sort().pop();
                const backupData = localStorage.getItem(latestCertKey!);
                if (backupData) {
                  try {
                    localStorage.setItem('certificates', backupData);
                    const parsed = JSON.parse(backupData);
                    recoveredCertificates = parsed.length;
                    console.log('✅ Recovered certificates from:', latestCertKey);
                  } catch (error) {
                    console.error('❌ Failed to recover certificates:', error);
                  }
                }
              }
              
              const message = `
🔄 Data Recovery Complete:
• Sessions recovered: ${recoveredSessions}
• Certificates recovered: ${recoveredCertificates}
• Backup sessions found: ${backupSessionKeys.length}
• Backup certificates found: ${backupCertKeys.length}

${(recoveredSessions > 0 || recoveredCertificates > 0) ? 'Refresh the page to see recovered data!' : 'No backup data found to recover.'}
              `;
              
              alert(message);
              
              if (recoveredSessions > 0 || recoveredCertificates > 0) {
                setTimeout(() => window.location.reload(), 2000);
              }
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Recover Data
          </button>
          
          <button
            onClick={clearAllData}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm flex items-center"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All Data
          </button>
          
          <button
            onClick={() => {
              // Clean up old/incomplete sessions
              const now = new Date();
              const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
              
              const activeSessions = sessions.filter(s => 
                s.status === 'completed' || s.status === 'evaluated' ||
                (s.status === 'in-progress' && s.createdAt > oneHourAgo)
              );
              
              if (activeSessions.length !== sessions.length) {
                localStorage.setItem('interviewSessions', JSON.stringify(activeSessions));
                alert(`🧹 Cleaned up ${sessions.length - activeSessions.length} old/incomplete sessions. Refresh to see changes.`);
                setTimeout(() => window.location.reload(), 1000);
              } else {
                alert('✅ No sessions need cleanup.');
              }
            }}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Clean Old Sessions
          </button>
        </div>
        
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            💡 <strong>Tips:</strong> Export your data regularly to prevent loss. Use "Clean Old Sessions" to remove incomplete interviews. Data is stored locally in your browser.
          </p>
        </div>
      </div>

      {/* Modals */}
      {showDetailedReport && selectedSession && (
        <DetailedEvaluationReport
          session={selectedSession}
          certificate={certificates.find(c => c.candidateName === selectedSession.candidateName && c.position === selectedSession.position)}
          onClose={() => {
            setShowDetailedReport(false);
            setSelectedSession(null);
          }}
        />
      )}

      {showReEvaluation && selectedSession && (
        <ReEvaluationInterface
          session={selectedSession}
          onClose={() => {
            setShowReEvaluation(false);
            setSelectedSession(null);
          }}
          onReEvaluationComplete={handleReEvaluationComplete}
        />
      )}
    </div>
  );

  const renderSessions = () => (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold text-gray-800">Interview Sessions</h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Candidate</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sessions.map(session => (
              <tr key={session.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{session.candidateName}</div>
                    <div className="text-sm text-gray-500">{session.candidateEmail}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{session.position}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    session.status === 'evaluated' ? 'bg-green-100 text-green-800' :
                    session.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    session.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {session.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {session.score ? `${session.score}%` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {session.createdAt.toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button 
                    onClick={() => handleViewDetails(session)}
                    className="text-blue-600 hover:text-blue-900 mr-3 flex items-center"
                    title="View Detailed Report"
                  >
                    <Eye className="w-4 h-4" />
                    <span className="ml-1 text-xs">Details</span>
                  </button>
                  <button 
                    onClick={() => {
                      try {
                        const relatedCertificate = certificates.find(c => 
                          c.candidateName === session.candidateName && 
                          c.position === session.position
                        );
                        if (relatedCertificate) {
                          downloadCertificate(relatedCertificate, session);
                          alert('✅ Detailed evaluation report downloaded successfully!');
                        } else {
                          alert('❌ No certificate found for this session. Complete the evaluation first.');
                        }
                      } catch (error) {
                        console.error('Evaluation report download failed:', error);
                        alert('❌ Failed to download evaluation report. Please try again.');
                      }
                    }}
                    className="text-green-600 hover:text-green-900 mr-3 flex items-center"
                    title="Download Detailed Report"
                  >
                    <Download className="w-4 h-4" />
                    <span className="ml-1 text-xs">Download</span>
                  </button>
                  {session.status === 'evaluated' && session.responses.some(r => r.transcript) && (
                    <button 
                      onClick={() => handleReEvaluate(session)}
                      className="text-purple-600 hover:text-purple-900 mr-3 flex items-center"
                      title="Re-evaluate with Different Criteria"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span className="ml-1 text-xs">Re-evaluate</span>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCertificates = () => (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold text-gray-800">Issued Certificates</h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Candidate</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Certificate No</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {certificates.map(cert => (
              <tr key={cert.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {cert.candidateName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cert.position}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-sm font-medium ${
                    cert.score >= 80 ? 'text-green-600' :
                    cert.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {cert.score}%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                  {cert.certificateNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {cert.issueDate.toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button 
                    onClick={() => {
                      try {
                        const relatedSession = sessions.find(s => 
                          s.candidateName === cert.candidateName && 
                          s.position === cert.position
                        );
                        downloadCertificate(cert, relatedSession);
                        alert('Detailed Evaluation Report downloaded successfully!');
                      } catch (error) {
                        console.error('Evaluation report download failed:', error);
                        alert('Failed to download evaluation report. Please try again.');
                      }
                    }}
                    className="text-green-600 hover:text-green-900 flex items-center"
                    title="Download Detailed Evaluation Report"
                  >
                    <Download className="w-4 h-4" />
                    <span className="ml-1 text-xs">Report</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-600">Manage interviews and monitor candidate performance</p>
        </div>
        
        <div className="mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'sessions', label: 'Sessions', icon: Users },
              { id: 'certificates', label: 'Certificates', icon: Award },
              { id: 'test-api', label: 'Test API', icon: Wifi },
              { id: 'methods', label: 'Interview Methods', icon: Video }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        
        <div>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'sessions' && renderSessions()}
          {activeTab === 'certificates' && renderCertificates()}
          {activeTab === 'test-api' && <OpenAITest />}
          {activeTab === 'methods' && <InterviewMethodComparison />}
        </div>
      </div>

      {/* Detailed Evaluation Report Modal */}
      {showDetailedReport && selectedSession && (
        <DetailedEvaluationReport
          session={selectedSession}
          certificate={certificates.find(c => 
            c.candidateName === selectedSession.candidateName && 
            c.position === selectedSession.position
          )}
          onClose={() => {
            setShowDetailedReport(false);
            setSelectedSession(null);
          }}
        />
      )}

      {/* Re-evaluation Interface Modal */}
      {showReEvaluation && selectedSession && (
        <ReEvaluationInterface
          session={selectedSession}
          onClose={() => {
            setShowReEvaluation(false);
            setSelectedSession(null);
          }}
          onReEvaluationComplete={handleReEvaluationComplete}
        />
      )}
    </div>
  );
};