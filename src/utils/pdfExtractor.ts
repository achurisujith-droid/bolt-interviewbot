// PDF text extraction utility
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

export const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    
    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Combine text items with proper spacing
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ')
        .replace(/\s+/g, ' ') // Normalize whitespace
        .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space between camelCase
        .replace(/(\d)([A-Z])/g, '$1 $2') // Add space between numbers and letters
        .trim();
      
      if (pageText) {
        fullText += pageText + '\n\n';
      }
    }
    
    const cleanedText = cleanExtractedText(fullText);
    
    // Additional validation for PDF extraction
    if (cleanedText.length < 100) {
      throw new Error('PDF appears to be empty or contains mostly images. Please try copying and pasting the text manually.');
    }
    
    return cleanedText;
  } catch (error) {
    console.error('PDF extraction failed:', error);
    if (error instanceof Error && error.message.includes('PDF appears to be empty')) {
      throw error;
    }
    throw new Error('Failed to extract text from PDF. The file may be corrupted, password-protected, or contain mostly images. Please try copying and pasting the text manually.');
  }
};

// Alternative PDF extraction using a different approach
export const extractTextFromPDFAlternative = async (file: File): Promise<string> => {
  try {
    // Try using PDF-lib for extraction
    const formData = new FormData();
    formData.append('file', file);
    
    // This would typically be a server-side service
    // For now, we'll provide instructions to the user
    throw new Error('PDF extraction requires server-side processing. Please copy and paste your resume text instead.');
  } catch (error) {
    throw error;
  }
};

// Detect if file is a PDF
export const isPDFFile = (file: File): boolean => {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
};

// Detect if content is binary/corrupted
export const isBinaryContent = (text: string): boolean => {
  // Check for null bytes, control characters, or PDF markers
  return (
    text.includes('\0') || 
    text.includes('�') || 
    /[\x00-\x08\x0E-\x1F\x7F-\x9F]/.test(text) ||
    text.startsWith('%PDF-') ||
    text.includes('endobj') ||
    text.includes('stream')
  );
};

// Clean extracted text
export const cleanExtractedText = (text: string): string => {
  return text
    .replace(/\f/g, '\n') // Replace form feeds with newlines
    .replace(/\r\n/g, '\n') // Normalize line endings
    .replace(/\r/g, '\n') // Normalize line endings
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/\n\s*\n\s*\n/g, '\n\n') // Reduce multiple empty lines
    .replace(/[^\x20-\x7E\n\t]/g, ' ') // Replace non-printable with spaces
    .replace(/\s+/g, ' ') // Final whitespace normalization
    .replace(/\n /g, '\n') // Remove spaces at start of lines
    .trim();
};