import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { BookOpen, Sparkles, Loader2 } from 'lucide-react';
import { StudySkill } from '@/types/skill';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AddSkillLogModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skill: StudySkill | null;
  onSubmit: (skillId: string, title: string, content: string) => Promise<{ isCompleted?: boolean }>;
}

export function AddSkillLogModal({ open, onOpenChange, skill, onSubmit }: AddSkillLogModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skill || !title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    const result = await onSubmit(skill.id, title.trim(), content.trim());
    setIsSubmitting(false);
    
    if (result?.isCompleted) {
      toast({
        title: "🏆 Habilidade Conquistada!",
        description: `Parabéns! Você completou ${skill.name}!`,
      });
    }
    
    setTitle('');
    setContent('');
    onOpenChange(false);
  };

  const handleGenerateWithAI = async () => {
    if (!skill || !title.trim()) {
      toast({
        title: "Título necessário",
        description: "Escreva um título para a IA gerar o conteúdo.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-study-questions', {
        body: {
          mode: 'generate_log',
          skill_name: skill.name,
          day_number: skill.current_day + 1,
          title: title.trim(),
        },
      });

      if (error) throw error;
      
      if (data?.content) {
        setContent(data.content);
        toast({
          title: "Conteúdo gerado!",
          description: "Revise e edite conforme necessário.",
        });
      }
    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: "Erro ao gerar",
        description: "Não foi possível gerar o conteúdo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!skill) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Dia {skill.current_day + 1} - {skill.name}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="log-title">Título do Dia</Label>
            <Input
              id="log-title"
              placeholder="O que você estudou hoje?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="log-content">O que você aprendeu?</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGenerateWithAI}
                disabled={isGenerating || !title.trim()}
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-1" />
                )}
                Gerar com IA
              </Button>
            </div>
            <Textarea
              id="log-content"
              placeholder="Descreva o que você aprendeu, fez ou praticou hoje..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              required
            />
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Progresso: {skill.current_day}/{skill.target_days} dias</span>
            {skill.current_day + 1 === skill.target_days && (
              <span className="text-primary font-medium">🏆 Último dia!</span>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Registrar Dia'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
