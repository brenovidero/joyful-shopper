import { useState, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function useSystemAI() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  const sendMessage = useCallback(async (content: string, speakResponse = false) => {
    if (!user || !content.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/system-ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          })),
          userId: user.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao comunicar com o Sistema');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (data.actions_executed && data.actions_executed.length > 0) {
        toast({
          title: '[SISTEMA] Ação Executada',
          description: `Operações: ${data.actions_executed.join(', ')}`
        });
      }

      // Speak the response if requested
      if (speakResponse && data.message) {
        await speak(data.message);
      }

      return data;
    } catch (error) {
      console.error('[System AI] Error:', error);
      toast({
        title: '[ERRO] Sistema',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, messages, SUPABASE_URL, SUPABASE_KEY, toast]);

  const speak = useCallback(async (text: string) => {
    if (!text) return;

    setIsSpeaking(true);

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/system-tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        throw new Error('Erro ao gerar voz');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (error) {
      console.error('[TTS] Error:', error);
      setIsSpeaking(false);
      toast({
        title: '[ERRO] Voz do Sistema',
        description: 'Não foi possível reproduzir a voz',
        variant: 'destructive'
      });
    }
  }, [SUPABASE_URL, SUPABASE_KEY, toast]);

  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsSpeaking(false);
    }
  }, []);

  const startListening = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        
        await transcribeAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsListening(true);

      toast({
        title: '[SISTEMA] Ouvindo...',
        description: 'Fale agora, Jogador.'
      });
    } catch (error) {
      console.error('[STT] Microphone error:', error);
      toast({
        title: '[ERRO] Microfone',
        description: 'Não foi possível acessar o microfone',
        variant: 'destructive'
      });
    }
  }, [toast]);

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  const transcribeAudio = useCallback(async (audioBlob: Blob) => {
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await fetch(`${SUPABASE_URL}/functions/v1/system-stt`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Erro ao transcrever áudio');
      }

      const data = await response.json();
      
      if (data.text) {
        // Send the transcribed text as a message with voice response
        await sendMessage(data.text, true);
      }
    } catch (error) {
      console.error('[STT] Transcription error:', error);
      toast({
        title: '[ERRO] Transcrição',
        description: 'Não foi possível entender o áudio',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [SUPABASE_URL, SUPABASE_KEY, sendMessage, toast]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    isSpeaking,
    isListening,
    sendMessage,
    speak,
    stopSpeaking,
    startListening,
    stopListening,
    clearMessages
  };
}
