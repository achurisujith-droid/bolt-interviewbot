export interface InterviewOffering {
  id: string;
  title: string;
  description: string;
  category: 'technical' | 'behavioral' | 'mixed' | 'specialized';
  duration: number; // in minutes
  questionCount: number;
  difficulty: 'entry' | 'mid' | 'senior' | 'expert';
  skills: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  passingScore: number;
  certificateTemplate: string;
  price?: number; // for future monetization
  prerequisites?: string[];
  industryFocus?: string[];
}

export interface UserOffering {
  id: string;
  userId: string;
  offeringId: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'expired';
  attempts: number;
  maxAttempts: number;
  bestScore?: number;
  lastAttemptAt?: Date;
  expiresAt?: Date;
  purchasedAt: Date;
}

export interface InterviewSchedule {
  id: string;
  userId: string;
  offeringId: string;
  scheduledAt: Date;
  status: 'scheduled' | 'completed' | 'missed' | 'cancelled';
  reminderSent: boolean;
  createdAt: Date;
  notificationPreferences?: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

export interface Organization {
  id: string;
  name: string;
  domain: string;
  logo?: string;
  settings: {
    allowSelfRegistration: boolean;
    requireEmailVerification: boolean;
    customBranding: boolean;
    maxAttemptsPerOffering: number;
  };
  createdAt: Date;
  isActive: boolean;
}

export interface UserProgress {
  userId: string;
  offeringId: string;
  completionPercentage: number;
  timeSpent: number; // in minutes
  lastActivity: Date;
  currentQuestionIndex: number;
  bookmarkedQuestions: string[];
}