import { Product } from '@/types/product';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ExternalLink, TrendingDown, Pause, Play, AlertTriangle } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  delay?: number;
}

export function ProductCard({ product, onClick, delay = 0 }: ProductCardProps) {
  const getStatusBadge = () => {
    switch (product.status) {
      case 'ativo':
        return <Badge variant="success" className="gap-1"><Play className="h-3 w-3" /> Ativo</Badge>;
      case 'pausado':
        return <Badge variant="warning" className="gap-1"><Pause className="h-3 w-3" /> Pausado</Badge>;
      case 'erro':
        return <Badge variant="danger" className="gap-1"><AlertTriangle className="h-3 w-3" /> Erro</Badge>;
    }
  };

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

  const priceDiff = product.currentPrice - product.targetPrice;
  const isNearTarget = priceDiff <= 0;

  return (
    <div 
      className="group bg-gradient-card rounded-xl border border-border overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-lg cursor-pointer animate-slide-up"
      onClick={onClick}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={product.imageUrl} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3">
          {getStatusBadge()}
        </div>
        {isNearTarget && product.status === 'ativo' && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-success text-success-foreground gap-1 animate-pulse-soft">
              <TrendingDown className="h-3 w-3" /> Meta atingida!
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        <div>
          <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </div>

        {/* Prices */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Preço atual</p>
            <p className="text-2xl font-bold text-foreground">{formatPrice(product.currentPrice)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Preço alvo</p>
            <p className={cn(
              "text-lg font-semibold",
              isNearTarget ? "text-success" : "text-muted-foreground"
            )}>
              {formatPrice(product.targetPrice)}
            </p>
          </div>
        </div>

        {/* AI Verdict */}
        {product.status !== 'erro' && (
          <div className={cn(
            "rounded-lg border px-4 py-3",
            getVerdictStyle()
          )}>
            <div className="flex items-center justify-between">
              <span className="font-medium">{product.lastVerdict}</span>
              <span className="text-sm font-bold">{product.sentimentScore}/10</span>
            </div>
          </div>
        )}

        {product.status === 'erro' && (
          <div className="rounded-lg border border-danger/20 bg-danger/10 px-4 py-3 text-danger">
            <span className="font-medium">Erro ao coletar dados</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="secondary" 
            size="sm" 
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              window.open(product.url, '_blank');
            }}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Ver na loja
          </Button>
        </div>
      </div>
    </div>
  );
}
