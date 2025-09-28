import React, { useState } from 'react';
import { Upload, FileText, X, CheckCircle } from 'lucide-react';
import { extractTextFromPDF, isPDFFile, isBinaryContent, cleanExtractedText } from '../utils/pdfExtractor';

interface ResumeUploadProps {
  onResumeUploaded: (resumeText: string) => void;
  onSkip: () => void;
}

export const ResumeUpload: React.FC<ResumeUploadProps> = ({ onResumeUploaded, onSkip }) => {
  const [resumeText, setResumeText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'file' | 'text'>('file');
  const [uploadError, setUploadError] = useState('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError('');
    
    try {
      let extractedText = '';
      
      if (isPDFFile(file)) {
        console.log('📄 Processing PDF file:', file.name);
        try {
          extractedText = await extractTextFromPDF(file);
          console.log('✅ PDF text extracted successfully:', extractedText.length, 'characters');
          console.log('📝 First 500 chars:', extractedText.substring(0, 500));
        } catch (pdfError) {
          console.error('❌ PDF extraction failed:', pdfError);
          setUploadError(`PDF extraction failed: ${pdfError instanceof Error ? pdfError.message : 'Unknown error'}. Please try copying and pasting your resume text using the "Paste Text" option.`);
          setIsUploading(false);
          return;
        }
      } else if (file.type.startsWith('application/') && !file.name.endsWith('.txt')) {
        // For Word docs and other binary formats
        setUploadError('This file format is not supported. Please copy and paste your resume text using the "Paste Text" option, or save your resume as a .txt file.');
        setIsUploading(false);
        return;
      } else {
        // For text files
        extractedText = await file.text();
        extractedText = cleanExtractedText(extractedText);
      }
      
      // Validate that we got meaningful text
      if (!extractedText || extractedText.trim().length < 200) {
        setUploadError('The resume appears to be too short or empty. Please ensure you have copied the complete resume content including work experience, education, and skills.');
        setIsUploading(false);
        return;
      }
      
      // Check for binary/corrupted content
      if (isBinaryContent(extractedText)) {
        setUploadError('The file appears to contain binary or corrupted data. Please copy and paste your resume text using the "Paste Text" option.');
        setIsUploading(false);
        return;
      }
      
      setResumeText(extractedText);
      setUploadError('');
    } catch (error) {
      console.error('Failed to read file:', error);
      setUploadError('Failed to read file. Please try the "Paste Text" option instead.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = () => {
    if (resumeText.trim()) {
      onResumeUploaded(resumeText.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          <FileText className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Upload Your Resume</h1>
          <p className="text-gray-600">
            Upload your resume to get personalized interview questions based on your background
          </p>
        </div>

        <div className="mb-6">
          <div className="flex justify-center space-x-4 mb-4">
            <button
              onClick={() => setUploadMethod('file')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                uploadMethod === 'file'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Upload File
            </button>
            <button
              onClick={() => setUploadMethod('text')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                uploadMethod === 'text'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Paste Text
            </button>
          </div>

          {uploadMethod === 'file' ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                accept=".txt"
                onChange={handleFileUpload}
                className="hidden"
                id="resume-upload"
                disabled={isUploading}
              />
              <label
                htmlFor="resume-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                {isUploading ? (
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                ) : (
                  <Upload className="w-12 h-12 text-gray-400 mb-4" />
                )}
                <p className="text-lg font-medium text-gray-700 mb-2">
                  {isUploading ? 'Processing...' : 'Click to upload resume'}
                </p>
                <p className="text-sm text-gray-500">
                  Supports PDF and TXT files
                </p>
              </label>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paste your resume text here:
              </label>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="w-full h-64 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Paste your resume content here..."
              />
            </div>
          )}
        </div>

        {uploadError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start text-red-800">
              <X className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">Upload Error:</span>
                📄 <strong>PDF Support:</strong> Upload PDF files directly or use "Paste Text" for manual entry.<br/>
                💡 <strong>Tip:</strong> If PDF upload fails, open your PDF, select all text (Ctrl+A), copy (Ctrl+C), and use "Paste Text" option.
              </div>
            </div>
          </div>
        )}
        {resumeText && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center text-green-800 mb-2">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span className="font-medium">Resume loaded successfully!</span>
            </div>
            <p className="text-sm text-green-700">
              {resumeText.length} characters • Ready for analysis
            </p>
          </div>
        )}

        <div className="flex space-x-4">
          <button
            onClick={handleSubmit}
            disabled={!resumeText.trim() || !!uploadError}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg font-medium transition-colors"
          >
            Start AI Audio Interview
          </button>

          <button
            onClick={onSkip}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Skip & Use Standard Questions
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            🔒 Your resume is processed securely and not stored permanently.
            <br />
            <strong>Note:</strong> Resume analysis and personalized questions require OpenAI API key.
            <br />
            Without API key, you'll get standard interview questions.
          </p>
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-blue-800 text-xs">
              💡 <strong>Tip:</strong> Add VITE_OPENAI_API_KEY to .env file for personalized questions and real AI evaluation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};