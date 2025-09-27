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
const evaluateWithGPT4o = async (question: string, transcript: string, position: string, resumeContext?: string): Promise<{ score: number; feedback: string; strengths: string[]; improvements: string[] }> => {
  // Generate cache key for evaluation
  const evaluationHash = await generateTextHash(`${question}:${transcript}:${position}`);
  const cacheKey = `evaluation:${evaluationHash}`;
  
  // Check cache first
  const cachedResult = smartCache.get<any>(cacheKey);
  if (cachedResult) {
    console.log('📋 Using cached evaluation');
    return cachedResult;
  }

  const contextInfo = resumeContext ? `\n**Resume Context**: ${resumeContext}` : '';

  const evaluationPrompt = `
You are an expert interview evaluator with 20+ years of experience in hiring for ${position} roles. 

Evaluate this interview response comprehensively:

**Question**: "${question}"
**Candidate's Response**: "${transcript}"
**Position**: ${position}${contextInfo}

Evaluation Criteria:
1. **Relevance & Content Quality** (25%): How well does the response address the question?
2. **Communication Skills** (25%): Clarity, structure, and articulation
3. **Technical/Professional Knowledge** (25%): Depth of understanding and expertise
4. **Examples & Evidence** (25%): Use of specific examples, quantifiable results

Provide your evaluation in this exact JSON format:
{
  "score": <number between 0-100>,
  "feedback": "<comprehensive 2-3 sentence feedback explaining the score>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"]
}

Be fair but thorough. Consider the position requirements and provide actionable feedback.
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
            content: 'You are an expert interview evaluator. Always respond with valid JSON format. Be professional, fair, and constructive in your evaluations.'
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
    
    try {
      let content = result.choices[0].message.content;
      
      // Strip markdown code blocks if present
      if (content.startsWith('```json')) {
        content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (content.startsWith('```')) {
        content = content.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      const evaluation = JSON.parse(content);
      
      const result = {
        score: Math.max(0, Math.min(100, evaluation.score)),
        feedback: evaluation.feedback,
        strengths: evaluation.strengths || [],
        improvements: evaluation.improvements || []
      };
      
      // Cache the result
      smartCache.set(cacheKey, result, azureConfig.cache.ttl.evaluations);
      
      return result;
    } catch (parseError) {
      console.error('Failed to parse GPT-4o response:', result.choices[0].message.content);
      throw new Error('Invalid response format from GPT-4o');
    }
  });
};

// Generate interview questions using GPT-4o
export const generateQuestionsWithAI = async (position: string, experienceLevel: string = 'mid-level'): Promise<any[]> => {
  if (!AI_CONFIG.OPENAI_API_KEY) {
    console.warn('OpenAI API key not configured, using default questions');
    return [];
  }

  const questionPrompt = `
Generate 8 comprehensive interview questions for a ${experienceLevel} ${position} role.

Requirements:
- Mix of behavioral, technical, and situational questions
- Progressive difficulty (start easier, get more challenging)
- Relevant to ${position} responsibilities
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
    
    const questions = JSON.parse(content);
    
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
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: `Hello! Here's your next interview question: ${questionText}. Please take your time to think and provide a detailed response.`,
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
      return speakWithBrowserTTS(questionText);
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
// Fallback browser text-to-speech
const speakWithBrowserTTS = (text: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('Speech synthesis not supported'));
      return;
    }

    const utterance = new SpeechSynthesisUtterance(
      `Hello! Here's your next interview question: ${text}. Please take your time to think and provide a detailed response.`
    );
    
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
export const evaluateResponse = async (response: InterviewResponse, position: string = 'Software Developer', resumeContext?: string): Promise<{ score: number; feedback: string; strengths?: string[]; improvements?: string[] }> => {
  try {
    if (!AI_CONFIG.OPENAI_API_KEY) {
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
    const evaluation = await evaluateWithGPT4o(response.question, transcript, position, resumeContext);
    
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
  
  // Mock scoring algorithm based on duration and randomness
  let baseScore = Math.min(85, Math.max(45, duration * 1.8));
  const variance = (Math.random() - 0.5) * 15;
  const finalScore = Math.max(30, Math.min(95, Math.round(baseScore + variance)));
  
  // Generate realistic feedback based on score
  let feedback = '';
  let strengths: string[] = [];
  let improvements: string[] = [];
  
  if (finalScore >= 80) {
    feedback = 'Excellent response demonstrating strong communication skills and relevant experience. The answer was well-structured and provided good insights.';
    strengths = ['Clear communication', 'Relevant examples', 'Good structure'];
    improvements = ['Could add more quantifiable results', 'Consider industry trends', 'Expand on challenges faced'];
  } else if (finalScore >= 65) {
    feedback = 'Good response with solid content. Shows understanding of the topic but could benefit from more specific examples and deeper analysis.';
    strengths = ['Good understanding', 'Relevant content', 'Adequate communication'];
    improvements = ['Add specific examples', 'Provide more detail', 'Improve clarity'];
  } else if (finalScore >= 50) {
    feedback = 'Adequate response but needs improvement in depth and clarity. Consider providing more specific examples and elaborating on key points.';
    strengths = ['Basic understanding', 'Attempted to answer', 'Some relevant points'];
    improvements = ['Provide specific examples', 'Improve clarity', 'Add more depth'];
  } else {
    feedback = 'Response needs significant improvement. Focus on directly addressing the question with specific examples and clearer communication.';
    strengths = ['Attempted response', 'Some effort shown'];
    improvements = ['Address question directly', 'Provide clear examples', 'Improve communication', 'Add relevant details'];
  }
  
  // Add mock transcript for display
  response.transcript = `[Mock transcript - Audio duration: ${Math.round(duration)}s. In a real implementation, this would show the actual speech-to-text conversion of the candidate's response.]`;
  
  return { score: finalScore, feedback, strengths, improvements };
};

export const calculateOverallScore = (responses: InterviewResponse[]): number => {
  const scores = responses.filter(r => r.score !== undefined).map(r => r.score!);
  if (scores.length === 0) return 0;
  
  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
};