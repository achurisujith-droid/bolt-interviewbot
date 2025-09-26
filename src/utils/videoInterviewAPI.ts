// Video Interview API utilities
export interface VideoInterviewConfig {
  sessionId: string;
  candidateName: string;
  position: string;
  webhookUrl?: string;
  zoomIntegration?: boolean;
}

export interface VideoResponse {
  videoBlob: Blob;
  audioBlob: Blob;
  transcript?: string;
  duration: number;
  timestamp: Date;
}

export class VideoInterviewAPI {
  private websocket: WebSocket | null = null;
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl: string = 'wss://your-api-server.com') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  // Initialize WebSocket connection
  async connect(config: VideoInterviewConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      this.websocket = new WebSocket(`${this.baseUrl}/interview`);
      
      this.websocket.onopen = () => {
        this.websocket?.send(JSON.stringify({
          type: 'initialize',
          apiKey: this.apiKey,
          config
        }));
        resolve();
      };

      this.websocket.onerror = (error) => {
        reject(error);
      };

      this.websocket.onmessage = (event) => {
        this.handleMessage(JSON.parse(event.data));
      };
    });
  }

  // Send video response for processing
  async sendVideoResponse(response: VideoResponse, questionId: string): Promise<void> {
    const formData = new FormData();
    formData.append('video', response.videoBlob);
    formData.append('audio', response.audioBlob);
    formData.append('questionId', questionId);
    formData.append('duration', response.duration.toString());

    // Send via HTTP for large video files
    const httpResponse = await fetch(`${this.baseUrl.replace('wss://', 'https://')}/process-video`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: formData
    });

    if (!httpResponse.ok) {
      throw new Error('Failed to send video response');
    }

    const result = await httpResponse.json();
    return result;
  }

  // Handle WebSocket messages
  private handleMessage(data: any): void {
    switch (data.type) {
      case 'question':
        this.onQuestion?.(data.question, data.questionId);
        break;
      case 'evaluation':
        this.onEvaluation?.(data.evaluation);
        break;
      case 'complete':
        this.onComplete?.(data.results);
        break;
      case 'error':
        this.onError?.(data.error);
        break;
    }
  }

  // Event handlers (to be set by the component)
  onQuestion?: (question: string, questionId: string) => void;
  onEvaluation?: (evaluation: any) => void;
  onComplete?: (results: any) => void;
  onError?: (error: string) => void;

  // Disconnect
  disconnect(): void {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
  }
}

// Zoom Integration utilities
export class ZoomIntegration {
  private zoomSDK: any;
  private meetingId: string;
  private apiKey: string;
  private apiSecret: string;

  constructor(apiKey: string, apiSecret: string) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
  }

  // Initialize Zoom SDK
  async initialize(): Promise<void> {
    // Load Zoom Web SDK
    if (!window.ZoomMtg) {
      await this.loadZoomSDK();
    }

    window.ZoomMtg.setZoomJSLib('https://source.zoom.us/2.9.5/lib', '/av');
    window.ZoomMtg.preLoadWasm();
    window.ZoomMtg.prepareWebSDK();
  }

  // Create a new meeting
  async createMeeting(topic: string, duration: number = 60): Promise<string> {
    const response = await fetch('/api/zoom/create-meeting', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.generateJWT()}`
      },
      body: JSON.stringify({
        topic,
        type: 1, // Instant meeting
        duration,
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: false,
          mute_upon_entry: true,
          waiting_room: false,
          audio: 'both'
        }
      })
    });

    const meeting = await response.json();
    this.meetingId = meeting.id;
    return meeting.join_url;
  }

  // Join meeting as AI bot
  async joinAsBot(meetingId: string, botName: string = 'AI Interviewer'): Promise<void> {
    const signature = this.generateSignature(meetingId);
    
    window.ZoomMtg.init({
      leaveUrl: window.location.origin,
      success: () => {
        window.ZoomMtg.join({
          signature,
          meetingNumber: meetingId,
          userName: botName,
          apiKey: this.apiKey,
          passWord: '',
          success: () => {
            console.log('AI Bot joined meeting');
            this.setupBotBehavior();
          },
          error: (error: any) => {
            console.error('Failed to join meeting:', error);
          }
        });
      }
    });
  }

  // Setup AI bot behavior in meeting
  private setupBotBehavior(): void {
    // Enable audio/video
    window.ZoomMtg.getCurrentUser({
      success: (user: any) => {
        // Mute bot initially
        window.ZoomMtg.mute({
          mute: true,
          success: () => console.log('Bot muted')
        });

        // Setup event listeners
        this.setupMeetingEventListeners();
      }
    });
  }

  // Setup event listeners for meeting events
  private setupMeetingEventListeners(): void {
    // Listen for participant join/leave
    window.ZoomMtg.inMeetingServiceListener('onUserJoin', (data: any) => {
      console.log('User joined:', data);
      // Start interview when candidate joins
      this.onCandidateJoined?.(data);
    });

    window.ZoomMtg.inMeetingServiceListener('onUserLeave', (data: any) => {
      console.log('User left:', data);
      this.onCandidateLeft?.(data);
    });

    // Listen for audio/video changes
    window.ZoomMtg.inMeetingServiceListener('onMicrophoneStatusChange', (data: any) => {
      this.onMicrophoneChange?.(data);
    });
  }

  // Speak as AI bot
  async speak(text: string): Promise<void> {
    // Unmute bot
    await new Promise(resolve => {
      window.ZoomMtg.mute({
        mute: false,
        success: resolve
      });
    });

    // Use TTS to speak
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    
    return new Promise(resolve => {
      utterance.onend = () => {
        // Mute bot after speaking
        window.ZoomMtg.mute({
          mute: true,
          success: () => resolve()
        });
      };
      speechSynthesis.speak(utterance);
    });
  }

  // Event handlers
  onCandidateJoined?: (data: any) => void;
  onCandidateLeft?: (data: any) => void;
  onMicrophoneChange?: (data: any) => void;

  // Utility methods
  private async loadZoomSDK(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://source.zoom.us/2.9.5/zoom-meeting-embedded.umd.min.js';
      script.onload = () => resolve();
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  private generateJWT(): string {
    // Generate JWT token for Zoom API
    // This should be done on your backend for security
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };

    const payload = {
      iss: this.apiKey,
      exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour
    };

    // In production, generate this on your backend
    return 'your-jwt-token';
  }

  private generateSignature(meetingId: string): string {
    // Generate meeting signature
    // This should also be done on your backend
    return 'your-meeting-signature';
  }
}

// Webhook handler for meeting events
export const handleZoomWebhook = (event: any) => {
  switch (event.event) {
    case 'meeting.participant_joined':
      console.log('Participant joined:', event.payload.object.participant);
      // Start interview logic
      break;
    case 'meeting.participant_left':
      console.log('Participant left:', event.payload.object.participant);
      // End interview logic
      break;
    case 'meeting.ended':
      console.log('Meeting ended:', event.payload.object);
      // Process interview results
      break;
  }
};