import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Package, Coins } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Purchase, ShopItem } from '@/hooks/useShop';

interface PurchaseHistoryProps {
  purchases: Purchase[];
  items: ShopItem[];
}

export function PurchaseHistory({ purchases, items }: PurchaseHistoryProps) {
  if (purchases.length === 0) {
    return (
      <Card className="border-border/50">
        <CardContent className="py-8 text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Nenhuma compra realizada ainda</p>
        </CardContent>
      </Card>
    );
  }

  const getItemInfo = (itemId: string) => {
    return items.find(i => i.id === itemId);
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Package className="h-4 w-4 text-primary" />
          Histórico de Compras
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {purchases.slice(0, 10).map((purchase) => {
          const item = getItemInfo(purchase.item_id);
          return (
            <div 
              key={purchase.id}
              className="flex items-center justify-between py-2 border-b border-border/30 last:border-0"
            >
              <div>
                <p className="font-medium text-sm text-foreground">
                  {item?.name || 'Item desconhecido'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(purchase.purchased_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
              <div className="flex items-center gap-1 text-yellow-400">
                <Coins className="h-3 w-3" />
                <span className="text-sm font-medium">-{purchase.gold_spent}</span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
