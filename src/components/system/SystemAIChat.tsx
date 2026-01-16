import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Mic, MicOff, Volume2, VolumeX, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSystemAI } from '@/hooks/useSystemAI';
import { cn } from '@/lib/utils';

interface SystemAIChatProps {
  onClose: () => void;
}

export function SystemAIChat({ onClose }: SystemAIChatProps) {
  const {
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
  } = useSystemAI();

  const [input, setInput] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const text = input;
    setInput('');
    await sendMessage(text, voiceEnabled);
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleSpeakToggle = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      setVoiceEnabled(!voiceEnabled);
    }
  };

  return (
    <motion.div
      className="fixed bottom-24 right-6 z-50 w-[calc(100vw-3rem)] max-w-md"
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="bg-background/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl shadow-primary/10 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/20 to-primary/10 border-b border-border px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                  <span className="text-lg font-bold text-primary">S</span>
                </div>
                <motion.div
                  className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-background"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <div>
                <h3 className="font-bold text-foreground">[SISTEMA]</h3>
                <p className="text-xs text-muted-foreground">
                  {isLoading ? 'Processando...' : isSpeaking ? 'Falando...' : isListening ? 'Ouvindo...' : 'Online'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleSpeakToggle}
              >
                {isSpeaking ? (
                  <VolumeX className="h-4 w-4 text-primary" />
                ) : voiceEnabled ? (
                  <Volume2 className="h-4 w-4" />
                ) : (
                  <VolumeX className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={clearMessages}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="h-80 p-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                <span className="text-2xl font-bold text-primary">S</span>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-foreground">[SISTEMA ATIVO]</p>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Jogador detectado. Aguardando comandos.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {['Meu status', 'Listar livros', 'Listar cursos'].map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => sendMessage(suggestion, voiceEnabled)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'flex',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[85%] rounded-2xl px-4 py-2.5',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-muted text-foreground rounded-bl-md border border-border'
                    )}
                  >
                    {message.role === 'assistant' && (
                      <p className="text-xs font-bold text-primary mb-1">[SISTEMA]</p>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className={cn(
                      'text-xs mt-1',
                      message.role === 'user' ? 'text-primary-foreground/60' : 'text-muted-foreground'
                    )}>
                      {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3 border border-border">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">Processando...</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <div className="border-t border-border p-3">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <Button
              type="button"
              variant={isListening ? 'default' : 'outline'}
              size="icon"
              className={cn(
                'shrink-0 h-10 w-10 rounded-full',
                isListening && 'animate-pulse bg-red-500 hover:bg-red-600'
              )}
              onClick={handleVoiceToggle}
              disabled={isLoading}
            >
              {isListening ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite seu comando..."
              className="flex-1 rounded-full bg-muted/50 border-muted"
              disabled={isLoading || isListening}
            />
            <Button
              type="submit"
              size="icon"
              className="shrink-0 h-10 w-10 rounded-full"
              disabled={!input.trim() || isLoading}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
