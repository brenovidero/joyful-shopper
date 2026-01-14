import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Users, Search, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CommunityCard } from '@/components/community/CommunityCard';
import { CreateCommunityModal } from '@/components/community/CreateCommunityModal';
import { useCommunity } from '@/hooks/useCommunity';
import { useToast } from '@/hooks/use-toast';
import { Spinner } from '@/components/ui/spinner';

export default function Communities() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    communities, 
    myCommunities, 
    loading, 
    createCommunity, 
    joinCommunity, 
    leaveCommunity,
    fetchCommunities,
    fetchMyCommunities
  } = useCommunity();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCreateCommunity = async (name: string, description?: string) => {
    const { error } = await createCommunity(name, description);
    if (error) {
      toast({
        title: 'Erro ao criar comunidade',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Comunidade criada!',
        description: 'Sua comunidade foi enviada para aprovação.',
      });
    }
  };

  const handleJoinCommunity = async (communityId: string) => {
    const { error } = await joinCommunity(communityId);
    if (error) {
      toast({
        title: 'Erro ao entrar na comunidade',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Você entrou na comunidade!',
      });
    }
  };

  const handleLeaveCommunity = async (communityId: string) => {
    const { error } = await leaveCommunity(communityId);
    if (error) {
      toast({
        title: 'Erro ao sair da comunidade',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Você saiu da comunidade',
      });
    }
  };

  const handleRefresh = () => {
    fetchCommunities();
    fetchMyCommunities();
  };

  const myCommunityIds = new Set(myCommunities.map(c => c.id));
  
  const filteredCommunities = communities.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMyCommunities = myCommunities.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/50 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold">Comunidades</h1>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button size="sm" onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Criar
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar comunidades..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-card"
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner className="w-8 h-8" />
          </div>
        ) : (
          <Tabs defaultValue="my" className="space-y-4">
            <TabsList className="w-full">
              <TabsTrigger value="my" className="flex-1">
                Minhas ({myCommunities.length})
              </TabsTrigger>
              <TabsTrigger value="explore" className="flex-1">
                Explorar ({communities.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="my" className="space-y-4">
              {filteredMyCommunities.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Você ainda não faz parte de nenhuma comunidade</p>
                  <Button 
                    variant="link" 
                    className="mt-2"
                    onClick={() => setShowCreateModal(true)}
                  >
                    Criar uma comunidade
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {filteredMyCommunities.map((community) => (
                    <CommunityCard
                      key={community.id}
                      community={community}
                      isMember={true}
                      onView={() => navigate(`/community/${community.id}`)}
                      onLeave={() => handleLeaveCommunity(community.id)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="explore" className="space-y-4">
              {filteredCommunities.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhuma comunidade encontrada</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {filteredCommunities.map((community) => (
                    <CommunityCard
                      key={community.id}
                      community={community}
                      isMember={myCommunityIds.has(community.id)}
                      onView={() => navigate(`/community/${community.id}`)}
                      onJoin={() => handleJoinCommunity(community.id)}
                      onLeave={() => handleLeaveCommunity(community.id)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Create Modal */}
      <CreateCommunityModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSubmit={handleCreateCommunity}
      />
    </div>
  );
}
