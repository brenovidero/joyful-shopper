import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar,
  ResponsiveContainer 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import { Profile } from '@/types/rpg';

interface XPRadarChartProps {
  profile: Profile;
}

export function XPRadarChart({ profile }: XPRadarChartProps) {
  const maxXP = Math.max(
    profile.xp_intelligence,
    profile.xp_vitality,
    profile.xp_discipline,
    100
  );

  const data = [
    {
      attribute: 'INT',
      value: profile.xp_intelligence,
      fullMark: maxXP,
    },
    {
      attribute: 'VIT',
      value: profile.xp_vitality,
      fullMark: maxXP,
    },
    {
      attribute: 'DIS',
      value: profile.xp_discipline,
      fullMark: maxXP,
    },
  ];

  return (
    <Card className="bg-gradient-to-br from-purple-500/10 to-indigo-600/10 border-purple-500/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2 text-purple-400">
          <Sparkles className="w-5 h-5" />
          Atributos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
              <PolarGrid 
                stroke="hsl(var(--muted-foreground))" 
                strokeOpacity={0.3}
              />
              <PolarAngleAxis 
                dataKey="attribute" 
                tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, maxXP]}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                tickCount={4}
              />
              <Radar
                name="XP"
                dataKey="value"
                stroke="hsl(270, 80%, 60%)"
                fill="hsl(270, 80%, 60%)"
                fillOpacity={0.4}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-2">
          <div className="text-center p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <p className="text-xs text-muted-foreground">Inteligência</p>
            <p className="text-lg font-bold text-blue-400">{profile.xp_intelligence}</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-green-500/10 border border-green-500/20">
            <p className="text-xs text-muted-foreground">Vitalidade</p>
            <p className="text-lg font-bold text-green-400">{profile.xp_vitality}</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-xs text-muted-foreground">Disciplina</p>
            <p className="text-lg font-bold text-red-400">{profile.xp_discipline}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
