// Simple, reliable certificate generator
import { Certificate, InterviewSession } from '../types/interview';

export const generateCertificateNumber = (): string => {
  const prefix = 'AI-CERT';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

export const downloadCertificate = (certificate: Certificate, session?: InterviewSession): void => {
  console.log('🎯 CERTIFICATE DOWNLOAD STARTED');
  console.log('📜 Certificate data:', certificate);
  console.log('📊 Session data:', session);
  
  try {
    // Generate certificate HTML content
    const certificateContent = generateCertificateHTML(certificate, session);
    
    // Method 1: Try direct download
    try {
      const blob = new Blob([certificateContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `AI-Interview-Certificate-${certificate.candidateName.replace(/\s+/g, '-')}-${certificate.score}percent.html`;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      
      // Cleanup after a short delay
      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
        URL.revokeObjectURL(url);
      }, 1000);
      
      console.log('✅ Certificate download initiated successfully');
      return;
      
    } catch (downloadError) {
      console.error('❌ Direct download failed:', downloadError);
      
      // Method 2: Open in new window as fallback
      try {
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.document.write(certificateContent);
          newWindow.document.close();
          console.log('✅ Certificate opened in new window');
          return;
        } else {
          throw new Error('Popup blocked');
        }
      } catch (popupError) {
        console.error('❌ Popup method failed:', popupError);
        
        // Method 3: Copy to clipboard and show instructions
        try {
          navigator.clipboard.writeText(certificateContent).then(() => {
            alert(`📋 Certificate HTML copied to clipboard!\n\nTo save your certificate:\n1. Open a text editor\n2. Paste the content (Ctrl+V)\n3. Save as "certificate.html"\n4. Open the file in your browser\n5. Print or save as PDF`);
            console.log('✅ Certificate copied to clipboard');
          }).catch(() => {
            // Final fallback: Show content in alert
            console.log('❌ Clipboard failed, showing download instructions');
            alert(`Certificate generation completed!\n\nTo download:\n1. Right-click this page\n2. Select "Save As"\n3. Choose HTML format\n\nCertificate Number: ${certificate.certificateNumber}\nScore: ${certificate.score}%`);
          });
        } catch (clipboardError) {
          console.error('❌ All methods failed:', clipboardError);
          alert(`Certificate ready but download failed.\n\nCertificate Details:\nCandidate: ${certificate.candidateName}\nPosition: ${certificate.position}\nScore: ${certificate.score}%\nCertificate #: ${certificate.certificateNumber}\n\nPlease contact support for assistance.`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Certificate download failed:', error);
    alert(`❌ Certificate generation failed: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease try again or contact support.`);
  }
};

const generateCertificateHTML = (certificate: Certificate, session?: InterviewSession): string => {
  const performanceLevel = certificate.score >= 80 ? 'EXCELLENT' : 
                          certificate.score >= 60 ? 'GOOD' : 'DEVELOPING';
  
  const performanceColor = certificate.score >= 80 ? '#10b981' : 
                          certificate.score >= 60 ? '#f59e0b' : '#ef4444';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Interview Certificate - ${certificate.candidateName}</title>
    <style>
        @page {
            size: A4;
            margin: 0;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            box-sizing: border-box;
        }
        
        .certificate {
            background: white;
            color: #333;
            padding: 60px;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        .certificate::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(45deg, #f0f9ff 0%, #e0f2fe 100%);
            z-index: -1;
        }
        
        .header {
            border-bottom: 3px solid #3b82f6;
            padding-bottom: 30px;
            margin-bottom: 40px;
        }
        
        .title {
            font-size: 48px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        
        .subtitle {
            font-size: 20px;
            color: #6b7280;
            margin-bottom: 20px;
        }
        
        .candidate-name {
            font-size: 42px;
            font-weight: bold;
            color: #1f2937;
            margin: 30px 0;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .achievement {
            font-size: 18px;
            color: #4b5563;
            margin: 20px 0;
        }
        
        .position {
            font-size: 32px;
            font-weight: bold;
            color: #3b82f6;
            margin: 20px 0;
        }
        
        .score-section {
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            color: white;
            padding: 30px;
            border-radius: 15px;
            margin: 40px 0;
        }
        
        .score {
            font-size: 64px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .performance {
            font-size: 24px;
            font-weight: bold;
            color: ${performanceColor};
            margin: 20px 0;
        }
        
        .details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin: 40px 0;
            text-align: left;
        }
        
        .detail-item {
            margin-bottom: 15px;
        }
        
        .detail-label {
            font-weight: bold;
            color: #374151;
            display: block;
            margin-bottom: 5px;
        }
        
        .detail-value {
            color: #6b7280;
        }
        
        .footer {
            border-top: 2px solid #e5e7eb;
            padding-top: 30px;
            margin-top: 40px;
            font-size: 14px;
            color: #9ca3af;
        }
        
        .ai-badge {
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 10px 20px;
            border-radius: 25px;
            font-weight: bold;
            display: inline-block;
            margin: 20px 0;
        }
        
        @media print {
            body {
                background: white;
                padding: 0;
            }
            
            .certificate {
                box-shadow: none;
                border: 2px solid #3b82f6;
            }
        }
    </style>
</head>
<body>
    <div class="certificate">
        <div class="header">
            <div class="title">Certificate of Completion</div>
            <div class="subtitle">AI-Powered Interview Assessment</div>
        </div>
        
        <div class="candidate-name">${certificate.candidateName}</div>
        
        <div class="achievement">has successfully completed the</div>
        
        <div class="position">${certificate.position}</div>
        
        <div class="achievement">Interview Assessment</div>
        
        <div class="score-section">
            <div class="score">${certificate.score}%</div>
            <div>Final Score</div>
        </div>
        
        <div class="performance">Performance: ${performanceLevel}</div>
        
        <div class="ai-badge">🤖 AI-POWERED EVALUATION</div>
        
        <div class="details">
            <div>
                <div class="detail-item">
                    <span class="detail-label">Certificate Number:</span>
                    <span class="detail-value">${certificate.certificateNumber}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Issue Date:</span>
                    <span class="detail-value">${certificate.issueDate.toLocaleDateString()}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Evaluation Method:</span>
                    <span class="detail-value">${certificate.evaluationMethod || 'GPT-4o AI Evaluation'}</span>
                </div>
            </div>
            <div>
                ${session ? `
                <div class="detail-item">
                    <span class="detail-label">Questions Answered:</span>
                    <span class="detail-value">${session.responses?.length || 0}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Interview Duration:</span>
                    <span class="detail-value">${session.responses?.length ? (session.responses.length * 2) : 0} minutes</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Resume Analysis:</span>
                    <span class="detail-value">${session.resumeAnalysis ? 'Personalized' : 'Standard'}</span>
                </div>
                ` : ''}
            </div>
        </div>
        
        ${session?.responses ? `
        <div style="margin-top: 40px; text-align: left;">
            <h3 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Detailed Evaluation Results</h3>
            ${session.responses.map((response, index) => `
                <div style="margin: 20px 0; padding: 20px; background: #f9fafb; border-radius: 10px; border-left: 4px solid #3b82f6;">
                    <h4 style="color: #1f2937; margin-bottom: 10px;">Question ${index + 1}: ${response.score || 0}%</h4>
                    <p style="color: #4b5563; margin-bottom: 10px; font-style: italic;">"${response.question}"</p>
                    ${response.transcript ? `
                        <div style="background: white; padding: 15px; border-radius: 8px; margin: 10px 0;">
                            <strong style="color: #374151;">Your Response:</strong>
                            <p style="color: #6b7280; margin-top: 5px;">"${response.transcript}"</p>
                        </div>
                    ` : ''}
                    ${response.feedback ? `
                        <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin: 10px 0;">
                            <strong style="color: #1e40af;">AI Feedback:</strong>
                            <p style="color: #1e40af; margin-top: 5px;">${response.feedback}</p>
                        </div>
                    ` : ''}
                    ${response.strengths && response.strengths.length > 0 ? `
                        <div style="background: #d1fae5; padding: 15px; border-radius: 8px; margin: 10px 0;">
                            <strong style="color: #065f46;">Strengths:</strong>
                            <ul style="color: #065f46; margin-top: 5px;">
                                ${response.strengths.map(strength => `<li>${strength}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    ${response.improvements && response.improvements.length > 0 ? `
                        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 10px 0;">
                            <strong style="color: #92400e;">Areas for Improvement:</strong>
                            <ul style="color: #92400e; margin-top: 5px;">
                                ${response.improvements.map(improvement => `<li>${improvement}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
            `).join('')}
        </div>
        ` : ''}
        
        <div class="footer">
            <div>This certificate can be verified using the certificate number: ${certificate.certificateNumber}</div>
            <div style="margin-top: 10px;">Generated by AI Interview Bot System • ${new Date().toLocaleDateString()}</div>
            <div style="margin-top: 10px;">Powered by OpenAI GPT-4o • Verified AI Evaluation</div>
        </div>
    </div>
    
    <script>
        // Auto-print when opened
        window.onload = function() {
            setTimeout(() => {
                window.print();
            }, 1000);
        };
    </script>
</body>
</html>`;
};