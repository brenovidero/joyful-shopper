import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, BookOpen, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Book } from '@/types/rpg';
import { cn } from '@/lib/utils';

interface LogReadingModalProps {
  isOpen: boolean;
  book: Book | null;
  onClose: () => void;
  onLog: (bookId: string, pagesRead: number, notes?: string) => Promise<{ xpEarned?: number; isCompleted?: boolean; error: Error | null }>;
  loading: boolean;
}

const XP_PER_PAGE = 2;

export function LogReadingModal({ isOpen, book, onClose, onLog, loading }: LogReadingModalProps) {
  const [pagesRead, setPagesRead] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen || !book) return null;

  const remainingPages = book.total_pages - book.pages_read;
  const pages = parseInt(pagesRead) || 0;
  const willComplete = pages >= remainingPages;
  const xpPreview = pages * XP_PER_PAGE;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pagesRead || pages <= 0) return;

    await onLog(book.id, Math.min(pages, remainingPages), notes || undefined);

    // Reset form
    setPagesRead('');
    setNotes('');
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-lg bg-card rounded-t-3xl border-t border-border p-6 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-12 h-1 bg-muted rounded-full mx-auto mb-4" />

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Registrar Leitura</h2>
              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                {book.title}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Progress preview */}
        <div className="p-4 rounded-xl bg-muted/30 border border-border/50 mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progresso atual</span>
            <span className="font-medium text-foreground">
              {book.pages_read} / {book.total_pages} páginas
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Restante</span>
            <span className="font-medium text-foreground">{remainingPages} páginas</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pages">Páginas lidas *</Label>
            <Input
              id="pages"
              type="number"
              min="1"
              max={remainingPages}
              value={pagesRead}
              onChange={(e) => setPagesRead(e.target.value)}
              placeholder={`1 a ${remainingPages}`}
              required
            />
          </div>

          {/* XP Preview */}
          {pages > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex items-center justify-between p-3 rounded-xl",
                willComplete 
                  ? "bg-yellow-500/20 border border-yellow-500/30"
                  : "bg-purple-500/20 border border-purple-500/30"
              )}
            >
              <div className="flex items-center gap-2">
                <Sparkles className={cn(
                  "h-4 w-4",
                  willComplete ? "text-yellow-500" : "text-purple-400"
                )} />
                <span className={cn(
                  "text-sm font-medium",
                  willComplete ? "text-yellow-500" : "text-purple-400"
                )}>
                  {willComplete ? 'Quest Completa!' : 'XP a ganhar'}
                </span>
              </div>
              <span className={cn(
                "font-bold",
                willComplete ? "text-yellow-500" : "text-purple-400"
              )}>
                +{xpPreview} XP
              </span>
            </motion.div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anotações sobre a leitura..."
              rows={3}
            />
          </div>

          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={loading || !pagesRead || pages <= 0}
            >
              {loading ? 'Registrando...' : 'Registrar Leitura'}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
