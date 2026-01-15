import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Users, UserCheck, UserPlus, Heart, UserX, 
  Check, X, Star, MessageCircle 
} from 'lucide-react';
import { useSocial } from '@/hooks/useSocial';
import { useAuth } from '@/hooks/useAuth';
import type { Friendship, UserFollow, UserBlock } from '@/types/social';

export function SocialLists() {
  const { user } = useAuth();
  const social = useSocial();
  const [bestFriendTitle, setBestFriendTitle] = useState('');
  const [selectedFriendship, setSelectedFriendship] = useState<string | null>(null);

  const { data: followers, isLoading: loadingFollowers } = social.useFollowers(user?.id || '');
  const { data: following, isLoading: loadingFollowing } = social.useFollowing(user?.id || '');
  const { data: friendships, isLoading: loadingFriends } = social.useFriendships();
  const { data: blocked, isLoading: loadingBlocked } = social.useBlockedUsers();

  const friends = friendships?.filter(f => f.status === 'accepted') || [];
  const bestFriends = friends.filter(f => f.is_best_friend);
  const pendingRequests = friendships?.filter(
    f => f.addressee_id === user?.id && f.status === 'pending'
  ) || [];

  const getFriendProfile = (f: Friendship) => {
    return f.requester_id === user?.id ? f.addressee_profile : f.requester_profile;
  };

  const handleSetBestFriend = (friendshipId: string) => {
    if (bestFriendTitle) {
      social.setBestFriend({ friendshipId, title: bestFriendTitle });
      setBestFriendTitle('');
      setSelectedFriendship(null);
    }
  };

  return (
    <Card className="border-primary/20 bg-card/80 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Social
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="friends" className="space-y-4">
          <TabsList className="grid grid-cols-5 w-full bg-muted/50">
            <TabsTrigger value="friends" className="text-xs">
              <UserCheck className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="bestfriends" className="text-xs">
              <Heart className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="followers" className="text-xs">
              <UserPlus className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="following" className="text-xs">
              <Users className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="blocked" className="text-xs">
              <UserX className="w-4 h-4" />
            </TabsTrigger>
          </TabsList>

          {/* Friends */}
          <TabsContent value="friends">
            <div className="space-y-4">
              {/* Pending Requests */}
              {pendingRequests.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Solicitações</h4>
                  {pendingRequests.map((req) => (
                    <div key={req.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={req.requester_profile?.avatar_url || undefined} />
                          <AvatarFallback>{req.requester_profile?.display_name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{req.requester_profile?.display_name}</span>
                      </div>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-green-500" onClick={() => social.acceptFriendRequest(req.id)}>
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => social.rejectFriendRequest(req.id)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Friends List */}
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {friends.map((f) => {
                    const profile = getFriendProfile(f);
                    return (
                      <div key={f.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={profile?.avatar_url || undefined} />
                            <AvatarFallback>{profile?.display_name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{profile?.display_name}</p>
                            <p className="text-xs text-muted-foreground">Nível {profile?.level}</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {!f.is_best_friend && (
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8" 
                              onClick={() => setSelectedFriendship(f.id)}
                            >
                              <Star className="w-4 h-4 text-yellow-500" />
                            </Button>
                          )}
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => social.removeFriendship(f.id)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                  {friends.length === 0 && <p className="text-center text-muted-foreground text-sm py-4">Nenhum amigo ainda</p>}
                </div>
              </ScrollArea>

              {/* Best Friend Title Modal */}
              {selectedFriendship && (
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 space-y-2">
                  <p className="text-sm">Definir título de melhores amigos:</p>
                  <Input
                    placeholder="Ex: Parceiros de Estudo"
                    value={bestFriendTitle}
                    onChange={(e) => setBestFriendTitle(e.target.value)}
                    className="bg-background/50"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleSetBestFriend(selectedFriendship)}>Definir</Button>
                    <Button size="sm" variant="ghost" onClick={() => setSelectedFriendship(null)}>Cancelar</Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Best Friends */}
          <TabsContent value="bestfriends">
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {bestFriends.map((f) => {
                  const profile = getFriendProfile(f);
                  return (
                    <div key={f.id} className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 ring-2 ring-pink-500">
                          <AvatarImage src={profile?.avatar_url || undefined} />
                          <AvatarFallback>{profile?.display_name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{profile?.display_name}</p>
                          <Badge variant="outline" className="text-xs text-pink-500 border-pink-500/50">
                            <Heart className="w-3 h-3 mr-1" />
                            {f.best_friend_title}
                          </Badge>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        Tarefas
                      </Button>
                    </div>
                  );
                })}
                {bestFriends.length === 0 && (
                  <p className="text-center text-muted-foreground text-sm py-4">
                    Marque um amigo como melhor amigo para compartilhar tarefas!
                  </p>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Followers */}
          <TabsContent value="followers">
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {followers?.map((f) => (
                  <div key={f.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={f.follower_profile?.avatar_url || undefined} />
                        <AvatarFallback>{f.follower_profile?.display_name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{f.follower_profile?.display_name}</p>
                        <p className="text-xs text-muted-foreground">Nível {f.follower_profile?.level}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {(!followers || followers.length === 0) && <p className="text-center text-muted-foreground text-sm py-4">Nenhum seguidor ainda</p>}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Following */}
          <TabsContent value="following">
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {following?.map((f) => (
                  <div key={f.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={f.following_profile?.avatar_url || undefined} />
                        <AvatarFallback>{f.following_profile?.display_name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{f.following_profile?.display_name}</p>
                        <p className="text-xs text-muted-foreground">Nível {f.following_profile?.level}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => social.unfollow(f.following_id)}>
                      <UserX className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {(!following || following.length === 0) && <p className="text-center text-muted-foreground text-sm py-4">Você não segue ninguém</p>}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Blocked */}
          <TabsContent value="blocked">
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {blocked?.map((b) => (
                  <div key={b.id} className="flex items-center justify-between p-2 rounded-lg bg-red-500/10">
                    <span className="text-sm text-muted-foreground">Usuário bloqueado</span>
                    <Button size="sm" variant="ghost" onClick={() => social.unblock(b.blocked_id)}>
                      Desbloquear
                    </Button>
                  </div>
                ))}
                {(!blocked || blocked.length === 0) && <p className="text-center text-muted-foreground text-sm py-4">Nenhum usuário bloqueado</p>}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
