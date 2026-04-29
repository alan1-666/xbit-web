import React, { useEffect, useMemo, useRef } from 'react';
import { useGetOHLCShare } from "@hooks/useGetOHLCShare.ts";
import { Ohlcdto } from "@/@generated/gql/graphql-meme2.ts";
import dayjs from "dayjs";

type LineChartSharePCProps = {
  token: string;
};

const WIDTH = 342;
const HEIGHT = 200;
const LINE_COLOR = '#FFFFFF';
const LINE_WIDTH = 1.5;

const LineChartSharePc: React.FC<LineChartSharePCProps> = ({ token }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  const { data } = useGetOHLCShare({ token });

  const ohlc: Ohlcdto[] = useMemo(() => {
    // Reverse only if needed and return a new array (so we don’t mutate Apollo cache)
    if (!data?.getOHLC?.length) return [];
    return [...data.getOHLC].reverse();
  }, [data?.getOHLC]);

  const arrayClose = useMemo<number[]>(() => {
    if (!ohlc.length) return [];
    return ohlc.map(item => Number(item?.close ?? 0));
  }, [ohlc]);

  // ---------- Normalization helpers ----------
  const median = (xs: number[]) => {
    if (xs.length === 0) return 0;
    const sorted = [...xs].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  };

  const mad = (xs: number[], med: number) => {
    if (xs.length === 0) return 0;
    const dev = xs.map(v => Math.abs(v - med));
    return median(dev) || 0;
  };

  const clipOutliersMAD = (xs: number[], k = 3): number[] => {
    if (xs.length === 0) return xs;
    const med = median(xs);
    const m = mad(xs, med) || 1e-9;
    const lo = med - k * m;
    const hi = med + k * m;
    return xs.map(v => Math.min(Math.max(v, lo), hi));
  };

  const ema = (xs: number[], alpha = 0.25): number[] => {
    if (!xs.length) return xs;
    const out = new Array(xs.length);
    let prev = xs[0];
    out[0] = prev;
    for (let i = 1; i < xs.length; i++) {
      prev = alpha * xs[i] + (1 - alpha) * prev;
      out[i] = prev;
    }
    return out;
  };

  const minMax = (xs: number[], padPct = 0.1) => {
    if (!xs.length) return { norm: [], lo: 0, hi: 1 };
    let lo = Math.min(...xs);
    let hi = Math.max(...xs);
    if (hi === lo) hi = lo + 1;
    const range = hi - lo;
    const pad = range * padPct;
    lo -= pad;
    hi += pad;
    return {
      norm: xs.map(v => (v - lo) / (hi - lo)),
      lo,
      hi,
    };
  };

  const normalizeSeries = (xs: number[]) => {
    const clipped = clipOutliersMAD(xs, 3);
    const smoothed = ema(clipped, 0.25);
    const { norm } = minMax(smoothed, 0.08);
    return norm;
  };

  // Cache for hover math (avoids recalculating in mouse handlers)
  const cacheRef = useRef<{
    norm: number[];
    stepX: number;
    toY: (v01: number) => number;
    padding: { top: number; right: number; bottom: number; left: number };
  } | null>(null);

  const hoverIndexRef = useRef<number | null>(null);

  // ---------- Draw ----------
  const redraw = (highlightIndex?: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const cssW = WIDTH;
    const cssH = HEIGHT;
    const padding = { top: 8, right: 8, bottom: 8, left: 8 };

    // Setup canvas
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    const series = arrayClose ?? [];
    if (series.length < 2) {
      cacheRef.current = null;
      return;
    }

    const norm = normalizeSeries(series);
    const plotW = cssW - padding.left - padding.right;
    const plotH = cssH - padding.top - padding.bottom;

    const n = norm.length;
    const stepX = n > 1 ? plotW / (n - 1) : 0;
    const toY = (v01: number) => padding.top + (1 - v01) * plotH;

    // Save cache for hover handlers
    cacheRef.current = { norm, stepX, toY, padding };

    // Draw line
    ctx.save();
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = LINE_WIDTH;
    ctx.strokeStyle = LINE_COLOR;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const x = padding.left + i * stepX;
      const y = toY(norm[i]);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();

    // Highlight hover point (if any)
    if (typeof highlightIndex === 'number' && highlightIndex >= 0 && highlightIndex < n) {
      const x = padding.left + highlightIndex * stepX;
      const y = toY(norm[highlightIndex]);

      // marker
      ctx.save();
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x, y, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  };

  useEffect(() => {
    redraw(); // draw (or redraw) base when data changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arrayClose]);

  // ---------- Hover handlers (no state) ----------
  useEffect(() => {
    const wrap = wrapperRef.current;
    const tooltip = tooltipRef.current;
    if (!wrap || !tooltip) return;

    const formatTs = (ts: number) => {
      // handle seconds vs ms
      const ms = ts < 1e12 ? ts * 1000 : ts;
      return dayjs(ms).format('YYYY-MM-DD hh:mm');
    };

    const onMove = (e: MouseEvent) => {
      const cache = cacheRef.current;
      if (!cache || !ohlc.length) return;

      const rect = wrap.getBoundingClientRect();
      const x = e.clientX - rect.left;

      const { stepX, padding, norm, toY } = cache;
      const n = norm.length;

      // Convert x to nearest index
      const rel = (x - padding.left) / Math.max(1, stepX);
      let idx = Math.round(rel);
      if (idx < 0) idx = 0;
      if (idx > n - 1) idx = n - 1;

      if (hoverIndexRef.current === idx) return; // nothing changed
      hoverIndexRef.current = idx;

      // Update canvas with highlight
      redraw(idx);

      // Tooltip content
      const close = Number(ohlc[idx]?.close ?? 0);
      const ts = Number(ohlc[idx]?.ts ?? 0);

      // Tooltip position (near the point)
      const px = padding.left + idx * stepX;
      const py = toY(norm[idx]);

      // Position tooltip; keep inside box
      const left = Math.min(Math.max(px + 8, 0), WIDTH - 160);
      const top = Math.min(Math.max(py - 40, 0), HEIGHT - 32);

      tooltip.style.transform = `translate(${left}px, ${top}px)`;
      tooltip.style.opacity = '1';
      tooltip.innerHTML = `
        <div style="
          padding:6px 8px;
          background: rgba(0,0,0,0.75);
          color:#fff;
          font-size:12px;
          border:1px solid rgba(255,255,255,0.15);
          border-radius:6px;
          white-space:nowrap;
          pointer-events:none;">
          <div><strong>${close}</strong></div>
          <div style="opacity:.85">${formatTs(ts)}</div>
        </div>
      `;
    };

    const onLeave = () => {
      hoverIndexRef.current = null;
      tooltip.style.opacity = '0';
      redraw(); // redraw without highlight
    };

    wrap.addEventListener('mousemove', onMove);
    wrap.addEventListener('mouseleave', onLeave);
    return () => {
      wrap.removeEventListener('mousemove', onMove);
      wrap.removeEventListener('mouseleave', onLeave);
    };
  }, [ohlc]);

  return (
    <div
      ref={wrapperRef}
      className="relative mr-4 cursor-pointer"
      style={{ width: WIDTH, height: HEIGHT }}
    >
      <canvas ref={canvasRef} />
      {/* tooltip layer */}
      <div
        ref={tooltipRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          transform: 'translate(0px,0px)',
          opacity: 0,
          transition: 'opacity 80ms linear',
          willChange: 'transform, opacity',
          pointerEvents: 'none',
          zIndex: 2
        }}
      />
    </div>
  );
};

export default React.memo(LineChartSharePc);
