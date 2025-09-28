import React, { useState } from 'react';
import { RefreshCw, Settings, Award, Download, AlertTriangle } from 'lucide-react';
import { InterviewSession, Certificate } from '../types/interview';
import { evaluateResponse, calculateOverallScore } from '../utils/aiEvaluator';
import { generateCertificateNumber, downloadCertificate } from '../utils/certificateGenerator';

interface ReEvaluationInterfaceProps {
  session: InterviewSession;
  onClose: () => void;
  onReEvaluationComplete: (updatedSession: InterviewSession, newCertificate: Certificate) => void;
}

export const ReEvaluationInterface: React.FC<ReEvaluationInterfaceProps> = ({
  session,
  onClose,
  onReEvaluationComplete
}) => {
  const [customInstructions, setCustomInstructions] = useState('');
  const [evaluationMethod, setEvaluationMethod] = useState<'standard' | 'custom'>('standard');
  const [isReEvaluating, setIsReEvaluating] = useState(false);
  const [reEvaluationProgress, setReEvaluationProgress] = useState(0);
  const [newCertificate, setNewCertificate] = useState<Certificate | null>(null);
  const [newSession, setNewSession] = useState<InterviewSession | null>(null);

  const predefinedMethods = {
    'technical-focus': {
      name: 'Technical Focus (70% Technical, 30% Communication)',
      instructions: `
Evaluate with heavy emphasis on technical competency:
- Technical/Professional Knowledge: 70%
- Communication Skills: 30%
- Relevance & Content Quality: Included in technical assessment
- Examples & Evidence: Included in technical assessment

Focus on depth of technical understanding, accuracy of technical concepts, and practical application knowledge.
`
    },
    'communication-focus': {
      name: 'Communication Focus (70% Communication, 30% Technical)',
      instructions: `
Evaluate with heavy emphasis on communication and soft skills:
- Communication Skills: 40%
- Relevance & Content Quality: 30%
- Technical/Professional Knowledge: 20%
- Examples & Evidence: 10%

Focus on clarity, structure, professional presentation, and ability to explain complex concepts clearly.
`
    },
    'senior-level': {
      name: 'Senior Level Expectations (Higher Standards)',
      instructions: `
Apply senior-level evaluation standards:
- Expect strategic thinking and leadership examples
- Require detailed technical explanations with trade-offs
- Look for mentoring/team leadership experience
- Demand quantifiable business impact examples
- Higher threshold for all scoring criteria (80+ for good, 90+ for excellent)
`
    },
    'entry-level': {
      name: 'Entry Level Friendly (Adjusted Expectations)',
      instructions: `
Apply entry-level evaluation standards:
- Focus on potential and learning ability
- Accept theoretical knowledge over extensive experience
- Value enthusiasm and willingness to learn
- Lower threshold for scoring (60+ for good, 75+ for excellent)
- Emphasize educational background and projects
`
    }
  };

  const handleReEvaluate = async () => {
    setIsReEvaluating(true);
    setReEvaluationProgress(0);

    try {
      // Check if we have transcripts
      const responsesWithTranscripts = session.responses.filter(r => r.transcript);
     // Use robust regex to extract JSON from markdown code blocks
     const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
     if (jsonMatch) {
       content = jsonMatch[1].trim();
     } else {
       content = content.trim();
     }
      const updatedResponses = [...session.responses];
      const totalResponses = responsesWithTranscripts.length;

      // Get evaluation instructions
      let evaluationInstructions = '';
      if (evaluationMethod === 'custom') {
        evaluationInstructions = customInstructions;
      } else {
        // Use predefined method instructions
        const selectedMethod = Object.values(predefinedMethods).find(method => 
          method.instructions === customInstructions
        );
        evaluationInstructions = selectedMethod?.instructions || '';
      }

      // Re-evaluate each response with new instructions
      for (let i = 0; i < updatedResponses.length; i++) {
        const response = updatedResponses[i];
        
        if (response.transcript) {
          // Use existing transcript for re-evaluation
          const evaluation = await evaluateResponseWithCustomInstructions(
            response.question,
            response.transcript,
            session.position,
            evaluationInstructions,
            session.resumeAnalysis
          );
          
          updatedResponses[i] = {
            ...response,
            score: evaluation.score,
            feedback: evaluation.feedback,
            strengths: evaluation.strengths,
            improvements: evaluation.improvements,
            evaluationMethod: evaluationMethod === 'custom' ? 'Custom Instructions' : 'Predefined Method',
            customInstructions: evaluationInstructions
          };
        }

        setReEvaluationProgress(((i + 1) / totalResponses) * 100);
      }

      const newOverallScore = calculateOverallScore(updatedResponses);
      
      const reEvaluatedSession: InterviewSession = {
        ...session,
        responses: updatedResponses,
        score: newOverallScore,
        lastReEvaluatedAt: new Date(),
        evaluationMethod: evaluationMethod === 'custom' ? 'Custom Instructions' : 'Predefined Method'
      };

      const regeneratedCertificate: Certificate = {
        id: `cert-reeval-${session.id}-${Date.now()}`,
        candidateName: session.candidateName,
        position: session.position,
        score: newOverallScore,
        issueDate: new Date(),
        certificateNumber: generateCertificateNumber(),
        isReEvaluation: true,
        originalScore: session.score,
        evaluationMethod: evaluationMethod === 'custom' ? 'Custom Instructions' : 'Predefined Method'
      };

      setNewSession(reEvaluatedSession);
      setNewCertificate(regeneratedCertificate);
      
      onReEvaluationComplete(reEvaluatedSession, regeneratedCertificate);
    } catch (error) {
      console.error('Re-evaluation failed:', error);
      alert(`❌ Re-evaluation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsReEvaluating(false);
    }
  };

  const handlePredefinedMethod = (methodKey: string) => {
    const method = predefinedMethods[methodKey as keyof typeof predefinedMethods];
    setCustomInstructions(method.instructions);
    setEvaluationMethod('custom');
  };

  const handleDownloadNewCertificate = () => {
    if (newCertificate) {
      try {
        downloadCertificate(newCertificate, newSession);
        alert('✅ New detailed evaluation report downloaded successfully!');
      } catch (error) {
        console.error('Evaluation report download failed:', error);
        alert('❌ Failed to download evaluation report. Please try again.');
      }
    }
  };

  const hasTranscripts = session.responses.some(r => r.transcript);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Re-Evaluate Interview</h2>
            <p className="text-gray-600">{session.candidateName} • {session.position}</p>
            <p className="text-sm text-blue-600">Current Score: {session.score}% • Apply different evaluation criteria</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {!hasTranscripts && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-red-800 mb-2">
                    No Transcripts Available
                  </h3>
                  <p className="text-sm text-red-700">
                    This session doesn't have saved transcripts. Re-evaluation requires transcripts to apply different scoring methods.
                    Only sessions with OpenAI API processing have transcripts saved.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Current Evaluation Summary */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Evaluation</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{session.score}%</div>
                <div className="text-sm text-gray-600">Overall Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{session.responses.length}</div>
                <div className="text-sm text-gray-600">Questions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {session.responses.filter(r => r.transcript).length}
                </div>
                <div className="text-sm text-gray-600">With Transcripts</div>
              </div>
            </div>
          </div>

          {/* Predefined Evaluation Methods */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Evaluation Methods</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(predefinedMethods).map(([key, method]) => (
                <button
                  key={key}
                  onClick={() => handlePredefinedMethod(key)}
                  className="text-left p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <h4 className="font-medium text-gray-800 mb-2">{method.name}</h4>
                  <p className="text-sm text-gray-600">
                    {method.instructions.split('\n')[1]?.replace('- ', '') || 'Custom evaluation method'}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Instructions */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Custom Evaluation Instructions</h3>
            <div className="space-y-4">
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="method"
                    value="standard"
                    checked={evaluationMethod === 'standard'}
                    onChange={(e) => setEvaluationMethod(e.target.value as 'standard' | 'custom')}
                    className="mr-2"
                  />
                  Standard GPT-4o Evaluation
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="method"
                    value="custom"
                    checked={evaluationMethod === 'custom'}
                    onChange={(e) => setEvaluationMethod(e.target.value as 'standard' | 'custom')}
                    className="mr-2"
                  />
                  Custom Instructions
                </label>
              </div>

              {evaluationMethod === 'custom' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Evaluation Instructions for GPT-4o:
                  </label>
                  <textarea
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Enter specific evaluation criteria, scoring weights, or focus areas for GPT-4o to apply..."
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Example: "Focus 60% on technical depth, 40% on communication. For FPGA roles, emphasize timing closure, resource optimization, and verification methodologies."
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Re-evaluation Progress */}
          {isReEvaluating && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <RefreshCw className="w-5 h-5 text-blue-600 mr-2 animate-spin" />
                <h3 className="text-lg font-semibold text-blue-800">Re-evaluating with New Criteria</h3>
              </div>
              <div className="mb-4">
                <div className="w-full bg-blue-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${reEvaluationProgress}%` }}
                  />
                </div>
                <p className="text-sm text-blue-700 mt-2">{Math.round(reEvaluationProgress)}% Complete</p>
              </div>
              <p className="text-sm text-blue-700">
                Applying new evaluation criteria to existing transcripts...
              </p>
            </div>
          )}

          {/* New Results */}
          {newSession && newCertificate && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-green-800">Re-evaluation Complete!</h3>
                <button
                  onClick={handleDownloadNewCertificate}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center text-sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download New Report
                </button>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-gray-600">{session.score}%</div>
                  <div className="text-sm text-gray-500">Original Score</div>
                </div>
                <div className="text-center p-4 bg-green-100 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{newSession.score}%</div>
                  <div className="text-sm text-green-700">New Score</div>
                </div>
                <div className="text-center p-4 bg-blue-100 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {((newSession.score || 0) - (session.score || 0)) > 0 ? '+' : ''}
                    {(newSession.score || 0) - (session.score || 0)}%
                  </div>
                  <div className="text-sm text-blue-700">Difference</div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={handleReEvaluate}
              disabled={isReEvaluating || !hasTranscripts || (evaluationMethod === 'custom' && !customInstructions.trim())}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              {isReEvaluating ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Re-evaluating...
                </>
              ) : (
                <>
                  <Settings className="w-5 h-5 mr-2" />
                  Apply New Evaluation Method
                </>
              )}
            </button>
            
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>

          {/* Transcript Preview */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Available Transcripts</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {session.responses.map((response, index) => (
                <div key={response.questionId} className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50 rounded-r-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-800 text-sm">Question {index + 1}</h4>
                    <span className="text-xs text-gray-500">
                      {response.transcript ? `${response.transcript.length} chars` : 'No transcript'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{response.question}</p>
                  {response.transcript ? (
                    <p className="text-xs text-blue-700 bg-blue-50 p-2 rounded">
                      {response.transcript.substring(0, 150)}
                      {response.transcript.length > 150 ? '...' : ''}
                    </p>
                  ) : (
                    <p className="text-xs text-red-600 italic">No transcript available</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Custom evaluation function with specific instructions
const evaluateResponseWithCustomInstructions = async (
  question: string,
  transcript: string,
  position: string,
  customInstructions: string,
  resumeAnalysis?: any
): Promise<{ score: number; feedback: string; strengths: string[]; improvements: string[] }> => {
  const AI_CONFIG = {
    OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY || '',
    OPENAI_MODEL: 'gpt-4o',
  };

  if (!AI_CONFIG.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const contextInfo = resumeAnalysis ? `\n**Resume Context**: ${resumeAnalysis.actualRole || position} with ${resumeAnalysis.yearsOfExperience} years experience` : '';

  const evaluationPrompt = `
You are an expert interview evaluator. Apply the following CUSTOM EVALUATION CRITERIA:

${customInstructions}

**Interview Details:**
**Question**: "${question}"
**Candidate's Response**: "${transcript}"
**Position**: ${position}${contextInfo}

Apply the custom criteria above and provide your evaluation in this exact JSON format:
{
  "score": <number between 0-100>,
  "feedback": "<comprehensive feedback explaining the score based on custom criteria>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"]
}

Follow the custom instructions precisely and adjust your evaluation accordingly.
`;

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
          content: 'You are an expert interview evaluator. Apply custom evaluation criteria precisely. Always respond with valid JSON format.'
        },
        {
          role: 'user',
          content: evaluationPrompt
        }
      ],
      temperature: 0.2,
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
    
    return {
      score: Math.max(0, Math.min(100, evaluation.score)),
      feedback: evaluation.feedback,
      strengths: evaluation.strengths || [],
      improvements: evaluation.improvements || []
    };
  } catch (parseError) {
    console.error('Failed to parse GPT-4o response:', result.choices[0].message.content);
    throw new Error('Invalid response format from GPT-4o');
  }
};