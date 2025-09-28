import React, { useState, useEffect } from 'react';
import { InterviewInterface } from './components/InterviewInterface';
import { EvaluationInterface } from './components/EvaluationInterface';
import { AdminDashboard } from './components/AdminDashboard';
import { ResumeUpload } from './components/ResumeUpload';
import { InterviewSession, Certificate, InterviewResponse, ResumeAnalysis } from './types/interview';
import { analyzeResume } from './utils/resumeAnalyzer';

function App() {
  const [currentView, setCurrentView] = useState<'admin' | 'resume-upload' | 'interview' | 'evaluation'>('admin');
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [currentSession, setCurrentSession] = useState<InterviewSession | null>(null);
  const [resumeAnalysis, setResumeAnalysis] = useState<ResumeAnalysis | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Load data from localStorage on component mount
  useEffect(() => {
    console.log('🔄 Loading data from localStorage...');
    
    // Check if localStorage is available
    if (typeof Storage === "undefined") {
      console.error('❌ localStorage not supported');
      setDataLoaded(true);
      return;
    }
    
    const savedSessions = localStorage.getItem('interviewSessions');
    const savedCertificates = localStorage.getItem('certificates');
    
    console.log('📊 Saved sessions:', savedSessions);
    console.log('🎓 Saved certificates:', savedCertificates);
    
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
        localStorage.removeItem('interviewSessions');
      }
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
        localStorage.removeItem('certificates');
      }
    }

    // Check if we're joining an interview via URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session');
    const candidateName = urlParams.get('name');
    const candidateEmail = urlParams.get('email');
    const position = urlParams.get('position');

    if (sessionId && candidateName && candidateEmail && position) {
      console.log('🔗 Interview link detected:', { sessionId, candidateName, candidateEmail, position });
      
      // Check if session already exists
      const existingSession = sessions.find(s => s.id === sessionId);
      if (existingSession && existingSession.status !== 'pending') {
        console.log('🔄 Session already exists and completed, showing admin');
        setCurrentView('admin');
      } else {
        // Create new session and start with resume upload
        const newSession: InterviewSession = {
          id: sessionId,
          candidateName,
          candidateEmail,
          position,
          status: 'pending',
          createdAt: new Date(),
          responses: []
        };
        setCurrentSession(newSession);
        setCurrentView('resume-upload');
      }
    }
    
    setDataLoaded(true);
  }, []);

  // Save data to localStorage whenever sessions or certificates change
  useEffect(() => {
    if (!dataLoaded) return;
    
    try {
      console.log('💾 Saving sessions to localStorage:', sessions.length);
      localStorage.setItem('interviewSessions', JSON.stringify(sessions));
    } catch (error) {
      console.error('❌ Failed to save sessions:', error);
    }
  }, [sessions, dataLoaded]);

  useEffect(() => {
    if (!dataLoaded) return;
    
    try {
      console.log('💾 Saving certificates to localStorage:', certificates.length);
      localStorage.setItem('certificates', JSON.stringify(certificates));
    } catch (error) {
      console.error('❌ Failed to save certificates:', error);
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

  const handleResumeUploaded = async (resumeText: string) => {
    if (!currentSession) return;
    
    try {
      console.log('📄 Analyzing resume...');
      const analysis = await analyzeResume(resumeText, currentSession.position);
      setResumeAnalysis(analysis);
      
      const updatedSession = {
        ...currentSession,
        resumeText,
        resumeAnalysis: analysis,
        status: 'in-progress' as const
      };
      setCurrentSession(updatedSession);
      setCurrentView('interview');
    } catch (error) {
      console.error('Resume analysis failed:', error);
      // Continue without resume analysis
      const updatedSession = {
        ...currentSession,
        resumeText,
        status: 'in-progress' as const
      };
      setCurrentSession(updatedSession);
      setCurrentView('interview');
    }
  };

  const handleSkipResume = () => {
    if (!currentSession) return;
    
    const updatedSession = {
      ...currentSession,
      status: 'in-progress' as const
    };
    setCurrentSession(updatedSession);
    setCurrentView('interview');
  };

  const handleInterviewComplete = (responses: InterviewResponse[]) => {
    if (!currentSession) return;
    
    console.log('✅ Interview completed with', responses.length, 'responses');
    
    const completedSession: InterviewSession = {
      ...currentSession,
      responses,
      status: 'completed',
      completedAt: new Date()
    };
    
    setCurrentSession(completedSession);
    setSessions(prev => {
      const filtered = prev.filter(s => s.id !== completedSession.id);
      return [...filtered, completedSession];
    });
    
    setCurrentView('evaluation');
  };

  const handleEvaluationComplete = (updatedSession: InterviewSession, certificate: Certificate) => {
    console.log('✅ Evaluation completed:', updatedSession.score, '%');
    
    // Update sessions
    setSessions(prev => {
      const filtered = prev.filter(s => s.id !== updatedSession.id);
      return [...filtered, updatedSession];
    });
    
    // Add certificate
    setCertificates(prev => [...prev, certificate]);
    
    // Clear URL parameters and return to admin
    window.history.replaceState({}, document.title, window.location.pathname);
    setCurrentSession(null);
    setResumeAnalysis(null);
    setCurrentView('admin');
  };

  // Show loading state while data loads
  if (!dataLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800">Loading AI Interview System...</h2>
        </div>
      </div>
    );
  }

  // Render based on current view
  switch (currentView) {
    case 'resume-upload':
      return (
        <ResumeUpload
          onResumeUploaded={handleResumeUploaded}
          onSkip={handleSkipResume}
        />
      );
      
    case 'interview':
      return currentSession ? (
        <InterviewInterface
          sessionId={currentSession.id}
          candidateName={currentSession.candidateName}
          position={currentSession.position}
          resumeAnalysis={resumeAnalysis || undefined}
          onComplete={handleInterviewComplete}
        />
      ) : null;
      
    case 'evaluation':
      return currentSession ? (
        <EvaluationInterface
          session={currentSession}
          onEvaluationComplete={handleEvaluationComplete}
        />
      ) : null;
      
    case 'admin':
    default:
      return (
        <AdminDashboard
          sessions={sessions}
          certificates={certificates}
          onGenerateLink={generateInterviewLink}
          onLogout={() => {
            // Simple logout - just refresh the page
            window.location.reload();
          }}
        />
      );
  }
}

export default App;