import { ResumeAnalysis } from '../types/interview';

const AI_CONFIG = {
  OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY || '',
  OPENAI_MODEL: 'gpt-4o',
};

// Analyze resume text using GPT-4o
export const analyzeResume = async (resumeText: string): Promise<ResumeAnalysis> => {
  if (!AI_CONFIG.OPENAI_API_KEY) {
    throw new Error('OpenAI API key is required for resume analysis. Please add VITE_OPENAI_API_KEY to your .env file.');
  }

  // Basic validation - check if text has minimum content
  if (resumeText.trim().length < 200) {
    throw new Error('Resume text is too short. Please ensure you have copied the complete resume content.');
  }

  // Check for common resume indicators (more flexible)
  const resumeIndicators = [
    'experience', 'work', 'education', 'skills', 'project', 'company', 
    'university', 'college', 'degree', 'certification', 'employment',
    'job', 'position', 'role', 'responsibilities', 'achievements',
    'technologies', 'tools', 'programming', 'development', 'engineer',
    'manager', 'analyst', 'specialist', 'coordinator', 'director'
  ];
  
  const lowerText = resumeText.toLowerCase();
  const foundIndicators = resumeIndicators.filter(indicator => 
    lowerText.includes(indicator)
  );
  
  if (foundIndicators.length < 3) {
    throw new Error('This text does not appear to be a professional resume. Please ensure you have copied your complete resume content including work experience, education, and skills.');
  }

  // Truncate resume text if too long (keep within token limits)
  const maxResumeLength = 6000; // Approximately 1500 tokens
  const truncatedResumeText = resumeText.length > maxResumeLength 
    ? resumeText.substring(0, maxResumeLength) + '...[truncated]'
    : resumeText;

  const analysisPrompt = `
PRIORITY: Analyze the RESUME CONTENT first, ignore job title if it doesn't match resume.

**Resume Text:**
${truncatedResumeText}

**Task:** Analyze this resume and extract the person's actual professional profile.

Extract ACTUAL information from resume content:
{
  "actualRole": "what role this person actually has based on resume",
  "skills": ["actual technical skills from resume"],
  "experience": ["specific work experiences with companies/projects"],
  "education": ["actual degrees/certifications"],
  "projects": ["real projects mentioned"],
  "companies": ["companies worked at"],
  "technologies": ["specific technologies/tools used"],
  "strengths": ["clear strengths from experience"],
  "gaps": ["areas needing improvement for growth"],
  "yearsOfExperience": <number>,
  "keyTechnologies": ["main technologies from resume"],
  "seniority": "junior/mid/senior based on experience"
}

Focus on RESUME CONTENT, not job title. Be factual and specific.
`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_CONFIG.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: AI_CONFIG.OPENAI_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are a resume analyzer. Respond only with valid JSON.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.1,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
      console.error('OpenAI API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(`Resume analysis API error: ${errorMessage}`);
    }

    const result = await response.json();
    let content = result.choices[0].message.content;
    
    // Use robust JSON extraction with fallback for truncated responses
    content = extractJSONFromResponse(content);
    
    const analysis = JSON.parse(content);
    
    return {
      actualRole: analysis.actualRole || 'Professional',
      skills: analysis.skills || [],
      experience: analysis.experience || [],
      education: analysis.education || [],
      projects: analysis.projects || [],
      companies: analysis.companies || [],
      technologies: analysis.technologies || [],
      strengths: analysis.strengths || [],
      gaps: analysis.gaps || [],
      yearsOfExperience: analysis.yearsOfExperience || 0,
      keyTechnologies: analysis.keyTechnologies || [],
      seniority: analysis.seniority || 'mid'
    };
  } catch (error) {
    console.error('Resume analysis failed:', error);
    throw new Error(`Resume analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Generate customized questions based on resume analysis
export const generateResumeBasedQuestions = async (
  resumeAnalysis: ResumeAnalysis
): Promise<any[]> => {
  if (!AI_CONFIG.OPENAI_API_KEY) {
    console.warn('⚠️ OpenAI API key not configured - falling back to standard questions');
    return []; // Return empty array to trigger fallback to standard questions
  }

  // Get job requirements if available
  const jobRequirements = localStorage.getItem('currentJobRequirements') || '';
  const requirementsInfo = jobRequirements ? `\n**Job Requirements**: ${jobRequirements}` : '';

  const questionPrompt = `
Generate 7 comprehensive interview questions based on this person's ACTUAL background from their resume.

**Candidate Profile:**
- Actual Role: ${resumeAnalysis.actualRole}
- Experience: ${resumeAnalysis.yearsOfExperience} years (${resumeAnalysis.seniority} level)
- Key Skills: ${resumeAnalysis.skills.slice(0, 8).join(', ')}
- Technologies: ${resumeAnalysis.keyTechnologies.slice(0, 6).join(', ')}
- Companies: ${resumeAnalysis.companies?.slice(0, 3).join(', ') || 'Not specified'}${requirementsInfo}

Generate questions that:
1. Test their ACTUAL skills and experience from resume
2. Validate their claimed experience and projects
3. Explore depth of knowledge in their technologies
4. Ask about specific companies/projects mentioned
5. Match their experience level (${resumeAnalysis.seniority})
${jobRequirements ? '6. Assess fit for the job requirements provided' : '6. Evaluate their overall professional competency'}

Return as JSON array with this exact format:
[
  {
    "id": "q1",
    "text": "Specific question about their actual experience/skills",
    "category": "technical|behavioral|experience",
    "difficulty": "easy|medium|hard",
    "resumeContext": "What part of resume this validates"
  }
]

Make questions SPECIFIC to their background, not generic interview questions.
`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_CONFIG.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: AI_CONFIG.OPENAI_MODEL,
        messages: [
          {
            role: 'system',
            content: 'Generate interview questions based on actual resume content. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: questionPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
      console.error('OpenAI API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(`Question generation API error: ${errorMessage}`);
    }

    const result = await response.json();
    let content = result.choices[0].message.content;
    
    // Use robust JSON extraction
    content = extractJSONFromResponse(content);
    
    const questions = JSON.parse(content);
    return questions;
  } catch (error) {
    console.error('Question generation failed:', error);
    throw new Error(`Question generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Generate follow-up questions based on previous response
export const generateFollowUpQuestion = async (
  originalQuestion: string,
  candidateResponse: string,
  resumeAnalysis: ResumeAnalysis
): Promise<any | null> => {
  if (!AI_CONFIG.OPENAI_API_KEY) {
    return null; // No follow-ups without API key
  }

  // Truncate long responses to stay within token limits
  const maxResponseLength = 500;
  const truncatedResponse = candidateResponse.length > maxResponseLength
    ? candidateResponse.substring(0, maxResponseLength) + '...'
    : candidateResponse;

  const followUpPrompt = `
Analyze if this response needs deeper exploration:

**Original Question:** ${originalQuestion}
**Candidate Response:** ${truncatedResponse}
**Their Background:** ${resumeAnalysis.actualRole}, ${resumeAnalysis.yearsOfExperience} years
**Key Technologies:** ${resumeAnalysis.keyTechnologies.slice(0, 4).join(', ')}

Criteria for follow-up:
- Response too vague/generic
- Claims specific experience but lacks detail
- Mentions technology from resume but shallow explanation
- Senior level candidate giving junior-level answer

If follow-up needed (be selective):
{
  "needsFollowUp": true,
  "question": {
    "id": "followup-${Date.now()}",
    "text": "Specific follow-up to dig deeper",
    "category": "technical/behavioral",
    "difficulty": "based on their level",
    "isFollowUp": true,
    "resumeContext": "What needs clarification"
  }
}

If response is adequate:
{
  "needsFollowUp": false
}

Only ask follow-ups for important gaps, not every response.
`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_CONFIG.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: AI_CONFIG.OPENAI_MODEL,
        messages: [
          {
            role: 'system',
            content: 'Decide if follow-up question needed. Respond only with valid JSON.'
          },
          {
            role: 'user',
            content: followUpPrompt
          }
        ],
        temperature: 0.2,
        max_tokens: 400,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
      console.error('OpenAI API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(`Follow-up generation API error: ${errorMessage}`);
    }

    const result = await response.json();
    let content = result.choices[0].message.content;
    
    // Use robust JSON extraction
    content = extractJSONFromResponse(content);
    
    const followUpData = JSON.parse(content);
    return followUpData.needsFollowUp ? followUpData.question : null;
  } catch (error) {
    console.error('Follow-up generation failed:', error);
    return null; // No follow-ups on error
  }
};

// Robust JSON extraction helper function for resumeAnalyzer
const extractJSONFromResponse = (content: string): string => {
  // First, try to extract from complete markdown code blocks
  const completeJsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (completeJsonMatch) {
    return completeJsonMatch[1].trim();
  }
  
  // Handle partial markdown delimiters (truncated responses)
  let cleanContent = content.trim();
  
  // Remove partial opening markdown
  if (cleanContent.startsWith('```json')) {
    cleanContent = cleanContent.replace(/^```json\s*/, '');
  } else if (cleanContent.startsWith('```')) {
    cleanContent = cleanContent.replace(/^```\s*/, '');
  }
  
  // Remove partial closing markdown
  if (cleanContent.endsWith('```')) {
    cleanContent = cleanContent.replace(/\s*```$/, '');
  }
  
  return cleanContent.trim();
};

// Mock functions for fallback
const mockAnalyzeResume = (resumeText: string): ResumeAnalysis => {
  const words = resumeText.toLowerCase().split(/\s+/);
  
  const commonSkills = ['javascript', 'python', 'java', 'react', 'node.js', 'sql', 'git', 'aws'];
  const foundSkills = commonSkills.filter(skill => 
    words.some(word => word.includes(skill.toLowerCase()))
  );

  return {
    skills: foundSkills.length > 0 ? foundSkills : ['Programming', 'Problem Solving'],
    experience: ['Software Development', 'Team Collaboration'],
    education: ['Computer Science'],
    projects: ['Web Applications', 'Database Systems'],
    strengths: ['Technical Skills', 'Communication'],
    gaps: ['Advanced Architecture', 'Leadership Experience'],
    yearsOfExperience: Math.floor(Math.random() * 8) + 2,
    keyTechnologies: foundSkills.slice(0, 3)
  };
};

const mockGenerateQuestions = (resumeAnalysis: ResumeAnalysis): any[] => {
  return [
    {
      id: 'resume-q1',
      text: `Tell me about your experience with ${resumeAnalysis.keyTechnologies[0] || 'the technologies'} mentioned in your resume.`,
      category: 'technical',
      difficulty: 'medium',
      resumeContext: 'Technical skills validation'
    },
    {
      id: 'resume-q2',
      text: `You have ${resumeAnalysis.yearsOfExperience} years of experience. What's been your most challenging project?`,
      category: 'behavioral',
      difficulty: 'medium',
      resumeContext: 'Experience depth'
    }
  ];
};

const mockGenerateFollowUp = (originalQuestion: string, response: string): any | null => {
  if (response.length < 50) {
    return {
      id: `followup-${Date.now()}`,
      text: 'Can you provide more specific details about that?',
      category: 'general',
      difficulty: 'easy',
      isFollowUp: true,
      resumeContext: 'Seeking more detail'
    };
  }
  return null;
};