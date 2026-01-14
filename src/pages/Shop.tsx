import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Coins, ShoppingBag, Loader2, RefreshCw, Sparkles, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProfile } from '@/hooks/useProfile';
import { useShop } from '@/hooks/useShop';
import { ShopItemCard } from '@/components/rpg/ShopItemCard';
import { PurchaseHistory } from '@/components/rpg/PurchaseHistory';

export default function Shop() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { items, purchases, loading, purchaseItem, hasItem, refetch } = useShop();
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  const handlePurchase = async (item: typeof items[0]) => {
    setPurchasingId(item.id);
    await purchaseItem(item);
    setPurchasingId(null);
  };

  const consumables = items.filter(i => i.is_consumable);
  const permanents = items.filter(i => !i.is_consumable);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Carregando loja...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-yellow-400" />
              <span className="font-bold text-foreground">Loja</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={refetch}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="px-4 py-4 pb-24 space-y-4 max-w-lg mx-auto">
        {/* Gold Display */}
        <Card className="border-border/50 bg-gradient-to-r from-yellow-500/10 to-amber-500/10">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                  <Coins className="h-6 w-6 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Seu Ouro</p>
                  <p className="text-2xl font-bold text-yellow-400">{profile?.gold || 0}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Ganhe ouro em</p>
                <p className="text-sm text-foreground">batalhas vitoriosas!</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shop Tabs */}
        <Tabs defaultValue="consumables" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="consumables" className="text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              Consumíveis
            </TabsTrigger>
            <TabsTrigger value="permanent" className="text-xs">
              <Package className="h-3 w-3 mr-1" />
              Permanentes
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs">
              <Coins className="h-3 w-3 mr-1" />
              Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="consumables" className="space-y-3">
            {consumables.length === 0 ? (
              <Card className="border-border/50">
                <CardContent className="py-8 text-center">
                  <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Nenhum item consumível disponível</p>
                </CardContent>
              </Card>
            ) : (
              consumables.map((item) => (
                <ShopItemCard
                  key={item.id}
                  item={item}
                  owned={false}
                  canAfford={(profile?.gold || 0) >= item.cost_gold}
                  onPurchase={() => handlePurchase(item)}
                  loading={purchasingId === item.id}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="permanent" className="space-y-3">
            {permanents.length === 0 ? (
              <Card className="border-border/50">
                <CardContent className="py-8 text-center">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Nenhum item permanente disponível</p>
                </CardContent>
              </Card>
            ) : (
              permanents.map((item) => (
                <ShopItemCard
                  key={item.id}
                  item={item}
                  owned={hasItem(item.id)}
                  canAfford={(profile?.gold || 0) >= item.cost_gold}
                  onPurchase={() => handlePurchase(item)}
                  loading={purchasingId === item.id}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="history">
            <PurchaseHistory purchases={purchases} items={items} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
