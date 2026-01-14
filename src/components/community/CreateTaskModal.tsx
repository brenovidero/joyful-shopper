import { useState } from 'react';
import { ListTodo, Sparkles, Coins, Calendar } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface CreateTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    title: string, 
    description?: string, 
    xpReward?: number, 
    goldReward?: number, 
    dueDate?: string
  ) => Promise<void>;
}

export function CreateTaskModal({ open, onOpenChange, onSubmit }: CreateTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [xpReward, setXpReward] = useState(10);
  const [goldReward, setGoldReward] = useState(5);
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    await onSubmit(
      title.trim(), 
      description.trim() || undefined, 
      xpReward, 
      goldReward,
      dueDate || undefined
    );
    setLoading(false);
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setXpReward(10);
    setGoldReward(5);
    setDueDate('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ListTodo className="w-5 h-5 text-primary" />
            Nova Tarefa
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título da Tarefa</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Ler 20 páginas hoje"
              className="bg-background"
              maxLength={100}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalhes sobre a tarefa..."
              className="bg-background resize-none"
              rows={2}
              maxLength={300}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="xp" className="flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-blue-400" />
                XP
              </Label>
              <Input
                id="xp"
                type="number"
                min={1}
                max={100}
                value={xpReward}
                onChange={(e) => setXpReward(Number(e.target.value))}
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gold" className="flex items-center gap-1">
                <Coins className="w-4 h-4 text-yellow-400" />
                Gold
              </Label>
              <Input
                id="gold"
                type="number"
                min={0}
                max={50}
                value={goldReward}
                onChange={(e) => setGoldReward(Number(e.target.value))}
                className="bg-background"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate" className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Data Limite (opcional)
            </Label>
            <Input
              id="dueDate"
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="bg-background"
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={!title.trim() || loading}
            >
              {loading ? 'Criando...' : 'Criar Tarefa'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
