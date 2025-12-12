import { PriceHistory } from '@/types/product';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PriceChartProps {
  data: PriceHistory[];
  targetPrice?: number;
}

export function PriceChart({ data, targetPrice }: PriceChartProps) {
  const chartData = data.map(item => ({
    date: format(item.date, 'dd/MM', { locale: ptBR }),
    price: item.price,
    fullDate: format(item.date, "dd 'de' MMMM", { locale: ptBR })
  }));

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm text-muted-foreground">{payload[0].payload.fullDate}</p>
          <p className="text-lg font-bold text-primary">
            {formatPrice(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="date" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatPrice}
            domain={['auto', 'auto']}
          />
          <Tooltip content={<CustomTooltip />} />
          {targetPrice && (
            <ReferenceLine 
              y={targetPrice} 
              stroke="hsl(var(--success))" 
              strokeDasharray="5 5"
              label={{ 
                value: `Meta: ${formatPrice(targetPrice)}`, 
                position: 'right',
                fill: 'hsl(var(--success))',
                fontSize: 12
              }}
            />
          )}
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke="hsl(var(--primary))" 
            strokeWidth={3}
            dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: 'hsl(var(--primary))', stroke: 'hsl(var(--background))', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
