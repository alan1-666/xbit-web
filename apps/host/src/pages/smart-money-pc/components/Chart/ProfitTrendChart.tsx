import React, { useId, useMemo, useState } from "react";
import dayjs from "dayjs";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartRangeTabs } from "./ChartRangeTabs";
import { useTranslation } from 'react-i18next'
import { cn } from "@/lib/utils";

const normalizePerformance = (raw: any[]): Record<string, any>  =>{
  const map: Record<string, any> = {};
  (raw || []).forEach((entry: any) => {
    const key = entry?.[0];
    const val = entry?.[1];
    if (typeof key === "string" && val) {
      map[key] = val;
    }
  });
  return map;
}

const buildChartData = (
  bucket: any,
  opts?: { usePnl?: boolean }
): { time: number; label: string; value: number }[] => {
  if (!bucket) return [];

  // 在这里决定画 pnl 还是 account value
  const src = opts?.usePnl
    ? bucket.pnlHistory
    : bucket.accountValueHistory;

  if (!Array.isArray(src)) return [];

  const rows = src
    .map((pair: any) => {
      const ts = Number(pair?.[0]);
      const v = Number(pair?.[1]);
      return {
        time: ts,
        label: dayjs(ts).format("MM-DD HH:mm"),
        value: Number.isFinite(v) ? v : 0,
      };
    })
    .sort((a: any, b: any) => a.time - b.time);

  return rows;
}

type ProfitTrendProps = {
  rawData: any[];
  showChartTabs?: boolean
  activeRange?: string
  lineColor?: string
};

const AVAILABLE_KEYS = [
  { key: "perpDay", label: "1D" },
  { key: "perpWeek", label: "7D" },
  { key: "perpMonth", label: "30D" },
  { key: "perpAllTime", label: "ALL" },
];

const periodMap: Record<string, string> = {
  day: 'perpDay',
  week: 'perpWeek',
  month: 'perpMonth',
  allTime: 'perpAllTime',
}

export const ProfitTrendChart: React.FC<ProfitTrendProps> = ({ rawData, showChartTabs = true, activeRange = 'allTime', lineColor="#6F3FF5"}) => {
  const [active, setActive] = useState<string>(periodMap[activeRange]);
  const { t } = useTranslation()
  const gradientId = useId();

  const ACTIVE_KEYS: Record<string, any> = {
    perpDay: t('smartMoney.chart.1Day'),
    perpWeek: t('smartMoney.chart.7Days'),
    perpMonth: t('smartMoney.chart.30Days'),
    perpAllTime: t('smartMoney.chart.allTime'),
  };

  // 1) 先转成 map
  const perfMap = useMemo(() => normalizePerformance(rawData), [rawData]);

  // 2) 拿当前 tab 的数据
  const currentBucket = perfMap[active];

  // 3) 转成图表用的数据
  const chartData = useMemo(
    () => buildChartData(currentBucket /*, { usePnl: true }*/),
    [currentBucket]
  );

  return (
    <div className={cn("w-full rounded-xl", showChartTabs ? "bg-[#121319]" : "")}>

      {/* 顶部 tabs & 副标题 */}
      {showChartTabs && <ChartRangeTabs
        active={active}
        tabs={AVAILABLE_KEYS as any}
        onChange={(k) => setActive(k)}
        activeLabelMap={ACTIVE_KEYS}
        titlePrefix={t('smartMoney.chart.recent')}
        titleSuffix={t('smartMoney.addressDetail.profitTrend')}
      />}

      {/* 图表区域 */}
      <div className={cn(showChartTabs ? 'h-[300px] pb-4' : 'h-12.5')}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 20, bottom: 10, left: 5 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={lineColor} stopOpacity={0.35} />
                <stop offset="100%" stopColor={lineColor} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke="rgba(255,255,255,0.06)"
              strokeDasharray="3 3"
              vertical={false}
            />
            {showChartTabs && <XAxis
              dataKey="label"
              tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              minTickGap={24}
            />}
            {showChartTabs && <YAxis
              tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />}
            {showChartTabs && <Tooltip
              contentStyle={{
                background: "#0E0F13",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
              }}
              formatter={(val: any) =>
                typeof val === "number"
                  ? `$${val.toFixed(2).toLocaleString()}`
                  : val
              }
              labelFormatter={(label) => label}
            />}
            <Area
              type="monotone"
              dataKey="value"
              stroke={lineColor}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
