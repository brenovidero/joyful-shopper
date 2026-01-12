import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { PlayerCard } from '@/components/rpg/PlayerCard';
import { QuickActions } from '@/components/rpg/QuickActions';
import { TodayProgress } from '@/components/rpg/TodayProgress';
import { Button } from '@/components/ui/button';
import { Settings, LogOut, Loader2, Swords } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Index() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: 'Até logo!',
      description: 'Você saiu da sua conta.',
    });
    navigate('/auth');
  };

  const handleNavigate = (section: string) => {
    if (section === 'battle') {
      navigate('/battle');
      return;
    }
    if (section === 'quests') {
      navigate('/quests');
      return;
    }
    toast({
      title: 'Em breve!',
      description: `O módulo "${section}" será implementado em seguida.`,
    });
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Swords className="h-4 w-4 text-primary" />
            </div>
            <span className="font-bold text-foreground">Focus RPG</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-4 pb-24 space-y-4 max-w-lg mx-auto">
        {/* Player Card */}
        <PlayerCard profile={profile} />

        {/* Today's Progress */}
        <TodayProgress profile={profile} />

        {/* Quick Actions */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground px-1">Ações Rápidas</h3>
          <QuickActions onNavigate={handleNavigate} />
        </div>
      </main>
    </div>
  );
}
