import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Link2, DollarSign, Loader2 } from 'lucide-react';

interface AddProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (url: string, targetPrice: number) => void;
}

export function AddProductModal({ open, onOpenChange, onAdd }: AddProductModalProps) {
  const [url, setUrl] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      toast({
        title: 'URL obrigatória',
        description: 'Por favor, insira a URL do produto.',
        variant: 'destructive'
      });
      return;
    }

    if (!targetPrice || parseFloat(targetPrice) <= 0) {
      toast({
        title: 'Preço alvo inválido',
        description: 'Por favor, insira um preço alvo válido.',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    
    // Simulating API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    onAdd(url, parseFloat(targetPrice));
    
    toast({
      title: 'Produto adicionado!',
      description: 'O monitoramento será iniciado em breve.',
    });
    
    setUrl('');
    setTargetPrice('');
    setIsLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl">Adicionar Produto</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Cole a URL do produto (Amazon ou Mercado Livre) e defina seu preço alvo para alertas.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="url" className="text-sm font-medium">
              URL do Produto
            </Label>
            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="url"
                type="url"
                placeholder="https://amazon.com.br/dp/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="pl-10 bg-secondary border-border"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Suportamos Amazon e Mercado Livre
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetPrice" className="text-sm font-medium">
              Preço Alvo (R$)
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="targetPrice"
                type="number"
                step="0.01"
                min="0"
                placeholder="1.500,00"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                className="pl-10 bg-secondary border-border"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Você receberá um alerta quando o preço atingir esse valor
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="flex-1 bg-gradient-primary hover:opacity-90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adicionando...
                </>
              ) : (
                'Adicionar Produto'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
