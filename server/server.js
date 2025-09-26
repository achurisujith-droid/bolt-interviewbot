const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const multer = require('multer');
const FormData = require('form-data');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// OpenAI configuration
const OpenAI = require('openai');
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('start-interview', (data) => {
    console.log('Interview started for:', data.candidateName);
    socket.emit('interview-started', { success: true });
  });

  socket.on('audio-data', async (audioData) => {
    try {
      console.log('Received audio data, processing...');
      
      // Convert audio data to buffer
      const audioBuffer = Buffer.from(audioData.audio, 'base64');
      
      // Create form data for OpenAI Whisper
      const formData = new FormData();
      formData.append('file', audioBuffer, {
        filename: 'audio.webm',
        contentType: 'audio/webm'
      });
      formData.append('model', 'whisper-1');

      // Transcribe audio using OpenAI Whisper
      const transcription = await openai.audio.transcriptions.create({
        file: audioBuffer,
        model: 'whisper-1'
      });

      console.log('Transcription:', transcription.text);

      // Evaluate the response using GPT-4
      const evaluation = await evaluateResponse(transcription.text, audioData.question, audioData.position);

      socket.emit('transcription-result', {
        transcription: transcription.text,
        evaluation: evaluation
      });

    } catch (error) {
      console.error('Error processing audio:', error);
      socket.emit('transcription-error', { error: error.message });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Function to evaluate responses using GPT-4
async function evaluateResponse(transcription, question, position) {
  try {
    const prompt = `
    You are an expert interviewer evaluating a candidate's response for a ${position} position.
    
    Question: ${question}
    Candidate's Response: ${transcription}
    
    Please evaluate this response and provide:
    1. A score out of 100
    2. Detailed feedback
    3. Strengths identified
    4. Areas for improvement
    
    Respond in JSON format:
    {
      "score": number,
      "feedback": "detailed feedback",
      "strengths": ["strength1", "strength2"],
      "improvements": ["improvement1", "improvement2"]
    }
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('Error evaluating response:', error);
    return {
      score: 75,
      feedback: "Unable to evaluate response at this time.",
      strengths: ["Clear communication"],
      improvements: ["Provide more specific examples"]
    };
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});