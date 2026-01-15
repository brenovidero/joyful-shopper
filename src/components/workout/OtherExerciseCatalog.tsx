import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Clock, Check, ChevronRight, Search, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OtherExercise, OtherExerciseSession } from '@/types/workout';

interface OtherExerciseCatalogProps {
  exercises: OtherExercise[];
  sessions: OtherExerciseSession[];
  onLogSession: (
    exerciseId: string | null,
    customName: string | null,
    durationMinutes: number,
    setsCompleted?: number,
    repsCompleted?: number
  ) => Promise<number>;
}

const CATEGORY_LABELS: Record<string, { label: string; icon: string }> = {
  functional: { label: 'Funcional', icon: '🏋️' },
  calisthenics: { label: 'Calistenia', icon: '💪' },
  crossfit: { label: 'CrossFit', icon: '🔥' },
  pilates: { label: 'Pilates', icon: '🧘' },
  cardio: { label: 'Cardio', icon: '❤️' },
};

export function OtherExerciseCatalog({ 
  exercises, 
  sessions,
  onLogSession 
}: OtherExerciseCatalogProps) {
  const [selectedExercise, setSelectedExercise] = useState<OtherExercise | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [customName, setCustomName] = useState('');
  
  // Form state
  const [duration, setDuration] = useState(30);
  const [sets, setSets] = useState<number | undefined>();
  const [reps, setReps] = useState<number | undefined>();

  const categories = [...new Set(exercises.map(e => e.category))];

  const filteredExercises = exercises.filter(e => 
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectExercise = (exercise: OtherExercise) => {
    setSelectedExercise(exercise);
    setCustomName('');
    setDialogOpen(true);
  };

  const handleCustomExercise = () => {
    setSelectedExercise(null);
    setDialogOpen(true);
  };

  const handleLogSession = async () => {
    await onLogSession(
      selectedExercise?.id || null,
      customName || null,
      duration,
      sets,
      reps
    );

    setDialogOpen(false);
    setSelectedExercise(null);
    setCustomName('');
    setDuration(30);
    setSets(undefined);
    setReps(undefined);
  };

  const estimateXP = () => {
    return (sets || 1) * 5;
  };

  return (
    <>
      <Card className="bg-gradient-to-br from-violet-500/10 to-fuchsia-600/10 border-violet-500/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-violet-400">
            <Sparkles className="w-5 h-5" />
            Outros Exercícios
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar exercício..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Tabs */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-auto">
              <TabsTrigger value="all" className="text-xs py-1.5">Todos</TabsTrigger>
              <TabsTrigger value="functional" className="text-xs py-1.5">Funcional</TabsTrigger>
              <TabsTrigger value="calisthenics" className="text-xs py-1.5">Calistenia</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-3">
              <ExerciseList exercises={filteredExercises} onSelect={handleSelectExercise} />
            </TabsContent>
            <TabsContent value="functional" className="mt-3">
              <ExerciseList 
                exercises={filteredExercises.filter(e => e.category === 'functional')} 
                onSelect={handleSelectExercise} 
              />
            </TabsContent>
            <TabsContent value="calisthenics" className="mt-3">
              <ExerciseList 
                exercises={filteredExercises.filter(e => e.category === 'calisthenics')} 
                onSelect={handleSelectExercise} 
              />
            </TabsContent>
          </Tabs>

          {/* Custom Exercise Button */}
          <Button 
            variant="outline" 
            className="w-full border-dashed"
            onClick={handleCustomExercise}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Registrar Exercício Personalizado
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            +5 VIT XP por série completada
          </p>
        </CardContent>
      </Card>

      {/* Log Session Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-400" />
              {selectedExercise ? `Registrar ${selectedExercise.name}` : 'Exercício Personalizado'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Custom Name (if no exercise selected) */}
            {!selectedExercise && (
              <div className="space-y-2">
                <Label>Nome do Exercício</Label>
                <Input
                  placeholder="Ex: Salto no Box"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                />
              </div>
            )}

            {/* Exercise Info */}
            {selectedExercise && (
              <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                {selectedExercise.image_url && (
                  <img 
                    src={selectedExercise.image_url} 
                    alt={selectedExercise.name}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                )}
                <p className="text-sm text-muted-foreground">{selectedExercise.description}</p>
                {selectedExercise.muscles_worked && (
                  <div className="flex flex-wrap gap-1">
                    {selectedExercise.muscles_worked.map((muscle, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {muscle}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}

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
                min={1}
                max={180}
              />
            </div>

            {/* Sets and Reps */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Séries</Label>
                <Input
                  type="number"
                  value={sets || ''}
                  onChange={(e) => setSets(e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="Opcional"
                  min={1}
                  max={20}
                />
              </div>
              <div className="space-y-2">
                <Label>Repetições</Label>
                <Input
                  type="number"
                  value={reps || ''}
                  onChange={(e) => setReps(e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="Opcional"
                  min={1}
                  max={100}
                />
              </div>
            </div>

            {/* XP Preview */}
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center">
              <p className="text-sm text-muted-foreground">XP Estimado</p>
              <p className="text-2xl font-bold text-green-400">+{estimateXP()} VIT</p>
            </div>

            <Button 
              className="w-full bg-violet-600 hover:bg-violet-700" 
              onClick={handleLogSession}
              disabled={!selectedExercise && !customName}
            >
              <Check className="w-4 h-4 mr-2" />
              Registrar Exercício
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ExerciseList({ 
  exercises, 
  onSelect 
}: { 
  exercises: OtherExercise[]; 
  onSelect: (exercise: OtherExercise) => void;
}) {
  return (
    <ScrollArea className="h-[200px]">
      <div className="space-y-2">
        {exercises.map((exercise) => (
          <motion.div
            key={exercise.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card 
              className="cursor-pointer hover:bg-muted/50 transition-colors border-border/50"
              onClick={() => onSelect(exercise)}
            >
              <CardContent className="p-2 flex items-center gap-2">
                {exercise.image_url && (
                  <img 
                    src={exercise.image_url} 
                    alt={exercise.name}
                    className="w-10 h-10 rounded object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{exercise.name}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {CATEGORY_LABELS[exercise.category]?.label || exercise.category}
                    </Badge>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: exercise.difficulty }).map((_, i) => (
                        <Star key={i} className="w-2 h-2 fill-yellow-500 text-yellow-500" />
                      ))}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </ScrollArea>
  );
}
