import React, { useState } from 'react';
import { Link, Users, Calendar, Send } from 'lucide-react';

interface InterviewLinkGeneratorProps {
  onGenerateLink: (candidateEmail: string) => string;
}

export const InterviewLinkGenerator: React.FC<InterviewLinkGeneratorProps> = ({ onGenerateLink }) => {
  const [candidateEmail, setCandidateEmail] = useState('');
  const [jobRequirements, setJobRequirements] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateLink = async () => {
    if (!candidateEmail) return;
    
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    
    // Store job requirements in localStorage for the interview
    if (jobRequirements.trim()) {
      localStorage.setItem('currentJobRequirements', jobRequirements.trim());
    }
    
    const link = onGenerateLink(candidateEmail);
    setGeneratedLink(link);
    setIsLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    // You could add a toast notification here
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center mb-4">
        <div className="bg-blue-100 rounded-lg p-2 mr-3">
          <Link className="w-6 h-6 text-blue-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800">Generate Interview Link</h2>
      </div>
      
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Candidate Email
          </label>
          <input
            type="email"
            value={candidateEmail}
            onChange={(e) => setCandidateEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="candidate@example.com"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Requirements (Optional)
          </label>
          <textarea
            value={jobRequirements}
            onChange={(e) => setJobRequirements(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
            rows={4}
            placeholder="Describe the job requirements, skills needed, experience level, etc. This will be used to evaluate the candidate's resume fit."
          />
          <p className="text-xs text-gray-500 mt-1">
            Leave empty for general resume evaluation without specific job requirements
          </p>
        </div>
        
        <button
          onClick={handleGenerateLink}
          disabled={!candidateEmail || isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
            </>
          )}
          {isLoading ? 'Generating...' : 'Generate Interview Link'}
        </button>
        
        {generatedLink && (
          <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800 mb-3 font-medium">✅ Interview link generated successfully!</p>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={generatedLink}
                readOnly
                className="flex-1 px-3 py-2 bg-white border border-green-300 rounded-lg text-sm font-mono"
              />
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
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