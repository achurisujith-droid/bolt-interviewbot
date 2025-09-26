import React, { useState, useEffect } from 'react';
import { InterviewInterface } from './components/InterviewInterface';
import { EvaluationInterface } from './components/EvaluationInterface';
import { AdminDashboard } from './components/AdminDashboard';
import { ResumeUpload } from './components/ResumeUpload';
import { InterviewSession, Certificate, InterviewResponse, ResumeAnalysis } from './types/interview';
import { analyzeResume } from './utils/resumeAnalyzer';

type AppState = 'admin' | 'resume-upload' | 'interview' | 'evaluation';

function App() {
  const [appState, setAppState] = useState<AppState>('admin');
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [currentSession, setCurrentSession] = useState<InterviewSession | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isAnalyzingResume, setIsAnalyzingResume] = useState(false);

  // Load data from localStorage on component mount
  useEffect(() => {
    console.log('🔄 Loading data from localStorage...');
    
    // Check if localStorage is available
    if (typeof Storage === "undefined") {
      console.error('❌ localStorage not supported');
      setDataLoaded(true);
      return;
    }
    
    // Debug: Show all localStorage keys
    console.log('🔍 All localStorage keys:', Object.keys(localStorage));
    console.log('📦 localStorage length:', localStorage.length);
    
    const savedSessions = localStorage.getItem('interviewSessions');
    const savedCertificates = localStorage.getItem('certificates');
    
    console.log('📊 Saved sessions:', savedSessions);
    console.log('🎓 Saved certificates:', savedCertificates);
    
    // Try to recover from any backup keys
    if (!savedSessions) {
      const backupSessions = localStorage.getItem('backup_interviewSessions') || 
                            localStorage.getItem('sessions') ||
                            localStorage.getItem('interview_sessions');
      if (backupSessions) {
        console.log('🔄 Found backup sessions, restoring...');
        localStorage.setItem('interviewSessions', backupSessions);
      }
    }
    
    if (!savedCertificates) {
      const backupCertificates = localStorage.getItem('backup_certificates') || 
                                localStorage.getItem('certs') ||
                                localStorage.getItem('interview_certificates');
      if (backupCertificates) {
        console.log('🔄 Found backup certificates, restoring...');
        localStorage.setItem('certificates', backupCertificates);
      }
    }
    
    if (savedSessions) {
      try {
        const parsedSessions = JSON.parse(savedSessions).map((s: any) => ({
          ...s,
          createdAt: new Date(s.createdAt),
          completedAt: s.completedAt ? new Date(s.completedAt) : undefined
        }));
        setSessions(parsedSessions);
        console.log('✅ Loaded sessions:', parsedSessions.length);
      } catch (error) {
        console.error('❌ Failed to parse sessions:', error);
        console.log('🔧 Attempting to recover sessions data...');
        localStorage.removeItem('interviewSessions');
      }
    } else {
      console.log('ℹ️ No saved sessions found');
    }
    
    if (savedCertificates) {
      try {
        const parsedCertificates = JSON.parse(savedCertificates).map((c: any) => ({
          ...c,
          issueDate: new Date(c.issueDate)
        }));
        setCertificates(parsedCertificates);
        console.log('✅ Loaded certificates:', parsedCertificates.length);
      } catch (error) {
        console.error('❌ Failed to parse certificates:', error);
        console.log('🔧 Attempting to recover certificates data...');
        localStorage.removeItem('certificates');
      }
    } else {
      console.log('ℹ️ No saved certificates found');
    }

    // Check if we're joining an interview via URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session');
    const candidateName = urlParams.get('name');
    const candidateEmail = urlParams.get('email');
    const position = urlParams.get('position');

    if (sessionId && candidateName && candidateEmail && position) {
      // Check if session already exists
      const existingSession = sessions.find(s => s.id === sessionId);
      if (existingSession && existingSession.status !== 'pending') {
        // Session already completed, redirect to admin
        console.log('🔄 Session already exists and completed, redirecting to admin');
        window.history.replaceState({}, document.title, window.location.pathname);
        setAppState('admin');
      } else {
        // Create new session or use existing pending session
        const newSession: InterviewSession = existingSession || {
          id: sessionId,
          candidateName,
          candidateEmail,
          position,
          status: 'pending',
          createdAt: new Date(),
          responses: [],
          interviewType: 'audio'
        };
        setCurrentSession(newSession);
        setAppState('resume-upload');
      }
    }
    
    setDataLoaded(true);
  }, []);

  // Save data to localStorage whenever sessions or certificates change
  useEffect(() => {
    if (!dataLoaded) return; // Don't save during initial load
    
    try {
      console.log('💾 Saving sessions to localStorage:', sessions.length);
      localStorage.setItem('interviewSessions', JSON.stringify(sessions));
      
      // Clean up old backups and create new one
      const backupKey = `backup_sessions_${Date.now()}`;
      localStorage.setItem(backupKey, JSON.stringify(sessions));
      
      // Keep only the 5 most recent backups
      const allKeys = Object.keys(localStorage);
      const sessionBackupKeys = allKeys
        .filter(key => key.startsWith('backup_sessions_'))
        .sort((a, b) => {
          const timestampA = parseInt(a.split('_')[2]);
          const timestampB = parseInt(b.split('_')[2]);
          return timestampB - timestampA; // Sort descending (newest first)
        });
      
      // Remove old backups, keep only 5 most recent
      sessionBackupKeys.slice(5).forEach(key => {
        localStorage.removeItem(key);
      });
      
      console.log('✅ Sessions saved successfully');
    } catch (error) {
      console.error('❌ Failed to save sessions:', error);
      // Try to free up space by removing old backups
      const allKeys = Object.keys(localStorage);
      const oldBackups = allKeys.filter(key => key.startsWith('backup_sessions_') || key.startsWith('backup_certificates_'));
      oldBackups.forEach(key => localStorage.removeItem(key));
      
      // Try saving again without backup
      try {
        localStorage.setItem('interviewSessions', JSON.stringify(sessions));
        console.log('✅ Sessions saved successfully after cleanup');
      } catch (retryError) {
        console.error('❌ Failed to save sessions even after cleanup:', retryError);
        alert('Warning: Failed to save interview data. Storage is full. Your data may be lost on refresh.');
      }
    }
  }, [sessions]);

  useEffect(() => {
    if (!dataLoaded) return; // Don't save during initial load
    
    try {
      console.log('💾 Saving certificates to localStorage:', certificates.length);
      localStorage.setItem('certificates', JSON.stringify(certificates));
      
      // Clean up old backups and create new one
      const backupKey = `backup_certificates_${Date.now()}`;
      localStorage.setItem(backupKey, JSON.stringify(certificates));
      
      // Keep only the 5 most recent backups
      const allKeys = Object.keys(localStorage);
      const certificateBackupKeys = allKeys
        .filter(key => key.startsWith('backup_certificates_'))
        .sort((a, b) => {
          const timestampA = parseInt(a.split('_')[2]);
          const timestampB = parseInt(b.split('_')[2]);
          return timestampB - timestampA; // Sort descending (newest first)
        });
      
      // Remove old backups, keep only 5 most recent
      certificateBackupKeys.slice(5).forEach(key => {
        localStorage.removeItem(key);
      });
      
      console.log('✅ Certificates saved successfully');
    } catch (error) {
      console.error('❌ Failed to save certificates:', error);
      // Try to free up space by removing old backups
      const allKeys = Object.keys(localStorage);
      const oldBackups = allKeys.filter(key => key.startsWith('backup_sessions_') || key.startsWith('backup_certificates_'));
      oldBackups.forEach(key => localStorage.removeItem(key));
      
      // Try saving again without backup
      try {
        localStorage.setItem('certificates', JSON.stringify(certificates));
        console.log('✅ Certificates saved successfully after cleanup');
      } catch (retryError) {
        console.error('❌ Failed to save certificates even after cleanup:', retryError);
        alert('Warning: Failed to save certificate data. Storage is full. Your data may be lost on refresh.');
      }
    }
  }, [certificates, dataLoaded]);

  const generateInterviewLink = (candidateEmail: string, position: string): string => {
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const candidateName = candidateEmail.split('@')[0].replace(/[._]/g, ' ');
    
    const baseUrl = window.location.origin + window.location.pathname;
    const params = new URLSearchParams({
      session: sessionId,
      name: candidateName,
      email: candidateEmail,
      position: position
    });
    
    return `${baseUrl}?${params.toString()}`;
  };

  const handleResumeUploaded = async (resumeText: string, interviewType?: 'audio' | 'video') => {
    if (!currentSession) return;
    
    setIsAnalyzingResume(true);
    try {
      const resumeAnalysis = await analyzeResume(resumeText, currentSession.position);
      
      const updatedSession: InterviewSession = {
        ...currentSession,
        resumeText,
        resumeAnalysis,
        status: 'in-progress',
        interviewType: 'audio'
      };
      
      setCurrentSession(updatedSession);
      setSessions(prev => {
        // Remove any existing session with same ID first
        const filtered = prev.filter(s => s.id !== updatedSession.id);
        return [...filtered, updatedSession];
      });
      
      setAppState('interview');
    } catch (error) {
      console.error('Resume analysis failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Full error details:', error);
      
      let userMessage = `❌ Resume analysis failed: ${errorMessage}\n\n`;
      
      if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        userMessage += '🔑 Issue: Invalid or missing OpenAI API key\n';
        userMessage += '📝 Solution: Check your .env file and ensure VITE_OPENAI_API_KEY is correct';
      } else if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
        userMessage += '⏰ Issue: Rate limit exceeded\n';
        userMessage += '📝 Solution: Wait a moment and try again';
      } else if (errorMessage.includes('insufficient_quota')) {
        userMessage += '💳 Issue: OpenAI account has insufficient credits\n';
        userMessage += '📝 Solution: Add credits to your OpenAI account';
      } else {
        userMessage += '📝 Please ensure your OpenAI API key is configured correctly in the .env file';
      }
      
      alert(userMessage);
      setIsAnalyzingResume(false);
    } finally {
      setIsAnalyzingResume(false);
    }
  };

  const handleSkipResume = () => {
    if (!currentSession) return;
    
    const updatedSession: InterviewSession = {
      ...currentSession,
      status: 'in-progress',
      interviewType: 'audio'
    };

    setCurrentSession(updatedSession);
    setSessions(prev => {
      // Remove any existing session with same ID first
      const filtered = prev.filter(s => s.id !== updatedSession.id);
      return [...filtered, updatedSession];
    });
    
    setAppState('interview');
  };

  const handleInterviewComplete = (responses: InterviewResponse[]) => {
    if (currentSession) {
      const updatedSession: InterviewSession = {
        ...currentSession,
        responses,
        status: 'completed',
        completedAt: new Date()
      };
      
      setCurrentSession(updatedSession);
      setSessions(prev => {
        // Remove any existing session with same ID first
        const filtered = prev.filter(s => s.id !== updatedSession.id);
        const updated = [...filtered, updatedSession];
        return updated;
      });
      
      setAppState('evaluation');
    }
  };

  const handleEvaluationComplete = (updatedSession: InterviewSession, certificate: Certificate) => {
    // Update sessions
    setSessions(prev => {
      // Remove any existing session with same ID first
      const filtered = prev.filter(s => s.id !== updatedSession.id);
      const updated = [...filtered, updatedSession];
      return updated;
    });
    
    // Add certificate
    setCertificates(prev => {
      // Remove any existing certificate with same candidate/position first
      const filtered = prev.filter(c => !(c.candidateName === certificate.candidateName && c.position === certificate.position));
      const updated = [...filtered, certificate];
      return updated;
    });
    
    // Clean up current session
    setCurrentSession(null);
    
    // Show completion message and redirect to admin after delay
    setTimeout(() => {
      setAppState('admin');
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }, 3000);
  };

  if (isAnalyzingResume) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Analyzing Your Resume</h2>
          <p className="text-gray-600">AI is analyzing your background to create personalized questions...</p>
        </div>
      </div>
    );
  }

  if (appState === 'resume-upload' && currentSession) {
    return (
      <ResumeUpload
        onResumeUploaded={handleResumeUploaded}
        onSkip={handleSkipResume}
      />
    );
  }

  if (appState === 'interview' && currentSession) {
    return (
      <InterviewInterface
        sessionId={currentSession.id}
        candidateName={currentSession.candidateName}
        position={currentSession.position}
        resumeAnalysis={currentSession.resumeAnalysis}
        onComplete={handleInterviewComplete}
      />
    );
  }

  if (appState === 'evaluation' && currentSession) {
    return (
      <EvaluationInterface
        session={currentSession}
        onEvaluationComplete={handleEvaluationComplete}
      />
    );
  }

  return (
    <AdminDashboard
      sessions={sessions}
      certificates={certificates}
      onGenerateLink={generateInterviewLink}
    />
  );
}

export default App;