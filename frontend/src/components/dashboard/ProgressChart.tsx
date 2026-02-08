import { Subject } from '@/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface ProgressChartProps {
  subjects: Subject[];
}

export default function ProgressChart({ subjects }: ProgressChartProps) {
  if (subjects.length === 0) {
    return null;
  }

  // Prepare data for chart - show top 8 subjects
  const chartData = subjects
    .slice(0, 8)
    .map((subject) => ({
      name: subject.name.length > 15 
        ? subject.name.substring(0, 15) + '...' 
        : subject.name,
      progress: subject.progress,
      color: subject.color,
    }));

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Progress by Subject</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            label={{ value: 'Progress (%)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
          />
          <Bar dataKey="progress" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}