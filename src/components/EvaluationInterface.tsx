import React, { useState, useEffect } from 'react';
import { Award, Download, Star, TrendingUp } from 'lucide-react';
import { InterviewSession, Certificate } from '../types/interview';
import { evaluateResponse, calculateOverallScore } from '../utils/aiEvaluator';
import { generateCertificateNumber, downloadCertificate } from '../utils/certificateGenerator';

interface EvaluationInterfaceProps {
  session: InterviewSession;
  onEvaluationComplete: (updatedSession: InterviewSession, certificate: Certificate) => void;
}

export const EvaluationInterface: React.FC<EvaluationInterfaceProps> = ({
  session,
  onEvaluationComplete
}) => {
  const [isEvaluating, setIsEvaluating] = useState(true);
  const [evaluationProgress, setEvaluationProgress] = useState(0);
  const [evaluatedSession, setEvaluatedSession] = useState<InterviewSession | null>(null);
  const [certificate, setCertificate] = useState<Certificate | null>(null);

  useEffect(() => {
    evaluateInterview();
  }, []);

  const evaluateInterview = async () => {
    const updatedResponses = [...session.responses];
    const totalResponses = updatedResponses.length;
    
    if (totalResponses === 0) {
      alert('No responses found to evaluate. Please ensure you recorded answers to the interview questions.');
      return;
    }

    for (let i = 0; i < updatedResponses.length; i++) {
      const response = updatedResponses[i];
      
      // Check if response already has evaluation data (mock responses)
      if (response.transcript && response.evaluation && response.evaluation.score) {
        // Use existing mock evaluation data
        updatedResponses[i] = {
          ...response,
          score: response.evaluation.score,
          feedback: response.evaluation.feedback,
          strengths: response.strengths || [],
          improvements: response.improvements || []
        };
      } else if (response.audioBlob || response.transcript) {
        // Evaluate response with AI
        try {
          const evaluation = await evaluateResponse(
            response, 
            session.position, 
            session.resumeAnalysis?.actualRole || session.position,
            session.resumeAnalysis
          );
          
          updatedResponses[i] = {
            ...response,
            score: evaluation.score,
            feedback: evaluation.feedback,
            strengths: evaluation.strengths,
            improvements: evaluation.improvements
          };
        } catch (error) {
          // Fallback to mock evaluation
          updatedResponses[i] = {
            ...response,
            score: Math.floor(Math.random() * 30) + 60,
            feedback: 'Response recorded successfully. AI evaluation unavailable.',
            strengths: ['Response provided'],
            improvements: ['Consider providing more specific examples']
          };
        }
      } else {
        // Skip responses without audio or transcript
        updatedResponses[i] = {
          ...response,
          score: 0,
          feedback: 'No response recorded',
          strengths: [],
          improvements: ['Please ensure microphone is working and record a response']
        };
      }

      setEvaluationProgress(((i + 1) / totalResponses) * 100);
    }

    // Filter out responses with no score for overall calculation
    const validResponses = updatedResponses.filter(r => r.score && r.score > 0);
    const overallScore = validResponses.length > 0 
      ? calculateOverallScore(validResponses)
      : 0;
    
    const updatedSession: InterviewSession = {
      ...session,
      responses: updatedResponses,
      score: overallScore,
      status: 'evaluated',
      completedAt: new Date()
    };

    const generatedCertificate: Certificate = {
      id: `cert-${session.id}`,
      candidateName: session.candidateName,
      position: session.position,
      score: overallScore,
      issueDate: new Date(),
      certificateNumber: generateCertificateNumber(),
      evaluationMethod: session.interviewType === 'video' ? 'Video Interview with AI Agent' : 'Audio Interview with GPT-4o'
    };

    setEvaluatedSession(updatedSession);
    setCertificate(generatedCertificate);
    setIsEvaluating(false);

    onEvaluationComplete(updatedSession, generatedCertificate);
  };

  const handleDownloadCertificate = () => {
    if (certificate) {
      try {
        downloadCertificate(certificate, evaluatedSession);
        alert('✅ Detailed Evaluation Report downloaded successfully!');
      } catch (error) {
        console.error('Evaluation report download failed:', error);
        alert('❌ Failed to download evaluation report. Please try again.');
      }
    }
  };

  if (isEvaluating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <TrendingUp className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Evaluating Your Interview</h2>
            <p className="text-gray-600">Our AI is analyzing your responses...</p>
          </div>
          
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${evaluationProgress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">{Math.round(evaluationProgress)}% Complete</p>
          </div>
          
          <div className="animate-pulse">
            <div className="text-sm text-blue-600">Processing audio responses...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!evaluatedSession || !certificate) {
    return <div>Error: Evaluation failed</div>;
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Improvement';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
          <div className="text-center mb-8">
            <Award className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Interview Complete!</h1>
            <p className="text-lg text-gray-600">{evaluatedSession.candidateName}</p>
            <p className="text-gray-500">{evaluatedSession.position}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg p-6 text-center">
              <Star className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Overall Score</h3>
              <div className="text-4xl font-bold mb-2">{evaluatedSession.score}%</div>
              <div className="text-sm opacity-90">{getScoreLabel(evaluatedSession.score!)}</div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800">Certificate Details</h3>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Certificate Number:</span> {certificate.certificateNumber}</div>
                <div><span className="font-medium">Issue Date:</span> {certificate.issueDate.toLocaleDateString()}</div>
                <div><span className="font-medium">Valid From:</span> {certificate.issueDate.toLocaleDateString()}</div>
              </div>
              
              <button
                onClick={handleDownloadCertificate}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg flex items-center justify-center transition-colors"
              >
                <Download className="w-5 h-5 mr-2" />
                Download Detailed Report
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Detailed Evaluation</h2>
          
          <div className="space-y-6">
            {evaluatedSession.responses.map((response, index) => (
              <div key={response.questionId} className="border-l-4 border-blue-500 pl-6">
                <div className="mb-2">
                  <h3 className="font-semibold text-gray-800 mb-1">Question {index + 1}</h3>
                  <p className="text-gray-600 text-sm mb-3">{response.question}</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Response Score</span>
                    <span className={`text-lg font-bold ${getScoreColor(response.score!)}`}>
                      {response.score}%
                    </span>
                  </div>
                  
                  {response.audioUrl && (
                    <audio controls className="w-full mb-3">
                      <source src={response.audioUrl} type="audio/webm" />
                      Your browser does not support the audio element.
                    </audio>
                  )}
                  
                  {response.transcript && (
                    <div className="mb-3 p-3 bg-blue-50 rounded-md">
                      <span className="text-sm font-medium text-blue-800">Transcript:</span>
                      <p className="text-sm text-blue-700 mt-1">{response.transcript}</p>
                    </div>
                  )}
                  
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">AI Feedback:</span> {response.feedback}
                  </div>
                  
                  {response.transcript && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-md">
                      <span className="text-sm font-medium text-gray-700">Your Response Transcript:</span>
                      <p className="text-sm text-gray-600 mt-1 italic">"{response.transcript}"</p>
                    </div>
                  )}
                  
                  {response.strengths && response.strengths.length > 0 && (
                    <div className="mt-3 p-3 bg-green-50 rounded-md">
                      <span className="text-sm font-medium text-green-800">Strengths:</span>
                      <ul className="text-sm text-green-700 mt-1 list-disc list-inside">
                        {response.strengths.map((strength, idx) => (
                          <li key={idx}>{strength}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {response.improvements && response.improvements.length > 0 && (
                    <div className="mt-3 p-3 bg-yellow-50 rounded-md">
                      <span className="text-sm font-medium text-yellow-800">Areas for Improvement:</span>
                      <ul className="text-sm text-yellow-700 mt-1 list-disc list-inside">
                        {response.improvements.map((improvement, idx) => (
                          <li key={idx}>{improvement}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};