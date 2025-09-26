import React, { useState } from 'react';
import { Video, Mic, Settings, CheckCircle, AlertTriangle, Wifi } from 'lucide-react';

interface VideoInterviewSetupProps {
  onStartInterview: () => void;
  onCancel: () => void;
}

export const VideoInterviewSetup: React.FC<VideoInterviewSetupProps> = ({
  onStartInterview,
  onCancel
}) => {
  const [cameraStatus, setCameraStatus] = useState<'granted' | 'denied' | 'not-found' | 'pending' | null>(null);
  const [micStatus, setMicStatus] = useState<'granted' | 'denied' | 'not-found' | 'pending' | null>(null);
  const [connectionTest, setConnectionTest] = useState<boolean | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const testCameraPermission = async () => {
    setCameraStatus('pending');
    try {
      const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraStatus('granted');
      videoStream.getTracks().forEach(track => track.stop());
    } catch (error: any) {
      console.error('Camera permission test failed:', error);
      if (error.name === 'NotFoundError') {
        setCameraStatus('not-found');
      } else if (error.name === 'NotAllowedError') {
        setCameraStatus('denied');
      } else {
        setCameraStatus('denied');
      }
    }
  };

  const testMicPermission = async () => {
    setMicStatus('pending');
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicStatus('granted');
      audioStream.getTracks().forEach(track => track.stop());
    } catch (error: any) {
      console.error('Microphone permission test failed:', error);
      if (error.name === 'NotFoundError') {
        setMicStatus('not-found');
      } else if (error.name === 'NotAllowedError') {
        setMicStatus('denied');
      } else {
        setMicStatus('denied');
      }
    }
  };

  const testConnection = async () => {
    setIsTestingConnection(true);
    
    try {
      // Test connection to AI interviewer backend
      const response = await fetch('https://localhost:3001/health', {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache'
      });
      
      if (response.ok) {
        setConnectionTest(true);
      } else {
        setConnectionTest(false);
      }
      
    } catch (error) {
      console.error('Connection test failed:', error);
      setConnectionTest(false);
    } finally {
      setIsTestingConnection(false);
    }
  };

  const allTestsPassed = cameraStatus === 'granted' && micStatus === 'granted';
  const canProceed = allTestsPassed; // Connection test is optional

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          <Video className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">AI Video Interview Setup</h1>
          <p className="text-gray-600">
            Let's test your camera, microphone, and connection before starting the interview
          </p>
        </div>

        <div className="space-y-6">
          {/* Camera Test */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center">
              <Video className="w-6 h-6 text-blue-600 mr-3" />
              <div>
                <h3 className="font-medium text-gray-800">Camera Access</h3>
                <p className="text-sm text-gray-600">Required for video interview</p>
              </div>
            </div>
            <div className="flex items-center">
              {cameraStatus === null && (
                <button
                  onClick={testCameraPermission}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                >
                  Test Camera
                </button>
              )}
              {cameraStatus === 'pending' && (
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              )}
              {cameraStatus === 'granted' && (
                <CheckCircle className="w-6 h-6 text-green-600" />
              )}
              {(cameraStatus === 'denied' || cameraStatus === 'not-found') && (
                <AlertTriangle className="w-6 h-6 text-red-600" />
              )}
            </div>
          </div>

          {/* Microphone Test */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center">
              <Mic className="w-6 h-6 text-blue-600 mr-3" />
              <div>
                <h3 className="font-medium text-gray-800">Microphone Access</h3>
                <p className="text-sm text-gray-600">Required for voice responses</p>
              </div>
            </div>
            <div className="flex items-center">
              {micStatus === null && (
                <button
                  onClick={testMicPermission}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                >
                  Test Microphone
                </button>
              )}
              {micStatus === 'pending' && (
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              )}
              {micStatus === 'granted' && (
                <CheckCircle className="w-6 h-6 text-green-600" />
              )}
              {(micStatus === 'denied' || micStatus === 'not-found') && (
                <AlertTriangle className="w-6 h-6 text-red-600" />
              )}
            </div>
          </div>
        </div>

        {/* System Requirements */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-2">System Requirements</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Modern web browser (Chrome, Firefox, Safari, Edge)</li>
            <li>• Stable internet connection (minimum 1 Mbps upload)</li>
            <li>• Working camera and microphone</li>
            <li>• Quiet environment for best audio quality</li>
          </ul>
        </div>

        {/* Error Messages */}
        {(cameraStatus === 'denied' || micStatus === 'denied') && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-800 mb-2">
                  Permission Required
                </h3>
                <p className="text-sm text-red-700">
                  Please allow camera and microphone access in your browser settings and refresh the page.
                </p>
              </div>
            </div>
          </div>
        )}

        {(cameraStatus === 'not-found' || micStatus === 'not-found') && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800 mb-2">
                  Device Not Found
                </h3>
                <p className="text-sm text-yellow-700">
                  {cameraStatus === 'not-found' && micStatus === 'not-found' 
                    ? 'No camera or microphone found. Please connect these devices and try again.'
                    : cameraStatus === 'not-found'
                    ? 'No camera found. Please connect a camera and try again.'
                    : 'No microphone found. Please connect a microphone and try again.'
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {connectionTest === false && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-800 mb-2">
                  Connection Failed
                </h3>
                <p className="text-sm text-red-700">
                  Unable to connect to the internet. Please check your internet connection and try again.
                  You can still proceed with the interview, but some features may not work properly.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-4 mt-8">
          <button
            onClick={onStartInterview}
            disabled={!canProceed}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg font-medium transition-colors"
          >
            {canProceed ? 'Start AI Video Interview' : 'Complete Setup First'}
          </button>
          
          <button
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>

        {canProceed && (
          <div className="mt-4 text-center text-sm text-green-600">
            ✅ Camera and microphone ready! You can now start your AI video interview.
            {connectionTest === false && (
              <div className="text-yellow-600 mt-1">
                ⚠️ Internet connection test failed, but you can still proceed.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};