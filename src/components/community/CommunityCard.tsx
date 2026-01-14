import { Users, Crown, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Community, COMMUNITY_STATUS_LABELS } from '@/types/community';
import { cn } from '@/lib/utils';

interface CommunityCardProps {
  community: Community;
  isMember?: boolean;
  memberCount?: number;
  onJoin?: () => void;
  onLeave?: () => void;
  onView?: () => void;
}

export function CommunityCard({ 
  community, 
  isMember, 
  memberCount = 0,
  onJoin, 
  onLeave, 
  onView 
}: CommunityCardProps) {
  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-200 hover:shadow-lg cursor-pointer",
        "bg-card/50 backdrop-blur-sm border-border/50"
      )}
      onClick={onView}
    >
      {/* Cover */}
      <div 
        className="h-24 bg-gradient-to-br from-primary/30 to-accent/30"
        style={community.cover_url ? { 
          backgroundImage: `url(${community.cover_url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : undefined}
      />
      
      <CardContent className="p-4 -mt-8 relative">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-xl bg-background border-4 border-background overflow-hidden mb-3">
          {community.image_url ? (
            <img 
              src={community.image_url} 
              alt={community.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-primary/20 flex items-center justify-center">
              <Users className="w-8 h-8 text-primary" />
            </div>
          )}
        </div>

        {/* Info */}
        <h3 className="font-bold text-foreground truncate">{community.name}</h3>
        {community.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {community.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-3 mt-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{memberCount} membros</span>
          </div>
          {community.status !== 'approved' && (
            <Badge variant="secondary" className="text-xs">
              {COMMUNITY_STATUS_LABELS[community.status]}
            </Badge>
          )}
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-2" onClick={(e) => e.stopPropagation()}>
          {isMember ? (
            <>
              <Button 
                variant="default" 
                size="sm" 
                className="flex-1"
                onClick={onView}
              >
                Entrar
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={onLeave}
              >
                Sair
              </Button>
            </>
          ) : (
            <Button 
              variant="default" 
              size="sm" 
              className="flex-1"
              onClick={onJoin}
            >
              Participar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
