'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import Editor, { type OnMount } from '@monaco-editor/react';
import { Play, Code2, AlertTriangle, Clock, ShieldCheck, Fullscreen, Copy, ClipboardPaste } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
const apiUrl = import.meta.env.VITE_API_URL;
// --- Type Definitions ---
interface Question { type: 'aptitude' | 'coding'; question?: string; options?: string[]; correctAnswer?: string; title?: string; description?: string; starter_code?: Record<string, string>; }
interface Answer { questionIndex: number; answer?: string; code?: string; language?: string; }
type ProctoringEvent = { type: 'tab_switch_away' | 'tab_switch_back' | 'copy' | 'paste'; timestamp: string };

export default function TechnicalInterviewPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  // --- State Management ---
  const [application, setApplication] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [proctoringEvents, setProctoringEvents] = useState<ProctoringEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60 * 60);
  const [isAssessmentStarted, setIsAssessmentStarted] = useState(false); // ✅ Controls the instruction modal
  const [tabSwitchCount, setTabSwitchCount] = useState(0); // ✅ Tracks tab switches

  // --- UI State for Current Question ---
  const [currentAptitudeAnswer, setCurrentAptitudeAnswer] = useState('');
  const [currentCode, setCurrentCode] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState('javascript');
  const [codeOutput, setCodeOutput] = useState('');
  
  // --- Refs ---
  const timerRef = useRef<number | null>(null);

  // --- Hooks ---
  useEffect(() => {
    if (!authLoading && !user) navigate('/auth/login');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && id) fetchAssessment(user.id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, id]);

  // ✅ UPDATED: Proctoring useEffect for copy, paste, and tab switching
  useEffect(() => {
    if (!isAssessmentStarted) return; // Only activate proctoring after the assessment starts

    const logEvent = (type: ProctoringEvent['type']) => {
      setProctoringEvents(prev => [...prev, { type, timestamp: new Date().toISOString() }]);
    };
    
    const handleCopy = () => logEvent('copy');
    const handlePaste = () => logEvent('paste');
    const handleVisibilityChange = () => {
      if (document.hidden) {
        logEvent('tab_switch_away');
        setTabSwitchCount(prev => prev + 1);
      } else {
        logEvent('tab_switch_back');
      }
    };
    
    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAssessmentStarted]);

  // ✅ NEW: useEffect to handle tab switch limit
  useEffect(() => {
    if (tabSwitchCount > 3) {
      toast({
        title: "Proctoring Violation",
        description: "Assessment has been automatically submitted due to excessive tab switching.",
        variant: "destructive",
      });
      handleFinishInterview(true); // Auto-submit
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabSwitchCount]);
  
  // Timer useEffect
  useEffect(() => {
    if (isAssessmentStarted && !timerRef.current) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            handleFinishInterview(true);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAssessmentStarted]);

  const fetchAssessment = async (userId: string) => {
    try {
      const { data: appData, error: appError } = await supabase.from('applications').select('*, job:jobs(*)').eq('id', id).eq('profile_id', userId).single();
      if (appError || !appData) { throw appError || new Error("Application not found for this user."); }
      setApplication(appData);

      if (appData.technical_interview_transcript && appData.technical_interview_transcript.length > 0 && appData.technical_interview_transcript[0]?.assessment) {
          setQuestions(appData.technical_interview_transcript[0].assessment.questions || []);
          setAnswers(appData.technical_interview_transcript[0].submission?.answers || []);
      } else {
        const response = await fetch(`${apiUrl}/api/generate-technical-assessment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobTitle: appData.job.title, jobDescription: appData.job.description }),
        });
        if (!response.ok) throw new Error('Failed to generate assessment questions.');
        const data = await response.json();
        const allQuestions = [
            ...(data.aptitudeQuestions || []).map((q: any) => ({...q, type: 'aptitude' as const})), 
            ...(data.codingChallenges || []).map((c: any) => ({...c, type: 'coding' as const}))
        ];
        setQuestions(allQuestions);
        await supabase.from('applications').update({ technical_interview_transcript: [{ assessment: { questions: allQuestions } }] }).eq('id', id);
      }
    } catch (error: any) {
      console.error("Error fetching assessment:", error);
      toast({ title: 'Error', description: error.message || 'Could not load the interview session.', variant: 'destructive' });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex < questions.length) {
      const currentQuestion = questions[currentQuestionIndex];
      const existingAnswer = answers.find(a => a.questionIndex === currentQuestionIndex);
      if (currentQuestion.type === 'aptitude') {
        setCurrentAptitudeAnswer(existingAnswer?.answer || '');
      } else if (currentQuestion.type === 'coding') {
        const lang = existingAnswer?.language || 'javascript';
        setCurrentLanguage(lang);
        setCurrentCode(existingAnswer?.code || currentQuestion.starter_code?.[lang] || '');
      }
      setCodeOutput('');
    }
  }, [currentQuestionIndex, questions, answers]);

  const handleNext = () => {
    const currentQuestion = questions[currentQuestionIndex];
    const newAnswer: Answer = currentQuestion.type === 'aptitude'
      ? { questionIndex: currentQuestionIndex, answer: currentAptitudeAnswer }
      : { questionIndex: currentQuestionIndex, code: currentCode, language: currentLanguage };
    setAnswers(prev => [...prev.filter(a => a.questionIndex !== currentQuestionIndex), newAnswer]);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) { setCurrentQuestionIndex(prev => prev - 1); }
  };
  
  const handleRunCode = async () => {
    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion.type !== 'coding') return;
    setCodeOutput('Running code...');
    setIsSubmitting(true);
    try {
      const response = await fetch(`${apiUrl}/api/analyze-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: currentCode, language: currentLanguage, challenge: currentQuestion }),
      });
      const data = await response.json();
      setCodeOutput(`--- SIMULATED EXECUTION ---\n${data.simulatedOutput}\n\n--- AI CODE ANALYSIS ---\nQuality: ${data.quality}\nCorrectness: ${data.correctness}\nComplexity: ${data.complexity}\nSuggestions: ${data.suggestions}`);
    } catch (error) {
      setCodeOutput('Error analyzing code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinishInterview = async (isAutoSubmit = false) => {
    if (isSubmitting && !isAutoSubmit) return;
    if (!isAutoSubmit) setShowFinishConfirm(false);
    setIsSubmitting(true);
    toast({ title: isAutoSubmit ? 'Auto-Submitting...' : 'Submitting Interview', description: 'Please wait while we process your submission...' });

    try {
      const finalAnswers = [...answers];
      const lastQuestion = questions[currentQuestionIndex];
      if (lastQuestion) {
          const lastAnswer = {
              questionIndex: currentQuestionIndex,
              answer: lastQuestion.type === 'aptitude' ? currentAptitudeAnswer : undefined,
              code: lastQuestion.type === 'coding' ? currentCode : undefined,
              language: lastQuestion.type === 'coding' ? currentLanguage : undefined,
          };
          const existingIndex = finalAnswers.findIndex(a => a.questionIndex === currentQuestionIndex);
          if (existingIndex > -1) { finalAnswers[existingIndex] = lastAnswer; } 
          else { finalAnswers.push(lastAnswer); }
      }

      const finalTranscript = [{ assessment: { questions }, submission: { answers: finalAnswers }, proctoringEvents }];
      const analysisResponse = await fetch(`${apiUrl}/api/finish-technical-interview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobTitle: application.job.title, transcript: finalTranscript, proctoringEvents }),
      });
      if (!analysisResponse.ok) throw new Error('Failed to get final analysis');
      const analysisData = await analysisResponse.json();

      const { error } = await supabase.from('applications').update({
        technical_interview_transcript: finalTranscript,
        technical_interview_score: analysisData.technical_interview_score,
        status: 'technical_screening',
      }).eq('id', id);
      if (error) throw error;
      
      toast({ title: 'Success!', description: 'Your technical interview has been submitted.' });
      navigate('/dashboard');

    } catch (error) {
      console.error(error);
      toast({ title: 'Submission Error', description: 'There was an error submitting your interview.', variant: 'destructive' });
      setIsSubmitting(false);
    }
  };
  
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // ✅ NEW: Function to start the assessment and enter full screen
  const handleStartAssessment = async () => {
    try {
      await document.documentElement.requestFullscreen();
      setIsAssessmentStarted(true);
    } catch (err) {
      toast({
        title: "Full Screen Required",
        description: "Please enable full-screen mode to start the assessment.",
        variant: "destructive"
      });
    }
  };

  // ✅ NEW: Monaco Editor onMount handler to prevent pasting
  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editor.onDidPaste(() => {
      toast({
        title: "Action Blocked",
        description: "Pasting content into the code editor is not allowed.",
        variant: "destructive"
      });
      editor.trigger('paste-blocker', 'undo', null);
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div></div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  if (!currentQuestion && !loading) {
      return (<div className="flex items-center justify-center h-screen"><p>No questions found for this assessment.</p></div>);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      {/* ✅ NEW: Instruction Modal */}
      <AlertDialog open={!isAssessmentStarted && !loading}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Technical Assessment Rules</AlertDialogTitle>
                <AlertDialogDescription asChild>
                    <div className="space-y-3 pt-2 text-sm">
                        <p>This is a proctored assessment. Please read the following rules carefully before you begin.</p>
                        <div className="flex items-start gap-3"><Fullscreen className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" /><p>The test must be taken in **full-screen mode**.</p></div>
                        <div className="flex items-start gap-3"><AlertTriangle className="h-5 w-5 text-red-600 mt-1 flex-shrink-0" /><p>You are allowed a maximum of **3 tab switches**. Exceeding this limit will automatically end and submit your test.</p></div>
                        <div className="flex items-start gap-3"><Copy className="h-5 w-5 text-orange-500 mt-1 flex-shrink-0" /><p>Copying questions or instructions is **not allowed**.</p></div>
                        <div className="flex items-start gap-3"><ClipboardPaste className="h-5 w-5 text-orange-500 mt-1 flex-shrink-0" /><p>Pasting code into the editor is **not allowed**.</p></div>
                    </div>
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogAction onClick={handleStartAssessment}>Agree and Start Assessment</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className={`flex-1 grid grid-cols-1 lg:grid-cols-2 h-[calc(100vh-4rem)] ${!isAssessmentStarted ? 'blur-sm pointer-events-none' : ''}`}>
        <div className="flex flex-col border-r bg-white">
          <CardHeader>
            <CardTitle>Technical Assessment: {application?.job?.title}</CardTitle>
            <div className="flex justify-between items-center text-sm text-slate-500 pt-2">
                <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                <div className={`flex items-center gap-2 font-mono font-semibold ${timeLeft <= 300 ? 'text-red-500' : ''}`}><Clock className="h-4 w-4" /><span>{formatTime(timeLeft)}</span></div>
                <div className="flex items-center gap-1 text-xs p-1 bg-yellow-100 text-yellow-800 rounded"><AlertTriangle className="h-3 w-3" /><span>Proctoring is active (Tab Switches: {tabSwitchCount}/3)</span></div>
            </div>
          </CardHeader>
          {/* ✅ UPDATED: Added onCopy and select-none to prevent copying */}
          <ScrollArea className="flex-1" onCopy={(e) => { e.preventDefault(); toast({ title: "Action Blocked", description: "Copying questions is not allowed." }); }}>
            <CardContent className="p-6 select-none">
                {currentQuestion.type === 'aptitude' ? (
                    <div>
                        <h3 className="font-semibold text-lg mb-4">{currentQuestion.question}</h3>
                        <RadioGroup value={currentAptitudeAnswer} onValueChange={setCurrentAptitudeAnswer}>
                            {currentQuestion.options?.map((opt, i) => (
                                <div key={i} className="flex items-center space-x-2"><RadioGroupItem value={opt} id={`opt-${i}`} /><Label htmlFor={`opt-${i}`}>{opt}</Label></div>
                            ))}
                        </RadioGroup>
                    </div>
                ) : (
                    <div>
                        <h3 className="font-semibold text-lg">{currentQuestion.title}</h3>
                        <p className="text-sm whitespace-pre-wrap mt-2">{currentQuestion.description}</p>
                    </div>
                )}
            </CardContent>
          </ScrollArea>
          <div className="p-4 border-t flex justify-between">
              <Button variant="outline" onClick={handlePrev} disabled={currentQuestionIndex === 0 || isSubmitting}>Previous</Button>
              {currentQuestionIndex === questions.length - 1 ? (
                <Button variant="destructive" onClick={() => setShowFinishConfirm(true)} disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Finish & Submit'}</Button>
              ) : (
                <Button onClick={handleNext} disabled={isSubmitting}>Next</Button>
              )}
          </div>
        </div>
        
        <div className="flex flex-col bg-slate-900 text-white">
          <div className="p-4 border-b border-slate-700 flex justify-between items-center">
            <h2 className="text-lg font-bold flex items-center gap-2"><Code2 className="h-5 w-5" /> Code Editor</h2>
            {currentQuestion.type === 'coding' && (
                <div className="flex gap-2">
                    <select value={currentLanguage} onChange={(e) => { const newLang = e.target.value; setCurrentLanguage(newLang); setCurrentCode(questions[currentQuestionIndex].starter_code?.[newLang] || ''); }} className="bg-slate-800 text-white px-3 py-1.5 rounded text-sm border border-slate-700" disabled={isSubmitting}>
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                    </select>
                    <Button onClick={handleRunCode} variant="secondary" size="sm" disabled={isSubmitting}><Play className="h-4 w-4 mr-2" /> {isSubmitting ? 'Running...' : 'Run'}</Button>
                </div>
            )}
          </div>
          <div className="flex-1 grid grid-rows-2">
            <div className="row-span-1 border-b border-slate-700">
                {/* ✅ UPDATED: Added onMount to block pasting */}
                <Editor
                    height="100%"
                    language={currentLanguage}
                    value={currentQuestion.type === 'coding' ? currentCode : "// Code editor is for coding challenges only."}
                    onChange={(val) => setCurrentCode(val || '')}
                    theme="vs-dark"
                    options={{ minimap: { enabled: false }, readOnly: currentQuestion.type !== 'coding' || isSubmitting }}
                    onMount={handleEditorDidMount}
                />
            </div>
            <div className="row-span-1">
                <ScrollArea className="h-full">
                    <pre className="text-sm p-4 whitespace-pre-wrap">{codeOutput || "Code output and AI analysis will appear here..."}</pre>
                </ScrollArea>
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={showFinishConfirm}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to submit?</AlertDialogTitle>
                <AlertDialogDescription>You cannot go back and change your answers. Your current answer will also be saved.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <Button variant="ghost" onClick={() => setShowFinishConfirm(false)}>Cancel</Button>
                <Button variant="destructive" onClick={() => handleFinishInterview(false)}>Confirm & Submit</Button>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}