import { Profile, RANK_CONFIG, getSkillLevelFromXP, getCharacterLevelFromXP, getTotalXP } from '@/types/rpg';
import { XPBar } from './XPBar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Brain, Heart, Zap, Coins, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlayerCardProps {
  profile: Profile;
}

export function PlayerCard({ profile }: PlayerCardProps) {
  const rankConfig = RANK_CONFIG[profile.rank];
  const totalXP = getTotalXP(profile);
  
  // Calcular nível do personagem e progresso
  const characterProgress = getCharacterLevelFromXP(totalXP);
  
  // Calcular níveis individuais das skills
  const intProgress = getSkillLevelFromXP(profile.xp_intelligence);
  const vitProgress = getSkillLevelFromXP(profile.xp_vitality);
  const disProgress = getSkillLevelFromXP(profile.xp_discipline);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-card border border-border/50">
      {/* Aura background effect */}
      <div className={cn(
        'absolute inset-0 bg-gradient-to-br opacity-30',
        rankConfig.aura,
        'to-transparent'
      )} />
      
      {/* Content */}
      <div className="relative p-4 space-y-4">
        {/* Header: Avatar + Info */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-16 w-16 border-2 border-primary/50 shadow-lg">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/20 text-primary text-xl font-bold">
                {profile.display_name?.charAt(0).toUpperCase() || 'A'}
              </AvatarFallback>
            </Avatar>
            {/* Level badge */}
            <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full shadow">
              Nv.{characterProgress.level}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-foreground truncate">
              {profile.display_name || 'Aventureiro'}
            </h2>
            <p className={cn('text-sm font-semibold', rankConfig.color)}>
              {rankConfig.label}
            </p>
            
            {/* Level progress */}
            <div className="mt-2">
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500"
                  style={{ width: `${characterProgress.progress}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {characterProgress.currentLevelXP.toLocaleString()} / {characterProgress.xpForNextLevel.toLocaleString()} XP
              </p>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-between bg-background/50 rounded-xl p-3">
          <div className="flex items-center gap-1.5">
            <Coins className="h-4 w-4 text-yellow-500" />
            <span className="font-bold text-yellow-500">{profile.gold}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="font-medium text-orange-500">{profile.streak_days} dias</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Vitórias</span>
            <span className="font-bold text-foreground">{profile.total_battles_won}</span>
          </div>
        </div>

        {/* XP Bars com níveis individuais */}
        <div className="space-y-3">
          <XPBar
            label="Inteligência"
            current={intProgress.currentLevelXP}
            max={intProgress.xpForNextLevel}
            color="intelligence"
            icon={<Brain className="h-3.5 w-3.5" />}
            level={intProgress.level}
          />
          <XPBar
            label="Vitalidade"
            current={vitProgress.currentLevelXP}
            max={vitProgress.xpForNextLevel}
            color="vitality"
            icon={<Heart className="h-3.5 w-3.5" />}
            level={vitProgress.level}
          />
          <XPBar
            label="Disciplina"
            current={disProgress.currentLevelXP}
            max={disProgress.xpForNextLevel}
            color="discipline"
            icon={<Zap className="h-3.5 w-3.5" />}
            level={disProgress.level}
          />
        </div>
      </div>
    </div>
  );
}
