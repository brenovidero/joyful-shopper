import { useState } from 'react';
import { motion } from 'framer-motion';
import { Swords, Clock, Zap, Users, Check, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { MartialArtsStyle, MartialArtsSession } from '@/types/workout';

interface MartialArtsSessionProps {
  styles: MartialArtsStyle[];
  sessions: MartialArtsSession[];
  onLogSession: (
    styleId: string,
    durationMinutes: number,
    roundsCompleted: number,
    intensity: number,
    sparring: boolean,
    techniquesPracticed?: string[]
  ) => Promise<number>;
}

export function MartialArtsSessionComponent({ 
  styles, 
  sessions,
  onLogSession 
}: MartialArtsSessionProps) {
  const [selectedStyle, setSelectedStyle] = useState<MartialArtsStyle | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Form state
  const [duration, setDuration] = useState(60);
  const [rounds, setRounds] = useState(3);
  const [intensity, setIntensity] = useState(3);
  const [sparring, setSparring] = useState(false);
  const [selectedTechniques, setSelectedTechniques] = useState<string[]>([]);

  const handleSelectStyle = (style: MartialArtsStyle) => {
    setSelectedStyle(style);
    setSelectedTechniques([]);
    setDialogOpen(true);
  };

  const handleLogSession = async () => {
    if (!selectedStyle) return;

    const xpEarned = await onLogSession(
      selectedStyle.id,
      duration,
      rounds,
      intensity,
      sparring,
      selectedTechniques.length > 0 ? selectedTechniques : undefined
    );

    setDialogOpen(false);
    setSelectedStyle(null);
    setDuration(60);
    setRounds(3);
    setIntensity(3);
    setSparring(false);
    setSelectedTechniques([]);
  };

  const getIntensityLabel = (value: number) => {
    const labels = ['Leve', 'Moderado', 'Intenso', 'Muito Intenso', 'Máximo'];
    return labels[value - 1] || 'Moderado';
  };

  const estimateXP = () => {
    return rounds * 15 + (sparring ? 20 : 0);
  };

  return (
    <>
      <Card className="bg-gradient-to-br from-red-500/10 to-orange-600/10 border-red-500/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-red-400">
            <Swords className="w-5 h-5" />
            Artes Marciais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Escolha seu estilo de luta:
          </p>

          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {styles.map((style) => (
                <motion.div
                  key={style.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className="cursor-pointer hover:bg-muted/50 transition-colors border-border/50"
                    onClick={() => handleSelectStyle(style)}
                  >
                    <CardContent className="p-3 flex items-center gap-3">
                      {style.image_url && (
                        <img 
                          src={style.image_url} 
                          alt={style.name}
                          className="w-14 h-14 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-sm">{style.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {style.description}
                        </p>
                        {style.origin_country && (
                          <Badge variant="outline" className="text-xs mt-1">
                            {style.origin_country}
                          </Badge>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </ScrollArea>

          <p className="text-xs text-center text-muted-foreground">
            +15 VIT XP por round • +20 XP bônus por sparring
          </p>
        </CardContent>
      </Card>

      {/* Log Session Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Swords className="w-5 h-5 text-red-400" />
              Registrar Treino de {selectedStyle?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Duration */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Duração (minutos)
              </Label>
              <Input
                type="number"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                min={5}
                max={180}
              />
            </div>

            {/* Rounds */}
            <div className="space-y-2">
              <Label>Rounds/Séries Completadas</Label>
              <Input
                type="number"
                value={rounds}
                onChange={(e) => setRounds(parseInt(e.target.value) || 0)}
                min={1}
                max={20}
              />
            </div>

            {/* Intensity */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Intensidade
                </Label>
                <Badge variant="secondary">{getIntensityLabel(intensity)}</Badge>
              </div>
              <Slider
                value={[intensity]}
                onValueChange={(v) => setIntensity(v[0])}
                min={1}
                max={5}
                step={1}
              />
            </div>

            {/* Sparring */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-orange-400" />
                <span className="text-sm">Fez Sparring?</span>
              </div>
              <Switch checked={sparring} onCheckedChange={setSparring} />
            </div>

            {/* Techniques */}
            {selectedStyle?.techniques && selectedStyle.techniques.length > 0 && (
              <div className="space-y-2">
                <Label>Técnicas Praticadas</Label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {selectedStyle.techniques.map((technique) => (
                    <div key={technique} className="flex items-center space-x-2">
                      <Checkbox
                        id={technique}
                        checked={selectedTechniques.includes(technique)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedTechniques([...selectedTechniques, technique]);
                          } else {
                            setSelectedTechniques(selectedTechniques.filter(t => t !== technique));
                          }
                        }}
                      />
                      <label htmlFor={technique} className="text-xs">
                        {technique}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* XP Preview */}
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center">
              <p className="text-sm text-muted-foreground">XP Estimado</p>
              <p className="text-2xl font-bold text-green-400">+{estimateXP()} VIT</p>
            </div>

            <Button className="w-full bg-red-600 hover:bg-red-700" onClick={handleLogSession}>
              <Check className="w-4 h-4 mr-2" />
              Registrar Treino
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
