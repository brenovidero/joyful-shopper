import { Zap, Shield, Scroll, Heart, Flame, Crown, Sparkles, Sword, Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ShopItem } from '@/hooks/useShop';

interface ShopItemCardProps {
  item: ShopItem;
  owned: boolean;
  canAfford: boolean;
  onPurchase: () => void;
  loading?: boolean;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  zap: Zap,
  shield: Shield,
  scroll: Scroll,
  heart: Heart,
  flame: Flame,
  crown: Crown,
  sparkles: Sparkles,
  sword: Sword,
};

export function ShopItemCard({ item, owned, canAfford, onPurchase, loading }: ShopItemCardProps) {
  const IconComponent = item.icon ? iconMap[item.icon] || Package : Package;
  
  const getItemColor = () => {
    if (item.cost_gold >= 750) return 'text-yellow-400';
    if (item.cost_gold >= 500) return 'text-purple-400';
    if (item.cost_gold >= 200) return 'text-blue-400';
    return 'text-emerald-400';
  };

  const getBgColor = () => {
    if (item.cost_gold >= 750) return 'bg-yellow-500/10';
    if (item.cost_gold >= 500) return 'bg-purple-500/10';
    if (item.cost_gold >= 200) return 'bg-blue-500/10';
    return 'bg-emerald-500/10';
  };

  return (
    <Card className={cn(
      'border-border/50 transition-all duration-200',
      owned && 'opacity-60',
      !canAfford && !owned && 'opacity-75'
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
            getBgColor()
          )}>
            <IconComponent className={cn('h-6 w-6', getItemColor())} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-foreground truncate">{item.name}</h4>
              {!item.is_consumable && (
                <Badge variant="outline" className="text-xs shrink-0">Permanente</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
              {item.description}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="text-yellow-400 font-bold">{item.cost_gold}</span>
                <span className="text-xs text-muted-foreground">ouro</span>
              </div>
              
              {owned ? (
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                  Adquirido
                </Badge>
              ) : (
                <Button
                  size="sm"
                  onClick={onPurchase}
                  disabled={!canAfford || loading}
                  className={cn(
                    'h-8',
                    canAfford 
                      ? 'bg-primary hover:bg-primary/90' 
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {loading ? 'Comprando...' : 'Comprar'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
