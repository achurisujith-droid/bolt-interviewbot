import { InterviewOffering } from '../types/offerings';

export const defaultOfferings: InterviewOffering[] = [
  {
    id: 'software-dev-basic',
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
    price: 0
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
    price: 0
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
    price: 0
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
    price: 0
  },
  {
    id: 'marketing-manager',
    title: 'Marketing Manager',
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
    price: 0
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
    price: 0
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
    price: 0
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
    price: 0
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