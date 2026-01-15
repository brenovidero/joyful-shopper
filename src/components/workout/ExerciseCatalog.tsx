import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Dumbbell, ChevronRight, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StrengthExercise, ExerciseCategory, EXERCISE_CATEGORY_LABELS } from '@/types/workout';

interface ExerciseCatalogProps {
  exercises: StrengthExercise[];
  onSelectExercise?: (exercise: StrengthExercise) => void;
}

const CATEGORY_GROUPS = {
  'Parte Superior': ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms', 'traps', 'lats'] as ExerciseCategory[],
  'Parte Inferior': ['quadriceps', 'hamstrings', 'glutes', 'calves'] as ExerciseCategory[],
  'Core': ['abs', 'obliques', 'lower_back'] as ExerciseCategory[],
};

export function ExerciseCatalog({ exercises, onSelectExercise }: ExerciseCatalogProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | 'all'>('all');

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(search.toLowerCase()) ||
      exercise.muscle_primary.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || exercise.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedByCategory = filteredExercises.reduce((acc, exercise) => {
    if (!acc[exercise.category]) {
      acc[exercise.category] = [];
    }
    acc[exercise.category].push(exercise);
    return acc;
  }, {} as Record<ExerciseCategory, StrengthExercise[]>);

  return (
    <div className="space-y-4">
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
      <Tabs defaultValue="all" onValueChange={(v) => setSelectedCategory(v as ExerciseCategory | 'all')}>
        <TabsList className="grid w-full grid-cols-4 h-auto">
          <TabsTrigger value="all" className="text-xs py-2">Todos</TabsTrigger>
          <TabsTrigger value="upper" className="text-xs py-2">Superior</TabsTrigger>
          <TabsTrigger value="lower" className="text-xs py-2">Inferior</TabsTrigger>
          <TabsTrigger value="core" className="text-xs py-2">Core</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {Object.entries(groupedByCategory).map(([category, categoryExercises]) => (
                <div key={category}>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                    <Dumbbell className="w-4 h-4" />
                    {EXERCISE_CATEGORY_LABELS[category as ExerciseCategory]}
                    <Badge variant="outline" className="text-xs">{categoryExercises.length}</Badge>
                  </h3>
                  <div className="space-y-2">
                    {categoryExercises.map((exercise) => (
                      <ExerciseCard 
                        key={exercise.id} 
                        exercise={exercise} 
                        onClick={() => onSelectExercise?.(exercise)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="upper" className="mt-4">
          <ExerciseList 
            exercises={filteredExercises.filter(e => CATEGORY_GROUPS['Parte Superior'].includes(e.category))}
            onSelectExercise={onSelectExercise}
          />
        </TabsContent>

        <TabsContent value="lower" className="mt-4">
          <ExerciseList 
            exercises={filteredExercises.filter(e => CATEGORY_GROUPS['Parte Inferior'].includes(e.category))}
            onSelectExercise={onSelectExercise}
          />
        </TabsContent>

        <TabsContent value="core" className="mt-4">
          <ExerciseList 
            exercises={filteredExercises.filter(e => CATEGORY_GROUPS['Core'].includes(e.category))}
            onSelectExercise={onSelectExercise}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ExerciseList({ 
  exercises, 
  onSelectExercise 
}: { 
  exercises: StrengthExercise[]; 
  onSelectExercise?: (exercise: StrengthExercise) => void;
}) {
  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-2">
        {exercises.map((exercise) => (
          <ExerciseCard 
            key={exercise.id} 
            exercise={exercise} 
            onClick={() => onSelectExercise?.(exercise)}
          />
        ))}
      </div>
    </ScrollArea>
  );
}

function ExerciseCard({ 
  exercise, 
  onClick 
}: { 
  exercise: StrengthExercise; 
  onClick?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className="cursor-pointer hover:bg-muted/50 transition-colors border-border/50"
        onClick={onClick}
      >
        <CardContent className="p-3 flex items-center gap-3">
          {exercise.gif_url ? (
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
              <img 
                src={exercise.gif_url} 
                alt={exercise.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
              <Dumbbell className="w-6 h-6 text-muted-foreground" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{exercise.name}</p>
            <p className="text-xs text-muted-foreground truncate">{exercise.muscle_primary}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                {EXERCISE_CATEGORY_LABELS[exercise.category]}
              </Badge>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: exercise.difficulty }).map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                ))}
              </div>
            </div>
          </div>

          <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        </CardContent>
      </Card>
    </motion.div>
  );
}
