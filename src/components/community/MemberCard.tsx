import { Crown, Shield, User, MoreVertical } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CommunityMember, CommunityRole, COMMUNITY_ROLE_LABELS } from '@/types/community';
import { RANK_CONFIG, PlayerRank } from '@/types/rpg';
import { cn } from '@/lib/utils';

interface MemberCardProps {
  member: CommunityMember;
  canManage?: boolean;
  isCurrentUser?: boolean;
  onPromote?: (role: CommunityRole) => void;
  onRemove?: () => void;
}

export function MemberCard({ 
  member, 
  canManage, 
  isCurrentUser,
  onPromote, 
  onRemove 
}: MemberCardProps) {
  const RoleIcon = {
    leader: Crown,
    vice_leader: Shield,
    member: User,
  }[member.role];

  const roleColors = {
    leader: 'text-yellow-400',
    vice_leader: 'text-purple-400',
    member: 'text-muted-foreground',
  };

  const rankConfig = member.profile?.rank 
    ? RANK_CONFIG[member.profile.rank as PlayerRank] 
    : null;

  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-xl",
      "bg-card/50 backdrop-blur-sm border border-border/50"
    )}>
      <Avatar className="w-10 h-10">
        <AvatarImage src={member.profile?.avatar_url || undefined} />
        <AvatarFallback className="bg-primary/20">
          {member.profile?.display_name?.[0] || 'U'}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">
            {member.profile?.display_name || 'Usuário'}
          </span>
          {isCurrentUser && (
            <Badge variant="outline" className="text-xs">Você</Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <RoleIcon className={cn("w-3.5 h-3.5", roleColors[member.role])} />
          <span className={roleColors[member.role]}>
            {COMMUNITY_ROLE_LABELS[member.role]}
          </span>
          {rankConfig && (
            <>
              <span className="text-muted-foreground">•</span>
              <span className={rankConfig.color}>
                Lv.{member.profile?.level} {rankConfig.label}
              </span>
            </>
          )}
        </div>
      </div>

      {canManage && !isCurrentUser && member.role !== 'leader' && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-card border-border">
            {member.role === 'member' && (
              <DropdownMenuItem onClick={() => onPromote?.('vice_leader')}>
                <Shield className="w-4 h-4 mr-2 text-purple-400" />
                Promover a Vice-Líder
              </DropdownMenuItem>
            )}
            {member.role === 'vice_leader' && (
              <DropdownMenuItem onClick={() => onPromote?.('member')}>
                <User className="w-4 h-4 mr-2" />
                Rebaixar a Membro
              </DropdownMenuItem>
            )}
            <DropdownMenuItem 
              onClick={onRemove}
              className="text-destructive focus:text-destructive"
            >
              Remover da Comunidade
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
