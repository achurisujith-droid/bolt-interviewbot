import { Question } from '../types/interview';

// Default question bank - you can expand this or load from an API
export const defaultQuestions: Question[] = [
  {
    id: '1',
    text: 'Tell me about yourself and your professional background.',
    category: 'general',
    difficulty: 'easy'
  },
  {
    id: '2',
    text: 'Why are you interested in this position and our company?',
    category: 'behavioral',
    difficulty: 'easy'
  },
  {
    id: '3',
    text: 'Describe a challenging project you worked on and how you overcame obstacles.',
    category: 'behavioral',
    difficulty: 'medium'
  },
  {
    id: '4',
    text: 'What are your greatest strengths and how do they apply to this role?',
    category: 'behavioral',
    difficulty: 'medium'
  },
  {
    id: '5',
    text: 'How do you handle working under pressure and tight deadlines?',
    category: 'behavioral',
    difficulty: 'medium'
  },
  {
    id: '6',
    text: 'Describe your experience with problem-solving in your field.',
    category: 'technical',
    difficulty: 'medium'
  },
  {
    id: '7',
    text: 'Where do you see yourself in the next 5 years?',
    category: 'general',
    difficulty: 'easy'
  },
  {
    id: '8',
    text: 'Tell me about a time when you had to work with a difficult team member.',
    category: 'behavioral',
    difficulty: 'medium'
  },
  {
    id: '9',
    text: 'What motivates you in your work?',
    category: 'behavioral',
    difficulty: 'easy'
  },
  {
    id: '10',
    text: 'Describe a situation where you had to learn something new quickly.',
    category: 'behavioral',
    difficulty: 'medium'
  }
];

// Function to generate dynamic questions based on position
export const generateQuestionsForPosition = (position: string): Question[] => {
  const baseQuestions = [...defaultQuestions];
  
  // Add position-specific questions
  const positionSpecificQuestions: Record<string, Question[]> = {
    'Software Developer': [
      {
        id: 'tech-1',
        text: 'Explain your experience with version control systems like Git.',
        category: 'technical',
        difficulty: 'medium'
      },
      {
        id: 'tech-2',
        text: 'How do you approach debugging complex issues in your code?',
        category: 'technical',
        difficulty: 'hard'
      }
    ],
    'Marketing Manager': [
      {
        id: 'marketing-1',
        text: 'Describe a successful marketing campaign you led and its results.',
        category: 'technical',
        difficulty: 'medium'
      },
      {
        id: 'marketing-2',
        text: 'How do you measure the effectiveness of marketing strategies?',
        category: 'technical',
        difficulty: 'medium'
      }
    ],
    'Sales Representative': [
      {
        id: 'sales-1',
        text: 'Tell me about your approach to handling customer objections.',
        category: 'technical',
        difficulty: 'medium'
      },
      {
        id: 'sales-2',
        text: 'Describe your most successful sales achievement.',
        category: 'behavioral',
        difficulty: 'medium'
      }
    ]
  };

  // Add position-specific questions if available
  if (positionSpecificQuestions[position]) {
    baseQuestions.push(...positionSpecificQuestions[position]);
  }

  // Shuffle and return a subset of questions (7-10 questions)
  const shuffled = baseQuestions.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(8, shuffled.length));
};

// Function to load questions from an external API (example)
export const loadQuestionsFromAPI = async (position: string): Promise<Question[]> => {
  try {
    // Example API call - replace with your actual API endpoint
    const response = await fetch(`/api/questions?position=${encodeURIComponent(position)}`);
    
    if (response.ok) {
      const questions = await response.json();
      return questions;
    }
  } catch (error) {
    console.error('Failed to load questions from API:', error);
  }
  
  // Fallback to generated questions
  return generateQuestionsForPosition(position);
};