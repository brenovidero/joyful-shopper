import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { BookOpen, Target, Trophy, TrendingUp } from 'lucide-react';
import { StudyCourse } from '@/types/study';

interface StudyDashboardProps {
  courses: StudyCourse[];
}

export function StudyDashboard({ courses }: StudyDashboardProps) {
  const stats = useMemo(() => {
    const totalLessons = courses.reduce((acc, c) => acc + c.total_lessons, 0);
    const completedLessons = courses.reduce((acc, c) => acc + c.current_lesson, 0);
    const remainingLessons = totalLessons - completedLessons;
    const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return {
      totalCourses: courses.length,
      totalLessons,
      completedLessons,
      remainingLessons,
      overallProgress,
    };
  }, [courses]);

  const pieData = [
    { name: 'Concluídas', value: stats.completedLessons, color: 'hsl(var(--primary))' },
    { name: 'Restantes', value: stats.remainingLessons, color: 'hsl(var(--muted))' },
  ];

  const barData = courses.map((course) => ({
    name: course.name.length > 15 ? course.name.substring(0, 15) + '...' : course.name,
    progresso: course.total_lessons > 0 
      ? Math.round((course.current_lesson / course.total_lessons) * 100) 
      : 0,
  }));

  const chartConfig = {
    progresso: {
      label: 'Progresso',
      color: 'hsl(var(--primary))',
    },
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalCourses}</p>
                <p className="text-xs text-muted-foreground">Cursos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completedLessons}</p>
                <p className="text-xs text-muted-foreground">Concluídas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.remainingLessons}</p>
                <p className="text-xs text-muted-foreground">Restantes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.overallProgress}%</p>
                <p className="text-xs text-muted-foreground">Progresso</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Progresso Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center">
              {stats.totalLessons > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-sm">Nenhum curso cadastrado</p>
              )}
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-sm">{stats.completedLessons} Concluídas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-muted" />
                <span className="text-sm">{stats.remainingLessons} Restantes</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Progresso por Curso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              {courses.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-full w-full">
                  <BarChart data={barData} layout="vertical" margin={{ left: 0, right: 20 }}>
                    <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                    <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar 
                      dataKey="progresso" 
                      fill="hsl(var(--primary))" 
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground text-sm">Nenhum curso cadastrado</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
