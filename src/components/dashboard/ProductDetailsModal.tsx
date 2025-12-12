import { Product, PriceHistory } from '@/types/product';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PriceChart } from './PriceChart';
import { cn } from '@/lib/utils';
import { ExternalLink, ThumbsUp, ThumbsDown, Clock, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ProductDetailsModalProps {
  product: Product | null;
  priceHistory: PriceHistory[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductDetailsModal({ product, priceHistory, open, onOpenChange }: ProductDetailsModalProps) {
  if (!product) return null;

  const getVerdictStyle = () => {
    switch (product.verdictType) {
      case 'positivo':
        return 'bg-success/10 text-success border-success/20';
      case 'neutro':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'negativo':
        return 'bg-danger/10 text-danger border-danger/20';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const productHistory = priceHistory.filter(h => h.productId === product.id);
  const minPrice = Math.min(...productHistory.map(h => h.price));
  const maxPrice = Math.max(...productHistory.map(h => h.price));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl pr-8">{product.name}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 mt-4">
          {/* Price Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-secondary/50 rounded-lg p-4 space-y-1">
              <p className="text-sm text-muted-foreground">Preço Atual</p>
              <p className="text-2xl font-bold text-foreground">{formatPrice(product.currentPrice)}</p>
            </div>
            <div className="bg-secondary/50 rounded-lg p-4 space-y-1">
              <p className="text-sm text-muted-foreground">Menor Preço (15 dias)</p>
              <p className="text-2xl font-bold text-success">{formatPrice(minPrice)}</p>
            </div>
            <div className="bg-secondary/50 rounded-lg p-4 space-y-1">
              <p className="text-sm text-muted-foreground">Maior Preço (15 dias)</p>
              <p className="text-2xl font-bold text-danger">{formatPrice(maxPrice)}</p>
            </div>
          </div>

          {/* AI Verdict */}
          <div className={cn(
            "rounded-xl border p-6",
            getVerdictStyle()
          )}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {product.verdictType === 'positivo' && <ThumbsUp className="h-6 w-6" />}
                {product.verdictType === 'negativo' && <ThumbsDown className="h-6 w-6" />}
                {product.verdictType === 'neutro' && <TrendingDown className="h-6 w-6" />}
                <span className="text-xl font-bold">{product.lastVerdict}</span>
              </div>
              <Badge variant="outline" className="text-lg px-4 py-1 border-current">
                {product.sentimentScore}/10
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 text-sm opacity-80">
              <Clock className="h-4 w-4" />
              <span>
                Última análise: {format(product.lastUpdated, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
              </span>
            </div>
          </div>

          {/* Price Chart */}
          <div className="bg-secondary/30 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Histórico de Preços</h3>
            <PriceChart data={productHistory} targetPrice={product.targetPrice} />
          </div>

          {/* Pros and Cons */}
          {product.pros.length > 0 && product.cons.length > 0 && (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-success/5 border border-success/20 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <ThumbsUp className="h-5 w-5 text-success" />
                  <h3 className="font-semibold text-success">Prós</h3>
                </div>
                <ul className="space-y-2">
                  {product.pros.map((pro, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-foreground/90">
                      <span className="text-success mt-1">•</span>
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-danger/5 border border-danger/20 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <ThumbsDown className="h-5 w-5 text-danger" />
                  <h3 className="font-semibold text-danger">Contras</h3>
                </div>
                <ul className="space-y-2">
                  {product.cons.map((con, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-foreground/90">
                      <span className="text-danger mt-1">•</span>
                      {con}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button 
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Fechar
            </Button>
            <Button 
              onClick={() => window.open(product.url, '_blank')}
              className="flex-1 bg-gradient-primary hover:opacity-90"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Ver na Loja
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
