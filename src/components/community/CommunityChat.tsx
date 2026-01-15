import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send, Image as ImageIcon } from 'lucide-react';
import { useCommunityChat } from '@/hooks/useCommunityChat';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CommunityChatProps {
  communityId: string;
}

export function CommunityChat({ communityId }: CommunityChatProps) {
  const { user } = useAuth();
  const { messages, isLoading, sendMessage, isSending } = useCommunityChat(communityId);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    sendMessage({ content: newMessage.trim() });
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="border-primary/20 bg-card/80 backdrop-blur h-[500px] flex flex-col">
      <CardHeader className="py-3 border-b border-border/50">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageCircle className="w-5 h-5 text-primary" />
          Chat da Comunidade
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {isLoading ? (
              <p className="text-center text-muted-foreground text-sm">Carregando...</p>
            ) : messages.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-8">
                Nenhuma mensagem ainda. Seja o primeiro a enviar!
              </p>
            ) : (
              messages.map((msg) => {
                const isOwn = msg.user_id === user?.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}
                  >
                    <Avatar className="w-8 h-8 shrink-0">
                      <AvatarImage src={msg.user_profile?.avatar_url || undefined} />
                      <AvatarFallback className="text-xs">
                        {msg.user_profile?.display_name?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
                      <div className={`flex items-center gap-2 mb-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
                        <span className="text-xs font-medium">
                          {msg.user_profile?.display_name || 'Usuário'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(msg.created_at), 'HH:mm', { locale: ptBR })}
                        </span>
                      </div>
                      <div
                        className={`rounded-2xl px-4 py-2 ${
                          isOwn
                            ? 'bg-primary text-primary-foreground rounded-tr-sm'
                            : 'bg-muted rounded-tl-sm'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                        {msg.media_url && (
                          <img
                            src={msg.media_url}
                            alt="Media"
                            className="mt-2 rounded-lg max-w-full"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-3 border-t border-border/50 bg-muted/30">
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="shrink-0">
              <ImageIcon className="w-5 h-5 text-muted-foreground" />
            </Button>
            <Input
              placeholder="Digite sua mensagem..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="bg-background/50"
              disabled={isSending}
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!newMessage.trim() || isSending}
              className="shrink-0 bg-primary"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
