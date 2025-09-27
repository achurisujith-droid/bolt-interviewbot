import { InterviewProduct } from '../types/products';

export const interviewProducts: InterviewProduct[] = [
  {
    id: 'audio-basic',
    name: 'AI Audio Interview - Basic',
    description: 'Comprehensive audio-based interview with AI evaluation using GPT-4o. Perfect for initial screening and technical assessment.',
    type: 'audio',
    price: 29.99,
    duration: 45,
    questionCount: 8,
    features: [
      'Resume-based personalized questions',
      'OpenAI Whisper speech-to-text',
      'GPT-4o intelligent evaluation',
      'Detailed feedback report',
      'Professional certificate',
      'Instant results'
    ],
    evaluationCriteria: [
      'Technical Knowledge (25%)',
      'Communication Skills (25%)',
      'Problem Solving (25%)',
      'Professional Experience (25%)'
    ],
    targetAudience: ['Entry Level', 'Mid Level', 'Career Changers'],
    difficulty: 'mid',
    isActive: true,
    passingScore: 60,
    certificateTemplate: 'audio-basic',
    skillsAssessed: ['Communication', 'Technical Knowledge', 'Problem Solving'],
    resumeRequirements: ['Work experience', 'Skills section', 'Education background']
  },
  {
    id: 'video-premium',
    name: 'AI Video Interview - Premium',
    description: 'Advanced video interview with AI agent, body language analysis, and comprehensive evaluation. Includes technical + behavioral assessment.',
    type: 'video',
    price: 79.99,
    duration: 60,
    questionCount: 12,
    features: [
      'Live AI video interviewer',
      'Body language analysis',
      'Confidence level assessment',
      'Technical + behavioral questions',
      'Real-time feedback',
      'Premium certificate',
      'Video recording analysis',
      'Presentation skills evaluation'
    ],
    evaluationCriteria: [
      'Technical Expertise (30%)',
      'Communication Skills (25%)',
      'Confidence & Presentation (25%)',
      'Behavioral Responses (20%)'
    ],
    targetAudience: ['Mid Level', 'Senior Level', 'Leadership Roles'],
    difficulty: 'senior',
    isActive: true,
    passingScore: 70,
    certificateTemplate: 'video-premium',
    prerequisites: ['2+ years experience', 'Camera and microphone required'],
    skillsAssessed: ['Technical Skills', 'Leadership', 'Communication', 'Confidence'],
    resumeRequirements: ['Detailed work experience', 'Project descriptions', 'Leadership examples']
  },
  {
    id: 'technical-deep',
    name: 'Technical Deep Dive',
    description: 'Intensive technical interview focusing on coding, system design, and problem-solving. Ideal for senior technical positions.',
    type: 'technical',
    price: 99.99,
    duration: 90,
    questionCount: 15,
    features: [
      'Advanced technical questions',
      'System design scenarios',
      'Code review simulation',
      'Architecture discussions',
      'Performance optimization',
      'Expert-level certificate',
      'Detailed technical report'
    ],
    evaluationCriteria: [
      'Technical Depth (40%)',
      'System Design (30%)',
      'Problem Solving (20%)',
      'Code Quality (10%)'
    ],
    targetAudience: ['Senior Developers', 'Tech Leads', 'Architects'],
    difficulty: 'expert',
    isActive: true,
    passingScore: 75,
    certificateTemplate: 'technical-expert',
    prerequisites: ['5+ years experience', 'Strong technical background'],
    skillsAssessed: ['Advanced Programming', 'System Design', 'Architecture', 'Performance'],
    resumeRequirements: ['Senior-level experience', 'Technical projects', 'System design experience']
  },
  {
    id: 'leadership-executive',
    name: 'Leadership & Executive Assessment',
    description: 'Executive-level interview focusing on leadership, strategy, and management skills. Perfect for C-level and VP positions.',
    type: 'leadership',
    price: 149.99,
    duration: 75,
    questionCount: 10,
    features: [
      'Executive-level questions',
      'Strategic thinking assessment',
      'Leadership scenario analysis',
      'Decision-making evaluation',
      'Team management skills',
      'Executive certificate',
      'Leadership competency report'
    ],
    evaluationCriteria: [
      'Strategic Thinking (35%)',
      'Leadership Skills (30%)',
      'Decision Making (20%)',
      'Communication (15%)'
    ],
    targetAudience: ['Senior Managers', 'Directors', 'VPs', 'C-Level'],
    difficulty: 'expert',
    isActive: true,
    passingScore: 80,
    certificateTemplate: 'leadership-executive',
    prerequisites: ['10+ years experience', 'Management experience', 'Strategic planning background'],
    skillsAssessed: ['Leadership', 'Strategy', 'Management', 'Decision Making'],
    resumeRequirements: ['Management experience', 'Team leadership', 'Strategic initiatives']
  },
  {
    id: 'behavioral-soft-skills',
    name: 'Behavioral & Soft Skills',
    description: 'Comprehensive behavioral interview focusing on soft skills, emotional intelligence, and cultural fit.',
    type: 'behavioral',
    price: 49.99,
    duration: 50,
    questionCount: 10,
    features: [
      'Behavioral question scenarios',
      'Emotional intelligence assessment',
      'Cultural fit evaluation',
      'Conflict resolution skills',
      'Teamwork assessment',
      'Soft skills certificate',
      'Personality insights report'
    ],
    evaluationCriteria: [
      'Emotional Intelligence (30%)',
      'Communication (25%)',
      'Teamwork (25%)',
      'Adaptability (20%)'
    ],
    targetAudience: ['All Levels', 'Team Players', 'Customer-Facing Roles'],
    difficulty: 'mid',
    isActive: true,
    passingScore: 65,
    certificateTemplate: 'behavioral-soft-skills',
    skillsAssessed: ['Emotional Intelligence', 'Communication', 'Teamwork', 'Adaptability'],
    resumeRequirements: ['Team experience', 'Collaboration examples', 'Interpersonal skills']
  }
];

export const getProductById = (id: string): InterviewProduct | undefined => {
  return interviewProducts.find(product => product.id === id);
};

export const getRecommendedProducts = (resumeAnalysis: any): InterviewProduct[] => {
  const { seniority, yearsOfExperience, actualRole } = resumeAnalysis;
  
  let recommended: InterviewProduct[] = [];
  
  // Always recommend audio basic as starting point
  recommended.push(interviewProducts.find(p => p.id === 'audio-basic')!);
  
  // Recommend based on experience level
  if (yearsOfExperience >= 5 || seniority === 'senior') {
    recommended.push(interviewProducts.find(p => p.id === 'video-premium')!);
    
    if (actualRole?.toLowerCase().includes('lead') || actualRole?.toLowerCase().includes('senior')) {
      recommended.push(interviewProducts.find(p => p.id === 'technical-deep')!);
    }
  }
  
  // Recommend leadership for management roles
  if (actualRole?.toLowerCase().includes('manager') || 
      actualRole?.toLowerCase().includes('director') ||
      yearsOfExperience >= 10) {
    recommended.push(interviewProducts.find(p => p.id === 'leadership-executive')!);
  }
  
  // Always recommend behavioral for well-rounded assessment
  recommended.push(interviewProducts.find(p => p.id === 'behavioral-soft-skills')!);
  
  return recommended.filter(Boolean);
};