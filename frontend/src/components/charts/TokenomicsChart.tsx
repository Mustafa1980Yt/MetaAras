'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ALLOCATIONS } from '@/constants/tokenomics';
import { formatNumber } from '@/utils/format';

export function TokenomicsChart() {
  const data = ALLOCATIONS.map(a => ({
    name:  a.label,
    value: a.pct,
    amount: a.amount,
    color:  a.color,
  }));

  return (
    <ResponsiveContainer width="100%" height={340}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={80}
          outerRadius={130}
          paddingAngle={3}
          dataKey="value"
          stroke="none"
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0].payload;
            return (
              <div className="glass rounded-xl p-3 text-sm border border-[var(--border)]">
                <p className="font-semibold" style={{ color: d.color }}>{d.name}</p>
                <p className="text-[var(--text-secondary)]">{d.value}% — {formatNumber(d.amount)} MTA</p>
              </div>
            );
          }}
        />
        <Legend
          formatter={(value, entry: any) => (
            <span className="text-sm text-[var(--text-secondary)]">{value} ({entry.payload.value}%)</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
