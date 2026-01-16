import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Star, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface GeneratedQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: string[];
  onSave: (selectedQuestions: string[]) => Promise<{ error: Error | null }>;
  onSaveAsFavorites: (selectedQuestions: string[]) => Promise<{ error: Error | null }>;
}

export function GeneratedQuestionsModal({
  isOpen,
  onClose,
  questions,
  onSave,
  onSaveAsFavorites,
}: GeneratedQuestionsModalProps) {
  const [selectedQuestions, setSelectedQuestions] = useState<Set<number>>(
    new Set(questions.map((_, i) => i))
  );
  const [saving, setSaving] = useState(false);

  const toggleQuestion = (index: number) => {
    const newSelected = new Set(selectedQuestions);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedQuestions(newSelected);
  };

  const handleSave = async (asFavorites: boolean) => {
    const selected = questions.filter((_, i) => selectedQuestions.has(i));
    if (selected.length === 0) return;

    setSaving(true);
    const { error } = asFavorites 
      ? await onSaveAsFavorites(selected)
      : await onSave(selected);
    setSaving(false);

    if (!error) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-card border border-border rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Questões Geradas</h2>
                  <p className="text-sm text-muted-foreground">
                    Selecione as questões para salvar
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-3 mb-6">
              {questions.map((question, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border"
                >
                  <Checkbox
                    id={`question-${index}`}
                    checked={selectedQuestions.has(index)}
                    onCheckedChange={() => toggleQuestion(index)}
                    className="mt-1"
                  />
                  <Label
                    htmlFor={`question-${index}`}
                    className="text-sm cursor-pointer leading-relaxed"
                  >
                    {question}
                  </Label>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleSave(false)}
                disabled={saving || selectedQuestions.size === 0}
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                Salvar ({selectedQuestions.size})
              </Button>
              <Button
                className="flex-1"
                onClick={() => handleSave(true)}
                disabled={saving || selectedQuestions.size === 0}
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Star className="w-4 h-4 mr-2" />
                )}
                Salvar como Favoritas
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
