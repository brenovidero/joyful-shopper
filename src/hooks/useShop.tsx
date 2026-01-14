import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useProfile } from './useProfile';
import { useToast } from './use-toast';

export interface ShopItem {
  id: string;
  name: string;
  description: string | null;
  cost_gold: number;
  icon: string | null;
  is_consumable: boolean;
  is_active: boolean;
}

export interface Purchase {
  id: string;
  item_id: string;
  gold_spent: number;
  purchased_at: string;
  item?: ShopItem;
}

export function useShop() {
  const { user } = useAuth();
  const { profile, fetchProfile } = useProfile();
  const { toast } = useToast();
  const [items, setItems] = useState<ShopItem[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShopData();
  }, [user]);

  const fetchShopData = async () => {
    setLoading(true);
    
    // Fetch active shop items
    const { data: itemsData, error: itemsError } = await supabase
      .from('shop_items')
      .select('*')
      .eq('is_active', true)
      .order('cost_gold', { ascending: true });

    if (itemsError) {
      console.error('Error fetching shop items:', itemsError);
    } else {
      setItems(itemsData as ShopItem[]);
    }

    // Fetch user purchases if logged in
    if (user) {
      const { data: purchasesData, error: purchasesError } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', user.id)
        .order('purchased_at', { ascending: false });

      if (purchasesError) {
        console.error('Error fetching purchases:', purchasesError);
      } else {
        setPurchases(purchasesData as Purchase[]);
      }
    }

    setLoading(false);
  };

  const purchaseItem = async (item: ShopItem) => {
    if (!user || !profile) {
      toast({
        title: 'Erro',
        description: 'Você precisa estar logado para comprar.',
        variant: 'destructive',
      });
      return { success: false };
    }

    if (profile.gold < item.cost_gold) {
      toast({
        title: 'Ouro insuficiente',
        description: `Você precisa de ${item.cost_gold} de ouro para comprar este item.`,
        variant: 'destructive',
      });
      return { success: false };
    }

    // Check if user already owns non-consumable item
    if (!item.is_consumable) {
      const alreadyOwned = purchases.some(p => p.item_id === item.id);
      if (alreadyOwned) {
        toast({
          title: 'Item já adquirido',
          description: 'Você já possui este item.',
          variant: 'destructive',
        });
        return { success: false };
      }
    }

    // Deduct gold from profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ gold: profile.gold - item.cost_gold })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating gold:', updateError);
      toast({
        title: 'Erro',
        description: 'Falha ao processar compra.',
        variant: 'destructive',
      });
      return { success: false };
    }

    // Record purchase
    const { error: purchaseError } = await supabase
      .from('purchases')
      .insert({
        user_id: user.id,
        item_id: item.id,
        gold_spent: item.cost_gold,
      });

    if (purchaseError) {
      console.error('Error recording purchase:', purchaseError);
      // Rollback gold deduction
      await supabase
        .from('profiles')
        .update({ gold: profile.gold })
        .eq('id', user.id);
      
      toast({
        title: 'Erro',
        description: 'Falha ao registrar compra.',
        variant: 'destructive',
      });
      return { success: false };
    }

    // Apply instant effects for XP items
    if (item.is_consumable) {
      let xpField: 'xp_intelligence' | 'xp_vitality' | 'xp_discipline' | null = null;
      
      if (item.name.includes('Sabedoria')) {
        xpField = 'xp_intelligence';
      } else if (item.name.includes('Vitalidade')) {
        xpField = 'xp_vitality';
      } else if (item.name.includes('Disciplina')) {
        xpField = 'xp_discipline';
      }

      if (xpField) {
        const currentXP = profile[xpField] as number;
        await supabase
          .from('profiles')
          .update({ [xpField]: currentXP + 50 })
          .eq('id', user.id);
      }
    }

    toast({
      title: 'Compra realizada!',
      description: `Você adquiriu ${item.name} por ${item.cost_gold} de ouro.`,
    });

    await fetchProfile();
    await fetchShopData();

    return { success: true };
  };

  const hasItem = (itemId: string) => {
    return purchases.some(p => p.item_id === itemId);
  };

  return {
    items,
    purchases,
    loading,
    purchaseItem,
    hasItem,
    refetch: fetchShopData,
  };
}
