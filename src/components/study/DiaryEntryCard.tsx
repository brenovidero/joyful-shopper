import { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  FileText, 
  Calendar, 
  Sparkles, 
  Trash2, 
  ChevronDown,
  ChevronUp,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { StudyDiaryEntry } from '@/types/study';
import { supabase } from '@/integrations/supabase/client';

interface DiaryEntryCardProps {
  entry: StudyDiaryEntry;
  onDelete: (entryId: string) => void;
  onQuestionsGenerated: (entryId: string, questions: string[]) => void;
}

export function DiaryEntryCard({ entry, onDelete, onQuestionsGenerated }: DiaryEntryCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerateQuestions = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-study-questions', {
        body: { 
          summary: entry.summary,
          subject: entry.subject,
        },
      });

      if (error) throw error;

      if (data?.questions && Array.isArray(data.questions)) {
        onQuestionsGenerated(entry.id, data.questions);
        toast({
          title: 'Questões Geradas!',
          description: `${data.questions.length} perguntas de Active Recall criadas.`,
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      toast({
        title: 'Erro ao gerar questões',
        description: 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl overflow-hidden"
    >
      <div 
        className="p-4 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm line-clamp-1">{entry.subject}</h3>
              <div className="flex items-center gap-2 mt-1">
                {entry.course && (
                  <Badge variant="secondary" className="text-xs">
                    {entry.course.name}
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(entry.entry_date), "d 'de' MMMM", { locale: ptBR })}
                </span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="shrink-0">
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="border-t border-border"
        >
          <div className="p-4 space-y-4">
            <div className="bg-muted/30 rounded-lg p-4">
              <h4 className="text-xs font-medium text-muted-foreground mb-2">Resumo</h4>
              <p className="text-sm whitespace-pre-wrap">{entry.summary}</p>
            </div>

            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateQuestions}
                disabled={generating}
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Gerar Questões de Revisão
                  </>
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(entry.id);
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
