import React, { useEffect, useState } from 'react';
import { AlertTriangle, Users, EyeOff, Camera } from 'lucide-react';
import { ProctoringViolation } from '../types/interview';

interface ProctoringWarningProps {
  violation: ProctoringViolation;
  onDismiss: () => void;
  autoHide?: boolean;
  duration?: number;
}

export const ProctoringWarning: React.FC<ProctoringWarningProps> = ({
  violation,
  onDismiss,
  autoHide = true,
  duration = 5000
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoHide) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onDismiss, 300); // Allow fade out animation
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoHide, duration, onDismiss]);

  const getViolationIcon = () => {
    switch (violation.type) {
      case 'multiple_faces':
        return <Users className="w-6 h-6" />;
      case 'no_face':
        return <EyeOff className="w-6 h-6" />;
      case 'face_changed':
        return <Camera className="w-6 h-6" />;
      default:
        return <AlertTriangle className="w-6 h-6" />;
    }
  };

  const getViolationMessage = () => {
    switch (violation.type) {
      case 'multiple_faces':
        return {
          title: 'Multiple People Detected',
          message: 'Please ensure you are alone during the interview. Other people have been detected in your camera view.',
          action: 'Ask others to leave the room and position yourself clearly in the camera.'
        };
      case 'no_face':
        return {
          title: 'Face Not Visible',
          message: 'Your face is not clearly visible in the camera. Please adjust your position.',
          action: 'Move closer to the camera and ensure proper lighting on your face.'
        };
      case 'face_changed':
        return {
          title: 'Identity Change Detected',
          message: 'The person in the camera appears different from the initial verification photo.',
          action: 'Please ensure you are the same person who started the interview.'
        };
      default:
        return {
          title: 'Proctoring Alert',
          message: violation.description,
          action: 'Please address the issue to continue your interview.'
        };
    }
  };

  const violationInfo = getViolationMessage();
  const severityColor = violation.severity === 'high' ? 'red' : 
                       violation.severity === 'medium' ? 'yellow' : 'orange';

  if (!isVisible) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
      isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
    }`}>
      <div className={`bg-${severityColor}-50 border border-${severityColor}-200 rounded-lg shadow-lg p-6 max-w-md`}>
        <div className="flex items-start">
          <div className={`flex-shrink-0 text-${severityColor}-600 mr-3`}>
            {getViolationIcon()}
          </div>
          
          <div className="flex-1">
            <h3 className={`text-lg font-semibold text-${severityColor}-800 mb-2`}>
              {violationInfo.title}
            </h3>
            
            <p className={`text-sm text-${severityColor}-700 mb-3`}>
              {violationInfo.message}
            </p>
            
            <div className={`bg-${severityColor}-100 rounded-md p-3 mb-4`}>
              <p className={`text-xs font-medium text-${severityColor}-800`}>
                <strong>Action Required:</strong> {violationInfo.action}
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <span className={`text-xs text-${severityColor}-600`}>
                {violation.timestamp.toLocaleTimeString()}
              </span>
              
              <button
                onClick={() => {
                  setIsVisible(false);
                  setTimeout(onDismiss, 300);
                }}
                className={`text-xs bg-${severityColor}-600 hover:bg-${severityColor}-700 text-white px-3 py-1 rounded-md transition-colors`}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
        
        {/* Progress bar for auto-hide */}
        {autoHide && (
          <div className={`mt-4 w-full bg-${severityColor}-200 rounded-full h-1`}>
            <div 
              className={`bg-${severityColor}-600 h-1 rounded-full transition-all duration-${duration} ease-linear`}
              style={{ 
                width: isVisible ? '0%' : '100%',
                transition: `width ${duration}ms linear`
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};