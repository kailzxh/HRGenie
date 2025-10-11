'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Application, ChatMessage } from '@/lib/supabase/types';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function HRInterviewPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchApplication();
    }
  }, [user, params.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchApplication = async () => {
    const { data: appData, error: appError } = await supabase
      .from('applications') // <-- onboarding schema
      .select('*, job:jobs(*)') // <-- remove schema from renamed join
      .eq('id', params.id)
      .eq('profile_id', user!.id)
      .maybeSingle();

    if (appData && !appError) {
      setApplication(appData);
      setMessages(appData.hr_interview_transcript || []);

      if (!appData.hr_interview_transcript || appData.hr_interview_transcript.length === 0) {
        const initialMessages: ChatMessage[] = [
          {
            role: 'assistant',
            content: `Hello! I'm excited to speak with you today about the ${appData.job?.title} position at our company. I'm an AI HR interviewer, and I'll be asking you some questions to better understand your background, motivations, and how you'd be a great fit for our team.

This interview will focus on behavioral questions using the STAR method (Situation, Task, Action, Result). Take your time with your answers, and feel free to ask me questions about the role or company as well.

Let's start with an icebreaker: Can you tell me a bit about yourself and what attracted you to this position?`,
            timestamp: new Date().toISOString(),
          },
        ];
        setMessages(initialMessages);
        await saveTranscript(initialMessages);
      }
    } else {
      toast({
        title: 'Error',
        description: 'Application not found',
        variant: 'destructive',
      });
      router.push('/dashboard');
    }
    setLoading(false);
  };

  const saveTranscript = async (updatedMessages: ChatMessage[]) => {
    await supabase
      .from('applications') // <-- onboarding schema
      .update({ hr_interview_transcript: updatedMessages })
      .eq('id', params.id);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputMessage('');
    setSending(true);

    setTimeout(async () => {
      const hrQuestions = [
        "That's great! Tell me about a time when you had to work with a difficult team member. How did you handle the situation?",
        "Excellent. Can you describe a situation where you had to meet a tight deadline? What was your approach?",
        "I appreciate that perspective. Tell me about a time when you made a mistake at work. How did you handle it?",
        "Thank you for sharing. Why are you interested in working for our company specifically?",
        "What are your long-term career goals, and how does this position align with them?",
        "Great answers! Do you have any questions for me about the role, team, or company culture?",
        "Thank you for taking the time to speak with me today. We'll be in touch soon with next steps. Is there anything else you'd like to add?",
      ];

      const responseIndex = Math.min(
        Math.floor((updatedMessages.filter((m) => m.role === 'user').length - 1) / 1),
        hrQuestions.length - 1
      );

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content:
          hrQuestions[responseIndex] ||
          "Thank you for your thoughtful response. In a production environment, this would use Vertex AI Agent Builder with Gemini to provide intelligent, context-aware follow-up questions based on your answers, evaluate your responses using behavioral interview frameworks, and generate a comprehensive summary for recruiters.",
        timestamp: new Date().toISOString(),
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);
      await saveTranscript(finalMessages);
      setSending(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="h-[calc(100vh-8rem)]">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              HR Interview - {application?.job?.title}
            </CardTitle>
            <p className="text-sm text-slate-600 mt-1">
              Behavioral Interview with AI HR Agent
            </p>
          </CardHeader>
          <CardContent className="p-0 h-[calc(100%-5rem)] flex flex-col">
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
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

            <div className="p-6 border-t bg-white">
              <div className="flex gap-2">
                <Textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your answer here..."
                  className="resize-none"
                  rows={4}
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
              <p className="text-xs text-slate-500 mt-2">
                Press Enter to send, Shift+Enter for a new line
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
