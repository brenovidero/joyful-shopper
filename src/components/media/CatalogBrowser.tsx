import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FolderOpen, Plus, ChevronRight, Trash2, 
  Video, Camera, Laptop, Dumbbell, ChefHat, Music, Book 
} from 'lucide-react';
import { useCatalogs } from '@/hooks/useCatalogs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface CatalogBrowserProps {
  communityId?: string;
  onSelectCatalog?: (catalogId: string) => void;
  selectedCatalogId?: string;
}

const CATALOG_ICONS: Record<string, React.ReactNode> = {
  tecnologia: <Laptop className="w-4 h-4" />,
  academia: <Dumbbell className="w-4 h-4" />,
  culinaria: <ChefHat className="w-4 h-4" />,
  musica: <Music className="w-4 h-4" />,
  estudo: <Book className="w-4 h-4" />,
  video: <Video className="w-4 h-4" />,
  foto: <Camera className="w-4 h-4" />,
};

export function CatalogBrowser({ communityId, onSelectCatalog, selectedCatalogId }: CatalogBrowserProps) {
  const catalogs = useCatalogs();
  const [parentId, setParentId] = useState<string | undefined>(undefined);
  const [breadcrumbs, setBreadcrumbs] = useState<{ id: string; name: string }[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [newCatalogName, setNewCatalogName] = useState('');
  const [newCatalogDesc, setNewCatalogDesc] = useState('');
  const [newCatalogIcon, setNewCatalogIcon] = useState('');

  const { data: isAdmin } = catalogs.useIsAdmin();

  // Use global or community catalogs based on context
  const { data: catalogList, isLoading } = communityId
    ? catalogs.useCommunityatalogs(communityId, parentId)
    : catalogs.useGlobalCatalogs(parentId);

  const handleNavigate = (catalog: { id: string; name: string }) => {
    setBreadcrumbs([...breadcrumbs, catalog]);
    setParentId(catalog.id);
  };

  const handleBack = (index: number) => {
    if (index === -1) {
      setBreadcrumbs([]);
      setParentId(undefined);
    } else {
      setBreadcrumbs(breadcrumbs.slice(0, index + 1));
      setParentId(breadcrumbs[index].id);
    }
  };

  const handleCreateCatalog = () => {
    if (!newCatalogName.trim()) return;

    if (communityId) {
      catalogs.createCommunityCatalog({
        communityId,
        name: newCatalogName.trim(),
        description: newCatalogDesc.trim() || undefined,
        icon: newCatalogIcon.trim() || undefined,
        parentId,
      });
    } else {
      catalogs.createGlobalCatalog({
        name: newCatalogName.trim(),
        description: newCatalogDesc.trim() || undefined,
        icon: newCatalogIcon.trim() || undefined,
        parentId,
      });
    }

    setNewCatalogName('');
    setNewCatalogDesc('');
    setNewCatalogIcon('');
    setCreateOpen(false);
  };

  const handleDeleteCatalog = (catalogId: string) => {
    if (communityId) {
      catalogs.deleteCommunityCatalog(catalogId);
    } else {
      catalogs.deleteGlobalCatalog(catalogId);
    }
  };

  const getIcon = (iconName: string | null) => {
    if (!iconName) return <FolderOpen className="w-4 h-4" />;
    return CATALOG_ICONS[iconName.toLowerCase()] || <FolderOpen className="w-4 h-4" />;
  };

  const canManage = communityId ? true : isAdmin; // Leaders manage community, admins manage global

  return (
    <Card className="border-primary/20 bg-card/80 backdrop-blur">
      <CardHeader className="py-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FolderOpen className="w-5 h-5 text-primary" />
            Catálogos
          </CardTitle>
          {canManage && (
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-primary/20">
                <DialogHeader>
                  <DialogTitle>Novo Catálogo</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nome *</Label>
                    <Input
                      value={newCatalogName}
                      onChange={(e) => setNewCatalogName(e.target.value)}
                      placeholder="Ex: Tecnologia"
                      className="bg-background/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Textarea
                      value={newCatalogDesc}
                      onChange={(e) => setNewCatalogDesc(e.target.value)}
                      placeholder="Descrição do catálogo"
                      className="bg-background/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Ícone</Label>
                    <Input
                      value={newCatalogIcon}
                      onChange={(e) => setNewCatalogIcon(e.target.value)}
                      placeholder="tecnologia, academia, culinaria..."
                      className="bg-background/50"
                    />
                    <p className="text-xs text-muted-foreground">
                      Opções: tecnologia, academia, culinaria, musica, estudo, video, foto
                    </p>
                  </div>
                  <Button onClick={handleCreateCatalog} disabled={!newCatalogName.trim()} className="w-full">
                    Criar Catálogo
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1 mb-3 flex-wrap">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-6 px-2"
            onClick={() => handleBack(-1)}
          >
            Início
          </Button>
          {breadcrumbs.map((crumb, idx) => (
            <div key={crumb.id} className="flex items-center">
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-6 px-2"
                onClick={() => handleBack(idx)}
              >
                {crumb.name}
              </Button>
            </div>
          ))}
        </div>

        {/* Catalog List */}
        <ScrollArea className="h-48">
          {isLoading ? (
            <p className="text-center text-muted-foreground text-sm py-4">Carregando...</p>
          ) : catalogList?.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-4">
              {parentId ? 'Nenhum sub-catálogo' : 'Nenhum catálogo'}
            </p>
          ) : (
            <div className="space-y-2">
              {catalogList?.map((cat) => (
                <div
                  key={cat.id}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                    selectedCatalogId === cat.id
                      ? 'bg-primary/20 border border-primary/50'
                      : 'bg-muted/30 hover:bg-muted/50'
                  }`}
                >
                  <div
                    className="flex items-center gap-2 flex-1"
                    onClick={() => onSelectCatalog?.(cat.id)}
                  >
                    {getIcon(cat.icon)}
                    <div>
                      <p className="text-sm font-medium">{cat.name}</p>
                      {cat.description && (
                        <p className="text-xs text-muted-foreground">{cat.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleNavigate({ id: cat.id, name: cat.name })}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    {canManage && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => handleDeleteCatalog(cat.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
