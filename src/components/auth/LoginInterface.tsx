import React, { useState } from 'react';
import { Bot, Users, Shield, ArrowRight, Eye, EyeOff, Mail, Lock } from 'lucide-react';

interface LoginInterfaceProps {
  onLogin: (user: any, type: 'admin' | 'jobseeker') => void;
}

export const LoginInterface: React.FC<LoginInterfaceProps> = ({ onLogin }) => {
  const [loginType, setLoginType] = useState<'admin' | 'jobseeker'>('jobseeker');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate login process
    await new Promise(resolve => setTimeout(resolve, 1500));

    const user = {
      id: `user-${Date.now()}`,
      name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      email,
      type: loginType,
      joinedAt: new Date(),
      lastLogin: new Date()
    };

    onLogin(user, loginType);
    setIsLoading(false);
  };

  const handleDemoLogin = (type: 'admin' | 'jobseeker') => {
    const demoUsers = {
      admin: {
        id: 'admin-demo',
        name: 'Admin User',
        email: 'admin@company.com',
        type: 'admin'
      },
      jobseeker: {
        id: 'jobseeker-demo',
        name: 'John Candidate',
        email: 'john@example.com',
        type: 'jobseeker'
      }
    };

    onLogin(demoUsers[type], type);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <Bot className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            AI Interview Platform
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Experience the future of hiring with AI-powered interviews, real-time evaluation, and instant certification
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Jobseeker Login */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Job Seekers</h2>
              <p className="text-gray-300">Take AI interviews and earn certificates</p>
            </div>

            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h3 className="text-white font-semibold mb-2">✨ What you get:</h3>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• 10+ specialized interview types</li>
                  <li>• AI-powered evaluation with GPT-4o</li>
                  <li>• Instant certificates and detailed reports</li>
                  <li>• Resume-based personalized questions</li>
                  <li>• Progress tracking and skill analysis</li>
                </ul>
              </div>

              <button
                onClick={() => handleDemoLogin('jobseeker')}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                <Users className="w-5 h-5 mr-2" />
                Enter as Job Seeker
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>

          {/* Admin Login */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Administrators</h2>
              <p className="text-gray-300">Manage interviews and monitor performance</p>
            </div>

            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h3 className="text-white font-semibold mb-2">🎯 Admin features:</h3>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Generate interview links for candidates</li>
                  <li>• Monitor real-time interview sessions</li>
                  <li>• Download detailed evaluation reports</li>
                  <li>• Re-evaluate with custom criteria</li>
                  <li>• Export/import data management</li>
                </ul>
              </div>

              <button
                onClick={() => handleDemoLogin('admin')}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                <Shield className="w-5 h-5 mr-2" />
                Enter as Administrator
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        </div>

        {/* Features Showcase */}
        <div className="mt-16 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">AI-Powered</h3>
            <p className="text-gray-400 text-sm">GPT-4o evaluation with Whisper transcription</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Scalable</h3>
            <p className="text-gray-400 text-sm">Handle 200-300 concurrent interviews</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Enterprise Ready</h3>
            <p className="text-gray-400 text-sm">Azure App Service deployment ready</p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-400 text-sm">
            🚀 Ready for Azure App Service • 🤖 Powered by OpenAI GPT-4o • 🏆 Instant Certification
          </p>
        </div>
      </div>
    </div>
  );
};