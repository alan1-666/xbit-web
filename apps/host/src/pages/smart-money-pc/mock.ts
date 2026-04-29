import type { SmartMoneyResponse, Trader } from './types';

function rand(min: number, max: number, fx = 2) {
  const v = Math.random() * (max - min) + min;
  return Number(v.toFixed(fx));
}
function addr(i: number) {
  // 生成稳定的“0x…”地址
  return `0x${(i + 1).toString(16).padStart(8, '0')}${Math.random().toString(16).slice(2, 34)}`;
}

const LABEL_POOL = ['BTC专家', '短线', '激进型', '高胜率', '高频'];

export const MOCK_TRADERS: Trader[] = Array.from({ length: 300 }).map((_, i) => {
  const pnl = rand(-20000, 300000, 2); // 模拟正负收益
  const roi = rand(-50, 120, 2);
  const win = rand(10, 98, 2);
  const mdd = rand(5, 70, 2);
  const labels = Array.from(
    new Set(Array.from({ length: rand(1, 4, 0) }).map(() => LABEL_POOL[Math.floor(Math.random() * LABEL_POOL.length)]))
  );

  return {
    user_address: addr(i),
    roi,
    net_pnl: pnl,
    avg_win_rate: win,
    max_drawdown: mdd,
    trading_days: Math.floor(rand(1, 120, 0)),
    total_trades: Math.floor(rand(200, 20000, 0)),
    unique_coins_count: Math.floor(rand(1, 12, 0)),
    latest_activity: null,
    latest_activity_time: null,
    kol_labels: labels,
    kol_labels_description: labels.join('、'),
  };
});


export function mockFetchSmartMoney(page = 1, pageSize = 50, address?: string): SmartMoneyResponse {
  const filtered = address ? MOCK_TRADERS.filter(t => t.user_address.toLowerCase().includes(address.toLowerCase())) : MOCK_TRADERS;
  const total = filtered.length;
  const total_pages = Math.max(1, Math.ceil(total / pageSize));
  const data = filtered.slice((page - 1) * pageSize, page * pageSize);

  return {
    success: true,
    data,
    pagination: { page, page_size: pageSize, total, total_pages },
    message: 'mock',
  };
}
