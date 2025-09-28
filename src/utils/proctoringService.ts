import { ProctoringScreenshot, ProctoringViolation, ProctoringSettings } from '../types/interview';

export class ProctoringService {
  private videoElement: HTMLVideoElement | null = null;
  private canvasElement: HTMLCanvasElement | null = null;
  private captureInterval: NodeJS.Timeout | null = null;
  private screenshots: ProctoringScreenshot[] = [];
  private violations: ProctoringViolation[] = [];
  private settings: ProctoringSettings;
  private onViolationCallback?: (violation: ProctoringViolation) => void;
  private onScreenshotCallback?: (screenshot: ProctoringScreenshot) => void;

  constructor(settings: ProctoringSettings) {
    this.settings = settings;
    this.canvasElement = document.createElement('canvas');
    this.canvasElement.style.display = 'none';
    document.body.appendChild(this.canvasElement);
  }

  async initialize(videoElement: HTMLVideoElement): Promise<void> {
    this.videoElement = videoElement;
    
    // Wait for video to be ready
    if (videoElement.readyState < 2) {
      await new Promise((resolve) => {
        videoElement.addEventListener('loadeddata', resolve, { once: true });
      });
    }
  }

  async startProctoring(): Promise<void> {
    if (!this.videoElement || !this.settings.faceDetectionEnabled) {
      console.warn('Proctoring not initialized or disabled');
      return;
    }

    console.log('🔍 Starting proctoring with interval:', this.settings.captureInterval, 'seconds');

    // Capture initial photo
    await this.captureScreenshot(true);

    // Start periodic captures
    this.captureInterval = setInterval(async () => {
      await this.captureScreenshot();
    }, this.settings.captureInterval * 1000);
  }

  stopProctoring(): void {
    if (this.captureInterval) {
      clearInterval(this.captureInterval);
      this.captureInterval = null;
    }
    console.log('🔍 Proctoring stopped');
  }

  private async captureScreenshot(isInitial: boolean = false): Promise<ProctoringScreenshot | null> {
    if (!this.videoElement || !this.canvasElement) {
      return null;
    }

    try {
      const canvas = this.canvasElement;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      // Set canvas size to match video
      canvas.width = this.videoElement.videoWidth || 640;
      canvas.height = this.videoElement.videoHeight || 480;

      // Draw current video frame to canvas
      ctx.drawImage(this.videoElement, 0, 0, canvas.width, canvas.height);

      // Convert to base64
      const imageData = canvas.toDataURL('image/jpeg', 0.8);

      // Detect faces
      const faceDetection = await this.detectFaces(imageData);

      const screenshot: ProctoringScreenshot = {
        id: `screenshot-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        timestamp: new Date(),
        imageData,
        faceCount: faceDetection.faceCount,
        confidence: faceDetection.confidence,
        flagged: faceDetection.flagged
      };

      this.screenshots.push(screenshot);

      // Check for violations
      if (this.settings.multiPersonDetection) {
        await this.checkForViolations(screenshot, isInitial);
      }

      // Callback for real-time updates
      if (this.onScreenshotCallback) {
        this.onScreenshotCallback(screenshot);
      }

      console.log(`📸 Screenshot captured: ${faceDetection.faceCount} faces detected`);
      return screenshot;

    } catch (error) {
      console.error('Failed to capture screenshot:', error);
      return null;
    }
  }

  private async detectFaces(imageData: string): Promise<{ faceCount: number; confidence: number; flagged: boolean }> {
    try {
      // Try OpenAI Vision API first
      const openAIResult = await this.detectFacesWithOpenAI(imageData);
      if (openAIResult) {
        return openAIResult;
      }
    } catch (error) {
      console.warn('OpenAI face detection failed, using browser-based detection:', error);
    }

    // Fallback to browser-based detection
    return this.detectFacesWithBrowser(imageData);
  }

  private async detectFacesWithOpenAI(imageData: string): Promise<{ faceCount: number; confidence: number; flagged: boolean } | null> {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      return null;
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Count the number of human faces visible in this image. Respond with only a JSON object: {"faceCount": number, "confidence": number_0_to_1, "description": "brief description"}'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: imageData
                  }
                }
              ]
            }
          ],
          max_tokens: 100,
          temperature: 0.1
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const result = await response.json();
      const content = result.choices[0].message.content;
      
      // Parse JSON response
      const parsed = JSON.parse(content);
      const faceCount = parsed.faceCount || 0;
      const confidence = parsed.confidence || 0.5;
      
      return {
        faceCount,
        confidence,
        flagged: faceCount !== 1 // Flag if not exactly 1 face
      };

    } catch (error) {
      console.error('OpenAI face detection error:', error);
      return null;
    }
  }

  private async detectFacesWithBrowser(imageData: string): Promise<{ faceCount: number; confidence: number; flagged: boolean }> {
    // Simple browser-based face detection using basic image analysis
    // This is a fallback - in production, you'd use TensorFlow.js or MediaPipe
    
    try {
      // Create image element to analyze
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageData;
      });

      // Simple heuristic: check image brightness and contrast
      // This is very basic - real face detection would use ML models
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not available');

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageDataObj.data;
      
      let brightness = 0;
      for (let i = 0; i < data.length; i += 4) {
        brightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
      }
      brightness /= (data.length / 4);

      // Very basic heuristic: if image is too dark or too bright, likely no face
      const hasLikelyFace = brightness > 30 && brightness < 200;
      
      return {
        faceCount: hasLikelyFace ? 1 : 0,
        confidence: 0.3, // Low confidence for browser-based detection
        flagged: !hasLikelyFace
      };

    } catch (error) {
      console.error('Browser face detection error:', error);
      return {
        faceCount: 1, // Assume 1 face if detection fails
        confidence: 0.1,
        flagged: false
      };
    }
  }

  private async checkForViolations(screenshot: ProctoringScreenshot, isInitial: boolean): Promise<void> {
    const violations: ProctoringViolation[] = [];

    // Check for multiple faces
    if (screenshot.faceCount > 1) {
      violations.push({
        id: `violation-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        timestamp: screenshot.timestamp,
        type: 'multiple_faces',
        description: `${screenshot.faceCount} faces detected in frame`,
        screenshotId: screenshot.id,
        severity: 'high',
        resolved: false
      });
    }

    // Check for no face detected
    if (screenshot.faceCount === 0 && !isInitial) {
      violations.push({
        id: `violation-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        timestamp: screenshot.timestamp,
        type: 'no_face',
        description: 'No face detected in frame',
        screenshotId: screenshot.id,
        severity: 'medium',
        resolved: false
      });
    }

    // Add violations and trigger callbacks
    for (const violation of violations) {
      this.violations.push(violation);
      
      if (this.onViolationCallback) {
        this.onViolationCallback(violation);
      }
    }
  }

  // Public methods for accessing data
  getScreenshots(): ProctoringScreenshot[] {
    return [...this.screenshots];
  }

  getViolations(): ProctoringViolation[] {
    return [...this.violations];
  }

  getViolationCount(): number {
    return this.violations.length;
  }

  getFlaggedScreenshots(): ProctoringScreenshot[] {
    return this.screenshots.filter(s => s.flagged);
  }

  // Event handlers
  onViolation(callback: (violation: ProctoringViolation) => void): void {
    this.onViolationCallback = callback;
  }

  onScreenshot(callback: (screenshot: ProctoringScreenshot) => void): void {
    this.onScreenshotCallback = callback;
  }

  // Cleanup
  destroy(): void {
    this.stopProctoring();
    if (this.canvasElement && document.body.contains(this.canvasElement)) {
      document.body.removeChild(this.canvasElement);
    }
  }
}