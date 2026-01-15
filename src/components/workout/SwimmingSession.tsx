import { useState } from 'react';
import { motion } from 'framer-motion';
import { Waves, Clock, Ruler, Check, ChevronRight, Droplets } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SwimmingStyle, SwimmingSession } from '@/types/workout';

interface SwimmingSessionProps {
  styles: SwimmingStyle[];
  sessions: SwimmingSession[];
  onLogSession: (
    styleId: string,
    durationMinutes: number,
    lapsCompleted: number,
    poolLengthMeters: number
  ) => Promise<number>;
}

const POOL_LENGTHS = [25, 50];

export function SwimmingSessionComponent({ 
  styles, 
  sessions,
  onLogSession 
}: SwimmingSessionProps) {
  const [selectedStyle, setSelectedStyle] = useState<SwimmingStyle | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Form state
  const [duration, setDuration] = useState(30);
  const [laps, setLaps] = useState(20);
  const [poolLength, setPoolLength] = useState(25);

  const handleSelectStyle = (style: SwimmingStyle) => {
    setSelectedStyle(style);
    setDialogOpen(true);
  };

  const handleLogSession = async () => {
    if (!selectedStyle) return;

    await onLogSession(selectedStyle.id, duration, laps, poolLength);

    setDialogOpen(false);
    setSelectedStyle(null);
    setDuration(30);
    setLaps(20);
    setPoolLength(25);
  };

  const getTotalDistance = () => {
    return (laps * poolLength) / 1000; // km
  };

  const estimateXP = () => {
    return laps * 8;
  };

  return (
    <>
      <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border-cyan-500/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-cyan-400">
            <Waves className="w-5 h-5" />
            Natação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Escolha seu estilo de nado:
          </p>

          <ScrollArea className="h-[250px]">
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
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {style.description}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          {Array.from({ length: style.difficulty }).map((_, i) => (
                            <Droplets key={i} className="w-3 h-3 fill-cyan-400 text-cyan-400" />
                          ))}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </ScrollArea>

          {/* Recent Sessions Summary */}
          {sessions.length > 0 && (
            <div className="bg-background/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-2">Última semana</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-lg font-bold text-cyan-400">
                    {sessions.slice(0, 7).reduce((acc, s) => acc + s.laps_completed, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Voltas</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-blue-400">
                    {sessions.slice(0, 7).reduce((acc, s) => acc + (s.duration_minutes || 0), 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Minutos</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-green-400">
                    {sessions.slice(0, 7).reduce((acc, s) => acc + s.xp_earned, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">XP</p>
                </div>
              </div>
            </div>
          )}

          <p className="text-xs text-center text-muted-foreground">
            +8 VIT XP por volta completada
          </p>
        </CardContent>
      </Card>

      {/* Log Session Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Waves className="w-5 h-5 text-cyan-400" />
              Registrar Treino de {selectedStyle?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Pool Length */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Ruler className="w-4 h-4" />
                Tamanho da Piscina
              </Label>
              <Select value={poolLength.toString()} onValueChange={(v) => setPoolLength(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {POOL_LENGTHS.map((length) => (
                    <SelectItem key={length} value={length.toString()}>
                      {length} metros
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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

            {/* Laps */}
            <div className="space-y-2">
              <Label>Voltas Completadas</Label>
              <Input
                type="number"
                value={laps}
                onChange={(e) => setLaps(parseInt(e.target.value) || 0)}
                min={1}
                max={200}
              />
            </div>

            {/* Stats Preview */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3 text-center">
                <p className="text-sm text-muted-foreground">Distância Total</p>
                <p className="text-xl font-bold text-cyan-400">{getTotalDistance().toFixed(2)} km</p>
              </div>
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center">
                <p className="text-sm text-muted-foreground">XP Estimado</p>
                <p className="text-xl font-bold text-green-400">+{estimateXP()} VIT</p>
              </div>
            </div>

            {/* Muscles Worked */}
            {selectedStyle?.muscles_worked && selectedStyle.muscles_worked.length > 0 && (
              <div className="space-y-2">
                <Label>Músculos Trabalhados</Label>
                <div className="flex flex-wrap gap-1">
                  {selectedStyle.muscles_worked.map((muscle, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {muscle}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Button className="w-full bg-cyan-600 hover:bg-cyan-700" onClick={handleLogSession}>
              <Check className="w-4 h-4 mr-2" />
              Registrar Treino
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
