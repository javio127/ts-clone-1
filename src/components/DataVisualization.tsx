import React from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

interface ChartData {
  type: 'bar' | 'line' | 'pie';
  title: string;
  description?: string;
  dataSource?: string;
  data: Array<{
    name: string;
    value: number;
    [key: string]: unknown;
  }>;
  xAxisLabel?: string;
  yAxisLabel?: string;
  colors?: string[];
}

interface DataVisualizationProps {
  chartData: ChartData;
}

const DEFAULT_COLORS = [
  '#60a5fa', '#34d399', '#fbbf24', '#f472b6', '#a78bfa', 
  '#fb7185', '#22d3ee', '#fcd34d', '#86efac', '#c084fc'
];

export default function DataVisualization({ chartData }: DataVisualizationProps) {
  const { type, title, description, dataSource, data, xAxisLabel, yAxisLabel, colors = DEFAULT_COLORS } = chartData;

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#6b7280', fontSize: 12 }}
              axisLine={{ stroke: '#9ca3af' }}
              tickLine={{ stroke: '#9ca3af' }}
              label={{ value: xAxisLabel, position: 'insideBottom', offset: -10, style: { fill: '#6b7280' } }}
            />
            <YAxis 
              tick={{ fill: '#6b7280', fontSize: 12 }}
              axisLine={{ stroke: '#9ca3af' }}
              tickLine={{ stroke: '#9ca3af' }}
              label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', style: { fill: '#6b7280' } }}
              domain={['dataMin - 2', 'dataMax + 2']}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#ffffff', 
                border: '1px solid #d1d5db', 
                borderRadius: '8px',
                color: '#374151',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend wrapperStyle={{ color: '#6b7280' }} />
            <Bar dataKey="value" fill={colors[0]} radius={[4, 4, 0, 0]} />
          </BarChart>
        );

      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
            <XAxis 
              dataKey="name"
              tick={{ fill: '#6b7280', fontSize: 12 }}
              axisLine={{ stroke: '#9ca3af' }}
              tickLine={{ stroke: '#9ca3af' }}
              label={{ value: xAxisLabel, position: 'insideBottom', offset: -10, style: { fill: '#6b7280' } }}
            />
            <YAxis 
              tick={{ fill: '#6b7280', fontSize: 12 }}
              axisLine={{ stroke: '#9ca3af' }}
              tickLine={{ stroke: '#9ca3af' }}
              label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', style: { fill: '#6b7280' } }}
              domain={['dataMin - 2', 'dataMax + 2']}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#ffffff', 
                border: '1px solid #d1d5db', 
                borderRadius: '8px',
                color: '#374151',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend wrapperStyle={{ color: '#6b7280' }} />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={colors[0]} 
              strokeWidth={3}
              dot={{ fill: colors[0], strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, stroke: colors[0], strokeWidth: 2, fill: '#ffffff' }}
            />
          </LineChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              stroke="#ffffff"
              strokeWidth={2}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#ffffff', 
                border: '1px solid #d1d5db', 
                borderRadius: '8px',
                color: '#374151',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend wrapperStyle={{ color: '#6b7280' }} />
          </PieChart>
        );

      default:
        return <div>Unsupported chart type</div>;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto mt-6 mb-6">
      <div className="relative">
        {/* Subtle shadow effect */}
        <div className="absolute inset-0 bg-gray-100/50 rounded-2xl blur-xl"></div>
        
        {/* Main content */}
        <div className="relative bg-white border border-gray-200 rounded-2xl p-8 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-1">{title}</h3>
              {description && (
                <p className="text-sm text-gray-600 mb-1">{description}</p>
              )}
              {dataSource && (
                <p className="text-xs text-green-600 font-medium">📊 Source: {dataSource}</p>
              )}
            </div>
          </div>
          
          <div className="w-full h-80 bg-gray-50 rounded-xl p-4">
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
} 