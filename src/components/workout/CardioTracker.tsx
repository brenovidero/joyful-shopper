import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, Square, MapPin, Timer, Flame, 
  Activity, Navigation, Footprints, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CardioSession, CardioType, CARDIO_TYPE_LABELS } from '@/types/workout';

interface CardioTrackerProps {
  activeSession: CardioSession | null;
  onStartSession: (type: CardioType) => Promise<CardioSession | null>;
  onUpdateSession: (sessionId: string, updates: Partial<CardioSession>) => Promise<boolean>;
  onEndSession: (sessionId: string, durationMinutes: number, distanceMeters?: number, caloriesBurned?: number) => Promise<number>;
}

export function CardioTracker({
  activeSession,
  onStartSession,
  onUpdateSession,
  onEndSession,
}: CardioTrackerProps) {
  const [selectedType, setSelectedType] = useState<CardioType | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [distance, setDistance] = useState(0);
  const [steps, setSteps] = useState(0);
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [motionPermission, setMotionPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastPositionRef = useRef<GeolocationPosition | null>(null);

  // Timer effect
  useEffect(() => {
    if (activeSession && !isPaused) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [activeSession, isPaused]);

  // GPS tracking for free cardio
  useEffect(() => {
    if (activeSession && isFreeCardio(activeSession.cardio_type) && !isPaused) {
      startGPSTracking();
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [activeSession, isPaused]);

  // Motion detection for stationary cardio
  useEffect(() => {
    if (activeSession && !isFreeCardio(activeSession.cardio_type) && !isPaused) {
      requestMotionPermission();
    }
  }, [activeSession, isPaused]);

  const isFreeCardio = (type: CardioType) => {
    return ['free_run', 'free_walk', 'free_cycle'].includes(type);
  };

  const startGPSTracking = () => {
    if ('geolocation' in navigator) {
      const id = navigator.geolocation.watchPosition(
        (pos) => {
          setPosition(pos);
          
          // Calculate distance from last position
          if (lastPositionRef.current) {
            const dist = calculateDistance(
              lastPositionRef.current.coords.latitude,
              lastPositionRef.current.coords.longitude,
              pos.coords.latitude,
              pos.coords.longitude
            );
            setDistance(prev => prev + dist);
          }
          
          lastPositionRef.current = pos;
        },
        (error) => {
          console.error('GPS error:', error);
        },
        { enableHighAccuracy: true, maximumAge: 1000, timeout: 5000 }
      );
      setWatchId(id);
    }
  };

  const requestMotionPermission = async () => {
    if ('DeviceMotionEvent' in window) {
      // @ts-ignore
      if (typeof DeviceMotionEvent.requestPermission === 'function') {
        try {
          // @ts-ignore
          const permission = await DeviceMotionEvent.requestPermission();
          setMotionPermission(permission);
          if (permission === 'granted') {
            startMotionTracking();
          }
        } catch (error) {
          console.error('Motion permission error:', error);
        }
      } else {
        // Android or older iOS
        setMotionPermission('granted');
        startMotionTracking();
      }
    }
  };

  const startMotionTracking = () => {
    let lastAcceleration = 0;
    const stepThreshold = 1.2;
    let stepCooldown = false;

    const handleMotion = (event: DeviceMotionEvent) => {
      if (!event.accelerationIncludingGravity) return;

      const { x, y, z } = event.accelerationIncludingGravity;
      const acceleration = Math.sqrt((x || 0) ** 2 + (y || 0) ** 2 + (z || 0) ** 2);
      const delta = Math.abs(acceleration - lastAcceleration);

      if (delta > stepThreshold && !stepCooldown) {
        setSteps(prev => prev + 1);
        stepCooldown = true;
        setTimeout(() => { stepCooldown = false; }, 300);
      }

      lastAcceleration = acceleration;
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const estimateCalories = (durationMinutes: number, type: CardioType): number => {
    const caloriesPerMinute: Record<CardioType, number> = {
      treadmill: 10,
      bike: 8,
      elliptical: 9,
      rowing: 11,
      stairs: 12,
      free_run: 11,
      free_walk: 5,
      free_cycle: 8,
    };
    return Math.round(durationMinutes * (caloriesPerMinute[type] || 8));
  };

  const handleStart = async (type: CardioType) => {
    setSelectedType(type);
    setElapsedSeconds(0);
    setDistance(0);
    setSteps(0);
    setIsPaused(false);
    lastPositionRef.current = null;
    await onStartSession(type);
  };

  const handleTogglePause = () => {
    setIsPaused(!isPaused);
  };

  const handleStop = async () => {
    if (!activeSession) return;

    const durationMinutes = Math.round(elapsedSeconds / 60);
    const calories = estimateCalories(durationMinutes, activeSession.cardio_type);
    
    const xpEarned = await onEndSession(
      activeSession.id,
      durationMinutes,
      distance > 0 ? distance : undefined,
      calories
    );

    setSelectedType(null);
    setElapsedSeconds(0);
    setDistance(0);
    setSteps(0);

    return xpEarned;
  };

  if (activeSession) {
    const isFree = isFreeCardio(activeSession.cardio_type);
    const speedKmh = elapsedSeconds > 0 ? (distance / 1000) / (elapsedSeconds / 3600) : 0;

    return (
      <Card className="bg-gradient-to-br from-orange-500/10 to-red-600/10 border-orange-500/30">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-orange-400">
              <Activity className="w-5 h-5" />
              {CARDIO_TYPE_LABELS[activeSession.cardio_type].label}
            </CardTitle>
            <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
              {isPaused ? 'Pausado' : 'Em Progresso'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Timer */}
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-center"
          >
            <p className="text-5xl font-mono font-bold text-foreground">
              {formatTime(elapsedSeconds)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Tempo</p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            {isFree && (
              <>
                <StatCard
                  icon={<Navigation className="w-5 h-5" />}
                  label="Distância"
                  value={`${(distance / 1000).toFixed(2)} km`}
                  color="text-blue-400"
                />
                <StatCard
                  icon={<Activity className="w-5 h-5" />}
                  label="Velocidade"
                  value={`${speedKmh.toFixed(1)} km/h`}
                  color="text-green-400"
                />
              </>
            )}
            {!isFree && (
              <StatCard
                icon={<Footprints className="w-5 h-5" />}
                label="Passos"
                value={steps.toString()}
                color="text-purple-400"
              />
            )}
            <StatCard
              icon={<Flame className="w-5 h-5" />}
              label="Calorias"
              value={`~${estimateCalories(Math.round(elapsedSeconds / 60), activeSession.cardio_type)}`}
              color="text-orange-400"
            />
          </div>

          {/* GPS Map indicator for free cardio */}
          {isFree && position && (
            <div className="bg-background/50 rounded-lg p-3 flex items-center gap-3">
              <MapPin className="w-5 h-5 text-primary" />
              <div className="text-sm">
                <p className="font-medium">GPS Ativo</p>
                <p className="text-muted-foreground text-xs">
                  {position.coords.latitude.toFixed(4)}, {position.coords.longitude.toFixed(4)}
                </p>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleTogglePause}
            >
              {isPaused ? (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Retomar
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pausar
                </>
              )}
            </Button>
            <Button
              variant="destructive"
              onClick={handleStop}
            >
              <Square className="w-4 h-4 mr-2" />
              Finalizar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-orange-500/10 to-red-600/10 border-orange-500/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-orange-400">
          <Activity className="w-5 h-5" />
          Cardio
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Escolha o tipo de cardio para começar:
        </p>

        <div className="space-y-3">
          {/* Stationary Cardio */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
              Aparelhos
            </p>
            <div className="grid grid-cols-3 gap-2">
              {(['treadmill', 'bike', 'elliptical', 'rowing', 'stairs'] as CardioType[]).map((type) => (
                <Button
                  key={type}
                  variant="outline"
                  className="border-orange-500/30 hover:bg-orange-500/20 hover:border-orange-500 flex-col h-auto py-3"
                  onClick={() => handleStart(type)}
                >
                  <span className="text-xl mb-1">{CARDIO_TYPE_LABELS[type].icon}</span>
                  <span className="text-xs">{CARDIO_TYPE_LABELS[type].label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Free Cardio */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              Ao Ar Livre (GPS)
            </p>
            <div className="grid grid-cols-3 gap-2">
              {(['free_run', 'free_walk', 'free_cycle'] as CardioType[]).map((type) => (
                <Button
                  key={type}
                  variant="outline"
                  className="border-green-500/30 hover:bg-green-500/20 hover:border-green-500 flex-col h-auto py-3"
                  onClick={() => handleStart(type)}
                >
                  <span className="text-xl mb-1">{CARDIO_TYPE_LABELS[type].icon}</span>
                  <span className="text-xs">{CARDIO_TYPE_LABELS[type].label}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          +2 VIT XP por minuto de cardio
        </p>
      </CardContent>
    </Card>
  );
}

function StatCard({ 
  icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  color: string;
}) {
  return (
    <div className="bg-background/50 rounded-lg p-3 text-center">
      <div className={`flex justify-center mb-1 ${color}`}>{icon}</div>
      <p className="text-lg font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
