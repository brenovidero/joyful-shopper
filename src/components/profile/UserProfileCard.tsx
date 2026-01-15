import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, Settings, UserPlus, UserMinus, UserX, Heart, 
  Users, BookOpen, Swords, Award, Flame 
} from 'lucide-react';
import { useSocial } from '@/hooks/useSocial';
import { useAuth } from '@/hooks/useAuth';
import type { PublicProfile } from '@/types/social';

interface UserProfileCardProps {
  profile: PublicProfile;
  isOwnProfile?: boolean;
  onEditProfile?: () => void;
}

export function UserProfileCard({ profile, isOwnProfile = false, onEditProfile }: UserProfileCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const social = useSocial();
  
  const { data: isFollowing } = social.useIsFollowing(profile.id);
  const { data: followers } = social.useFollowers(profile.id);
  const { data: following } = social.useFollowing(profile.id);
  const { data: friendships } = social.useFriendships();

  const friendship = friendships?.find(
    f => (f.requester_id === profile.id || f.addressee_id === profile.id) && f.status === 'accepted'
  );

  const pendingRequest = friendships?.find(
    f => f.addressee_id === user?.id && f.requester_id === profile.id && f.status === 'pending'
  );

  const handleFollow = () => {
    if (isFollowing) {
      social.unfollow(profile.id);
    } else {
      social.follow(profile.id);
    }
  };

  const handleFriendAction = () => {
    if (friendship) {
      social.removeFriendship(friendship.id);
    } else if (pendingRequest) {
      social.acceptFriendRequest(pendingRequest.id);
    } else {
      social.sendFriendRequest(profile.id);
    }
  };

  const handleBlock = () => {
    social.block(profile.id);
  };

  const totalXp = profile.xp_intelligence + profile.xp_vitality + profile.xp_discipline;

  return (
    <Card className="overflow-hidden border-primary/20 bg-card/80 backdrop-blur">
      {/* Cover */}
      <div className="h-32 bg-gradient-to-r from-primary/30 via-secondary/30 to-accent/30 relative">
        {profile.cover_url && (
          <img src={profile.cover_url} alt="Cover" className="w-full h-full object-cover" />
        )}
        {friendship?.is_best_friend && (
          <Badge className="absolute top-2 right-2 bg-pink-500/80">
            <Heart className="w-3 h-3 mr-1" />
            {friendship.best_friend_title || 'Melhores Amigos'}
          </Badge>
        )}
      </div>

      <CardContent className="relative pt-0">
        {/* Avatar */}
        <div className="flex justify-between items-start -mt-12">
          <Avatar className="w-24 h-24 border-4 border-card shadow-lg">
            <AvatarImage src={profile.avatar_url || undefined} />
            <AvatarFallback className="bg-primary/20 text-2xl">
              {profile.display_name?.charAt(0) || <User className="w-10 h-10" />}
            </AvatarFallback>
          </Avatar>

          {isOwnProfile ? (
            <Button variant="outline" size="sm" className="mt-14" onClick={onEditProfile}>
              <Settings className="w-4 h-4 mr-2" />
              Editar
            </Button>
          ) : (
            <div className="flex gap-2 mt-14">
              <Button
                variant={isFollowing ? 'outline' : 'default'}
                size="sm"
                onClick={handleFollow}
              >
                {isFollowing ? <UserMinus className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              </Button>
              <Button
                variant={friendship ? 'outline' : 'secondary'}
                size="sm"
                onClick={handleFriendAction}
              >
                {friendship ? 'Amigos' : pendingRequest ? 'Aceitar' : 'Adicionar'}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleBlock}>
                <UserX className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-4">
          <h2 className="text-xl font-bold text-foreground">
            {profile.display_name || 'Aventureiro'}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-primary border-primary/50">
              Nível {profile.level}
            </Badge>
            <Badge className="bg-gradient-to-r from-primary to-secondary capitalize">
              {profile.rank}
            </Badge>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 text-center">
          <div>
            <p className="text-2xl font-bold text-primary">{followers?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Seguidores</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-secondary">{following?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Seguindo</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-accent">{profile.streak_days}</p>
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Flame className="w-3 h-3" /> Streak
            </p>
          </div>
        </div>

        {/* XP Stats */}
        <div className="grid grid-cols-4 gap-2 mt-4 p-3 rounded-lg bg-muted/30">
          <div className="text-center">
            <Award className="w-5 h-5 mx-auto text-yellow-500" />
            <p className="text-sm font-bold">{totalXp}</p>
            <p className="text-xs text-muted-foreground">XP Total</p>
          </div>
          <div className="text-center">
            <BookOpen className="w-5 h-5 mx-auto text-blue-500" />
            <p className="text-sm font-bold">{profile.xp_intelligence}</p>
            <p className="text-xs text-muted-foreground">INT</p>
          </div>
          <div className="text-center">
            <Swords className="w-5 h-5 mx-auto text-red-500" />
            <p className="text-sm font-bold">{profile.xp_discipline}</p>
            <p className="text-xs text-muted-foreground">DIS</p>
          </div>
          <div className="text-center">
            <Users className="w-5 h-5 mx-auto text-green-500" />
            <p className="text-sm font-bold">{profile.xp_vitality}</p>
            <p className="text-xs text-muted-foreground">VIT</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
