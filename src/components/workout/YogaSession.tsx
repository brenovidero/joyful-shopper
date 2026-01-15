import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flower2, Play, Check, Clock, Star, Heart, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { YogaPose, YogaSession as YogaSessionType } from '@/types/workout';

interface YogaSessionProps {
  poses: YogaPose[];
  onStartSession: (sessionType: string) => Promise<YogaSessionType | null>;
  onEndSession: (sessionId: string, posesCompleted: number, durationMinutes: number) => Promise<number>;
}

const SESSION_TYPES = [
  { id: 'morning', label: 'Manhã Energizante', icon: '🌅', duration: '15-20 min', description: 'Desperte seu corpo e mente' },
  { id: 'power', label: 'Power Yoga', icon: '💪', duration: '30-45 min', description: 'Treino intenso de força' },
  { id: 'relaxation', label: 'Relaxamento', icon: '🧘', duration: '20-30 min', description: 'Alongamento e paz mental' },
  { id: 'evening', label: 'Noturno', icon: '🌙', duration: '15-20 min', description: 'Prepare-se para dormir' },
];

export function YogaSessionComponent({ poses, onStartSession, onEndSession }: YogaSessionProps) {
  const [activeSession, setActiveSession] = useState<YogaSessionType | null>(null);
  const [currentPoseIndex, setCurrentPoseIndex] = useState(0);
  const [completedPoses, setCompletedPoses] = useState<Set<string>>(new Set());
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [poseTimer, setPoseTimer] = useState(0);
  const [isPoseActive, setIsPoseActive] = useState(false);

  const selectedPoses = poses.slice(0, 5); // Use first 5 poses for session

  const handleStartSession = async (sessionType: string) => {
    const session = await onStartSession(sessionType);
    if (session) {
      setActiveSession(session);
      setSessionStartTime(new Date());
      setCurrentPoseIndex(0);
      setCompletedPoses(new Set());
    }
  };

  const handleStartPose = () => {
    setIsPoseActive(true);
    const currentPose = selectedPoses[currentPoseIndex];
    let timeLeft = currentPose.duration_seconds;
    
    const interval = setInterval(() => {
      timeLeft -= 1;
      setPoseTimer(timeLeft);
      
      if (timeLeft <= 0) {
        clearInterval(interval);
        handleCompletePose();
      }
    }, 1000);
  };

  const handleCompletePose = () => {
    setIsPoseActive(false);
    setPoseTimer(0);
    
    const currentPose = selectedPoses[currentPoseIndex];
    setCompletedPoses(prev => new Set([...prev, currentPose.id]));
    
    if (currentPoseIndex < selectedPoses.length - 1) {
      setCurrentPoseIndex(prev => prev + 1);
    }
  };

  const handleEndSession = async () => {
    if (!activeSession || !sessionStartTime) return;

    const durationMinutes = Math.round((new Date().getTime() - sessionStartTime.getTime()) / 60000);
    const xpEarned = await onEndSession(activeSession.id, completedPoses.size, durationMinutes);
    
    setActiveSession(null);
    setSessionStartTime(null);
    setCurrentPoseIndex(0);
    setCompletedPoses(new Set());
    
    return xpEarned;
  };

  const progress = (completedPoses.size / selectedPoses.length) * 100;

  if (activeSession) {
    const currentPose = selectedPoses[currentPoseIndex];
    const allCompleted = completedPoses.size === selectedPoses.length;

    return (
      <Card className="bg-gradient-to-br from-purple-500/10 to-pink-600/10 border-purple-500/30">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-purple-400">
              <Flower2 className="w-5 h-5" />
              Sessão de Yoga
            </CardTitle>
            <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30">
              {completedPoses.size}/{selectedPoses.length} poses
            </Badge>
          </div>
          <Progress value={progress} className="h-2 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          {allCompleted ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-6"
            >
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-4">
                <Check className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Sessão Completa!</h3>
              <p className="text-muted-foreground mb-4">
                Você completou todas as poses 🧘‍♀️
              </p>
              <Button onClick={handleEndSession}>
                Finalizar e Ganhar XP
              </Button>
            </motion.div>
          ) : (
            <>
              {/* Current Pose */}
              <motion.div
                key={currentPose.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-background/50 rounded-xl p-4 space-y-4"
              >
                {currentPose.image_url && (
                  <img 
                    src={currentPose.image_url} 
                    alt={currentPose.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                )}
                
                <div className="text-center">
                  <h3 className="text-lg font-bold">{currentPose.name}</h3>
                  {currentPose.name_sanskrit && (
                    <p className="text-sm text-purple-400 italic">{currentPose.name_sanskrit}</p>
                  )}
                </div>

                <p className="text-sm text-muted-foreground text-center">
                  {currentPose.description}
                </p>

                {/* Benefits */}
                {currentPose.benefits && currentPose.benefits.length > 0 && (
                  <div className="flex flex-wrap gap-1 justify-center">
                    {currentPose.benefits.map((benefit, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {benefit}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Timer */}
                {isPoseActive ? (
                  <div className="text-center">
                    <p className="text-4xl font-mono font-bold text-purple-400">
                      {poseTimer}s
                    </p>
                    <p className="text-sm text-muted-foreground">Mantenha a pose</p>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{currentPose.duration_seconds} segundos</span>
                  </div>
                )}

                {!isPoseActive && (
                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    onClick={handleStartPose}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Iniciar Pose
                  </Button>
                )}
              </motion.div>

              {/* Pose List */}
              <div className="space-y-2">
                {selectedPoses.map((pose, index) => (
                  <div
                    key={pose.id}
                    className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                      index === currentPoseIndex 
                        ? 'bg-purple-500/20 border border-purple-500/50' 
                        : completedPoses.has(pose.id)
                          ? 'bg-green-500/10'
                          : 'bg-background/30'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      completedPoses.has(pose.id)
                        ? 'bg-green-500 text-white'
                        : index === currentPoseIndex
                          ? 'bg-purple-500 text-white'
                          : 'bg-muted text-muted-foreground'
                    }`}>
                      {completedPoses.has(pose.id) ? <Check className="w-3 h-3" /> : index + 1}
                    </div>
                    <span className="text-sm flex-1">{pose.name}</span>
                    <span className="text-xs text-muted-foreground">{pose.duration_seconds}s</span>
                  </div>
                ))}
              </div>

              <Button variant="outline" className="w-full" onClick={handleEndSession}>
                Encerrar Sessão
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-purple-500/10 to-pink-600/10 border-purple-500/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-purple-400">
          <Flower2 className="w-5 h-5" />
          Yoga
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Escolha um tipo de sessão para começar:
        </p>

        <div className="space-y-2">
          {SESSION_TYPES.map((type) => (
            <motion.div
              key={type.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className="cursor-pointer hover:bg-muted/50 transition-colors border-border/50"
                onClick={() => handleStartSession(type.id)}
              >
                <CardContent className="p-3 flex items-center gap-3">
                  <span className="text-2xl">{type.icon}</span>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{type.label}</p>
                    <p className="text-xs text-muted-foreground">{type.description}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {type.duration}
                  </Badge>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <p className="text-xs text-center text-muted-foreground">
          +10 VIT XP por pose completada
        </p>
      </CardContent>
    </Card>
  );
}
