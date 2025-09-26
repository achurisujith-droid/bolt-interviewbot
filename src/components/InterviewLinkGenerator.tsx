import React, { useState } from 'react';
import { Link, Users, Calendar, Send } from 'lucide-react';

interface InterviewLinkGeneratorProps {
  onGenerateLink: (candidateEmail: string, position: string) => string;
}

export const InterviewLinkGenerator: React.FC<InterviewLinkGeneratorProps> = ({ onGenerateLink }) => {
  const [candidateEmail, setCandidateEmail] = useState('');
  const [position, setPosition] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateLink = async () => {
    if (!candidateEmail || !position) return;
    
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    
    const link = onGenerateLink(candidateEmail, position);
    setGeneratedLink(link);
    setIsLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    // You could add a toast notification here
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-4">
        <Link className="w-6 h-6 text-blue-600 mr-2" />
        <h2 className="text-xl font-semibold text-gray-800">Generate Interview Link</h2>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Candidate Email
          </label>
          <input
            type="email"
            value={candidateEmail}
            onChange={(e) => setCandidateEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="candidate@example.com"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Position
          </label>
          <input
            type="text"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Software Developer"
          />
        </div>
        
        <button
          onClick={handleGenerateLink}
          disabled={!candidateEmail || !position || isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center justify-center"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Generate Interview Link
            </>
          )}
        </button>
        
        {generatedLink && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800 mb-2">Interview link generated successfully!</p>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={generatedLink}
                readOnly
                className="flex-1 px-3 py-2 bg-white border border-green-300 rounded-md text-sm"
              />
              <button
                onClick={copyToClipboard}
                className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
              >
                Copy
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};