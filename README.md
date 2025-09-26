# AI Interview Bot 🤖🎤

A comprehensive AI-powered interview platform with voice recording, real-time evaluation, and certificate generation.

## 🚀 Features

### Core Functionality
- **Voice Interviews**: Record audio responses to interview questions
- **AI Evaluation**: Real-time transcription and intelligent scoring using OpenAI GPT-4o
- **Text-to-Speech**: Questions are spoken aloud like a real interviewer
- **Smart Questions**: AI-generated questions tailored to specific positions
- **Certificate Generation**: Automated certificate creation and download
- **Admin Dashboard**: Comprehensive management interface

### AI Integration
- **OpenAI Whisper**: Speech-to-text transcription
- **GPT-4o**: Intelligent response evaluation with detailed feedback
- **OpenAI TTS**: Natural voice question delivery
- **Dynamic Questions**: Position-specific question generation
- **Real-time Video**: AI agent in video calls with direct voice processing
- **Backend Integration**: Node.js server with Socket.IO for real-time communication

## 🛠️ Setup Instructions

### 1. Environment Configuration

Create a `.env` file in the root directory:

```env
VITE_OPENAI_API_KEY=sk-your-openai-api-key-here
```

**Get your OpenAI API key**: https://platform.openai.com/api-keys

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

### 4. Start Backend Server (for Video Interviews)

```bash
cd server
npm install
cp .env.example .env
# Add your OpenAI API key to .env
npm run dev
```

## 🎯 How It Works

### For Administrators
1. **Generate Interview Links**: Create unique interview sessions
2. **Monitor Progress**: Track candidate sessions in real-time
3. **Review Results**: Access detailed evaluations and certificates
4. **Manage Data**: Export results and manage candidate information

### For Candidates
1. **Join Interview**: Click the provided link to start
2. **Listen to Questions**: Questions are spoken aloud automatically
3. **Record Responses**: Use voice recording for each answer
4. **Get Evaluated**: AI processes responses and provides scores
5. **Receive Certificate**: Download personalized completion certificate

## 🤖 AI Features

### With OpenAI API Key
- ✅ Real speech-to-text transcription
- ✅ GPT-4o powered evaluation
- ✅ Natural text-to-speech questions
- ✅ AI-generated interview questions
- ✅ Detailed feedback with strengths/improvements
- 🎥 AI Video Interview Agent (Beta)
- 🔗 Zoom Integration Support
- 📹 Real-time video analysis

### Without API Key (Mock Mode)
- ✅ Simulated AI evaluation
- ✅ Browser text-to-speech
- ✅ Default question bank
- ✅ Realistic scoring algorithm
- ✅ Professional feedback

## 📊 Evaluation Criteria

The AI evaluates responses based on:
- **Relevance & Content Quality** (25%)
- **Communication Skills** (25%)
- **Technical/Professional Knowledge** (25%)
- **Examples & Evidence** (25%)

## 🎨 Design Features

- Modern gradient design with professional aesthetics
- Responsive layout for all devices
- Smooth animations and transitions
- Intuitive audio controls
- Real-time progress tracking
- Professional certificate templates

## 🔧 Technical Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **Audio**: Web Audio API + MediaRecorder
- **Video**: WebRTC + MediaRecorder + Canvas API
- **AI**: OpenAI GPT-4o + Whisper + TTS
- **Video Calls**: WebSocket + Zoom SDK (optional)
- **Storage**: LocalStorage (easily upgradeable to database)
- **Build**: Vite

## 📝 Usage Examples

### Generate Interview Link
```typescript
const link = generateInterviewLink('candidate@email.com', 'Software Developer');
// Returns: https://yourapp.com?session=abc123&name=candidate&email=...
```

### AI Evaluation
```typescript
const evaluation = await evaluateResponse(audioResponse, 'Software Developer');
// Returns: { score: 85, feedback: "...", strengths: [...], improvements: [...] }
```

## 🚀 Deployment

The application is ready for deployment to any static hosting service:

```bash
npm run build
```

Deploy the `dist` folder to your preferred hosting platform.

## 🔒 Security Notes

- API keys are only used client-side for demo purposes
- In production, implement server-side API calls
- Add authentication for admin dashboard
- Consider rate limiting for API calls

## 📈 Future Enhancements

- Database integration (Supabase/PostgreSQL)
- ✅ Video interview support (implemented)
- Zoom/Teams integration
- Multi-language support
- Advanced analytics dashboard
- Integration with HR systems
- Bulk interview management
- AI avatar with realistic appearance
- Screen sharing capabilities
- Real-time sentiment analysis

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - feel free to use this project for your own applications.

---

**Ready to revolutionize your interview process? Get started now!** 🚀