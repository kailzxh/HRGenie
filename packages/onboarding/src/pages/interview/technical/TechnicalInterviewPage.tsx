import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import Editor from '@monaco-editor/react'; // This import is correct, the error is likely due to missing package installation or type declarations.
import { Send, Play, Code2, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function TechnicalInterviewPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [application, setApplication] = useState(null);
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [sending, setSending] = useState(false);
  const [running, setRunning] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchApplicationAndChallenge();
    }
  }, [user, id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchApplicationAndChallenge = async () => {
    const { data: appData, error: appError } = await supabase
      .from('applications')
      .select('*, job:jobs(*)')
      .eq('id', id)
      .eq('profile_id', user.id)
      .maybeSingle();

    if (appData && !appError) {
      setApplication(appData);
      setMessages(appData.technical_interview_transcript || []);

      const { data: challengeData } = await supabase
        .from('coding_challenges')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (challengeData) {
        setChallenge(challengeData);
        setCode(challengeData.starter_code[language] || '');

        if (!appData.technical_interview_transcript?.length) {
          const initialMessage = {
            role: 'assistant',
            content: `Hello! I'm your technical interviewer. Today, I'll be evaluating your problem-solving skills and coding abilities.

Here's your challenge: **${challengeData.title}**

${challengeData.description}

Take your time to read the problem carefully. You can use the code editor on the right to write your solution. When you're ready, feel free to ask me questions or submit your code for evaluation.

Good luck!`,
            timestamp: new Date().toISOString(),
          };
          setMessages([initialMessage]);
          await saveTranscript([initialMessage]);
        }
      }
    } else {
      toast({
        title: 'Error',
        description: 'Application not found',
        variant: 'destructive',
      });
      navigate('/dashboard');
    }
    setLoading(false);
  };

  const saveTranscript = async (updatedMessages) => {
    await supabase
      .from('applications')
      .update({ technical_interview_transcript: updatedMessages })
      .eq('id', id);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputMessage('');
    setSending(true);

    const assistantMessage = {
      role: 'assistant',
      content:
        "I'm processing your message. In a production environment, this would connect to the Vertex AI Agent Builder to provide intelligent responses based on your question and the current interview context.",
      timestamp: new Date().toISOString(),
    };

    const finalMessages = [...updatedMessages, assistantMessage];
    setMessages(finalMessages);
    await saveTranscript(finalMessages);
    setSending(false);
  };

  const runCode = async () => {
    setRunning(true);

    setTimeout(async () => {
      const resultMessage = {
        role: 'assistant',
        content: `I've analyzed your code. In a production environment, this would:
1. Execute your code against test cases via GCP Cloud Run
2. Analyze code quality using Gemini API
3. Provide detailed feedback on:
   - Test case results (pass/fail)
   - Time complexity (Big O analysis)
   - Code quality and best practices
   - Suggestions for improvement

For now, I can see you're working on the problem. Would you like to explain your approach?`,
        timestamp: new Date().toISOString(),
      };

      const updatedMessages = [...messages, resultMessage];
      setMessages(updatedMessages);
      await saveTranscript(updatedMessages);
      setRunning(false);
    }, 2000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading interview...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="h-[calc(100vh-4rem)]">
        <div className="h-full max-w-full mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 h-full gap-0">
            {/* LEFT: Chat Interface */}
            <div className="flex flex-col border-r bg-white">
              <div className="p-4 border-b">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Technical Interview
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  {application?.job?.title} • AI Interviewer
                </p>
              </div>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[85%] rounded-lg p-4 ${
                          message.role === 'user'
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-900'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <p className="text-xs mt-2 opacity-70">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message or ask a question..."
                    className="resize-none"
                    rows={3}
                    disabled={sending}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={sending || !inputMessage.trim()}
                    size="icon"
                    className="h-auto"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* RIGHT: Code Editor */}
            <div className="flex flex-col bg-slate-900">
              <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Code2 className="h-5 w-5" />
                  Code Editor
                </h2>
                <div className="flex gap-2">
                  <select
                    value={language}
                    onChange={(e) => {
                      setLanguage(e.target.value);
                      setCode(challenge?.starter_code[e.target.value] || '');
                    }}
                    className="bg-slate-800 text-white px-3 py-1.5 rounded text-sm border border-slate-700"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                  </select>
                  <Button
                    onClick={runCode}
                    disabled={running || !code.trim()}
                    variant="secondary"
                    size="sm"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {running ? 'Running...' : 'Run Code'}
                  </Button>
                </div>
              </div>

              <div className="flex-1">
                <Editor
                  height="100%"
                  language={language}
                  value={code}
                  onChange={(value) => setCode(value || '')}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
