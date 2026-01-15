import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar, Dumbbell, Trash2, ChevronDown, ChevronUp, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  WorkoutPlanDay, 
  WorkoutPlanExercise,
  StrengthExercise,
  WorkoutDay, 
  ExerciseCategory,
  WORKOUT_DAY_LABELS,
  EXERCISE_CATEGORY_LABELS,
} from '@/types/workout';
import { ExerciseCatalog } from './ExerciseCatalog';

interface WorkoutPlanBuilderProps {
  planDays: WorkoutPlanDay[];
  exercises: StrengthExercise[];
  onAddDay: (dayOfWeek: WorkoutDay, name: string, targetMuscles: ExerciseCategory[]) => Promise<any>;
  onRemoveDay: (dayId: string) => Promise<boolean>;
  onAddExercise: (planDayId: string, exerciseId: string, sets: number, reps: number, weight?: number) => Promise<boolean>;
  onRemoveExercise: (exerciseId: string) => Promise<boolean>;
}

export function WorkoutPlanBuilder({
  planDays,
  exercises,
  onAddDay,
  onRemoveDay,
  onAddExercise,
  onRemoveExercise,
}: WorkoutPlanBuilderProps) {
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [addDayDialogOpen, setAddDayDialogOpen] = useState(false);
  const [addExerciseDialog, setAddExerciseDialog] = useState<{ open: boolean; dayId: string | null }>({ 
    open: false, 
    dayId: null 
  });

  // New day form state
  const [newDayOfWeek, setNewDayOfWeek] = useState<WorkoutDay>('monday');
  const [newDayName, setNewDayName] = useState('');
  const [selectedMuscles, setSelectedMuscles] = useState<ExerciseCategory[]>([]);

  // New exercise form state
  const [selectedExercise, setSelectedExercise] = useState<StrengthExercise | null>(null);
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(12);
  const [weight, setWeight] = useState<number | undefined>();

  const toggleDay = (dayId: string) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(dayId)) {
      newExpanded.delete(dayId);
    } else {
      newExpanded.add(dayId);
    }
    setExpandedDays(newExpanded);
  };

  const handleAddDay = async () => {
    if (!newDayName) return;
    await onAddDay(newDayOfWeek, newDayName, selectedMuscles);
    setAddDayDialogOpen(false);
    setNewDayName('');
    setSelectedMuscles([]);
  };

  const handleSelectExercise = (exercise: StrengthExercise) => {
    setSelectedExercise(exercise);
  };

  const handleAddExercise = async () => {
    if (!selectedExercise || !addExerciseDialog.dayId) return;
    await onAddExercise(addExerciseDialog.dayId, selectedExercise.id, sets, reps, weight);
    setAddExerciseDialog({ open: false, dayId: null });
    setSelectedExercise(null);
    setSets(3);
    setReps(12);
    setWeight(undefined);
  };

  const usedDays = planDays.map(d => d.day_of_week);
  const availableDays = Object.keys(WORKOUT_DAY_LABELS).filter(
    d => !usedDays.includes(d as WorkoutDay)
  ) as WorkoutDay[];

  return (
    <div className="space-y-4">
      {/* Days List */}
      <AnimatePresence>
        {planDays.map((day) => (
          <motion.div
            key={day.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border-border/50">
              <CardHeader 
                className="pb-2 cursor-pointer" 
                onClick={() => toggleDay(day.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-primary" />
                    <div>
                      <CardTitle className="text-base">{WORKOUT_DAY_LABELS[day.day_of_week]}</CardTitle>
                      <p className="text-sm text-muted-foreground">{day.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {day.exercises?.length || 0} exercícios
                    </Badge>
                    {expandedDays.has(day.id) ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </CardHeader>

              <AnimatePresence>
                {expandedDays.has(day.id) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <CardContent className="space-y-3">
                      {/* Target Muscles */}
                      {day.target_muscles && day.target_muscles.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {day.target_muscles.map((muscle) => (
                            <Badge key={muscle} variant="secondary" className="text-xs">
                              {EXERCISE_CATEGORY_LABELS[muscle]}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Exercises */}
                      <div className="space-y-2">
                        {day.exercises?.map((planExercise, index) => (
                          <PlanExerciseItem
                            key={planExercise.id}
                            planExercise={planExercise}
                            index={index}
                            onRemove={() => onRemoveExercise(planExercise.id)}
                          />
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => setAddExerciseDialog({ open: true, dayId: day.id })}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Adicionar Exercício
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => onRemoveDay(day.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Add Day Button */}
      {availableDays.length > 0 && (
        <Dialog open={addDayDialogOpen} onOpenChange={setAddDayDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full border-dashed">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Dia de Treino
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Dia de Treino</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Dia da Semana</Label>
                <Select value={newDayOfWeek} onValueChange={(v) => setNewDayOfWeek(v as WorkoutDay)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDays.map((day) => (
                      <SelectItem key={day} value={day}>
                        {WORKOUT_DAY_LABELS[day]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Nome do Treino</Label>
                <Input
                  placeholder="Ex: Peito e Tríceps"
                  value={newDayName}
                  onChange={(e) => setNewDayName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Músculos Alvo</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(EXERCISE_CATEGORY_LABELS) as ExerciseCategory[]).map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={category}
                        checked={selectedMuscles.includes(category)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedMuscles([...selectedMuscles, category]);
                          } else {
                            setSelectedMuscles(selectedMuscles.filter(m => m !== category));
                          }
                        }}
                      />
                      <label htmlFor={category} className="text-xs">
                        {EXERCISE_CATEGORY_LABELS[category]}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Button className="w-full" onClick={handleAddDay} disabled={!newDayName}>
                Adicionar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Exercise Dialog */}
      <Dialog 
        open={addExerciseDialog.open} 
        onOpenChange={(open) => setAddExerciseDialog({ open, dayId: open ? addExerciseDialog.dayId : null })}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adicionar Exercício</DialogTitle>
          </DialogHeader>

          {!selectedExercise ? (
            <ExerciseCatalog exercises={exercises} onSelectExercise={handleSelectExercise} />
          ) : (
            <div className="space-y-4">
              {/* Selected Exercise */}
              <Card className="bg-muted/30">
                <CardContent className="p-3 flex items-center gap-3">
                  {selectedExercise.gif_url && (
                    <img 
                      src={selectedExercise.gif_url} 
                      alt={selectedExercise.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <p className="font-medium">{selectedExercise.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedExercise.muscle_primary}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="ml-auto"
                    onClick={() => setSelectedExercise(null)}
                  >
                    Trocar
                  </Button>
                </CardContent>
              </Card>

              {/* Sets and Reps */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Séries</Label>
                  <Input
                    type="number"
                    value={sets}
                    onChange={(e) => setSets(parseInt(e.target.value) || 1)}
                    min={1}
                    max={10}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Repetições</Label>
                  <Input
                    type="number"
                    value={reps}
                    onChange={(e) => setReps(parseInt(e.target.value) || 1)}
                    min={1}
                    max={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Peso (kg)</Label>
                  <Input
                    type="number"
                    value={weight || ''}
                    onChange={(e) => setWeight(e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="Opcional"
                    step={0.5}
                    min={0}
                  />
                </div>
              </div>

              <Button className="w-full" onClick={handleAddExercise}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar ao Treino
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {planDays.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Dumbbell className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">Nenhum dia de treino configurado</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Adicione dias e exercícios ao seu plano semanal
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function PlanExerciseItem({ 
  planExercise, 
  index,
  onRemove 
}: { 
  planExercise: WorkoutPlanExercise; 
  index: number;
  onRemove: () => void;
}) {
  const exercise = planExercise.exercise || planExercise.custom_exercise;
  if (!exercise) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center gap-3 p-2 rounded-lg bg-background/50 border border-border/30"
    >
      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
        {index + 1}
      </span>
      
      {exercise.gif_url && (
        <img 
          src={exercise.gif_url} 
          alt={exercise.name}
          className="w-10 h-10 rounded object-cover"
        />
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{exercise.name}</p>
        <p className="text-xs text-muted-foreground">
          {planExercise.sets}x{planExercise.reps}
          {planExercise.weight_kg && ` • ${planExercise.weight_kg}kg`}
        </p>
      </div>

      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onRemove}>
        <Trash2 className="w-4 h-4 text-muted-foreground" />
      </Button>
    </motion.div>
  );
}
