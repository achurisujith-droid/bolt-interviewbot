export interface Question {
  id: string;
  text: string;
  category: 'technical' | 'behavioral' | 'general';
  difficulty: 'easy' | 'medium' | 'hard';
  isFollowUp?: boolean;
  parentQuestionId?: string;
  resumeContext?: string;
}

export interface InterviewSession {
  id: string;
  candidateName: string;
  candidateEmail: string;
  position: string;
  status: 'pending' | 'in-progress' | 'completed' | 'evaluated';
  createdAt: Date;
  completedAt?: Date;
  resumeText?: string;
  resumeAnalysis?: ResumeAnalysis;
  score?: number;
  feedback?: string;
  responses: InterviewResponse[];
  lastReEvaluatedAt?: Date;
  evaluationMethod?: string;
  interviewType?: 'audio' | 'video';
}

export interface InterviewResponse {
  questionId: string;
  question: string;
  audioBlob?: Blob;
  audioUrl?: string;
  transcript?: string;
  score?: number;
  feedback?: string;
  strengths?: string[];
  improvements?: string[];
  needsFollowUp?: boolean;
  followUpGenerated?: boolean;
  evaluationMethod?: string;
  customInstructions?: string;
}

export interface Certificate {
  id: string;
  candidateName: string;
  position: string;
  score: number;
  issueDate: Date;
  certificateNumber: string;
  isReEvaluation?: boolean;
  originalScore?: number;
  evaluationMethod?: string;
  productType?: string;
  paymentId?: string;
}

export interface ResumeAnalysis {
  actualRole?: string;
  skills: string[];
  experience: string[];
  education: string[];
  projects: string[];
  companies?: string[];
  technologies?: string[];
  strengths: string[];
  gaps: string[];
  yearsOfExperience: number;
  keyTechnologies: string[];
  seniority?: 'junior' | 'mid' | 'senior';
  recommendedProducts?: string[];
  skillLevel?: number;
  confidenceLevel?: number;
}