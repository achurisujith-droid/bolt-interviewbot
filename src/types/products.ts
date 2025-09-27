export interface InterviewProduct {
  id: string;
  name: string;
  description: string;
  type: 'audio' | 'video' | 'technical' | 'behavioral' | 'leadership';
  price: number;
  duration: number; // in minutes
  questionCount: number;
  features: string[];
  evaluationCriteria: string[];
  targetAudience: string[];
  difficulty: 'entry' | 'mid' | 'senior' | 'expert';
  isActive: boolean;
  passingScore: number;
  certificateTemplate: string;
  prerequisites?: string[];
  skillsAssessed: string[];
  resumeRequirements?: string[];
}

export interface Payment {
  id: string;
  userId: string;
  productId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  transactionId?: string;
  createdAt: Date;
  completedAt?: Date;
  metadata?: any;
}

export interface UserPurchase {
  id: string;
  userId: string;
  productId: string;
  paymentId: string;
  status: 'active' | 'used' | 'expired';
  purchasedAt: Date;
  expiresAt?: Date;
  usedAt?: Date;
  sessionId?: string;
}

export interface ReferralEarning {
  id: string;
  recruiterId: string;
  candidateId: string;
  productId: string;
  amount: number;
  commission: number;
  status: 'pending' | 'paid' | 'cancelled';
  createdAt: Date;
  paidAt?: Date;
  referralCode: string;
}

export interface Recruiter {
  id: string;
  name: string;
  email: string;
  company: string;
  referralCode: string;
  totalEarnings: number;
  pendingEarnings: number;
  totalReferrals: number;
  commissionRate: number;
  isActive: boolean;
  joinedAt: Date;
  paymentDetails?: {
    bankAccount?: string;
    paypalEmail?: string;
    preferredMethod: 'bank' | 'paypal';
  };
}