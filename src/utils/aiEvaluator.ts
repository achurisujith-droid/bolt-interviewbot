import { InterviewResponse } from '../types/interview';
import { performanceOptimizer, smartCache } from './performanceOptimizer';
import { azureConfig } from './azureConfig';

// Configuration for AI services
const AI_CONFIG = {
  OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY || '',
  OPENAI_MODEL: 'gpt-4o', // Using GPT-4o as requested
};

// Convert audio blob to FormData for OpenAI Whisper
const prepareAudioForWhisper = (audioBlob: Blob): FormData => {
  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.webm');
  formData.append('model', 'whisper-1');
  formData.append('language', 'en');
  return formData;
};

// Real OpenAI Whisper API integration for speech-to-text
const transcribeWithOpenAI = async (audioBlob: Blob): Promise<string> => {
  // Generate cache key for transcription
  const audioHash = await generateBlobHash(audioBlob);
  const cacheKey = `transcription:${audioHash}`;
  
  // Check cache first
  const cachedResult = smartCache.get<string>(cacheKey);
  if (cachedResult) {
    console.log('📋 Using cached transcription');
    return cachedResult;
  }

  return performanceOptimizer.optimizedOpenAIRequest(async (apiKey) => {
    const formData = prepareAudioForWhisper(audioBlob);

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI Whisper API error: ${error.error?.message || 'Unknown error'}`);
    }

    const result = await response.json();
    const transcript = result.text || 'No transcription available';
    
    // Cache the result
    smartCache.set(cacheKey, transcript, azureConfig.cache.ttl.evaluations);
    
    return transcript;
  });
};

// Real OpenAI GPT-4o evaluation with detailed analysis
const evaluateWithGPT4o = async (question: string, transcript: string, actualRole: string, resumeContext?: string, resumeAnalysis?: any): Promise<{ score: number; feedback: string; strengths: string[]; improvements: string[] }> => {
  // Generate cache key for evaluation
  const evaluationHash = await generateTextHash(`${question}:${transcript}:${actualRole}`);
  const cacheKey = `evaluation:${evaluationHash}`;
  
  // Check cache first
  const cachedResult = smartCache.get<any>(cacheKey);
  if (cachedResult) {
    console.log('📋 Using cached evaluation');
    return cachedResult;
  }

  const contextInfo = resumeContext ? `\n**Resume Context**: ${resumeContext}` : '';
  const experienceInfo = resumeAnalysis ? `\n**Experience Level**: ${resumeAnalysis.yearsOfExperience} years (${resumeAnalysis.seniority} level)\n**Key Technologies**: ${resumeAnalysis.keyTechnologies?.join(', ') || 'N/A'}` : '';

  // Get job requirements if available
  const jobRequirements = localStorage.getItem('currentJobRequirements') || '';
  const requirementsInfo = jobRequirements ? `\n**Job Requirements**: ${jobRequirements}` : '';

  const evaluationPrompt = `
You are an expert interview evaluator analyzing a candidate's response based on their actual background.

Evaluate this interview response comprehensively and provide REAL, DETAILED analysis:

**Question**: "${question}"
**Candidate's Response Transcript**: "${transcript}"
**Candidate's Actual Role**: ${actualRole}${contextInfo}${experienceInfo}${requirementsInfo}

IMPORTANT: Provide REAL evaluation based on the actual transcript content. Do NOT give generic scores.

Evaluation Criteria (each worth 25%):
1. **Relevance & Content Quality** (25%): How well does the response address the question?
2. **Communication Skills** (25%): Clarity, structure, and articulation
3. **Technical/Professional Knowledge** (25%): Depth of understanding and expertise
4. **Examples & Evidence** (25%): Use of specific examples, quantifiable results${jobRequirements ? '\n\n**Additional Context**: Evaluate how well their response aligns with the job requirements provided.' : ''}

Analyze the ACTUAL content of the transcript and provide your evaluation in this exact JSON format:
{
  "score": <number between 0-100>,
  "feedback": "<comprehensive 2-3 sentence feedback explaining the score based on actual transcript content>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"]
}

Be fair but thorough. Consider their actual background and provide actionable feedback based on what the candidate actually said.
`;

  return performanceOptimizer.optimizedOpenAIRequest(async (apiKey) => {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: AI_CONFIG.OPENAI_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are an expert interview evaluator. Evaluate based on candidate actual background, not predetermined job positions. Always respond with valid JSON format.'
          },
          {
            role: 'user',
            content: evaluationPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI GPT-4o API error: ${error.error?.message || 'Unknown error'}`);
    }

    const result = await response.json();
    
    let content = result.choices[0].message.content;
    
    // Use robust JSON extraction
    content = extractJSONFromResponse(content);
    
    let evaluation;
    try {
      evaluation = JSON.parse(content);
    } catch (parseError) {
      // Fallback: Extract JSON object between first { and last }
      const firstBrace = content.indexOf('{');
      const lastBrace = content.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        const jsonSubstring = content.substring(firstBrace, lastBrace + 1);
        evaluation = JSON.parse(jsonSubstring);
      } else {
        throw new Error('No valid JSON object found in response');
      }
    }
    
    const finalEvaluation = {
      score: Math.max(0, Math.min(100, evaluation.score)),
      feedback: evaluation.feedback,
      strengths: evaluation.strengths || [],
      improvements: evaluation.improvements || []
    };
    
    // Cache the result
    smartCache.set(cacheKey, finalEvaluation, azureConfig.cache.ttl.evaluations);
    
    return finalEvaluation;
  });
};

// Generate interview questions using GPT-4o
export const generateQuestionsWithAI = async (actualRole: string, experienceLevel: string = 'mid-level'): Promise<any[]> => {
  if (!AI_CONFIG.OPENAI_API_KEY) {
    console.warn('OpenAI API key not configured, using default questions');
    return [];
  }

  const questionPrompt = `
Generate 7 comprehensive interview questions for a ${experienceLevel} ${actualRole} professional.

Requirements:
- Mix of behavioral, technical, and situational questions
- Progressive difficulty (start easier, get more challenging)
- Relevant to ${actualRole} responsibilities
- Allow for detailed responses (30-90 seconds each)

Return as JSON array with this exact format:
[
  {
    "id": "q1",
    "text": "Question text here",
    "category": "behavioral|technical|situational",
    "difficulty": "easy|medium|hard",
    "expectedDuration": 60
  }
]

Make questions engaging and allow candidates to showcase their skills and experience.
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
            content: 'You are an expert HR professional. Generate relevant, engaging interview questions. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: questionPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate questions');
    }

    const result = await response.json();
    let content = result.choices[0].message.content;
    
    // Strip markdown code blocks if present
    if (content.startsWith('```json')) {
      content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (content.startsWith('```')) {
      content = content.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    let questions;
    try {
      questions = JSON.parse(content);
    } catch (parseError) {
      // Fallback: Extract JSON array between first [ and last ]
      const firstBracket = content.indexOf('[');
      const lastBracket = content.lastIndexOf(']');
      if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
        const jsonSubstring = content.substring(firstBracket, lastBracket + 1);
        questions = JSON.parse(jsonSubstring);
      } else {
        throw new Error('No valid JSON array found in response');
      }
    }
    
    return questions.map((q: any, index: number) => ({
      ...q,
      id: `ai-q${index + 1}`
    }));
  } catch (error) {
    console.error('Failed to generate AI questions:', error);
    return [];
  }
};

// Text-to-Speech for asking questions
export const speakQuestion = async (questionText: string): Promise<void> => {
  if (!questionText || questionText.trim().length === 0) {
    console.warn('Empty question text provided to speakQuestion');
    return;
  }
  
  console.log('🔊 Speaking question:', questionText);
  
  // Generate cache key for TTS
  const textHash = await generateTextHash(questionText);
  const cacheKey = `tts:${textHash}`;
  
  // Check if we have cached audio URL
  const cachedAudioUrl = smartCache.get<string>(cacheKey);
  if (cachedAudioUrl) {
    console.log('📋 Using cached TTS audio');
    return playAudioFromUrl(cachedAudioUrl);
  }

  return performanceOptimizer.optimizedOpenAIRequest(async (apiKey) => {
    try {
      console.log('🎤 Using OpenAI TTS for question:', questionText.substring(0, 100) + '...');
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: questionText, // Use the exact question text without modification
          voice: 'alloy', // Professional, neutral voice
          speed: 0.9, // Slightly slower for clarity
        }),
      });

      if (!response.ok) {
        throw new Error('TTS API error');
      }

      const audioBuffer = await response.arrayBuffer();
      const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Cache the audio URL
      smartCache.set(cacheKey, audioUrl, azureConfig.cache.ttl.questions);
      
      return playAudioFromUrl(audioUrl);
    } catch (error) {
      console.error('OpenAI TTS failed, using browser TTS:', error);
      return speakWithBrowserTTS(questionText); // Pass exact question text
    }
  });
};

// Helper function to play audio from URL
const playAudioFromUrl = (audioUrl: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const audio = new Audio(audioUrl);
    
    audio.onended = () => {
      resolve();
    };
    audio.onerror = () => {
      reject(new Error('Audio playback failed'));
    };
    audio.play();
  });
};

// Helper function to generate hash for caching
const generateTextHash = async (text: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
};

const generateBlobHash = async (blob: Blob): Promise<string> => {
  const arrayBuffer = await blob.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
};

// Helper function to extract JSON from response
const extractJSONFromResponse = (content: string): string => {
  // Strip markdown code blocks if present
  if (content.startsWith('```json')) {
    content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (content.startsWith('```')) {
    content = content.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return content;
};

// Fallback browser text-to-speech
const speakWithBrowserTTS = (text: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('Speech synthesis not supported'));
      return;
    }

    console.log('🔊 Using browser TTS for question:', text.substring(0, 100) + '...');
    
    // Use the exact question text without modification
    const utterance = new SpeechSynthesisUtterance(text);
    
    utterance.rate = 0.8;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    
    // Try to use a professional voice
    const voices = speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Google') || 
      voice.name.includes('Microsoft') ||
      voice.lang.startsWith('en')
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onend = () => resolve();
    utterance.onerror = (error) => reject(error);
    
    speechSynthesis.speak(utterance);
  });
};

// Main evaluation function using real AI
export const evaluateResponse = async (response: InterviewResponse, actualRole: string = 'General', resumeContext?: string, resumeAnalysis?: any): Promise<{ score: number; feedback: string; strengths?: string[]; improvements?: string[] }> => {
  try {
    console.log('🎯 Starting REAL AI evaluation for:', actualRole);
    console.log('🔑 API Key available:', !!AI_CONFIG.OPENAI_API_KEY);
    console.log('🎤 Audio blob available:', !!response.audioBlob);
    
    if (!AI_CONFIG.OPENAI_API_KEY) {
      console.warn('⚠️ No OpenAI API key found - using mock evaluation');
      throw new Error('OpenAI API key is required for AI evaluation. Please add VITE_OPENAI_API_KEY to your .env file.');
    }

    if (!response.audioBlob) {
      throw new Error('No audio data available for evaluation');
    }

    console.log('🎤 Transcribing audio with OpenAI Whisper...');
    const transcript = await transcribeWithOpenAI(response.audioBlob);
    
    if (!transcript || transcript.trim().length === 0) {
      throw new Error('No speech detected in audio');
    }

    console.log('📝 Transcript:', transcript);
    
    console.log('🤖 Evaluating with GPT-4o...');
    const evaluation = await evaluateWithGPT4o(response.question, transcript, actualRole, resumeContext, resumeAnalysis);
    
    // Store transcript in response for display
    response.transcript = transcript;
    
    console.log('✅ Evaluation complete:', evaluation);
    return evaluation;
    
  } catch (error) {
    console.error('❌ AI evaluation failed:', error);
    console.log('🔄 Falling back to mock evaluation...');
    return await mockEvaluateResponse(response);
  }
};

// Enhanced mock evaluator for fallback
const mockEvaluateResponse = async (response: InterviewResponse): Promise<{ score: number; feedback: string; strengths: string[]; improvements: string[] }> => {
  console.log('⚠️ MOCK EVALUATION MODE - OpenAI API not available or failed');
  console.log('🔧 This is fallback mode - scores are simulated, not real AI analysis');
  
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
  
  // Analyze audio duration for mock scoring
  let duration = 30; // default
  if (response.audioUrl) {
    try {
      const audioElement = new Audio(response.audioUrl);
      await new Promise((resolve) => {
        audioElement.onloadedmetadata = () => {
          duration = audioElement.duration || 30;
          resolve(null);
        };
        audioElement.onerror = () => resolve(null);
      });
    } catch (error) {
      console.warn('Could not analyze audio duration');
    }
  }
  
  // VERY LOW mock scores to indicate this is not real evaluation
  let baseScore = Math.min(40, Math.max(10, duration * 0.8)); // Much lower scores
  const variance = (Math.random() - 0.5) * 10;
  const finalScore = Math.max(5, Math.min(45, Math.round(baseScore + variance)));
  
  console.log(`📊 MOCK EVALUATION (NOT REAL): duration=${duration}s, baseScore=${baseScore}, finalScore=${finalScore}`);
  
  // Generate realistic feedback based on score
  let feedback = '';
  let strengths: string[] = [];
  let improvements: string[] = [];
  
  // Always indicate this is mock evaluation
  feedback = `MOCK EVALUATION MODE: This is a simulated score (${finalScore}%) because OpenAI API is not configured. For real AI evaluation with GPT-4o, add VITE_OPENAI_API_KEY to your .env file.`;
  strengths = ['Mock evaluation active', 'Audio recorded successfully'];
  improvements = ['Configure OpenAI API key for real evaluation', 'Add VITE_OPENAI_API_KEY to .env file', 'Restart application after adding API key'];
  
  // Add mock transcript for display
  response.transcript = `[MOCK TRANSCRIPT - Audio duration: ${Math.round(duration)}s] This is simulated text. For real speech-to-text transcription, add VITE_OPENAI_API_KEY to your .env file and restart the application.`;
  
  return { score: finalScore, feedback, strengths, improvements };
};

export const calculateOverallScore = (responses: InterviewResponse[]): number => {
  const scores = responses.filter(r => r.score !== undefined).map(r => r.score!);
  if (scores.length === 0) return 0;
  
  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
};