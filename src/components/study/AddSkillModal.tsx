import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Zap, Target } from 'lucide-react';

interface AddSkillModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string, targetDays: number) => Promise<void>;
}

export function AddSkillModal({ open, onOpenChange, onSubmit }: AddSkillModalProps) {
  const [name, setName] = useState('');
  const [targetDays, setTargetDays] = useState(100);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || targetDays < 1) return;

    setIsSubmitting(true);
    await onSubmit(name.trim(), targetDays);
    setIsSubmitting(false);
    setName('');
    setTargetDays(100);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Nova Habilidade
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="skill-name">Nome da Habilidade</Label>
            <Input
              id="skill-name"
              placeholder="Ex: Java, Piano, Desenho..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="target-days" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Meta de Dias
            </Label>
            <Input
              id="target-days"
              type="number"
              min={1}
              max={365}
              value={targetDays}
              onChange={(e) => setTargetDays(Number(e.target.value))}
              required
            />
            <p className="text-xs text-muted-foreground">
              Quantos dias você quer estudar essa habilidade?
            </p>
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Criando...' : 'Criar Habilidade'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
