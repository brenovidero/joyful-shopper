import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AddCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, totalLessons: number) => Promise<{ error: Error | null }>;
}

export function AddCourseModal({ isOpen, onClose, onSubmit }: AddCourseModalProps) {
  const [name, setName] = useState('');
  const [totalLessons, setTotalLessons] = useState(10);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || totalLessons < 1) return;

    setLoading(true);
    const { error } = await onSubmit(name.trim(), totalLessons);
    setLoading(false);

    if (!error) {
      setName('');
      setTotalLessons(10);
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
            className="bg-card border border-border rounded-xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold">Novo Curso</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Curso</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: JavaScript Avançado"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalLessons">Total de Aulas</Label>
                <Input
                  id="totalLessons"
                  type="number"
                  min={1}
                  value={totalLessons}
                  onChange={(e) => setTotalLessons(parseInt(e.target.value) || 1)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                <Plus className="w-4 h-4 mr-2" />
                {loading ? 'Adicionando...' : 'Adicionar Curso'}
              </Button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
