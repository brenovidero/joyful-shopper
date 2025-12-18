import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Profile, getRankFromLevel } from '@/types/rpg';

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
    } else if (data) {
      setProfile(data as unknown as Profile);
    }
    setLoading(false);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (!error) {
      await fetchProfile();
    }
    return { error };
  };

  const addXP = async (type: 'intelligence' | 'vitality' | 'discipline', amount: number) => {
    if (!profile) return;

    const field = `xp_${type}` as keyof Profile;
    const currentXP = profile[field] as number;
    const newXP = currentXP + amount;
    
    const totalXP = profile.xp_intelligence + profile.xp_vitality + profile.xp_discipline + amount;
    const newLevel = Math.floor(Math.sqrt(totalXP / 50)) + 1;
    const newRank = getRankFromLevel(newLevel);

    await updateProfile({
      [field]: newXP,
      level: newLevel,
      rank: newRank,
    } as Partial<Profile>);
  };

  const addGold = async (amount: number) => {
    if (!profile) return;
    await updateProfile({ gold: profile.gold + amount });
  };

  return { profile, loading, fetchProfile, updateProfile, addXP, addGold };
}
