import React from 'react';
import { MarketSummary } from '../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

interface DashboardChartsProps {
  markets: MarketSummary[];
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ markets }) => {
  // Format market data for the bar chart
  const barChartData = markets.map((m) => ({
    name: m.name,
    variance: m.varianceDollars,
    target: m.avgTarget,
    actual: m.avgActual
  }));

  // Format trend data for the line chart (mocking months based on trendData array)
  // Find the market with the largest variance for the trend example
  const sortedMarkets = [...markets].sort((a, b) => Math.abs(b.varianceDollars) - Math.abs(a.varianceDollars));
  const topMarket = sortedMarkets[0];
  
  const lineChartData = topMarket?.trendData.map((val, idx) => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'][idx] || `M${idx + 1}`,
    rate: val,
  })) || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div className="bg-white p-4 rounded-xl border border-[#D8E1EB] shadow-sm">
        <h3 className="text-sm font-bold text-[#0B1930] mb-4">Variance by Market ($)</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={barChartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: '#F3F4F6' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="variance" name="Variance ($)" fill="#1769FF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-[#D8E1EB] shadow-sm">
        <h3 className="text-sm font-bold text-[#0B1930] mb-4">
          Trend: {topMarket ? topMarket.name : 'Top Market'}
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={lineChartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line
                type="monotone"
                dataKey="rate"
                name="Avg Target Rate"
                stroke="#D58A16"
                strokeWidth={3}
                dot={{ r: 4, fill: '#D58A16', strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
