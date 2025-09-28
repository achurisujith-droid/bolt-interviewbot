import React, { useState } from 'react';
import { Camera, AlertTriangle, Eye, Clock, Users, Shield, Download } from 'lucide-react';
import { ProctoringData, ProctoringScreenshot, ProctoringViolation } from '../types/interview';

interface ProctoringDashboardProps {
  proctoringData: ProctoringData;
  candidateName: string;
  onClose: () => void;
}

export const ProctoringDashboard: React.FC<ProctoringDashboardProps> = ({
  proctoringData,
  candidateName,
  onClose
}) => {
  const [selectedScreenshot, setSelectedScreenshot] = useState<ProctoringScreenshot | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'screenshots' | 'violations'>('overview');

  const flaggedScreenshots = proctoringData.screenshots.filter(s => s.flagged);
  const highSeverityViolations = proctoringData.violations.filter(v => v.severity === 'high');

  const downloadProctoringReport = () => {
    const report = {
      candidate: candidateName,
      timestamp: new Date().toISOString(),
      summary: {
        totalScreenshots: proctoringData.screenshots.length,
        flaggedScreenshots: flaggedScreenshots.length,
        totalViolations: proctoringData.violations.length,
        highSeverityViolations: highSeverityViolations.length
      },
      screenshots: proctoringData.screenshots.map(s => ({
        id: s.id,
        timestamp: s.timestamp,
        faceCount: s.faceCount,
        confidence: s.confidence,
        flagged: s.flagged
      })),
      violations: proctoringData.violations
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `proctoring-report-${candidateName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-500 text-white rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Screenshots</p>
              <p className="text-2xl font-bold">{proctoringData.screenshots.length}</p>
            </div>
            <Camera className="w-6 h-6 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-yellow-500 text-white rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Flagged</p>
              <p className="text-2xl font-bold">{flaggedScreenshots.length}</p>
            </div>
            <AlertTriangle className="w-6 h-6 text-yellow-200" />
          </div>
        </div>
        
        <div className="bg-red-500 text-white rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Violations</p>
              <p className="text-2xl font-bold">{proctoringData.violations.length}</p>
            </div>
            <Shield className="w-6 h-6 text-red-200" />
          </div>
        </div>
        
        <div className="bg-purple-500 text-white rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">High Risk</p>
              <p className="text-2xl font-bold">{highSeverityViolations.length}</p>
            </div>
            <AlertTriangle className="w-6 h-6 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Recent Violations */}
      {proctoringData.violations.length > 0 && (
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Violations</h3>
          <div className="space-y-3">
            {proctoringData.violations.slice(-5).map(violation => (
              <div key={violation.id} className={`p-3 rounded-lg border-l-4 ${
                violation.severity === 'high' ? 'border-red-500 bg-red-50' :
                violation.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                'border-orange-500 bg-orange-50'
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-800">{violation.type.replace('_', ' ').toUpperCase()}</h4>
                    <p className="text-sm text-gray-600">{violation.description}</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {violation.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderScreenshots = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {proctoringData.screenshots.map(screenshot => (
          <div
            key={screenshot.id}
            className={`relative cursor-pointer rounded-lg overflow-hidden border-2 ${
              screenshot.flagged ? 'border-red-500' : 'border-gray-200'
            } hover:border-blue-500 transition-colors`}
            onClick={() => setSelectedScreenshot(screenshot)}
          >
            <img
              src={screenshot.imageData}
              alt={`Screenshot ${screenshot.timestamp.toLocaleTimeString()}`}
              className="w-full h-24 object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-1">
              <div className="text-xs">
                {screenshot.timestamp.toLocaleTimeString()}
              </div>
              <div className="text-xs">
                {screenshot.faceCount} face{screenshot.faceCount !== 1 ? 's' : ''}
              </div>
            </div>
            {screenshot.flagged && (
              <div className="absolute top-1 right-1">
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Screenshot Modal */}
      {selectedScreenshot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Screenshot Details</h3>
                <button
                  onClick={() => setSelectedScreenshot(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <img
                src={selectedScreenshot.imageData}
                alt="Screenshot"
                className="w-full rounded-lg mb-4"
              />
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Timestamp:</span>
                  <span className="ml-2">{selectedScreenshot.timestamp.toLocaleString()}</span>
                </div>
                <div>
                  <span className="font-medium">Face Count:</span>
                  <span className="ml-2">{selectedScreenshot.faceCount}</span>
                </div>
                <div>
                  <span className="font-medium">Confidence:</span>
                  <span className="ml-2">{(selectedScreenshot.confidence * 100).toFixed(1)}%</span>
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <span className={`ml-2 ${selectedScreenshot.flagged ? 'text-red-600' : 'text-green-600'}`}>
                    {selectedScreenshot.flagged ? 'Flagged' : 'Normal'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderViolations = () => (
    <div className="space-y-4">
      {proctoringData.violations.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No violations detected during this interview.</p>
        </div>
      ) : (
        proctoringData.violations.map(violation => (
          <div key={violation.id} className={`border rounded-lg p-4 ${
            violation.severity === 'high' ? 'border-red-300 bg-red-50' :
            violation.severity === 'medium' ? 'border-yellow-300 bg-yellow-50' :
            'border-orange-300 bg-orange-50'
          }`}>
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-gray-800">
                {violation.type.replace('_', ' ').toUpperCase()}
              </h4>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                violation.severity === 'high' ? 'bg-red-200 text-red-800' :
                violation.severity === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                'bg-orange-200 text-orange-800'
              }`}>
                {violation.severity.toUpperCase()}
              </span>
            </div>
            
            <p className="text-gray-600 mb-2">{violation.description}</p>
            
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>{violation.timestamp.toLocaleString()}</span>
              <button
                onClick={() => {
                  const screenshot = proctoringData.screenshots.find(s => s.id === violation.screenshotId);
                  if (screenshot) setSelectedScreenshot(screenshot);
                }}
                className="text-blue-600 hover:text-blue-800"
              >
                View Screenshot
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Proctoring Dashboard</h2>
            <p className="text-gray-600">{candidateName}</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={downloadProctoringReport}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center text-sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="flex border-b">
          {[
            { id: 'overview', label: 'Overview', icon: Eye },
            { id: 'screenshots', label: 'Screenshots', icon: Camera },
            { id: 'violations', label: 'Violations', icon: AlertTriangle }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'screenshots' && renderScreenshots()}
          {activeTab === 'violations' && renderViolations()}
        </div>
      </div>
    </div>
  );
};