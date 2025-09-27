import React, { useState, useEffect } from 'react';
import { InterviewInterface } from './components/InterviewInterface';
import { EvaluationInterface } from './components/EvaluationInterface';
import { AdminDashboard } from './components/AdminDashboard';
import { JobseekerDashboard } from './components/jobseeker/JobseekerDashboard';
import { RecruiterPortal } from './components/recruiter/RecruiterPortal';
import { LoginInterface } from './components/auth/LoginInterface';
import { InterviewSession, Certificate, InterviewResponse, ResumeAnalysis } from './types/interview';
import { Recruiter } from './types/products';

type AppState = 'login' | 'admin' | 'jobseeker' | 'recruiter';

function App() {
  const [appState, setAppState] = useState<AppState>('login');
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userType, setUserType] = useState<'admin' | 'jobseeker' | 'recruiter' | null>(null);

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
        setAppState('login');
      } else {
        // For URL-based interviews, redirect to login and let them choose user type
        setAppState('login');
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

  const handleLogin = (user: any, type: 'admin' | 'jobseeker' | 'recruiter') => {
    setCurrentUser(user);
    setUserType(type);
    setAppState(type);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUserType(null);
    setAppState('login');
  };

  if (appState === 'login') {
    return <LoginInterface onLogin={handleLogin} />;
  }

  if (appState === 'jobseeker' && currentUser) {
    return (
      <JobseekerDashboard user={currentUser} onLogout={handleLogout} />
    );
  }

  if (appState === 'recruiter' && currentUser) {
    const recruiterData: Recruiter = {
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      company: currentUser.company || 'Demo Company',
      referralCode: currentUser.referralCode || 'DEMO2024',
      totalEarnings: 1250.00,
      pendingEarnings: 320.00,
      totalReferrals: 24,
      commissionRate: currentUser.commissionRate || 20,
      isActive: true,
      joinedAt: new Date()
    };
    
    return (
      <RecruiterPortal recruiter={recruiterData} onLogout={handleLogout} />
    );
  }

  if (appState === 'admin') {
    return (
      <AdminDashboard
        sessions={sessions}
        certificates={certificates}
        onGenerateLink={generateInterviewLink}
        onLogout={handleLogout}
      />
    );
  }

  return <div>Loading...</div>;
}

export default App;