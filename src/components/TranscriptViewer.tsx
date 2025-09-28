import React, { useState } from 'react';
import { MessageSquare, Copy, Play, Volume2, CheckCircle, X } from 'lucide-react';
import { InterviewSession } from '../types/interview';

interface TranscriptViewerProps {
  session: InterviewSession;
  onClose: () => void;
}

export const TranscriptViewer: React.FC<TranscriptViewerProps> = ({
  session,
  onClose
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const responsesWithTranscripts = session.responses.filter(r => r.transcript);

  const copyToClipboard = async (text: string, index?: number) => {
    try {
      await navigator.clipboard.writeText(text);
      if (index !== undefined) {
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
      } else {
        setCopiedAll(true);
        setTimeout(() => setCopiedAll(false), 2000);
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const copyAllTranscripts = () => {
    const allTranscripts = responsesWithTranscripts.map((response, index) => {
      return `Question ${index + 1}: ${response.question}

Candidate Response: "${response.transcript}"

Score: ${response.score}%
AI Feedback: ${response.feedback}

${response.strengths ? `Strengths: ${response.strengths.join(', ')}` : ''}
${response.improvements ? `Areas for Improvement: ${response.improvements.join(', ')}` : ''}

---`;
    }).join('\n\n');

    const fullReport = `Interview Transcript Report
Candidate: ${session.candidateName}
Position: ${session.position}
Date: ${session.createdAt.toLocaleDateString()}
Overall Score: ${session.score}%

${allTranscripts}`;

    copyToClipboard(fullReport);
  };

  const playAudio = (audioUrl: string) => {
    const audio = new Audio(audioUrl);
    audio.play().catch(error => {
      console.error('Failed to play audio:', error);
    });
  };

  if (responsesWithTranscripts.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
          <h2 className="text-xl font-bold text-gray-800 mb-4">No Transcripts Available</h2>
          <p className="text-gray-600 mb-4">
            This session doesn't have any saved transcripts. Transcripts are only available 
            for sessions processed with OpenAI API.
          </p>
          <button
            onClick={onClose}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <MessageSquare className="w-6 h-6 mr-2" />
              Interview Transcripts
            </h2>
            <p className="text-gray-600">{session.candidateName} • {session.position}</p>
            <p className="text-sm text-blue-600">
              {responsesWithTranscripts.length} responses with transcripts • Overall Score: {session.score}%
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={copyAllTranscripts}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center text-sm"
            >
              {copiedAll ? <CheckCircle className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copiedAll ? 'Copied!' : 'Copy All'}
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
          {responsesWithTranscripts.map((response, index) => (
            <div key={response.questionId} className="border rounded-lg p-6 bg-gray-50">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Question {index + 1}
                  </h3>
                  <p className="text-gray-700 mb-4 italic">"{response.question}"</p>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    (response.score || 0) >= 80 ? 'bg-green-100 text-green-800' :
                    (response.score || 0) >= 60 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {response.score}%
                  </span>
                </div>
              </div>

              {/* Transcript */}
              <div className="bg-white rounded-lg p-4 mb-4 border-l-4 border-blue-500">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-gray-800 flex items-center">
                    <Volume2 className="w-4 h-4 mr-2" />
                    Candidate Response Transcript
                  </h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                      {response.transcript?.length} characters
                    </span>
                    {response.audioUrl && (
                      <button
                        onClick={() => playAudio(response.audioUrl!)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Play Audio"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => copyToClipboard(response.transcript || '', index)}
                      className="text-gray-600 hover:text-gray-800 p-1"
                      title="Copy Transcript"
                    >
                      {copiedIndex === index ? 
                        <CheckCircle className="w-4 h-4 text-green-600" /> : 
                        <Copy className="w-4 h-4" />
                      }
                    </button>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  "{response.transcript}"
                </p>
              </div>

              {/* AI Feedback */}
              {response.feedback && (
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-blue-800 mb-2">AI Feedback</h4>
                  <p className="text-blue-700 text-sm">{response.feedback}</p>
                </div>
              )}

              {/* Strengths and Improvements */}
              <div className="grid md:grid-cols-2 gap-4">
                {response.strengths && response.strengths.length > 0 && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-medium text-green-800 mb-2">Strengths</h4>
                    <ul className="text-green-700 text-sm space-y-1">
                      {response.strengths.map((strength, idx) => (
                        <li key={idx} className="flex items-start">
                          <CheckCircle className="w-3 h-3 mr-2 mt-0.5 flex-shrink-0" />
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {response.improvements && response.improvements.length > 0 && (
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-800 mb-2">Areas for Improvement</h4>
                    <ul className="text-yellow-700 text-sm space-y-1">
                      {response.improvements.map((improvement, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="w-3 h-3 mr-2 mt-0.5 flex-shrink-0 text-yellow-600">•</span>
                          {improvement}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="sticky bottom-0 bg-white border-t p-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Session completed on {session.completedAt?.toLocaleDateString()} at {session.completedAt?.toLocaleTimeString()}
            </div>
            <button
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-6 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};