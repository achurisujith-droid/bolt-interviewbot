import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Play, Pause, SkipForward, CheckCircle, Volume2, VolumeX, Bot, Camera, Shield } from 'lucide-react';
import { AudioRecorder } from '../utils/audioRecorder';
import { Question, InterviewResponse, ResumeAnalysis, ProctoringData, ProctoringSettings } from '../types/interview';
import { defaultQuestions, generateQuestionsForPosition } from '../data/questions';
import { speakQuestion } from '../utils/aiEvaluator';
import { generateResumeBasedQuestions } from '../utils/resumeAnalyzer';
import { ProctoringService } from '../utils/proctoringService';
import { ProctoringConsent } from './ProctoringConsent';
import { ProctoringWarning } from './ProctoringWarning';

interface InterviewInterfaceProps {
  sessionId: string;
  candidateName: string;
  position: string;
  resumeAnalysis?: ResumeAnalysis;
  onComplete: (responses: InterviewResponse[]) => void;
}

export const InterviewInterface: React.FC<InterviewInterfaceProps> = ({
  sessionId,
  candidateName,
  position,
  resumeAnalysis,
  onComplete
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [responses, setResponses] = useState<InterviewResponse[]>([]);
  const [audioRecorder] = useState(new AudioRecorder());
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [hasSpokenCurrentQuestion, setHasSpokenCurrentQuestion] = useState(false);
  
  // Proctoring states
  const [showProctoringConsent, setShowProctoringConsent] = useState(true);
  const [proctoringEnabled, setProctoringEnabled] = useState(false);
  const [proctoringService, setProctoringService] = useState<ProctoringService | null>(null);
  const [proctoringData, setProctoringData] = useState<ProctoringData | null>(null);
  const [currentViolation, setCurrentViolation] = useState<any>(null);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);

  // Load questions on component mount
  useEffect(() => {
    loadQuestions();
  }, []);

  // Initialize proctoring when enabled
  useEffect(() => {
    if (proctoringEnabled && !proctoringService) {
      initializeProctoring();
    }
  }, [proctoringEnabled]);

  // Auto-speak question when it changes (only once per question)
  useEffect(() => {
    if (questions.length > 0 && autoSpeak && !isSpeaking && !hasSpokenCurrentQuestion) {
      const currentQuestion = questions[currentQuestionIndex];
      if (currentQuestion) {
        handleSpeakQuestion();
      }
    }
  }, [currentQuestionIndex, autoSpeak, questions, isSpeaking, hasSpokenCurrentQuestion]);

  const handleProctoringConsent = (consentGiven: boolean) => {
    setShowProctoringConsent(false);
    setProctoringEnabled(consentGiven);
    
    if (consentGiven) {
      // Initialize camera for proctoring
      initializeCamera();
    }
  };

  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 }, 
        audio: false 
      });
      
      const video = document.createElement('video');
      video.srcObject = stream;
      video.autoplay = true;
      video.muted = true;
      video.style.display = 'none';
      document.body.appendChild(video);
      
      setVideoElement(video);
    } catch (error) {
      console.error('Failed to initialize camera for proctoring:', error);
      alert('Camera access is required for proctoring. Please allow camera access and refresh.');
    }
  };

  const initializeProctoring = async () => {
    if (!videoElement) return;

    const settings: ProctoringSettings = {
      captureInterval: 90, // 90 seconds
      faceDetectionEnabled: true,
      multiPersonDetection: true,
      warningsEnabled: true,
      autoFlagViolations: true
    };

    const service = new ProctoringService(settings);
    await service.initialize(videoElement);

    // Set up event handlers
    service.onViolation((violation) => {
      setCurrentViolation(violation);
      console.log('🚨 Proctoring violation:', violation);
    });

    service.onScreenshot((screenshot) => {
      console.log('📸 Screenshot captured:', screenshot);
    });

    setProctoringService(service);

    // Initialize proctoring data
    const initialData: ProctoringData = {
      enabled: true,
      screenshots: [],
      violations: [],
      consentGiven: true,
      settings
    };
    setProctoringData(initialData);

    // Start proctoring
    await service.startProctoring();
  };

  const loadQuestions = async () => {
    setIsLoadingQuestions(true);
    try {
      let generatedQuestions: Question[] = [];
      
      if (resumeAnalysis) {
        console.log('📄 Attempting to generate resume-based questions for:', resumeAnalysis.actualRole || position);
        try {
          const resumeQuestions = await generateResumeBasedQuestions(resumeAnalysis, position);
          if (resumeQuestions && resumeQuestions.length > 0) {
            generatedQuestions = resumeQuestions;
            console.log('✅ Generated', generatedQuestions.length, 'personalized questions');
          } else {
            console.log('⚠️ No personalized questions generated, using standard questions');
          }
        } catch (error) {
          console.error('❌ Failed to generate personalized questions:', error);
          console.log('🔄 Falling back to standard questions');
        }
      }
      
      if (generatedQuestions.length === 0) {
        console.log('📝 Using standard questions for position:', position);
        generatedQuestions = generateQuestionsForPosition(position);
      }
      
      setQuestions(generatedQuestions);
    } catch (error) {
      console.error('Failed to load questions:', error);
      console.log('🔄 Emergency fallback to standard questions');
      setQuestions(generateQuestionsForPosition(position));
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const handleSpeakQuestion = async () => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion || isSpeaking) return;
    
    setIsSpeaking(true);
    setHasSpokenCurrentQuestion(true);
    try {
      await speakQuestion(currentQuestion.text);
    } catch (error) {
      console.error('Failed to speak question:', error);
    } finally {
      setIsSpeaking(false);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const startRecording = async () => {
    try {
      await audioRecorder.startRecording();
      setIsRecording(true);
      setRecordingTime(0);
    } catch (error) {
      alert('Failed to start recording. Please check your microphone permissions.');
    }
  };

  const stopRecording = async () => {
    try {
      const audioBlob = await audioRecorder.stopRecording();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const currentQuestion = questions[currentQuestionIndex];
      const response: InterviewResponse = {
        questionId: currentQuestion.id,
        question: currentQuestion.text,
        audioBlob,
        audioUrl
      };
      
      setResponses(prev => [...prev, response]);
      setIsRecording(false);
      setRecordingTime(0);
    } catch (error) {
      alert('Failed to stop recording.');
      setIsRecording(false);
    }
  };

  const playRecording = () => {
    const latestResponse = responses[responses.length - 1];
    if (latestResponse?.audioUrl) {
      if (currentAudio) {
        currentAudio.pause();
      }
      
      const audio = new Audio(latestResponse.audioUrl);
      audio.onended = () => setIsPlaying(false);
      audio.play();
      setCurrentAudio(audio);
      setIsPlaying(true);
    }
  };

  const pauseRecording = () => {
    if (currentAudio) {
      currentAudio.pause();
      setIsPlaying(false);
    }
  };

  const nextQuestion = () => {
    const isLastQuestion = currentQuestionIndex === questions.length - 1;
    
    if (isLastQuestion) {
      console.log('✅ Interview complete! Calling onComplete with responses:', responses.length);
      
      // Stop proctoring and include data
      if (proctoringService) {
        proctoringService.stopProctoring();
        const finalProctoringData: ProctoringData = {
          enabled: proctoringEnabled,
          screenshots: proctoringService.getScreenshots(),
          violations: proctoringService.getViolations(),
          consentGiven: proctoringEnabled,
          settings: proctoringData?.settings || {
            captureInterval: 90,
            faceDetectionEnabled: true,
            multiPersonDetection: true,
            warningsEnabled: true,
            autoFlagViolations: true
          }
        };
        setProctoringData(finalProctoringData);
      }
      
      onComplete(responses);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setHasSpokenCurrentQuestion(false); // Reset for next question
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (proctoringService) {
        proctoringService.destroy();
      }
      if (videoElement) {
        const stream = videoElement.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        if (document.body.contains(videoElement)) {
          document.body.removeChild(videoElement);
        }
      }
    };
  }, [proctoringService, videoElement]);

  // Show proctoring consent first
  if (showProctoringConsent) {
    return (
      <ProctoringConsent
        onConsent={handleProctoringConsent}
        candidateName={candidateName}
        position={position}
      />
    );
  }

  // Loading state
  if (isLoadingQuestions) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Preparing Your Interview</h2>
          <p className="text-gray-600">Generating personalized questions...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Questions</h2>
          <p className="text-gray-600">Please refresh the page to try again.</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const hasRecordedCurrentQuestion = responses.some(r => r.questionId === currentQuestion.id);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Bot className="w-12 h-12 text-blue-600 mr-3" />
            <h1 className="text-2xl font-bold text-gray-800">AI Audio Interview</h1>
            {proctoringEnabled && (
              <Shield className="w-6 h-6 text-green-600 ml-3" title="Proctoring Active" />
            )}
          </div>
          <p className="text-gray-600">Welcome, {candidateName}</p>
          <p className="text-sm text-gray-500">Position: {position}</p>
          {proctoringEnabled && (
            <p className="text-xs text-green-600 mt-1">🔍 Interview is being monitored for integrity</p>
          )}
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span className="text-xs text-gray-500 capitalize">
              {currentQuestion.category} • {currentQuestion.difficulty}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Question:</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setAutoSpeak(!autoSpeak)}
                className={`p-2 rounded-lg transition-colors ${
                  autoSpeak ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                }`}
                title={autoSpeak ? 'Auto-speak enabled' : 'Auto-speak disabled'}
              >
                {autoSpeak ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <button
                onClick={handleSpeakQuestion}
                disabled={isSpeaking}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-3 py-2 rounded-lg text-sm flex items-center transition-colors"
              >
                {isSpeaking ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Speaking...
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 mr-2" />
                    Speak Question
                  </>
                )}
              </button>
            </div>
          </div>
          <p className="text-gray-700 leading-relaxed">{currentQuestion.text}</p>
        </div>

        <div className="flex flex-col items-center space-y-4">
          {isRecording && (
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 mb-2">
                {formatTime(recordingTime)}
              </div>
              <div className="flex items-center text-red-600">
                <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse mr-2" />
                Recording...
              </div>
            </div>
          )}

          <div className="flex space-x-4">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center transition-colors"
              >
                <Mic className="w-5 h-5 mr-2" />
                Start Recording
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg flex items-center transition-colors"
              >
                <MicOff className="w-5 h-5 mr-2" />
                Stop Recording
              </button>
            )}

            {hasRecordedCurrentQuestion && (
              <>
                {!isPlaying ? (
                  <button
                    onClick={playRecording}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center transition-colors"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Play
                  </button>
                ) : (
                  <button
                    onClick={pauseRecording}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg flex items-center transition-colors"
                  >
                    <Pause className="w-5 h-5 mr-2" />
                    Pause
                  </button>
                )}

                <button
                  onClick={nextQuestion}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center transition-colors"
                >
                  {isLastQuestion ? (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Complete Interview
                    </>
                  ) : (
                    <>
                      <SkipForward className="w-5 h-5 mr-2" />
                      Next Question
                    </>
                  )}
                </button>
              </>
            )}
          </div>

          {hasRecordedCurrentQuestion && (
            <div className="text-sm text-green-600 flex items-center">
              <CheckCircle className="w-4 h-4 mr-1" />
              Response recorded successfully
            </div>
          )}
        </div>

        {resumeAnalysis && (
          <div className="mt-6 text-center text-xs text-blue-600">
            <p>📄 Questions personalized for {resumeAnalysis.actualRole || position} ({resumeAnalysis.yearsOfExperience} years experience)</p>
          </div>
        )}

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Speak clearly and take your time.</p>
        </div>
      </div>

      {/* Proctoring Warning */}
      {currentViolation && (
        <ProctoringWarning
          violation={currentViolation}
          onDismiss={() => setCurrentViolation(null)}
        />
      )}
    </div>
  );
};