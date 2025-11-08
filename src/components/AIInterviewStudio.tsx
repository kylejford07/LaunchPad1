import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Video, VideoOff, MicOff, MessageSquare, Send, Sparkles, CheckCircle2, XCircle, Clock, Brain, Code, AlertCircle, Play, Pause, RotateCcw, TrendingUp, Award, Target, Zap, Eye, EyeOff, ThumbsUp, Users, Rocket, ChevronRight, ArrowRight, Volume2, VolumeX, RefreshCw } from 'lucide-react';
import { AudioRecorder, transcribeAudio } from '../utils/whisper';

type InterviewRole = 'frontend' | 'backend' | 'fullstack' | 'data' | 'ml';
type InterviewLevel = 'entry' | 'mid' | 'senior';
type InterviewStage = 'setup' | 'intro' | 'interview' | 'complete';
type QuestionCategory = 'behavioral' | 'technical' | 'coding' | 'system-design';
type Question = {
  id: string;
  category: QuestionCategory;
  question: string;
  difficulty: 'easy' | 'medium' | 'hard';
  hints?: string[];
  expectedKeywords?: string[];
  followUp?: string;
};
type InterviewerMood = 'thinking' | 'listening' | 'speaking' | 'positive' | 'neutral';
type InterviewConfig = {
  role: InterviewRole;
  level: InterviewLevel;
  duration: number;
};

const interviewQuestions = {
  frontend: [
    {
      id: 'fe-2',
      category: 'coding' as QuestionCategory,
      question: 'Build a simple debounce function that can be used to optimize event handlers.',
      difficulty: 'medium' as const,
      hints: ['Consider setTimeout', 'Clear previous timeouts', 'Return a wrapped function'],
      expectedKeywords: ['setTimeout', 'clearTimeout', 'closure', 'return function']
    },
    {
      id: 'fe-3',
      category: 'behavioral' as QuestionCategory,
      question: 'Tell me about a time you had to optimize a slow-performing web application. What was the problem and how did you solve it?',
      difficulty: 'medium' as const,
      hints: ['Focus on metrics', 'Describe your process', 'Mention team collaboration'],
      expectedKeywords: ['performance', 'metrics', 'optimization', 'collaboration']
    }
  ],
  backend: [] as Question[],
  fullstack: [] as Question[],
  data: [] as Question[],
  ml: [] as Question[]
};

type Answer = {
  questionId: string;
  answer: string;
  timestamp: Date;
  score?: number;
  feedback?: string;
  strengths?: string[];
  improvements?: string[];
};

type AIInterviewStudioProps = Record<string, never>;

const interviewRoles: {
  value: InterviewRole;
  label: string;
  icon: typeof Code;
  color: string;
}[] = [{
  value: 'frontend',
  label: 'Frontend Engineer',
  icon: Code,
  color: 'from-violet-400 to-purple-400'
}, {
  value: 'backend',
  label: 'Backend Engineer',
  icon: Brain,
  color: 'from-cyan-400 to-teal-400'
}, {
  value: 'fullstack',
  label: 'Full Stack Engineer',
  icon: Zap,
  color: 'from-orange-400 to-rose-400'
}, {
  value: 'data',
  label: 'Data Engineer',
  icon: Target,
  color: 'from-emerald-400 to-green-400'
}, {
  value: 'ml',
  label: 'ML Engineer',
  icon: Sparkles,
  color: 'from-blue-400 to-indigo-400'
}];

const interviewLevels: {
  value: InterviewLevel;
  label: string;
  description: string;
}[] = [{
  value: 'entry',
  label: 'Entry Level',
  description: '0-2 years experience'
}, {
  value: 'mid',
  label: 'Mid Level',
  description: '2-5 years experience'
}, {
  value: 'senior',
  label: 'Senior Level',
  description: '5+ years experience'
}];

const mockQuestions: Record<InterviewRole, Question[]> = {
  frontend: [{
    id: 'fe-1',
    category: 'behavioral',
    question: 'Tell me about a time when you had to optimize a slow-loading web application. What was your approach?',
    difficulty: 'medium',
    hints: ['Consider metrics', 'User impact', 'Technical solutions'],
    expectedKeywords: ['performance', 'optimization', 'loading', 'metrics', 'user experience'],
    followUp: 'What tools did you use to identify the bottlenecks?'
  }, {
    id: 'fe-2',
    category: 'technical',
    question: 'Explain the difference between controlled and uncontrolled components in React.',
    difficulty: 'medium',
    hints: ['State management', 'Form handling', 'React patterns'],
    expectedKeywords: ['state', 'props', 'ref', 'controlled', 'uncontrolled'],
    followUp: 'When would you choose one over the other?'
  }, {
    id: 'fe-3',
    category: 'coding',
    question: 'Write a function to debounce user input in a search box. Explain why debouncing is important.',
    difficulty: 'easy',
    hints: ['setTimeout', 'clearTimeout', 'Performance'],
    expectedKeywords: ['debounce', 'setTimeout', 'performance', 'API calls'],
    followUp: 'How would you test this function?'
  }, {
    id: 'fe-4',
    category: 'technical',
    question: 'How would you implement server-side rendering in a React application? What are the benefits?',
    difficulty: 'hard',
    hints: ['SEO', 'Initial load', 'Hydration'],
    expectedKeywords: ['SSR', 'SEO', 'performance', 'hydration', 'Next.js'],
    followUp: 'What challenges might you face with SSR?'
  }],
  backend: [{
    id: 'be-1',
    category: 'behavioral',
    question: 'Describe a situation where you had to design a scalable API. What considerations did you make?',
    difficulty: 'hard',
    hints: ['Load balancing', 'Caching', 'Database design'],
    expectedKeywords: ['scalability', 'API', 'load', 'caching', 'database'],
    followUp: 'How did you handle authentication?'
  }, {
    id: 'be-2',
    category: 'technical',
    question: 'Explain the CAP theorem and how it applies to distributed systems.',
    difficulty: 'hard',
    hints: ['Consistency', 'Availability', 'Partition tolerance'],
    expectedKeywords: ['CAP', 'consistency', 'availability', 'partition', 'distributed'],
    followUp: 'Can you give a real-world example?'
  }, {
    id: 'be-3',
    category: 'system-design',
    question: 'Design a URL shortening service like bit.ly. What are the key components?',
    difficulty: 'hard',
    hints: ['Hashing', 'Database', 'Scalability'],
    expectedKeywords: ['hash', 'database', 'redirect', 'scalability', 'collision'],
    followUp: 'How would you handle collision resolution?'
  }, {
    id: 'be-4',
    category: 'technical',
    question: 'What is the difference between SQL and NoSQL databases? When would you use each?',
    difficulty: 'medium',
    hints: ['Structure', 'Scalability', 'Use cases'],
    expectedKeywords: ['SQL', 'NoSQL', 'relational', 'document', 'scalability'],
    followUp: 'What about consistency guarantees?'
  }],
  fullstack: [{
    id: 'fs-1',
    category: 'behavioral',
    question: 'Tell me about a full-stack project you built from scratch. What was the most challenging part?',
    difficulty: 'medium',
    hints: ['Architecture', 'Frontend-backend integration', 'Deployment'],
    expectedKeywords: ['full-stack', 'frontend', 'backend', 'integration', 'deployment'],
    followUp: 'How did you handle state management across the stack?'
  }, {
    id: 'fs-2',
    category: 'technical',
    question: 'How would you implement real-time notifications in a web application?',
    difficulty: 'hard',
    hints: ['WebSockets', 'Polling', 'Server-sent events'],
    expectedKeywords: ['WebSocket', 'real-time', 'notifications', 'socket.io', 'SSE'],
    followUp: 'What about mobile push notifications?'
  }, {
    id: 'fs-3',
    category: 'system-design',
    question: 'Design a social media feed with infinite scroll. Consider both frontend and backend.',
    difficulty: 'hard',
    hints: ['Pagination', 'Caching', 'Performance'],
    expectedKeywords: ['pagination', 'infinite scroll', 'caching', 'performance', 'API'],
    followUp: 'How would you handle new posts appearing in real-time?'
  }, {
    id: 'fs-4',
    category: 'technical',
    question: 'Explain JWT authentication and its advantages over session-based auth.',
    difficulty: 'medium',
    hints: ['Stateless', 'Token', 'Security'],
    expectedKeywords: ['JWT', 'token', 'stateless', 'authentication', 'security'],
    followUp: 'Where would you store the JWT on the client?'
  }],
  data: [{
    id: 'de-1',
    category: 'behavioral',
    question: 'Describe a time when you had to work with messy, unstructured data. How did you clean and process it?',
    difficulty: 'medium',
    hints: ['Data quality', 'ETL', 'Tools'],
    expectedKeywords: ['data cleaning', 'ETL', 'pipeline', 'quality', 'transformation'],
    followUp: 'What tools did you use for this task?'
  }, {
    id: 'de-2',
    category: 'technical',
    question: 'Explain the difference between a data warehouse and a data lake.',
    difficulty: 'medium',
    hints: ['Structure', 'Storage', 'Use cases'],
    expectedKeywords: ['warehouse', 'lake', 'structured', 'unstructured', 'schema'],
    followUp: 'When would you choose one over the other?'
  }, {
    id: 'de-3',
    category: 'coding',
    question: 'Write a SQL query to find the top 5 customers by total purchase amount in the last year.',
    difficulty: 'easy',
    hints: ['JOIN', 'GROUP BY', 'ORDER BY'],
    expectedKeywords: ['SELECT', 'JOIN', 'GROUP BY', 'ORDER BY', 'LIMIT'],
    followUp: 'How would you optimize this query for a large dataset?'
  }, {
    id: 'de-4',
    category: 'technical',
    question: 'How would you design a real-time data pipeline for streaming analytics?',
    difficulty: 'hard',
    hints: ['Kafka', 'Spark', 'Stream processing'],
    expectedKeywords: ['streaming', 'Kafka', 'pipeline', 'real-time', 'processing'],
    followUp: 'What about fault tolerance and data recovery?'
  }],
  ml: [{
    id: 'ml-1',
    category: 'behavioral',
    question: 'Tell me about a machine learning model you deployed to production. What challenges did you face?',
    difficulty: 'hard',
    hints: ['Deployment', 'Monitoring', 'Performance'],
    expectedKeywords: ['model', 'deployment', 'production', 'monitoring', 'MLOps'],
    followUp: 'How did you handle model drift?'
  }, {
    id: 'ml-2',
    category: 'technical',
    question: 'Explain the bias-variance tradeoff and how it relates to overfitting.',
    difficulty: 'medium',
    hints: ['Model complexity', 'Generalization', 'Training vs test'],
    expectedKeywords: ['bias', 'variance', 'overfitting', 'underfitting', 'generalization'],
    followUp: 'How would you detect overfitting in your model?'
  }, {
    id: 'ml-3',
    category: 'technical',
    question: 'What is the difference between supervised and unsupervised learning? Give examples.',
    difficulty: 'easy',
    hints: ['Labels', 'Training data', 'Use cases'],
    expectedKeywords: ['supervised', 'unsupervised', 'labels', 'classification', 'clustering'],
    followUp: 'What about semi-supervised learning?'
  }, {
    id: 'ml-4',
    category: 'system-design',
    question: 'Design a recommendation system for an e-commerce platform. What algorithms would you use?',
    difficulty: 'hard',
    hints: ['Collaborative filtering', 'Content-based', 'Hybrid'],
    expectedKeywords: ['recommendation', 'collaborative', 'filtering', 'matrix', 'similarity'],
    followUp: 'How would you handle the cold start problem?'
  }]
};

// @component: AIInterviewStudio
export const AIInterviewStudio = (_props: AIInterviewStudioProps) => {
  const [stage, setStage] = useState<InterviewStage>('setup');
  const [config, setConfig] = useState<Partial<InterviewConfig>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [interviewerMood, setInterviewerMood] = useState<InterviewerMood>('neutral');
  const [isRecording, setIsRecording] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isGrading, setIsGrading] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState("alloy");
  const [apiKeyConfigured, setApiKeyConfigured] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [timerStarted, setTimerStarted] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);

  // Interview limit tracking
  const getInterviewCount = () => {
    const today = new Date().toDateString();
    const stored = localStorage.getItem('interviewData');
    if (stored) {
      const data = JSON.parse(stored);
      if (data.date === today) {
        return data.count;
      }
    }
    return 0;
  };

  const incrementInterviewCount = () => {
    const today = new Date().toDateString();
    const count = getInterviewCount() + 1;
    localStorage.setItem('interviewData', JSON.stringify({ date: today, count }));
    return count;
  };

  const hasReachedLimit = () => {
    return getInterviewCount() >= 3;
  };

  // Check API key on mount
  useEffect(() => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    setApiKeyConfigured(!!apiKey);
    if (!apiKey) {
      console.warn("⚠️ OpenAI API key not configured. Voice features will be disabled.");
      console.log("📝 To enable voice:");
      console.log("1. Create a .env file in the project root");
      console.log("2. Add: VITE_OPENAI_API_KEY=your_api_key_here");
      console.log("3. Get your API key from: https://platform.openai.com/api-keys");
    }
  }, []);
  const availableVoices = [{
    id: "alloy",
    name: "Alloy",
    description: "Balanced and confident"
  }, {
    id: "echo",
    name: "Echo",
    description: "Clear and articulate"
  }, {
    id: "fable",
    name: "Fable",
    description: "Expressive and warm"
  }, {
    id: "onyx",
    name: "Onyx",
    description: "Deep and professional"
  }, {
    id: "nova",
    name: "Nova",
    description: "Friendly and energetic"
  }, {
    id: "shimmer",
    name: "Shimmer",
    description: "Soft and pleasant"
  }];
  const questions = config.role ? mockQuestions[config.role] : [];
  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? (currentQuestionIndex + 1) / questions.length * 100 : 0;
  
  // Voice is enabled by default if API key is present
  // No auto-test on mount to avoid unnecessary alerts

  // Enhanced humanized speech synthesis with OpenAI TTS
  const speak = async (text: string, retryCount = 0, onComplete?: () => void) => {
    if (!voiceEnabled) {
      onComplete?.();
      return;
    }
    const DEBUG = true; // Force debug mode to help troubleshoot
    console.log('🎯 Attempting to speak...', { text, retryCount });
    
    // Check if API key is configured
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      console.error("❌ OpenAI API key not found! Please set VITE_OPENAI_API_KEY in your .env file");
      // Silently fail - user will see the warning banner instead
      return;
    }

    setIsSpeaking(true);
    try {
      console.log(`🎤 Speaking with voice: ${selectedVoice}`);
      console.log('🔑 API Key present:', apiKey.slice(0, 4) + '...' + apiKey.slice(-4));
      
      // Setup AbortController for timeout
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000); // Extended to 15s timeout

      const response = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "tts-1-hd",
          voice: selectedVoice,
          input: text,
          speed: 1.15
        }),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) {
        console.error("❌ Response not OK:", response.status, response.statusText);
        const errorData = await response.json().catch(() => ({}));
        console.error("Error details:", errorData);
        
        // Retry logic for 5xx errors or network issues
        if ((response.status >= 500 || response.status === 429) && retryCount < 3) {
          const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
          console.log(`🔄 Retrying in ${delay}ms... (attempt ${retryCount + 1}/3)`);
          await new Promise(resolve => setTimeout(resolve, delay));
          setIsSpeaking(false);
          return speak(text, retryCount + 1);
        }
        
        setIsSpeaking(false);
        throw new Error(`TTS API request failed: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);

      // Pre-load audio
      await new Promise((resolve, reject) => {
        audio.oncanplaythrough = resolve;
        audio.onerror = reject;
        audio.load();
      });

      setIsSpeaking(true);
      setInterviewerMood("speaking");

      audio.onended = () => {
        setIsSpeaking(false);
        setInterviewerMood("neutral");
        URL.revokeObjectURL(url);
        onComplete?.(); // Call the callback when speech finishes
      };

      audio.onerror = err => {
        DEBUG && console.error("❌ Audio playback error:", err);
        setIsSpeaking(false);
        setInterviewerMood("neutral");
        URL.revokeObjectURL(url);
        
        // Retry playback once on error
        if (retryCount < 1) {
          DEBUG && console.log("🔄 Retrying audio playback...");
          setTimeout(() => speak(text, retryCount + 1), 1000);
        }
      };

      await audio.play();
      DEBUG && console.log("✅ Voice playback started successfully");
      
    } catch (err) {
      DEBUG && console.error("❌ Voice error:", err);
      setIsSpeaking(false);
      setInterviewerMood("neutral");

      // Show user-friendly error message
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          console.error("Request timed out. Check your network connection.");
          // Retry once on timeout
          if (retryCount < 1) {
            DEBUG && console.log("🔄 Retrying after timeout...");
            return speak(text, retryCount + 1);
          }
        } else if (err.message.includes("401")) {
          console.error("Invalid OpenAI API key. Please check your .env file.");
        } else if (err.message.includes("429")) {
          console.error("OpenAI API rate limit reached. Please try again later.");
        } else {
          console.error("Voice playback failed. Check console for details.");
        }
      }
    }
  };

  // Quick test function for TTS
  const testVoice = async () => {
    await speak("Hello! I'm Alex, your AI interviewer. I'll help you practice technical interviews with voice feedback.");
  };

  // Function to repeat the current question
  const repeatQuestion = () => {
    if (currentQuestion) {
      speak(currentQuestion.question);
    }
  };

  // AI-powered grading using Claude API simulation
  const gradeAnswerWithAI = async (question: Question, answer: string): Promise<{
    score: number;
    feedback: string;
    strengths: string[];
    improvements: string[];
  }> => {
    setIsGrading(true);

    // Simulate API call to Claude (in production, this would be a real API call)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Advanced scoring algorithm based on multiple factors
    let score = 0;
    const strengths: string[] = [];
    const improvements: string[] = [];

    // 1. Technical Accuracy - Keyword matching (33 points) - MOST IMPORTANT
    const keywordMatches = question.expectedKeywords?.filter(keyword => answer.toLowerCase().includes(keyword.toLowerCase())) || [];
    const keywordCoverage = keywordMatches.length / (question.expectedKeywords?.length || 1);
    
    // Heavily weight accuracy - if they hit the key concepts, they understand it
    let keywordScore = 0;
    if (question.difficulty === 'hard') {
      // For hard questions, 50% coverage = full points (very lenient)
      keywordScore = Math.min(33, Math.round((keywordCoverage / 0.5) * 33));
    } else if (question.difficulty === 'medium') {
      // For medium, 60% coverage = full points
      keywordScore = Math.min(33, Math.round((keywordCoverage / 0.6) * 33));
    } else {
      // For easy, 70% coverage = full points
      keywordScore = Math.min(33, Math.round((keywordCoverage / 0.7) * 33));
    }
    score += keywordScore;
    
    if (keywordCoverage >= 0.7) {
      strengths.push(`Excellent technical accuracy (${keywordMatches.length}/${question.expectedKeywords?.length || 0} key concepts)`);
    } else if (keywordCoverage >= 0.5) {
      strengths.push('Good grasp of core concepts');
    } else if (keywordCoverage >= 0.3) {
      improvements.push(`Cover more key concepts (${keywordMatches.length}/${question.expectedKeywords?.length || 0})`);
    } else {
      improvements.push(`Missing critical concepts (${keywordMatches.length}/${question.expectedKeywords?.length || 0})`);
    }

    // 2. Length/Completeness (12 points) - 12% of grade
    const words = answer.trim().split(/\s+/).length;
    const hasCode = /```|function|const|let|var|class|def|public|private|\{|\}|=>/.test(answer);
    const isCodingQuestion = question.category === 'coding';
    
    let completenessScore = 0;
    
    if (isCodingQuestion && hasCode) {
      // For coding questions, having code is most important
      completenessScore = 12;
      strengths.push('Provided code implementation');
    } else if (isCodingQuestion && !hasCode) {
      completenessScore = 4;
      improvements.push('Include actual code implementation');
    } else if (words >= 50) {
      // For non-coding, just check if they explained enough
      completenessScore = 12;
    } else if (words >= 30) {
      completenessScore = 8;
    } else {
      completenessScore = 5;
      improvements.push('Provide more complete explanation');
    }
    score += completenessScore;

    // 3. Explanation Quality (18 points) - Did they explain HOW/WHY?
    const sentences = answer.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const hasExamples = answer.toLowerCase().includes('example') || answer.toLowerCase().includes('for instance') || answer.toLowerCase().includes('such as') || answer.toLowerCase().includes('like when') || answer.toLowerCase().includes('e.g.');
    const hasExplanation = sentences >= 2; // At least 2 sentences shows they explained
    
    let explanationScore = 6; // Base points
    
    if (hasExplanation) {
      explanationScore += 6;
    }
    
    if (hasExamples) {
      explanationScore += 6;
      strengths.push('Included helpful examples');
    }
    
    score += Math.min(18, explanationScore);

    // 4. Technical Depth (22 points) - Specific implementation details
    const technicalIndicators = ['implement', 'architecture', 'design', 'optimize', 'performance', 'scale', 'algorithm', 'complexity', 'pattern', 'best practice', 'framework', 'library', 'api', 'database', 'cache', 'async', 'sync', 'thread', 'memory', 'latency', 'component', 'function', 'method', 'class', 'interface', 'module', 'service', 'system', 'return', 'parameter', 'variable', 'loop', 'condition', 'array', 'object', 'string', 'number'];
    const technicalMatches = technicalIndicators.filter(indicator => answer.toLowerCase().includes(indicator));
    
    let depthScore = 8; // Base points for technical content
    
    if (technicalMatches.length >= 5) {
      depthScore = 22;
      strengths.push(`Excellent technical depth (${technicalMatches.length} technical terms)`);
    } else if (technicalMatches.length >= 3) {
      depthScore = 18;
      strengths.push('Good technical detail');
    } else if (technicalMatches.length >= 1) {
      depthScore = 13;
    } else {
      improvements.push('Add more specific technical details');
    }
    score += depthScore;

    // 5. Correctness & Reasoning (15 points) - Did they show understanding?
    const problemSolvingKeywords = ['because', 'therefore', 'thus', 'so', 'since', 'due to', 'as a result', 'this allows', 'this ensures', 'this helps', 'this way', 'in order to'];
    const problemSolvingMatches = problemSolvingKeywords.filter(keyword => answer.toLowerCase().includes(keyword));
    const hasReasoning = problemSolvingMatches.length > 0;
    
    let reasoningScore = 8; // Base points
    
    if (hasReasoning) {
      reasoningScore += 7;
      strengths.push('Explained reasoning clearly');
    } else {
      improvements.push('Explain WHY your solution works');
    }
    
    score += reasoningScore;

    // Adjust score based on difficulty - VERY generous for hard questions
    if (question.difficulty === 'easy' && score < 70) {
      score = Math.max(0, score - 2); // Tiny penalty for incomplete easy answers
    } else if (question.difficulty === 'medium' && score >= 60) {
      score = Math.min(100, score + 5); // Bonus for good medium answers
    } else if (question.difficulty === 'hard' && score >= 55) {
      score = Math.min(100, score + 10); // Large bonus for hard questions - accuracy matters most!
    }
    
    // For coding questions, if they provided code with key concepts, boost score
    if (isCodingQuestion && hasCode && keywordCoverage >= 0.5) {
      score = Math.min(100, score + 5);
      strengths.push('Provided working code solution');
    }

    // Generate precise, actionable feedback
    let feedback = '';
    const finalScore = Math.round(score);
    
    if (finalScore >= 95) {
      feedback = `Exceptional answer (${finalScore}/100)! You demonstrated mastery with comprehensive technical details, clear examples, and strong analytical thinking.`;
    } else if (finalScore >= 85) {
      feedback = `Excellent response (${finalScore}/100)! You covered the key concepts well with good technical depth. Minor improvements possible in ${improvements.length > 0 ? improvements[0].toLowerCase() : 'structure'}.`;
    } else if (finalScore >= 75) {
      feedback = `Good answer (${finalScore}/100). You hit the main points but there's room to strengthen your response. Focus on: ${improvements.slice(0, 2).join('; ')}.`;
    } else if (finalScore >= 65) {
      feedback = `Adequate attempt (${finalScore}/100). You touched on some concepts but need more depth. Key areas to improve: ${improvements.slice(0, 2).join('; ')}.`;
    } else if (finalScore >= 50) {
      feedback = `Below expectations (${finalScore}/100). Your answer lacks sufficient detail and technical accuracy. Critical improvements needed: ${improvements.slice(0, 3).join('; ')}.`;
    } else {
      feedback = `Needs significant improvement (${finalScore}/100). The answer is incomplete and missing key concepts. Please review the question and provide: ${improvements.slice(0, 3).join('; ')}.`;
    }
    setIsGrading(false);
    return {
      score: Math.round(score),
      feedback,
      strengths,
      improvements
    };
  };

  // Timer effect - only starts when Alex begins speaking the first question
  useEffect(() => {
    if (stage === 'interview' && timerStarted) {
      const timer = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [stage, timerStarted]);

  // Speak question when it changes
  useEffect(() => {
    if (stage === 'interview' && currentQuestion && voiceEnabled) {
      // Add longer pause for first question after intro (4 seconds)
      // Shorter pause for subsequent questions (500ms)
      const delay = currentQuestionIndex === 0 ? 4000 : 500;
      setTimeout(() => {
        speak(currentQuestion.question);
        // Start timer when first question begins speaking
        if (currentQuestionIndex === 0 && !timerStarted) {
          setTimerStarted(true);
        }
      }, delay);
    }
  }, [currentQuestionIndex, stage]);

  // Simulate AI mood changes
  useEffect(() => {
    if (stage === 'interview' && !isSpeaking) {
      const moodInterval = setInterval(() => {
        const moods: InterviewerMood[] = ['thinking', 'listening', 'neutral'];
        const randomMood = moods[Math.floor(Math.random() * moods.length)];
        setInterviewerMood(randomMood);
      }, 5000);
      return () => clearInterval(moodInterval);
    }
  }, [stage, isSpeaking]);
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  const handleStartInterview = () => {
    // Check if user has reached daily limit
    if (hasReachedLimit()) {
      setShowPaywall(true);
      speak("I'm sorry, but you've used all 3 of your free interviews for today. To continue practicing, please upgrade to premium for unlimited interviews!");
      return;
    }

    if (config.role && config.level && config.duration) {
      // Increment interview count
      incrementInterviewCount();
      
      setStage('intro');
      speak(
        "Hi! I'm Alex, your AI interviewer. Let's get started with your technical interview!",
        0,
        () => {
          // Wait 2 more seconds after intro finishes, then start interview
          setTimeout(() => {
            setStage('interview');
            setInterviewerMood('speaking');
          }, 2000);
        }
      );
    }
  };

  // Voice recording with Whisper AI
  const handleToggleRecording = async () => {
    if (isRecording) {
      // Stop recording and transcribe
      try {
        setIsRecording(false);
        setIsTranscribing(true);
        setInterviewerMood('thinking');
        
        const audioBlob = await audioRecorderRef.current?.stop();
        if (audioBlob) {
          const transcript = await transcribeAudio(audioBlob);
          setCurrentAnswer(prev => prev + (prev ? ' ' : '') + transcript);
          console.log('✅ Transcribed:', transcript);
        }
      } catch (error) {
        console.error('Recording error:', error);
        alert('Failed to transcribe audio. Please try again.');
      } finally {
        setIsTranscribing(false);
        setInterviewerMood('listening');
      }
    } else {
      // Start recording
      try {
        if (!audioRecorderRef.current) {
          audioRecorderRef.current = new AudioRecorder();
        }
        await audioRecorderRef.current.start();
        setIsRecording(true);
        setInterviewerMood('listening');
        console.log('🎤 Recording started');
      } catch (error) {
        console.error('Failed to start recording:', error);
        alert('Microphone access denied. Please allow microphone access to use voice input.');
      }
    }
  };

  // Camera/Video toggle
  const handleToggleVideo = async () => {
    if (videoEnabled) {
      // Turn off video
      if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach(track => track.stop());
        videoStreamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setVideoEnabled(false);
      console.log('📹 Camera stopped');
    } else {
      // Turn on video
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          } 
        });
        videoStreamRef.current = stream;
        setVideoEnabled(true);
        console.log('📹 Camera started', stream);
      } catch (error) {
        console.error('Failed to start camera:', error);
        alert('Camera access denied. Please allow camera access to enable video.');
      }
    }
  };

  // Update video element when stream changes
  useEffect(() => {
    if (videoRef.current && videoStreamRef.current && videoEnabled) {
      videoRef.current.srcObject = videoStreamRef.current;
      videoRef.current.play().catch(err => console.error('Video play error:', err));
    }
  }, [videoEnabled]);

  const handleSubmitAnswer = async () => {
    if (currentAnswer.trim()) {
      setInterviewerMood('thinking');

      // Use AI grading
      const gradingResult = await gradeAnswerWithAI(currentQuestion, currentAnswer);
      const newAnswer: Answer = {
        questionId: currentQuestion.id,
        answer: currentAnswer.trim(),
        timestamp: new Date(),
        score: gradingResult.score,
        feedback: gradingResult.feedback,
        strengths: gradingResult.strengths,
        improvements: gradingResult.improvements
      };
      setAnswers([...answers, newAnswer]);
      setCurrentAnswer('');

      // Personalized spoken feedback - wait for speech to finish before moving on
      const isLastQuestion = currentQuestionIndex >= questions.length - 1;
      let feedbackText = '';
      
      if (gradingResult.score >= 85) {
        setInterviewerMood('positive');
        feedbackText = isLastQuestion 
          ? "That was fantastic! You really nailed the key concepts there. Excellent work on this final question!"
          : "That was fantastic! You really nailed the key concepts there. I'm impressed with your depth of knowledge.";
      } else if (gradingResult.score >= 70) {
        setInterviewerMood('positive');
        feedbackText = isLastQuestion
          ? "Nice work! You covered the important points well. That shows solid understanding."
          : "Nice work! You covered the important points well. That shows solid understanding.";
      } else {
        setInterviewerMood('neutral');
        feedbackText = isLastQuestion
          ? "Thanks for your answer. There's definitely room to expand on some of those concepts."
          : "Thanks for your answer. There's definitely room to expand on some of those concepts. Let's keep going!";
      }
      
      // Speak feedback and wait for it to complete before moving to next question
      speak(feedbackText, 0, () => {
        // Wait 2 more seconds after feedback finishes, then move to next question
        setTimeout(() => {
          if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setInterviewerMood('speaking');
            setShowHints(false);
          } else {
            setStage('complete');
            speak("Congratulations! You've completed the interview. You did a great job today! Let me show you your detailed results and feedback.");
          }
        }, 2000);
      });
    }
  };
  const calculateOverallScore = () => {
    if (answers.length === 0) return 0;
    const total = answers.reduce((sum, a) => sum + (a.score || 0), 0);
    return Math.round(total / answers.length);
  };
  const getCategoryIcon = (category: QuestionCategory) => {
    switch (category) {
      case 'behavioral':
        return Users;
      case 'technical':
        return Brain;
      case 'coding':
        return Code;
      case 'system-design':
        return Target;
      default:
        return MessageSquare;
    }
  };
  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
    if (voiceEnabled) {
      setIsSpeaking(false);
      setInterviewerMood("neutral");
    }
  };

  // @return
  return <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div initial={{
        opacity: 0,
        y: -20
      }} animate={{
        opacity: 1,
        y: 0
      }} className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div animate={{
            rotate: [0, 10, -10, 0]
          }} transition={{
            duration: 2,
            repeat: Infinity
          }}>
              <Rocket className="w-10 h-10 text-indigo-600" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              AI Interview Studio
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Practice technical interviews with our AI interviewer and get instant, detailed feedback
          </p>
          
          {/* Interview Counter with Reset Button */}
          <div className="mt-4 flex items-center gap-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <span className="text-sm font-semibold text-gray-700">
                Free Interviews Today: <span className="text-indigo-600">{3 - getInterviewCount()}/3</span>
              </span>
            </div>
            
            {/* Demo Reset Button */}
            <button
              onClick={() => {
                localStorage.removeItem('interviewData');
                window.location.reload();
              }}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-full shadow-md transition-all flex items-center gap-2"
              title="Reset interview count (Demo only)"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Demo
            </button>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* API Key Warning Banner */}
          {!apiKeyConfigured && <motion.div initial={{
          opacity: 0,
          y: -10
        }} animate={{
          opacity: 1,
          y: 0
        }} exit={{
          opacity: 0,
          y: -10
        }} className="max-w-4xl mx-auto mb-8 bg-amber-50 border-2 border-amber-300 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-amber-900 mb-2">
                    Voice Feature Not Configured
                  </h3>
                  <p className="text-sm text-amber-800 mb-3">
                    To enable AI voice interviewer, you need to set up your OpenAI API key:
                  </p>
                  <ol className="text-sm text-amber-800 space-y-1 list-decimal list-inside mb-3">
                    <li>Create a <code className="bg-amber-100 px-2 py-0.5 rounded">.env</code> file in your project root</li>
                    <li>Add: <code className="bg-amber-100 px-2 py-0.5 rounded">VITE_OPENAI_API_KEY=your_key_here</code></li>
                    <li>Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-amber-900 font-semibold underline hover:text-amber-700">platform.openai.com</a></li>
                    <li>Restart your development server</li>
                  </ol>
                  <p className="text-xs text-amber-700">
                    💡 The interview will still work without voice - you just won't hear Alex speak!
                  </p>
                </div>
              </div>
            </motion.div>}

          {/* Paywall Modal */}
          {showPaywall && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowPaywall(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Award className="w-10 h-10 text-white" />
                  </div>
                  
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Upgrade to Premium
                  </h2>
                  
                  <p className="text-lg text-gray-600 mb-2">
                    You've completed your <span className="font-bold text-indigo-600">3 free interviews</span> for today!
                  </p>
                  
                  <p className="text-gray-600 mb-8">
                    Upgrade to Premium for unlimited interviews and advanced features.
                  </p>

                  {/* Pricing Cards */}
                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {/* Monthly Plan */}
                    <div className="border-2 border-gray-200 rounded-2xl p-6 hover:border-indigo-500 transition-all">
                      <div className="text-sm font-semibold text-indigo-600 mb-2">MONTHLY</div>
                      <div className="text-4xl font-bold text-gray-900 mb-1">
                        $7.99
                        <span className="text-lg text-gray-500 font-normal">/month</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">Billed monthly</p>
                      <button className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all">
                        Choose Monthly
                      </button>
                    </div>

                    {/* Yearly Plan */}
                    <div className="border-2 border-indigo-500 rounded-2xl p-6 relative bg-gradient-to-br from-indigo-50 to-purple-50">
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold rounded-full">
                        BEST VALUE
                      </div>
                      <div className="text-sm font-semibold text-indigo-600 mb-2">YEARLY</div>
                      <div className="text-4xl font-bold text-gray-900 mb-1">
                        $64.99
                        <span className="text-lg text-gray-500 font-normal">/year</span>
                      </div>
                      <p className="text-sm text-green-600 font-semibold mb-4">Save $31 (32% off)</p>
                      <button className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all">
                        Choose Yearly
                      </button>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="text-left bg-gray-50 rounded-2xl p-6 mb-6">
                    <h3 className="font-bold text-gray-900 mb-4">Premium Features:</h3>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">Unlimited daily interviews</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">Advanced AI feedback and analysis</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">Interview history and progress tracking</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">Priority support</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => setShowPaywall(false)}
                    className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                  >
                    Maybe later
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Setup Stage */}
          {stage === 'setup' && <motion.div key="setup" initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} exit={{
          opacity: 0
        }} className="space-y-8">
              {/* Role Selection */}
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Target className="w-7 h-7 text-indigo-600" />
                  Choose Your Role
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {interviewRoles.map(role => {
                const Icon = role.icon;
                const isSelected = config.role === role.value;
                return <motion.button key={role.value} whileHover={{
                  scale: 1.05
                }} whileTap={{
                  scale: 0.95
                }} onClick={() => setConfig({
                  ...config,
                  role: role.value
                })} className={`p-6 rounded-2xl border-2 transition-all ${isSelected ? 'border-indigo-500 bg-indigo-50 shadow-lg' : 'border-gray-200 bg-white hover:border-indigo-300'}`}>
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center mx-auto mb-3`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-sm font-semibold text-gray-900">{role.label}</div>
                      </motion.button>;
              })}
                </div>
              </div>

              {/* Level Selection */}
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <TrendingUp className="w-7 h-7 text-purple-600" />
                  Experience Level
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {interviewLevels.map(level => {
                const isSelected = config.level === level.value;
                return <motion.button key={level.value} whileHover={{
                  scale: 1.02
                }} whileTap={{
                  scale: 0.98
                }} onClick={() => setConfig({
                  ...config,
                  level: level.value
                })} className={`p-6 rounded-2xl border-2 transition-all text-left relative ${isSelected ? 'border-purple-500 bg-purple-50 shadow-lg' : 'border-gray-200 bg-white hover:border-purple-300'}`}>
                        <div className="font-bold text-gray-900 mb-2">{level.label}</div>
                        <div className="text-sm text-gray-600">{level.description}</div>
                        {isSelected && <motion.div initial={{
                    scale: 0
                  }} animate={{
                    scale: 1
                  }} className="absolute top-4 right-4">
                            <CheckCircle2 className="w-6 h-6 text-purple-600" />
                          </motion.div>}
                      </motion.button>;
              })}
                </div>
              </div>

              {/* Duration Selection */}
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Clock className="w-7 h-7 text-teal-600" />
                  Interview Duration
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[15, 30, 45, 60].map(duration => {
                const isSelected = config.duration === duration;
                return <motion.button key={duration} whileHover={{
                  scale: 1.02
                }} whileTap={{
                  scale: 0.98
                }} onClick={() => setConfig({
                  ...config,
                  duration
                })} className={`p-6 rounded-2xl border-2 transition-all ${isSelected ? 'border-teal-500 bg-teal-50 shadow-lg' : 'border-gray-200 bg-white hover:border-teal-300'}`}>
                        <div className="text-3xl font-bold text-gray-900 mb-1">{duration}</div>
                        <div className="text-sm text-gray-600">minutes</div>
                      </motion.button>;
              })}
                </div>
              </div>

              {/* Voice Selection */}
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Volume2 className="w-7 h-7 text-indigo-600" />
                  Choose Interview Voice
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {availableVoices.map(voice => {
                const isSelected = selectedVoice === voice.id;
                return <motion.button key={voice.id} whileHover={{
                  scale: 1.05
                }} whileTap={{
                  scale: 0.95
                }} onClick={() => setSelectedVoice(voice.id)} className={`p-5 rounded-2xl border-2 transition-all text-center ${isSelected ? 'border-indigo-500 bg-indigo-50 shadow-lg' : 'border-gray-200 bg-white hover:border-indigo-300'}`}>
                        <div className="text-lg font-semibold text-gray-900 mb-1">{voice.name}</div>
                        <div className="text-xs text-gray-600">{voice.description}</div>
                        {isSelected && <motion.div initial={{
                    scale: 0
                  }} animate={{
                    scale: 1
                  }} className="mt-2">
                            <CheckCircle2 className="w-5 h-5 text-indigo-600 mx-auto" />
                          </motion.div>}
                      </motion.button>;
              })}
                </div>
              </div>

              {/* Start Button */}
              <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} className="text-center">
                <motion.button whileHover={{
              scale: config.role && config.level && config.duration ? 1.05 : 1
            }} whileTap={{
              scale: config.role && config.level && config.duration ? 0.95 : 1
            }} onClick={handleStartInterview} disabled={!config.role || !config.level || !config.duration} className="px-12 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto">
                  Start Interview
                  <Play className="w-6 h-6" />
                </motion.button>
              </motion.div>
            </motion.div>}

          {/* Intro Stage */}
          {stage === 'intro' && <motion.div key="intro" initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} exit={{
          opacity: 0
        }} className="flex flex-col items-center justify-center py-20">
              <motion.div animate={{
            scale: isSpeaking ? [1, 1.05, 1] : 1
          }} transition={{
            duration: 0.5,
            repeat: isSpeaking ? Infinity : 0
          }} className="w-48 h-48 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 p-2 mb-8 shadow-2xl">
                <div className="w-full h-full rounded-full overflow-hidden border-4 border-white relative">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=b6e3f4&accessories=prescription02&clothing=blazerShirt&eyes=happy&eyebrows=raisedExcited&mouth=smile&top=shortHair&topColor=auburn" alt="AI Interviewer Alex" className="w-full h-full object-cover" onError={e => {
                // Fallback if image fails to load
                (e.currentTarget as HTMLImageElement).src = "https://api.dicebear.com/7.x/personas/svg?seed=Alex";
              }} />
                  {isSpeaking && <motion.div animate={{
                opacity: [0.3, 0.6, 0.3]
              }} transition={{
                duration: 1,
                repeat: Infinity
              }} className="absolute inset-0 bg-gradient-to-br from-indigo-400/30 to-purple-400/30" />}
                </div>
              </motion.div>

              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Meet Alex - Your AI Interviewer
              </h2>
              <p className="text-gray-600 mb-8 text-center max-w-md">
                Hi! I'm excited to conduct your {config.role} interview today. Let's get started!
              </p>

              <div className="flex gap-3">
                {[0, 1, 2, 3].map(i => <motion.div key={i} animate={{
              scale: [1, 1.5, 1],
              opacity: [1, 0.5, 1]
            }} transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2
            }} className="w-3 h-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full" />)}
              </div>
            </motion.div>}

          {/* Interview Stage */}
          {stage === 'interview' && currentQuestion && <motion.div key="interview" initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} exit={{
          opacity: 0
        }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left: AI Interviewer */}
              <div className="lg:col-span-1 space-y-6">
                {/* AI Avatar */}
                <div className="bg-white rounded-3xl shadow-xl p-8">
                  <div className="relative">
                    <motion.div animate={{
                  scale: isSpeaking ? [1, 1.03, 1] : 1
                }} transition={{
                  duration: 0.6,
                  repeat: isSpeaking ? Infinity : 0
                }} className="w-48 h-48 mx-auto rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 p-2 shadow-2xl">
                      <div className="w-full h-full rounded-full overflow-hidden border-4 border-white relative">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=b6e3f4&accessories=prescription02&clothing=blazerShirt&eyes=happy&eyebrows=raisedExcited&mouth=smile&top=shortHair&topColor=auburn" alt="AI Interviewer Alex" className="w-full h-full object-cover" onError={e => {
                      (e.currentTarget as HTMLImageElement).src = "https://api.dicebear.com/7.x/personas/svg?seed=Alex";
                    }} />
                        {isSpeaking && <motion.div animate={{
                      opacity: [0.3, 0.6, 0.3]
                    }} transition={{
                      duration: 1,
                      repeat: Infinity
                    }} className="absolute inset-0 bg-gradient-to-br from-indigo-400/30 to-purple-400/30" />}
                      </div>
                    </motion.div>

                    {/* Mood Indicator */}
                    <motion.div animate={{
                  scale: [1, 1.1, 1]
                }} transition={{
                  duration: 1.5,
                  repeat: Infinity
                }} className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-2 bg-white rounded-full shadow-lg border-2 border-indigo-200">
                      <div className="flex items-center gap-2">
                        {interviewerMood === 'thinking' && <>
                            <Brain className="w-4 h-4 text-indigo-600" />
                            <span className="text-sm font-semibold text-gray-900">Thinking...</span>
                          </>}
                        {interviewerMood === 'listening' && <>
                            <Eye className="w-4 h-4 text-teal-600" />
                            <span className="text-sm font-semibold text-gray-900">Listening</span>
                          </>}
                        {interviewerMood === 'speaking' && <>
                            <MessageSquare className="w-4 h-4 text-purple-600" />
                            <span className="text-sm font-semibold text-gray-900">Speaking</span>
                          </>}
                        {interviewerMood === 'positive' && <>
                            <ThumbsUp className="w-4 h-4 text-emerald-600" />
                            <span className="text-sm font-semibold text-gray-900">Great!</span>
                          </>}
                        {interviewerMood === 'neutral' && <>
                            <Sparkles className="w-4 h-4 text-indigo-600" />
                            <span className="text-sm font-semibold text-gray-900">Ready</span>
                          </>}
                      </div>
                    </motion.div>
                  </div>

                  <div className="text-center mt-6 mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">Alex Chen</h3>
                    <p className="text-sm text-gray-600">Senior Technical Interviewer</p>
                  </div>

                  {/* Your Video Preview */}
                  {videoEnabled && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="mt-6"
                    >
                      <div className="relative rounded-2xl overflow-hidden shadow-lg border-4 border-purple-200 bg-gray-900">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-auto min-h-[200px] object-cover"
                        />
                        <div className="absolute top-2 left-2 px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                          LIVE
                        </div>
                      </div>
                      <p className="text-center text-sm text-gray-600 mt-2">Your Camera</p>
                    </motion.div>
                  )}

                  {/* Interview Controls */}
                  <div className="mt-8 space-y-4">
                    <div className="flex items-center justify-center">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-gray-600" />
                        <span className="font-mono text-2xl font-bold text-gray-900">
                          {formatTime(timeElapsed)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      <button onClick={toggleVoice} disabled={!apiKeyConfigured} className={`py-3 rounded-xl font-semibold transition-all ${voiceEnabled && apiKeyConfigured ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'} disabled:opacity-50 disabled:cursor-not-allowed`} title={!apiKeyConfigured ? "API key required for voice" : voiceEnabled ? "Mute Alex" : "Unmute Alex"}>
                        {voiceEnabled && apiKeyConfigured ? <Volume2 className="w-5 h-5 mx-auto" /> : <VolumeX className="w-5 h-5 mx-auto" />}
                      </button>
                      <button onClick={repeatQuestion} disabled={!currentQuestion || isSpeaking || !apiKeyConfigured} className="py-3 rounded-xl font-semibold transition-all bg-indigo-100 text-indigo-700 hover:bg-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed" title={!apiKeyConfigured ? "API key required for voice" : "Repeat Question"}>
                        <RefreshCw className="w-5 h-5 mx-auto" />
                      </button>
                      <button 
                        onClick={handleToggleVideo} 
                        className={`py-3 rounded-xl font-semibold transition-all ${
                          videoEnabled ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        title={videoEnabled ? 'Turn off camera' : 'Turn on camera'}
                      >
                        {videoEnabled ? <Video className="w-5 h-5 mx-auto" /> : <VideoOff className="w-5 h-5 mx-auto" />}
                      </button>
                      <button 
                        onClick={handleToggleRecording} 
                        disabled={isTranscribing}
                        className={`py-3 rounded-xl font-semibold transition-all ${
                          isRecording ? 'bg-red-500 text-white animate-pulse' : 
                          isTranscribing ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        title={isRecording ? 'Stop recording' : isTranscribing ? 'Transcribing...' : 'Start voice recording'}
                      >
                        {isTranscribing ? (
                          <RefreshCw className="w-5 h-5 mx-auto animate-spin" />
                        ) : isRecording ? (
                          <Mic className="w-5 h-5 mx-auto" />
                        ) : (
                          <MicOff className="w-5 h-5 mx-auto" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div className="bg-white rounded-3xl shadow-xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-gray-900">Progress</span>
                    <span className="text-sm font-semibold text-indigo-600">
                      {currentQuestionIndex + 1} / {questions.length}
                    </span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div initial={{
                  width: 0
                }} animate={{
                  width: `${progress}%`
                }} transition={{
                  duration: 0.5
                }} className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" />
                  </div>
                </div>
              </div>

              {/* Right: Question and Answer */}
              <div className="lg:col-span-2 space-y-6">
                {/* Question Card */}
                <motion.div key={currentQuestion.id} initial={{
              opacity: 0,
              x: 100
            }} animate={{
              opacity: 1,
              x: 0
            }} className="bg-white rounded-3xl shadow-xl p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                      {(() => {
                    const CategoryIcon = getCategoryIcon(currentQuestion.category);
                    return <CategoryIcon className="w-7 h-7 text-indigo-600" />;
                  })()}
                      <div>
                        <div className="text-sm font-semibold text-indigo-600 uppercase tracking-wide">
                          {currentQuestion.category.replace('-', ' ')}
                        </div>
                        <div className={`text-xs font-bold mt-1 ${currentQuestion.difficulty === 'easy' ? 'text-emerald-600' : currentQuestion.difficulty === 'medium' ? 'text-orange-500' : 'text-rose-600'}`}>
                          {currentQuestion.difficulty.toUpperCase()}
                        </div>
                      </div>
                    </div>
                    <button onClick={() => setShowHints(!showHints)} className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-xl font-semibold hover:bg-amber-100 transition-colors">
                      {showHints ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      Hints
                    </button>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    {currentQuestion.question}
                  </h3>

                  {/* Hints */}
                  <AnimatePresence>
                    {showHints && currentQuestion.hints && <motion.div initial={{
                  opacity: 0,
                  height: 0
                }} animate={{
                  opacity: 1,
                  height: 'auto'
                }} exit={{
                  opacity: 0,
                  height: 0
                }} className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 mb-6">
                        <div className="flex items-center gap-2 mb-3">
                          <AlertCircle className="w-5 h-5 text-amber-600" />
                          <span className="font-bold text-amber-900">Hints to consider:</span>
                        </div>
                        <ul className="space-y-2">
                          {currentQuestion.hints.map((hint, i) => <li key={i} className="flex items-start gap-2 text-amber-800">
                              <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                              <span>{hint}</span>
                            </li>)}
                        </ul>
                      </motion.div>}
                  </AnimatePresence>

                  {/* Answer Input */}
                  <div className="space-y-4">
                    <div className="relative">
                      <textarea value={currentAnswer} onChange={e => setCurrentAnswer(e.target.value)} onFocus={() => setInterviewerMood('listening')} placeholder="Type your answer here... (or use voice input)" className="w-full h-48 p-4 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:outline-none resize-none text-gray-900" disabled={isGrading} />
                      {isRecording && <motion.div animate={{
                    opacity: [1, 0.5, 1]
                  }} transition={{
                    duration: 1.5,
                    repeat: Infinity
                  }} className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                          <div className="w-2 h-2 bg-red-600 rounded-full" />
                          Recording
                        </motion.div>}
                      {isGrading && <motion.div initial={{
                    opacity: 0
                  }} animate={{
                    opacity: 1
                  }} className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-3">
                          <motion.div animate={{
                      rotate: 360
                    }} transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'linear'
                    }}>
                            <Brain className="w-8 h-8 text-indigo-600" />
                          </motion.div>
                          <p className="text-gray-900 font-semibold">AI is analyzing your answer...</p>
                        </motion.div>}
                    </div>

                    <div className="flex items-center justify-between">
                      <button onClick={() => {
                    if (currentQuestionIndex > 0) {
                      setCurrentQuestionIndex(prev => prev - 1);
                    }
                  }} disabled={currentQuestionIndex === 0 || isGrading} className="px-6 py-3 text-gray-600 hover:text-gray-900 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                        Previous Question
                      </button>

                      <motion.button whileHover={{
                    scale: currentAnswer.trim() && !isGrading ? 1.05 : 1
                  }} whileTap={{
                    scale: currentAnswer.trim() && !isGrading ? 0.95 : 1
                  }} onClick={handleSubmitAnswer} disabled={!currentAnswer.trim() || isGrading} className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                        {isGrading ? 'Analyzing...' : 'Submit Answer'}
                        <Send className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>

                {/* Previous Answers */}
                {answers.length > 0 && <div className="bg-white rounded-3xl shadow-xl p-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                      Your Answers ({answers.length})
                    </h3>
                    <div className="space-y-4">
                      {answers.slice(-3).map((answer, i) => <motion.div key={answer.questionId} initial={{
                  opacity: 0,
                  y: 10
                }} animate={{
                  opacity: 1,
                  y: 0
                }} transition={{
                  delay: i * 0.1
                }} className="border-2 border-gray-200 rounded-xl p-5 hover:border-indigo-300 transition-colors">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-semibold text-gray-900">
                              Question {answers.indexOf(answer) + 1}
                            </span>
                            {answer.score && <div className="flex items-center gap-2">
                                <span className={`text-lg font-bold ${answer.score >= 85 ? 'text-emerald-600' : answer.score >= 70 ? 'text-orange-500' : 'text-rose-600'}`}>
                                  {answer.score}%
                                </span>
                                <Award className={`w-5 h-5 ${answer.score >= 85 ? 'text-emerald-600' : answer.score >= 70 ? 'text-orange-500' : 'text-rose-600'}`} />
                              </div>}
                          </div>
                          {answer.feedback && <p className="text-sm text-gray-700 mb-2">{answer.feedback}</p>}
                          {answer.strengths && answer.strengths.length > 0 && <div className="mt-2 flex flex-wrap gap-2">
                              {answer.strengths.slice(0, 2).map((strength, idx) => <span key={idx} className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                                  ✓ {strength}
                                </span>)}
                            </div>}
                        </motion.div>)}
                    </div>
                  </div>}
              </div>
            </motion.div>}

          {/* Complete Stage */}
          {stage === 'complete' && <motion.div key="complete" initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} exit={{
          opacity: 0
        }} className="space-y-8">
              <motion.div initial={{
            scale: 0
          }} animate={{
            scale: 1
          }} transition={{
            type: 'spring',
            stiffness: 100
          }} className="text-center">
                <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-6 shadow-2xl">
                  <Award className="w-16 h-16 text-white" />
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-3">Interview Complete!</h2>
                <p className="text-xl text-gray-600 mb-8">
                  Great job! Here's your detailed performance analysis
                </p>
              </motion.div>

              {/* Score Card */}
              <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-3xl mx-auto">
                <div className="text-center mb-8">
                  <div className="text-7xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    {calculateOverallScore()}%
                  </div>
                  <div className="text-xl text-gray-600">Overall Score</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-indigo-50 rounded-2xl p-6 text-center">
                    <MessageSquare className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                    <div className="text-3xl font-bold text-gray-900 mb-1">{answers.length}</div>
                    <div className="text-sm text-gray-600">Questions Answered</div>
                  </div>
                  <div className="bg-purple-50 rounded-2xl p-6 text-center">
                    <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {formatTime(timeElapsed)}
                    </div>
                    <div className="text-sm text-gray-600">Total Time</div>
                  </div>
                  <div className="bg-teal-50 rounded-2xl p-6 text-center">
                    <TrendingUp className="w-8 h-8 text-teal-600 mx-auto mb-2" />
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {answers.filter(a => (a.score || 0) >= 85).length}
                    </div>
                    <div className="text-sm text-gray-600">Excellent Answers</div>
                  </div>
                </div>

                {/* Detailed Feedback */}
                <div className="space-y-4 mb-8">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Brain className="w-6 h-6 text-indigo-600" />
                    Detailed AI Feedback
                  </h3>
                  {answers.map((answer, i) => <div key={answer.questionId} className="border-2 border-gray-200 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-bold text-gray-900">Question {i + 1}</span>
                        {answer.score && <div className={`px-4 py-1.5 rounded-full font-bold ${answer.score >= 85 ? 'bg-emerald-100 text-emerald-700' : answer.score >= 70 ? 'bg-orange-100 text-orange-700' : 'bg-rose-100 text-rose-700'}`}>
                            {answer.score}%
                          </div>}
                      </div>
                      
                      {/* User's Answer */}
                      <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Your Answer:</p>
                        <p className="text-gray-800 whitespace-pre-wrap">{answer.answer}</p>
                      </div>
                      
                      {answer.feedback && <p className="text-gray-700 mb-3 font-medium">{answer.feedback}</p>}
                      
                      {/* Strengths */}
                      {answer.strengths && answer.strengths.length > 0 && <div className="mb-3">
                          <p className="text-sm font-semibold text-emerald-700 mb-2">✓ Strengths:</p>
                          <ul className="space-y-1">
                            {answer.strengths.map((strength, idx) => <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                <span className="text-emerald-600">•</span>
                                {strength}
                              </li>)}
                          </ul>
                        </div>}
                      
                      {/* Improvements */}
                      {answer.improvements && answer.improvements.length > 0 && <div>
                          <p className="text-sm font-semibold text-orange-700 mb-2">→ Areas to improve:</p>
                          <ul className="space-y-1">
                            {answer.improvements.map((improvement, idx) => <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                <span className="text-orange-600">•</span>
                                {improvement}
                              </li>)}
                          </ul>
                        </div>}
                    </div>)}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-4 justify-center">
                  <motion.button whileHover={{
                scale: 1.05
              }} whileTap={{
                scale: 0.95
              }} onClick={() => {
                setStage('setup');
                setCurrentQuestionIndex(0);
                setAnswers([]);
                setCurrentAnswer('');
                setTimeElapsed(0);
                setTimerStarted(false);
                setConfig({});
                setIsSpeaking(false);
                setInterviewerMood("neutral");
              }} className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
                    <RotateCcw className="w-5 h-5" />
                    New Interview
                  </motion.button>
                  <motion.button whileHover={{
                scale: 1.05
              }} whileTap={{
                scale: 0.95
              }} className="px-8 py-4 bg-white text-indigo-600 border-2 border-indigo-600 rounded-full font-bold hover:bg-indigo-50 transition-all flex items-center gap-2">
                    View Roadmap
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-3xl p-8 max-w-3xl mx-auto">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Zap className="w-7 h-7 text-indigo-600" />
                  Next Steps Based on Your Performance
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-gray-900">Practice More Interviews</div>
                      <div className="text-sm text-gray-600">
                        Try different roles and difficulty levels to build confidence
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-gray-900">Review Improvement Areas</div>
                      <div className="text-sm text-gray-600">
                        Focus on the specific feedback provided for each answer
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-gray-900">Continue Your Learning Journey</div>
                      <div className="text-sm text-gray-600">
                        Build projects and gain hands-on experience in your focus areas
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>}
        </AnimatePresence>
      </div>
    </div>;
};

export default AIInterviewStudio;
