import { Certificate, InterviewSession } from '../types/interview';

export const generateCertificateNumber = (): string => {
  const prefix = 'AI-CERT';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

export const downloadCertificate = async (certificate: Certificate, session?: InterviewSession): Promise<void> => {
  console.log('🎯 === CERTIFICATE DOWNLOAD START ===');
  console.log('📜 Certificate:', certificate);
  console.log('📊 Session:', session);
  console.log('🌐 Browser:', navigator.userAgent);
  
  try {
    // Create comprehensive evaluation report
    const reportContent = generateEvaluationReport(certificate, session);
    console.log('📝 Report content generated, length:', reportContent.length);
    
    // Create blob
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    console.log('📦 Blob created, size:', blob.size, 'bytes');
    
    // Generate filename
    const filename = `AI-Interview-Report-${certificate.candidateName.replace(/\s+/g, '-')}-${certificate.certificateNumber}.txt`;
    console.log('📁 Filename:', filename);
    
    // Try multiple download methods
    let downloadSuccess = false;
    
    // Method 1: Modern download API
    if ('showSaveFilePicker' in window) {
      try {
        console.log('🔄 Trying File System Access API...');
        const fileHandle = await (window as any).showSaveFilePicker({
          suggestedName: filename,
          types: [{
            description: 'Text files',
            accept: { 'text/plain': ['.txt'] }
          }]
        });
        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();
        console.log('✅ File System Access API download successful');
        downloadSuccess = true;
      } catch (fsError) {
        console.log('⚠️ File System Access API failed or cancelled:', fsError);
      }
    }
    
    // Method 2: Traditional blob download
    if (!downloadSuccess) {
      console.log('🔄 Trying traditional blob download...');
      const url = URL.createObjectURL(blob);
      console.log('🔗 Blob URL created:', url);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      
      console.log('🔗 Download link created');
      console.log('📁 Download attribute:', link.download);
      console.log('🔗 Href attribute:', link.href);
      
      // Add to DOM
      document.body.appendChild(link);
      console.log('➕ Link added to DOM');
      
      // Force click with multiple attempts
      setTimeout(() => {
        console.log('🖱️ Attempting click...');
        try {
          link.click();
          console.log('✅ Click executed');
          downloadSuccess = true;
        } catch (clickError) {
          console.error('❌ Click failed:', clickError);
        }
        
        // Cleanup
        setTimeout(() => {
          try {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            console.log('🧹 Cleanup completed');
          } catch (cleanupError) {
            console.error('⚠️ Cleanup failed:', cleanupError);
          }
        }, 1000);
      }, 100);
    }
    
    // Method 3: Fallback - open in new window
    if (!downloadSuccess) {
      setTimeout(() => {
        console.log('🔄 Trying fallback method - new window...');
        try {
          const dataUrl = `data:text/plain;charset=utf-8,${encodeURIComponent(reportContent)}`;
          const newWindow = window.open(dataUrl, '_blank');
          if (newWindow) {
            console.log('✅ Opened in new window');
            alert('📄 Report opened in new window. Please save the file manually (Ctrl+S).');
          } else {
            throw new Error('Popup blocked');
          }
        } catch (fallbackError) {
          console.error('❌ Fallback method failed:', fallbackError);
          
          // Final fallback - copy to clipboard
          navigator.clipboard.writeText(reportContent).then(() => {
            alert('📋 Report copied to clipboard! Please paste it into a text file.');
            console.log('✅ Copied to clipboard as final fallback');
          }).catch(() => {
            alert('❌ All download methods failed. Please check browser settings and try again.');
            console.error('❌ All download methods failed');
          });
        }
      }, 2000);
    }
    
  } catch (error) {
    console.error('❌ Certificate download failed:', error);
    alert(`❌ Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  console.log('🎯 === CERTIFICATE DOWNLOAD END ===');
};

const generateEvaluationReport = (certificate: Certificate, session?: InterviewSession): string => {
  const reportDate = new Date().toLocaleDateString();
  const reportTime = new Date().toLocaleTimeString();
  
  let report = `
╔══════════════════════════════════════════════════════════════════════════════╗
║                        AI INTERVIEW EVALUATION REPORT                        ║
╚══════════════════════════════════════════════════════════════════════════════╝

CANDIDATE INFORMATION
━━━━━━━━━━━━━━━━━━━━━
Name: ${certificate.candidateName}
Position: ${certificate.position}
Overall Score: ${certificate.score}%
Performance Level: ${certificate.score >= 80 ? 'EXCELLENT' : certificate.score >= 60 ? 'GOOD' : 'NEEDS IMPROVEMENT'}

CERTIFICATE DETAILS
━━━━━━━━━━━━━━━━━━━━
Certificate Number: ${certificate.certificateNumber}
Issue Date: ${certificate.issueDate.toLocaleDateString()}
Evaluation Method: ${certificate.evaluationMethod || 'GPT-4o AI Evaluation'}
Report Generated: ${reportDate} at ${reportTime}

EVALUATION METHODOLOGY
━━━━━━━━━━━━━━━━━━━━━━
This assessment was conducted using advanced AI technology:

1. SPEECH-TO-TEXT PROCESSING
   • OpenAI Whisper API for accurate transcription
   • Real-time audio analysis and conversion

2. INTELLIGENT EVALUATION  
   • GPT-4o language model for content analysis
   • Multi-criteria assessment framework
   • Context-aware scoring based on position requirements

3. SCORING CRITERIA (Each worth 25%)
   • Relevance & Content Quality
   • Communication Skills
   • Technical/Professional Knowledge  
   • Examples & Evidence

`;

  if (session?.resumeAnalysis) {
    report += `
RESUME ANALYSIS CONTEXT
━━━━━━━━━━━━━━━━━━━━━━━
Actual Role: ${session.resumeAnalysis.actualRole || 'Not specified'}
Experience Level: ${session.resumeAnalysis.yearsOfExperience} years (${session.resumeAnalysis.seniority} level)
Key Technologies: ${session.resumeAnalysis.keyTechnologies?.join(', ') || 'Not specified'}
Personalized Questions: YES - Questions tailored to candidate's background

`;
  }

  if (session?.responses && session.responses.length > 0) {
    report += `
DETAILED QUESTION-BY-QUESTION ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

`;

    session.responses.forEach((response, index) => {
      report += `
QUESTION ${index + 1}
${'-'.repeat(50)}
Q: ${response.question}

CANDIDATE RESPONSE TRANSCRIPT:
"${response.transcript || 'No transcript available'}"

EVALUATION RESULTS:
• Score: ${response.score || 'N/A'}%
• AI Feedback: ${response.feedback || 'No feedback available'}

`;

      if (response.strengths && response.strengths.length > 0) {
        report += `STRENGTHS IDENTIFIED:
${response.strengths.map(s => `• ${s}`).join('\n')}

`;
      }

      if (response.improvements && response.improvements.length > 0) {
        report += `AREAS FOR IMPROVEMENT:
${response.improvements.map(i => `• ${i}`).join('\n')}

`;
      }
    });
  }

  report += `
OVERALL ASSESSMENT SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Final Score: ${certificate.score}%
Performance Rating: ${certificate.score >= 80 ? 'EXCELLENT - Exceeds expectations' : 
                     certificate.score >= 60 ? 'GOOD - Meets requirements' : 
                     'DEVELOPING - Additional preparation recommended'}

SCORE INTERPRETATION:
• 80-100%: Excellent performance, ready for advanced roles
• 60-79%:  Good performance, suitable for target position  
• 40-59%:  Developing skills, additional training recommended
• 0-39%:   Significant improvement needed

CERTIFICATE VERIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━
This certificate can be verified using:
• Certificate Number: ${certificate.certificateNumber}
• Issue Date: ${certificate.issueDate.toLocaleDateString()}
• Candidate Name: ${certificate.candidateName}
• Position Assessed: ${certificate.position}

TECHNOLOGY STACK
━━━━━━━━━━━━━━━━━━
• AI Evaluation: OpenAI GPT-4o
• Speech Processing: OpenAI Whisper
• Text-to-Speech: OpenAI TTS
• Platform: AI Interview Bot System

This report was generated automatically by the AI Interview Bot system.
For questions about this assessment, please contact the system administrator.

Report ID: ${certificate.id}
Generated: ${reportDate} ${reportTime}

═══════════════════════════════════════════════════════════════════════════════
                              END OF REPORT
═══════════════════════════════════════════════════════════════════════════════
`;

  return report;
};