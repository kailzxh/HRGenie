'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, AlertTriangle, Monitor, ShieldCheck, Fullscreen, Camera, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// --- Interfaces and Types ---
interface Job { id: string; title?: string; description?: string; }
interface Application { id: string; profile_id: string; job: Job; }
type Message = { role: 'user' | 'assistant'; content: string; timestamp: string };
type ProctoringEvent = { type: 'tab_switch_away' | 'tab_switch_back' | 'face_not_detected' | 'face_detected'; timestamp: string };
type InterviewEvent = Message | ProctoringEvent;
type InterviewState = 'idle' | 'instructions' | 'starting' | 'asking' | 'listening' | 'processing' | 'finished';

// --- Browser API Setup ---
declare global {
  interface Window { SpeechRecognition?: any; webkitSpeechRecognition?: any; }
}
const SpeechRecognition = (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)) || null;
const apiUrl = import.meta.env.VITE_API_URL;

// =================================================================================
// --- Main Component ---
// =================================================================================
export default function HRInterviewPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  // --- State Management ---
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [proctoringEvents, setProctoringEvents] = useState<ProctoringEvent[]>([]);
  const [interviewState, setInterviewState] = useState<InterviewState>('idle');
  const [questionCount, setQuestionCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [isBrowserSupported, setIsBrowserSupported] = useState(true);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  
  // --- Refs ---
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<number | null>(null);
  const noSpeechFallbackTimerRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const webcamRef = useRef<Webcam | null>(null);
  const faceDetectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const interviewStateRef = useRef<InterviewState>(interviewState);

  // ✅ Keep the ref synchronized with the state
  useEffect(() => {
    interviewStateRef.current = interviewState;
  }, [interviewState]);

  // --- Auth & Data Fetching ---
  useEffect(() => {
    if (!authLoading && !user) navigate('/auth/login');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    setIsBrowserSupported(!!SpeechRecognition);
    setInterviewState(!!SpeechRecognition ? 'instructions' : 'idle');
  }, []);

  useEffect(() => {
    const fetchApplication = async () => {
      if (!user || !id) return;
      setLoading(true);
      const { data, error } = await supabase.from('applications').select('*, job:jobs(*)').eq('id', id).eq('profile_id', user.id).maybeSingle();
      if (error || !data) {
        toast({ title: 'Error', description: 'Could not load interview session.', variant: 'destructive' });
        navigate('/dashboard');
      } else {
        setApplication(data as Application);
      }
      setLoading(false);
    };
    if (user) fetchApplication();
  }, [user, id, navigate, toast]);
  
  // --- Load Face Detection Models ---
  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        setModelsLoaded(true);
      } catch (error) {
        console.error("Failed to load face detection models", error);
        toast({ title: 'Error', description: 'Could not load face detection models.', variant: 'destructive' });
      }
    };
    loadModels();
  }, [toast]);

  // --- UI & Timers ---
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (interviewState === 'starting' && !timerRef.current) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((t) => {
          if (t === 61) {
            setShowTimeWarning(true);
          }
          if (t <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            finishInterview();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [interviewState]);

  // --- Proctoring Logic ---
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (interviewStateRef.current !== 'starting') return;
      const eventType = document.hidden ? 'tab_switch_away' : 'tab_switch_back';
      setProctoringEvents((prev) => [...prev, { type: eventType, timestamp: new Date().toISOString() }]);
    };

    const startProctoring = () => {
      document.addEventListener('visibilitychange', handleVisibilityChange);
      if (faceDetectionIntervalRef.current) clearInterval(faceDetectionIntervalRef.current);
      faceDetectionIntervalRef.current = setInterval(async () => {
        if (webcamRef.current?.video) {
          const detections = await faceapi.detectAllFaces(webcamRef.current.video as HTMLVideoElement, new faceapi.TinyFaceDetectorOptions());
          const faceCurrentlyDetected = detections.length > 0;
          setIsFaceDetected(prev => {
            if (prev && !faceCurrentlyDetected) {
              setProctoringEvents(p => [...p, { type: 'face_not_detected', timestamp: new Date().toISOString() }]);
            } else if (!prev && faceCurrentlyDetected) {
              setProctoringEvents(p => [...p, { type: 'face_detected', timestamp: new Date().toISOString() }]);
            }
            return faceCurrentlyDetected;
          });
        }
      }, 3000);
    };

    const stopProctoring = () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (faceDetectionIntervalRef.current) clearInterval(faceDetectionIntervalRef.current);
    };

    if (interviewState === 'starting') {
      startProctoring();
    } else {
      stopProctoring();
    }

    return stopProctoring;
  }, [interviewState]);
  
  // --- Pre-interview face detection check ---
  useEffect(() => {
    if (interviewState === 'instructions' && modelsLoaded && isCameraReady && webcamRef.current) {
        if (faceDetectionIntervalRef.current) clearInterval(faceDetectionIntervalRef.current);
        faceDetectionIntervalRef.current = setInterval(async () => {
          if (webcamRef.current?.video) {
              const detections = await faceapi.detectAllFaces(webcamRef.current.video as HTMLVideoElement, new faceapi.TinyFaceDetectorOptions());
              setIsFaceDetected(detections.length > 0);
          }
        }, 1500);
        return () => {
            if (faceDetectionIntervalRef.current) clearInterval(faceDetectionIntervalRef.current);
        };
    }
  }, [interviewState, modelsLoaded, isCameraReady]);

  // --- Helper functions and Callbacks ---
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const speakText = useCallback((text: string) => {
    return new Promise<void>((resolve) => {
      if (!('speechSynthesis' in window)) { resolve(); return; }
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'en-US';
      utter.onstart = () => setInterviewState('asking');
      utter.onend = () => resolve();
      utter.onerror = () => resolve();
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
    });
  }, []);

  const stopRecognition = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.onresult = null;
      recognitionRef.current.onend = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (noSpeechFallbackTimerRef.current) clearTimeout(noSpeechFallbackTimerRef.current);
  }, []);

  const finishInterview = useCallback(async () => {
    if (interviewStateRef.current === 'finished') {
      console.log('🛑 Interview already finished, skipping');
      return;
    }
    
    console.log('🏁 Finishing interview...');
    setInterviewState('finished');
    interviewStateRef.current = 'finished';
    
    stopRecognition();
    if (timerRef.current) clearInterval(timerRef.current);
    
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch (err) {
        console.warn('Could not exit fullscreen:', err);
      }
    }

    const finalMessage = "Thank you. The interview is now complete. We are now analyzing your responses...";
    setMessages((prev) => [...prev, { role: 'assistant', content: finalMessage, timestamp: new Date().toISOString() }]);
    
    await speakText(finalMessage);
    toast({ title: "Interview Complete", description: "Analyzing your responses..." });

    try {
      const analysisResponse = await fetch(`${apiUrl}/api/generate-response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle: application?.job?.title,
          jobDescription: application?.job?.description,
          previousTranscript: messages,
          proctoringEvents: proctoringEvents,
          isFinalAnalysis: true
        })
      });

      if (!analysisResponse.ok) {
        throw new Error('The AI analysis process failed.');
      }
      
      const result = await analysisResponse.json();
      
      let analysisData = { hr_interview_summary: 'AI analysis could not be generated.', hr_interview_score: 0 };
      
      try {
        const cleanedText = result.responseText.replace(/```json/g, '').replace(/```/g, '');
        analysisData = JSON.parse(cleanedText);
      } catch (e) { 
        console.error("Failed to parse AI analysis JSON:", result.responseText, e); 
      }

      const allEvents: InterviewEvent[] = [...messages, ...proctoringEvents];
      allEvents.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      
      const { error } = await supabase
        .from('applications')
        .update({
          hr_interview_transcript: allEvents,
          hr_interview_summary: analysisData.hr_interview_summary,
          hr_interview_score: analysisData.hr_interview_score,
          status: 'hr_screening'
        })
        .eq('id', id);

      if (error) throw error;
      
      toast({ title: 'Analysis Complete', description: 'Your interview has been saved successfully.' });
      setTimeout(() => navigate('/dashboard'), 3000);

    } catch (error: any) {
      console.error('Error during finishInterview process:', error);
      toast({ title: 'Error', description: 'Could not save the final analysis.', variant: 'destructive' });
    }
  }, [id, application, messages, proctoringEvents, stopRecognition, speakText, toast, navigate]);

  // ✅ Declare askNextQuestion first
  const askNextQuestion = useCallback(async (currentTranscript: Message[] = messages) => {
    if (interviewStateRef.current === 'finished') {
      console.log('🛑 Interview already finished, stopping question generation');
      return;
    }
    
    stopRecognition();
    
    if (questionCount >= 5) {
      console.log('✅ Reached question limit (5), finishing interview');
      finishInterview();
      return;
    }
    
    if (timeLeft <= 1) {
      console.log('⏰ Time limit reached, finishing interview');
      finishInterview();
      return;
    }
    
    setInterviewState('processing');
    console.log(`🔄 Asking question ${questionCount + 1} of 5`);

    try {
      const res = await fetch(`${apiUrl}/api/generate-response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle: application?.job?.title,
          jobDescription: application?.job?.description,
          previousTranscript: currentTranscript,
          isFinalAnalysis: false
        })
      });
      
      if (!res.ok) throw new Error('Failed to fetch from API');
      const data = await res.json();
      const question = data?.responseText;
      if (!question) throw new Error('Empty question from AI');
      
      const assistantMsg: Message = { role: 'assistant', content: question, timestamp: new Date().toISOString() };
      setMessages((prev) => [...prev, assistantMsg]);
      setQuestionCount((q) => q + 1);
      
      await speakText(question);
      
      if (questionCount + 1 >= 5) {
        console.log('✅ Just asked the 5th question, finishing interview next');
        finishInterview();
      } else {
        setTimeout(() => {
          if (interviewStateRef.current !== 'finished' && questionCount + 1 < 5) {
            startRecognition();
          }
        }, 100);
      }
      
    } catch (err: any) {
      console.error('❌ Error asking next question:', err);
      toast({ title: 'AI Error', description: err.message, variant: 'destructive' });
      finishInterview();
    }
  }, [application, questionCount, timeLeft, messages, speakText, toast, finishInterview, stopRecognition]);

  // ✅ Now declare startRecognition after askNextQuestion
  const startRecognition = useCallback(() => {
    if (!SpeechRecognition) return;
    stopRecognition();
    
    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    let finalTranscript = '';

    noSpeechFallbackTimerRef.current = window.setTimeout(() => {
      if (interviewStateRef.current !== 'listening') return;
      speakText("I'm sorry, I can't seem to hear you. We will move to the next question.").then(() => {
        askNextQuestion();
      });
    }, 100000);

    rec.onstart = () => setInterviewState('listening');
    
    rec.onresult = (event: any) => {
      if (noSpeechFallbackTimerRef.current) clearTimeout(noSpeechFallbackTimerRef.current);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }

      silenceTimerRef.current = window.setTimeout(() => {
        if (interviewStateRef.current !== 'listening') return;
        if (finalTranscript.trim()) {
          const msg: Message = { role: 'user', content: finalTranscript.trim(), timestamp: new Date().toISOString() };
          setMessages((prev) => {
            const updatedMessages = [...prev, msg];
            setInterviewState('processing');
            askNextQuestion(updatedMessages);
            return updatedMessages;
          });
        }
        stopRecognition();
      }, 2000);
    };

    rec.onerror = (ev: any) => {
        if (interviewStateRef.current !== 'listening') return;
        if (ev.error !== 'no-speech') {
            toast({ title: 'Speech error', description: ev.error, variant: 'destructive' });
        }
    };

    rec.onend = () => {
      if (interviewStateRef.current === 'listening') {
        setInterviewState('idle');
      }
    };
    
    recognitionRef.current = rec;
    rec.start();
  }, [speakText, stopRecognition, toast, askNextQuestion]);

  const handleAcceptAndStart = async () => {
    try {
      await document.documentElement.requestFullscreen();
    } catch (err) { console.warn('Could not enter fullscreen mode.'); }
    setInterviewState('starting');
    const greeting = `Hello! I'm the AI interviewer for the ${application?.job?.title || 'role'}. We'll ask up to 5 questions. When you're ready, answer each question after you hear it. Let's begin.`;
    setMessages([{ role: 'assistant', content: greeting, timestamp: new Date().toISOString() }]);
    await speakText(greeting);
    askNextQuestion([]);
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }
  
  const getStatusText = () => {
    if (!modelsLoaded) return 'Loading setup models...';
    if (!isCameraReady) return 'Please enable your camera.';
    if (!isFaceDetected) return 'Please position your face in the camera.';
    return 'Face Detected';
  };
  
  const getButtonText = () => {
      if (!modelsLoaded) return 'Loading Models...';
      if (!isCameraReady) return 'Waiting for Camera...';
      if (!isFaceDetected) return 'Waiting for Face...';
      return 'Accept and Start Interview';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-slate-50">
      <Navbar />
      
      <AlertDialog open={interviewState === 'instructions'}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Interview Instructions</AlertDialogTitle>
            <AlertDialogDescription asChild className="space-y-3 pt-2">
              <div>
                <p>Welcome to your automated HR interview for the <strong>{application?.job?.title}</strong> role.</p>
                <div className="flex items-start gap-3"><ShieldCheck className="h-5 w-5 text-green-600 mt-1" /><p>The goal is to answer 5 behavioral questions within the time limit.</p></div>
                <div className="flex items-start gap-3"><Camera className="h-5 w-5 text-blue-600 mt-1" /><p>This session requires camera access. Please grant permission when prompted.</p></div>
                <div className="flex items-start gap-3"><Fullscreen className="h-5 w-5 text-blue-600 mt-1" /><p>The interview will enter full-screen mode to help you focus.</p></div>
                <div className="flex items-center gap-3 p-2 rounded-md bg-slate-100">
                    {isFaceDetected ? <ShieldCheck className="h-5 w-5 text-green-600" /> : <AlertTriangle className="h-5 w-5 text-orange-500" />}
                    <p className="font-medium text-slate-800">{getStatusText()}</p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleAcceptAndStart} disabled={!isBrowserSupported || !modelsLoaded || !isCameraReady || !isFaceDetected}>
              {getButtonText()}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showTimeWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2"><Clock className="h-5 w-5 text-orange-500" /> Time Warning</AlertDialogTitle>
            <AlertDialogDescription>
              There is less than one minute remaining. Please provide your answer promptly. The session will end automatically when the timer runs out.
              <br /><br />
              You have answered <strong>{questionCount}</strong> out of 5 questions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowTimeWarning(false)}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="max-w-6xl mx-auto p-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl">HR Interview - {application?.job?.title}</CardTitle>
              <p className="text-sm text-slate-600">Please answer clearly into your microphone.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-xs text-slate-500">Time left</div>
                <div className={`font-mono font-semibold text-lg ${timeLeft <= 60 ? 'text-red-600 animate-pulse' : ''}`}>
                  {formatTime(timeLeft)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500">Questions</div>
                <div className="font-semibold">{questionCount} / 5</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 h-[70vh]">
              <div className="lg:col-span-1 p-4 border-r flex flex-col justify-between">
                <div>
                  <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
                    <Webcam 
                        ref={webcamRef} 
                        audio={false} 
                        mirrored 
                        className="w-full h-full object-cover" 
                        onUserMedia={() => setIsCameraReady(true)}
                        onUserMediaError={(err) => {
                            console.error("Webcam Error:", err);
                            setIsCameraReady(false);
                            toast({title: "Camera Error", description: "Could not access camera. Please check permissions.", variant: "destructive"})
                        }}
                    />
                    {interviewState === 'listening' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                            <Mic className="w-10 h-10 text-white animate-pulse" />
                        </div>
                    )}
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2">
                      {isFaceDetected ? <ShieldCheck className="h-4 w-4 text-green-600" /> : <AlertTriangle className="h-4 w-4 text-red-600" />}
                      <span className="text-sm font-medium">{isFaceDetected ? 'Face Detected' : 'FACE NOT DETECTED'}</span>
                    </div>
                    <div className="flex items-center gap-2"><Monitor className="h-4 w-4 text-green-600" /><span className="text-sm">Tab switching is monitored</span></div>
                  </div>
                </div>
                <div className="mt-4">
                  <Button variant="destructive" onClick={finishInterview} disabled={interviewState === 'finished' || interviewState === 'idle' || interviewState === 'instructions'}>
                    Finish Interview
                  </Button>
                </div>
              </div>
              <div className="lg:col-span-2 p-4 flex flex-col bg-slate-50/50">
                 <ScrollArea className="flex-1 p-2 mb-4">
                  <div className="space-y-4">
                    {messages.map((m, i) => (
                      <div key={i} className={`flex items-end gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {m.role === 'assistant' && (
                          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex-shrink-0">
                            <Mic className="w-4 h-4" />
                          </div>
                        )}
                        <div className={`max-w-[80%] px-4 py-2 rounded-lg ${m.role === 'user' ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-900'}`}>
                          {m.role === 'user' && <div className="whitespace-pre-wrap text-sm">{m.content}</div>}
                          {m.role === 'assistant' && (
                              <div className="flex items-center gap-2">
                                <div className="flex gap-1 items-center h-5">
                                    <span className={`w-1 h-2 bg-slate-500 rounded-full ${interviewState === 'asking' ? 'animate-[speak_0.8s_infinite_ease-in-out_0.1s]' : ''}`}></span>
                                    <span className={`w-1 h-3 bg-slate-500 rounded-full ${interviewState === 'asking' ? 'animate-[speak_0.8s_infinite_ease-in-out_0.3s]' : ''}`}></span>
                                    <span className={`w-1 h-2 bg-slate-500 rounded-full ${interviewState === 'asking' ? 'animate-[speak_0.8s_infinite_ease-in-out_0.5s]' : ''}`}></span>
                                </div>
                                <em className="text-slate-600 text-sm">AI is asking a question...</em>
                              </div>
                          )}
                          <div className="text-xs text-right mt-1">{m.role === 'user' ? 'You' : 'AI'} at {new Date(m.timestamp).toLocaleTimeString()}</div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                <div className="p-3 border-t bg-white rounded-b-lg">
                  <div className="font-semibold text-center text-slate-600">
                    {interviewState === 'listening' ? 'Listening...' :
                     interviewState === 'asking' ? 'AI is speaking...' :
                     interviewState === 'processing' ? 'Processing...' :
                     interviewState === 'finished' ? 'Interview Complete' :
                     'Waiting to start'}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}