import { InterviewOffering } from '../types/offerings';

export const defaultOfferings: InterviewOffering[] = [
  {
    id: 'software-dev-entry',
    title: 'Software Developer - Entry Level',
    description: 'Comprehensive assessment for entry-level software development positions covering programming fundamentals, problem-solving, and basic system design.',
    category: 'technical',
    duration: 45,
    questionCount: 8,
    difficulty: 'entry',
    skills: ['Programming', 'Problem Solving', 'Data Structures', 'Algorithms', 'Debugging'],
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
    passingScore: 60,
    certificateTemplate: 'software-developer-entry',
    price: 0,
    prerequisites: ['Basic programming knowledge', 'Understanding of data structures'],
    industryFocus: ['Technology', 'Software', 'Startups']
  },
  {
    id: 'software-dev-senior',
    title: 'Senior Software Developer',
    description: 'Advanced technical interview for senior software development roles including system design, architecture decisions, and leadership scenarios.',
    category: 'technical',
    duration: 60,
    questionCount: 10,
    difficulty: 'senior',
    skills: ['System Design', 'Architecture', 'Leadership', 'Advanced Programming', 'Performance Optimization'],
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
    passingScore: 75,
    certificateTemplate: 'software-developer-senior',
    price: 0,
    prerequisites: ['5+ years programming experience', 'System design knowledge', 'Leadership experience'],
    industryFocus: ['Technology', 'Enterprise', 'Fintech']
  },
  {
    id: 'data-scientist',
    title: 'Data Scientist',
    description: 'Specialized assessment for data science positions covering machine learning, statistics, data analysis, and Python/R programming.',
    category: 'specialized',
    duration: 50,
    questionCount: 9,
    difficulty: 'mid',
    skills: ['Machine Learning', 'Statistics', 'Python', 'Data Analysis', 'SQL', 'Visualization'],
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
    passingScore: 70,
    certificateTemplate: 'data-scientist',
    price: 0,
    prerequisites: ['Statistics background', 'Python/R programming', 'SQL knowledge'],
    industryFocus: ['Technology', 'Healthcare', 'Finance', 'Research']
  },
  {
    id: 'product-manager',
    title: 'Product Manager',
    description: 'Comprehensive evaluation for product management roles including strategy, user research, roadmap planning, and stakeholder management.',
    category: 'behavioral',
    duration: 40,
    questionCount: 7,
    difficulty: 'mid',
    skills: ['Product Strategy', 'User Research', 'Roadmap Planning', 'Stakeholder Management', 'Analytics'],
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
    passingScore: 65,
    certificateTemplate: 'product-manager',
    price: 0,
    prerequisites: ['Business analysis experience', 'User research knowledge', 'Project management'],
    industryFocus: ['Technology', 'E-commerce', 'SaaS', 'Mobile Apps']
  },
  {
    id: 'marketing-manager',
    title: 'Digital Marketing Manager',
    description: 'Marketing leadership assessment covering digital marketing, campaign management, analytics, and team leadership.',
    category: 'mixed',
    duration: 35,
    questionCount: 7,
    difficulty: 'mid',
    skills: ['Digital Marketing', 'Campaign Management', 'Analytics', 'Content Strategy', 'Team Leadership'],
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
    passingScore: 65,
    certificateTemplate: 'marketing-manager',
    price: 0,
    prerequisites: ['Marketing experience', 'Digital advertising knowledge', 'Analytics tools'],
    industryFocus: ['Marketing', 'E-commerce', 'Media', 'Retail']
  },
  {
    id: 'ui-ux-designer',
    title: 'UI/UX Designer',
    description: 'Design-focused interview covering user experience principles, design thinking, prototyping, and user research methodologies.',
    category: 'specialized',
    duration: 40,
    questionCount: 8,
    difficulty: 'mid',
    skills: ['User Experience', 'Design Thinking', 'Prototyping', 'User Research', 'Visual Design'],
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
    passingScore: 70,
    certificateTemplate: 'ui-ux-designer',
    price: 0,
    prerequisites: ['Design portfolio', 'Prototyping tools knowledge', 'User research experience'],
    industryFocus: ['Technology', 'Design Agencies', 'E-commerce', 'Mobile Apps']
  },
  {
    id: 'devops-engineer',
    title: 'DevOps Engineer',
    description: 'Infrastructure and automation assessment covering CI/CD, cloud platforms, containerization, and monitoring.',
    category: 'technical',
    duration: 55,
    questionCount: 9,
    difficulty: 'senior',
    skills: ['CI/CD', 'Cloud Platforms', 'Docker', 'Kubernetes', 'Monitoring', 'Infrastructure as Code'],
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
    passingScore: 75,
    certificateTemplate: 'devops-engineer',
    price: 0,
    prerequisites: ['Linux/Unix experience', 'Cloud platform knowledge', 'Scripting skills'],
    industryFocus: ['Technology', 'Cloud Services', 'Enterprise', 'Startups']
  },
  {
    id: 'sales-representative',
    title: 'Sales Representative',
    description: 'Sales skills evaluation including prospecting, relationship building, objection handling, and closing techniques.',
    category: 'behavioral',
    duration: 30,
    questionCount: 6,
    difficulty: 'entry',
    skills: ['Prospecting', 'Relationship Building', 'Objection Handling', 'Closing', 'CRM Usage'],
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
    passingScore: 60,
    certificateTemplate: 'sales-representative',
    price: 0,
    prerequisites: ['Communication skills', 'Customer service experience'],
    industryFocus: ['Sales', 'Retail', 'B2B Services', 'Technology']
  },
  {
    id: 'business-analyst',
    title: 'Business Analyst',
    description: 'Business analysis assessment covering requirements gathering, process improvement, stakeholder management, and documentation.',
    category: 'mixed',
    duration: 45,
    questionCount: 8,
    difficulty: 'mid',
    skills: ['Requirements Analysis', 'Process Improvement', 'Stakeholder Management', 'Documentation', 'Data Analysis'],
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
    passingScore: 70,
    certificateTemplate: 'business-analyst',
    price: 0,
    prerequisites: ['Business process knowledge', 'Analytical thinking', 'Documentation skills'],
    industryFocus: ['Consulting', 'Finance', 'Healthcare', 'Technology']
  },
  {
    id: 'project-manager',
    title: 'Project Manager',
    description: 'Project management evaluation covering planning, execution, risk management, and team leadership.',
    category: 'behavioral',
    duration: 40,
    questionCount: 7,
    difficulty: 'mid',
    skills: ['Project Planning', 'Risk Management', 'Team Leadership', 'Communication', 'Budget Management'],
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
    passingScore: 65,
    certificateTemplate: 'project-manager',
    price: 0,
    prerequisites: ['Project management experience', 'Leadership skills', 'Planning abilities'],
    industryFocus: ['Construction', 'Technology', 'Healthcare', 'Manufacturing']
  }
];

export const getOfferingById = (id: string): InterviewOffering | undefined => {
  return defaultOfferings.find(offering => offering.id === id);
};

export const getOfferingsByCategory = (category: string): InterviewOffering[] => {
  return defaultOfferings.filter(offering => offering.category === category && offering.isActive);
};

export const getOfferingsByDifficulty = (difficulty: string): InterviewOffering[] => {
  return defaultOfferings.filter(offering => offering.difficulty === difficulty && offering.isActive);
};

export const getOfferingsByIndustry = (industry: string): InterviewOffering[] => {
  return defaultOfferings.filter(offering => 
    offering.industryFocus?.includes(industry) && offering.isActive
  );
};

export const searchOfferings = (searchTerm: string): InterviewOffering[] => {
  const term = searchTerm.toLowerCase();
  return defaultOfferings.filter(offering => 
    offering.isActive && (
      offering.title.toLowerCase().includes(term) ||
      offering.description.toLowerCase().includes(term) ||
      offering.skills.some(skill => skill.toLowerCase().includes(term)) ||
      offering.industryFocus?.some(industry => industry.toLowerCase().includes(term))
    )
  );
};