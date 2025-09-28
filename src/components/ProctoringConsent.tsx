import React, { useState } from 'react';
import { Camera, Shield, Eye, AlertTriangle, CheckCircle } from 'lucide-react';

interface ProctoringConsentProps {
  onConsent: (granted: boolean) => void;
  candidateName: string;
  position: string;
}

export const ProctoringConsent: React.FC<ProctoringConsentProps> = ({
  onConsent,
  candidateName,
  position
}) => {
  const [consentGiven, setConsentGiven] = useState(false);
  const [understood, setUnderstood] = useState(false);

  const handleProceed = () => {
    onConsent(consentGiven);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Interview Proctoring Notice</h1>
          <p className="text-gray-600">
            {candidateName} • {position}
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
              <Camera className="w-5 h-5 mr-2" />
              Video Monitoring & Screenshot Capture
            </h2>
            <div className="space-y-3 text-sm text-blue-700">
              <p>To ensure interview integrity, we will:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Capture your photo</strong> at the start of the interview for identity verification</li>
                <li><strong>Take periodic screenshots</strong> every 60-120 seconds during the interview</li>
                <li><strong>Monitor for multiple people</strong> using AI face detection technology</li>
                <li><strong>Alert you immediately</strong> if unauthorized persons are detected</li>
                <li><strong>Flag sessions</strong> with suspicious activity for admin review</li>
              </ul>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
              <Eye className="w-5 h-5 mr-2" />
              What We Detect
            </h2>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-green-700">
              <div>
                <h3 className="font-medium mb-2">✅ Acceptable:</h3>
                <ul className="space-y-1">
                  <li>• Single candidate visible</li>
                  <li>• Clear face visibility</li>
                  <li>• Consistent lighting</li>
                  <li>• Professional environment</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-2">⚠️ Will Trigger Alerts:</h3>
                <ul className="space-y-1">
                  <li>• Multiple people in frame</li>
                  <li>• Candidate leaves camera view</li>
                  <li>• Face obscured or hidden</li>
                  <li>• Suspicious movements</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Privacy & Data Protection
            </h2>
            <div className="space-y-2 text-sm text-yellow-700">
              <p><strong>Data Security:</strong> All screenshots are encrypted and stored securely</p>
              <p><strong>Access Control:</strong> Only authorized administrators can review proctoring data</p>
              <p><strong>Retention Policy:</strong> Images are automatically deleted after 90 days</p>
              <p><strong>No Recording:</strong> We capture still images only, not continuous video</p>
              <p><strong>Your Rights:</strong> You can request deletion of your data at any time</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={understood}
                onChange={(e) => setUnderstood(e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                I understand that this interview will be monitored using video screenshots and AI face detection 
                to ensure integrity and prevent unauthorized assistance.
              </span>
            </label>

            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                <strong>I consent to video monitoring and screenshot capture</strong> for the purpose of interview 
                proctoring and integrity verification. I understand my data will be handled according to the 
                privacy policy stated above.
              </span>
            </label>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleProceed}
              disabled={!understood}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              {consentGiven ? (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Start Proctored Interview
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Continue Without Proctoring
                </>
              )}
            </button>
            
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>

          {!consentGiven && understood && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-orange-600 mr-3 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-orange-800 mb-1">
                    Proceeding Without Proctoring
                  </h3>
                  <p className="text-sm text-orange-700">
                    Your interview will not be monitored. Please ensure you maintain academic integrity 
                    throughout the session. Any suspicious activity may result in interview invalidation.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};