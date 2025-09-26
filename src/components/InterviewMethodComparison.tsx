import React from 'react';
import { Mic, Video, Users, Bot, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export const InterviewMethodComparison: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Interview Method Comparison</h2>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Current AI Voice Method */}
        <div className="border-2 border-blue-500 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Bot className="w-8 h-8 text-blue-600 mr-3" />
            <h3 className="text-xl font-semibold text-blue-800">Current: AI Voice Interview</h3>
          </div>
          
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2 flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                Advantages
              </h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• <strong>Scalable:</strong> Handle unlimited interviews simultaneously</li>
                <li>• <strong>Consistent:</strong> Same evaluation criteria for all candidates</li>
                <li>• <strong>Available 24/7:</strong> No scheduling constraints</li>
                <li>• <strong>Objective:</strong> GPT-4o provides unbiased evaluation</li>
                <li>• <strong>Detailed Analysis:</strong> Transcript + scoring breakdown</li>
                <li>• <strong>Cost Effective:</strong> No human interviewer time</li>
                <li>• <strong>Customizable:</strong> Questions based on resume analysis</li>
                <li>• <strong>Re-evaluable:</strong> Apply different scoring methods</li>
              </ul>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-semibold text-red-800 mb-2 flex items-center">
                <XCircle className="w-4 h-4 mr-2" />
                Limitations
              </h4>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• <strong>No Human Interaction:</strong> Lacks personal connection</li>
                <li>• <strong>No Follow-up Dialogue:</strong> Can't ask clarifying questions</li>
                <li>• <strong>Technical Issues:</strong> Audio quality affects evaluation</li>
                <li>• <strong>Candidate Comfort:</strong> Some prefer human interaction</li>
              </ul>
            </div>
          </div>
        </div>

        {/* AI Agent in Video Call */}
        <div className="border-2 border-purple-500 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Video className="w-8 h-8 text-purple-600 mr-3" />
            <h3 className="text-xl font-semibold text-purple-800">AI Agent in Video Call</h3>
          </div>
          
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2 flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                Advantages
              </h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• <strong>Familiar Environment:</strong> Standard video call interface</li>
                <li>• <strong>Visual Cues:</strong> Can analyze body language, presentation</li>
                <li>• <strong>Real-time Interaction:</strong> Dynamic conversation flow</li>
                <li>• <strong>Screen Sharing:</strong> Can review code, diagrams, portfolios</li>
                <li>• <strong>Natural Feel:</strong> More like talking to a person</li>
                <li>• <strong>Adaptive Questions:</strong> Can ask follow-ups based on responses</li>
              </ul>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-semibold text-red-800 mb-2 flex items-center">
                <XCircle className="w-4 h-4 mr-2" />
                Challenges
              </h4>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• <strong>Complex Implementation:</strong> Requires video AI, real-time processing</li>
                <li>• <strong>Higher Costs:</strong> More API calls, processing power</li>
                <li>• <strong>Technical Dependencies:</strong> Video quality, internet stability</li>
                <li>• <strong>Scheduling Required:</strong> Still needs appointment booking</li>
                <li>• <strong>Uncanny Valley:</strong> AI might feel "off" to candidates</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendation */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <AlertTriangle className="w-6 h-6 text-blue-600 mr-3 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-blue-800 mb-3">Recommendation: Hybrid Approach</h3>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-700 mb-2">Phase 1: AI Screening</h4>
                <p className="text-sm text-blue-600">Current system for initial assessment, technical skills validation</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-700 mb-2">Phase 2: AI Video Call</h4>
                <p className="text-sm text-blue-600">For qualified candidates, deeper technical discussion with AI agent</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-700 mb-2">Phase 3: Human Final</h4>
                <p className="text-sm text-blue-600">Top candidates meet human interviewer for culture fit, final decision</p>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-100 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Best of Both Worlds:</strong> AI handles scale and consistency, humans handle nuance and final decisions.
                Current system is excellent for initial screening and technical assessment.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Implementation Roadmap */}
      <div className="mt-6 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Implementation Roadmap</h3>
        
        <div className="space-y-3">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4">✓</div>
            <div>
              <h4 className="font-medium text-gray-800">Current: AI Voice Interview System</h4>
              <p className="text-sm text-gray-600">Fully functional with GPT-4o evaluation, resume analysis, re-evaluation</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4">2</div>
            <div>
              <h4 className="font-medium text-gray-800">Next: Enhanced Follow-up System</h4>
              <p className="text-sm text-gray-600">Real-time follow-up questions based on candidate responses</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4">3</div>
            <div>
              <h4 className="font-medium text-gray-800">Future: AI Video Agent</h4>
              <p className="text-sm text-gray-600">Integration with video platforms, visual analysis, screen sharing</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};