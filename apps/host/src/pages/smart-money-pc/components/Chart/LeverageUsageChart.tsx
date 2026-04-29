import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export type LeverageUsage = {
  coin: string;
  leverage: number;   // 倍数
  valueUsd: number;   // 仓位价值，用来排序/tooltip
};

type Props = {
  data: LeverageUsage[];
};

const formatUSD = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(n || 0);

export const LeverageUsageChart: React.FC<Props> = ({ data }) => {
  // 防御一下
  const safeData = Array.isArray(data) ? data : [];

  return (
    <div className="w-full h-full bg-transparent">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={safeData}
          margin={{ top: 20, right: 20, bottom: 20, left: 40 }}
          barCategoryGap={20}
        >
          <CartesianGrid stroke="rgba(255,255,255,0.03)" vertical={false} />

          {/* X 轴：币种 */}
          <XAxis
            dataKey="coin"
            tickLine={false}
            axisLine={{ stroke: "rgba(255,255,255,0.15)" }}
            tick={{ fill: "rgba(255,255,255,0.65)", fontSize: 12 }}
          />

          {/* Y 轴：杠杆倍数 */}
          <YAxis
            tickLine={false}
            axisLine={{ stroke: "rgba(255,255,255,0.15)" }}
            tick={{ fill: "rgba(255,255,255,0.65)", fontSize: 12 }}
            width={32}
          />

          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.03)" }}
            content={({ active, payload }) => {
              if (!active || !payload || !payload.length) return null;
              const item = payload[0].payload as LeverageUsage;
              return (
                <div className="rounded-md bg-[#0E0F13] border border-white/10 p-3 text-xs text-white/80 shadow-lg">
                  <div className="font-medium mb-1">{item.coin}</div>
                  <div>Leverage: {item.leverage}x</div>
                  <div>Position Value: {formatUSD(item.valueUsd)}</div>
                </div>
              );
            }}
          />

          {/* 柱子：杠杆倍数 */}
          <Bar
            dataKey="leverage"
            radius={[6, 6, 0, 0]}
            fill="#6F3FF5"
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
