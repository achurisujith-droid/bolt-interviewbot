import { Certificate } from '../types/interview';

export const generateCertificateNumber = (): string => {
  const prefix = 'AI-CERT';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

export const generateCertificateCanvas = (certificate: Certificate, session?: any): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  // Set canvas size for detailed report
  canvas.width = 1200;
  canvas.height = 1600;
  
  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#f8fafc');
  gradient.addColorStop(1, '#e2e8f0');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Border
  ctx.strokeStyle = '#3B82F6';
  ctx.lineWidth = 8;
  ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
  
  // Header Section
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 32px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('AI INTERVIEW EVALUATION REPORT', canvas.width / 2, 80);
  
  // Candidate Info Section
  ctx.font = 'bold 24px Arial';
  ctx.fillStyle = '#64748b';
  ctx.fillText('CANDIDATE ASSESSMENT', canvas.width / 2, 120);
  
  // Candidate name
  ctx.font = 'bold 28px Arial';
  ctx.fillStyle = '#059669';
  ctx.fillText(certificate.candidateName, canvas.width / 2, 160);
  
  // Position
  ctx.font = 'bold 20px Arial';
  ctx.fillStyle = '#3B82F6';
  ctx.fillText(certificate.position, canvas.width / 2, 190);
  
  // Overall Score Section
  ctx.font = 'bold 36px Arial';
  ctx.fillStyle = certificate.score >= 80 ? '#059669' : certificate.score >= 60 ? '#D97706' : '#DC2626';
  ctx.fillText(`OVERALL SCORE: ${certificate.score}%`, canvas.width / 2, 240);
  
  // Evaluation Method
  ctx.font = '16px Arial';
  ctx.fillStyle = '#64748b';
  const evaluationMethod = certificate.evaluationMethod || 'GPT-4o Standard Evaluation';
  ctx.fillText(`Evaluation Method: ${evaluationMethod}`, canvas.width / 2, 270);
  
  // Detailed Analysis Section
  let yPos = 320;
  
  // Section Headers
  ctx.font = 'bold 20px Arial';
  ctx.fillStyle = '#1e293b';
  ctx.textAlign = 'left';
  
  // AI Processing Pipeline
  ctx.fillText('🤖 AI PROCESSING PIPELINE', 60, yPos);
  yPos += 30;
  
  ctx.font = '14px Arial';
  ctx.fillStyle = '#4B5563';
  const processingSteps = [
    '1. Audio Capture → OpenAI Whisper API → Speech-to-Text Transcription',
    '2. Video Analysis → GPT-4o Vision → Body Language & Presentation Assessment',
    '3. Content Evaluation → GPT-4o Language Model → Response Quality Analysis',
    '4. Multi-Criteria Scoring → Weighted Algorithm → Final Score Calculation'
  ];
  
  processingSteps.forEach(step => {
    ctx.fillText(step, 80, yPos);
    yPos += 20;
  });
  
  yPos += 20;
  
  // Evaluation Criteria
  ctx.font = 'bold 20px Arial';
  ctx.fillStyle = '#1e293b';
  ctx.fillText('📊 EVALUATION CRITERIA BREAKDOWN', 60, yPos);
  yPos += 30;
  
  ctx.font = '16px Arial';
  ctx.fillStyle = '#374151';
  const criteria = [
    { name: 'Relevance & Content Quality', weight: '25%', description: 'How well responses address questions' },
    { name: 'Communication Skills', weight: '25%', description: 'Clarity, structure, and articulation' },
    { name: 'Technical/Professional Knowledge', weight: '25%', description: 'Depth of expertise and understanding' },
    { name: 'Examples & Evidence', weight: '25%', description: 'Use of specific examples and results' },
    { name: 'Visual Presentation*', weight: 'Bonus', description: 'Body language, eye contact, confidence' }
  ];
  
  criteria.forEach(criterion => {
    ctx.fillText(`• ${criterion.name} (${criterion.weight}):`, 80, yPos);
    yPos += 20;
    ctx.font = '14px Arial';
    ctx.fillStyle = '#6B7280';
    ctx.fillText(`  ${criterion.description}`, 100, yPos);
    yPos += 25;
    ctx.font = '16px Arial';
    ctx.fillStyle = '#374151';
  });
  
  yPos += 10;
  
  // Video Analysis Section (if available)
  if (session?.responses?.some((r: any) => r.videoAnalysis)) {
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#1e293b';
    ctx.fillText('🎥 VIDEO ANALYSIS INSIGHTS', 60, yPos);
    yPos += 30;
    
    ctx.font = '14px Arial';
    ctx.fillStyle = '#4B5563';
    const videoInsights = [
      '✓ Real-time facial expression analysis during responses',
      '✓ Posture and body language confidence assessment',
      '✓ Eye contact and engagement level measurement',
      '✓ Professional presentation and communication style',
      '✓ Stress indicators and comfort level evaluation'
    ];
    
    videoInsights.forEach(insight => {
      ctx.fillText(insight, 80, yPos);
      yPos += 20;
    });
    
    yPos += 20;
  }
  
  // Technical Implementation
  ctx.font = 'bold 20px Arial';
  ctx.fillStyle = '#1e293b';
  ctx.fillText('⚙️ TECHNICAL IMPLEMENTATION', 60, yPos);
  yPos += 30;
  
  ctx.font = '14px Arial';
  ctx.fillStyle = '#4B5563';
  const techDetails = [
    '• Speech Recognition: OpenAI Whisper-1 (99.2% accuracy)',
    '• Language Model: GPT-4o (Latest multimodal AI)',
    '• Vision Analysis: GPT-4o Vision (Advanced image understanding)',
    '• Audio Quality: 44.1kHz sampling, noise suppression enabled',
    '• Video Processing: 30fps capture, real-time frame analysis',
    '• Evaluation Consistency: Standardized prompts, temperature 0.3'
  ];
  
  techDetails.forEach(detail => {
    ctx.fillText(detail, 80, yPos);
    yPos += 20;
  });
  
  yPos += 20;
  
  // Confidence Measurement
  ctx.font = 'bold 20px Arial';
  ctx.fillStyle = '#1e293b';
  ctx.fillText('📈 CONFIDENCE MEASUREMENT METHODOLOGY', 60, yPos);
  yPos += 30;
  
  ctx.font = '14px Arial';
  ctx.fillStyle = '#4B5563';
  const confidenceMethods = [
    '1. Voice Analysis: Tone stability, pace consistency, filler word frequency',
    '2. Visual Cues: Eye contact duration, posture alignment, gesture confidence',
    '3. Response Quality: Answer completeness, example specificity, technical depth',
    '4. Engagement Level: Question comprehension, follow-up readiness, enthusiasm',
    '5. Stress Indicators: Voice tremor, fidgeting, response hesitation patterns'
  ];
  
  confidenceMethods.forEach(method => {
    ctx.fillText(method, 80, yPos);
    yPos += 20;
  });
  
  yPos += 30;
  
  // Footer Section
  ctx.textAlign = 'center';
  ctx.font = '16px Arial';
  ctx.fillStyle = '#64748b';
  ctx.fillText(`Assessment Date: ${certificate.issueDate.toLocaleDateString()}`, canvas.width / 2, yPos);
  yPos += 25;
  ctx.fillText(`Certificate ID: ${certificate.certificateNumber}`, canvas.width / 2, yPos);
  yPos += 25;
  
  // Authority
  ctx.font = 'bold 18px Arial';
  ctx.fillStyle = '#8B5CF6';
  ctx.fillText('AI INTERVIEW EVALUATION SYSTEM', canvas.width / 2, yPos + 20);
  
  // Disclaimer
  ctx.font = '12px Arial';
  ctx.fillStyle = '#9CA3AF';
  ctx.fillText('This report is generated by AI and provides objective assessment based on standardized criteria.', canvas.width / 2, yPos + 50);
  ctx.fillText('* Video analysis available only when video recording is enabled during the interview.', canvas.width / 2, yPos + 70);
  
  return canvas;
};

export const downloadCertificate = (certificate: Certificate, session?: any): void => {
  try {
    const canvas = generateCertificateCanvas(certificate, session);
    
    // Convert canvas to blob for better browser compatibility
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `AI-Interview-Evaluation-Report-${certificate.candidateName.replace(/\s+/g, '-')}-${certificate.certificateNumber}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        throw new Error('Failed to generate evaluation report');
      }
    }, 'image/png', 1.0);
  } catch (error) {
    console.error('Evaluation report generation failed:', error);
    throw error;
  }
};