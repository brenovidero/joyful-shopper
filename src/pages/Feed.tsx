import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Rss } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useMedia } from '@/hooks/useMedia';
import { MediaPostCard } from '@/components/media/MediaPostCard';
import { CreatePostModal } from '@/components/media/CreatePostModal';
import { CatalogBrowser } from '@/components/media/CatalogBrowser';

const Feed = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedCatalog, setSelectedCatalog] = useState<string | undefined>();
  const { data: posts, isLoading } = useMedia().useGlobalFeed(selectedCatalog);

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 p-4 pb-20">
      <div className="max-w-lg mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Rss className="w-5 h-5 text-primary" /> Feed
          </h1>
          <CreatePostModal catalogId={selectedCatalog} />
        </div>

        <CatalogBrowser onSelectCatalog={setSelectedCatalog} selectedCatalogId={selectedCatalog} />

        {isLoading ? (
          <p className="text-center text-muted-foreground py-8">Carregando...</p>
        ) : posts?.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Nenhuma publicação ainda</p>
        ) : (
          <div className="space-y-4">
            {posts?.map((post) => <MediaPostCard key={post.id} post={post} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;
