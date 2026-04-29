import React from 'react'

type GaugeChartProps = {
  value: number // 0-100
  size: number
  className?: string
  title?: string
  subtitle?: string
  /** Custom title text color (default: #ff4166) */
  titleColor?: string
  /** Custom subtitle text color (default: #FFFFFFB2) */
  subtitleColor?: string
  startColor?: string
  midColor?: string
  endColor?: string
}

const GaugeChart: React.FC<GaugeChartProps> = ({
  value,
  size,
  className,
  title,
  subtitle,
  titleColor = '#ff4166',
  subtitleColor = '#FFFFFFB2',
  startColor = '#FF3860',
  midColor = '#FF3860',
  endColor = '#00FFB3',
}) => {
  const strokeWidth = 12
  const radius = 90
  const cx = 100
  const cy = 100
  // Single path: bottom semicircle from 9 o'clock (left) to 3 o'clock (right), so track and progress share exact same path
  const pathD = `M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size - 40 }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0"
      >
        {/* Track: full semicircle, rounded ends */}
        <path
          d={pathD}
          pathLength={100}
          stroke="#212127"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
        />

        {/* Progress: same path, dash shows first value% */}
        <path
          d={pathD}
          pathLength={100}
          stroke="url(#gaugeGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="butt"
          strokeDasharray={`${value} 100`}
          strokeDashoffset={0}
          fill="none"
          className="transition-all duration-800 ease-out"
        />
        
        {/* Gradient definition */}
        <defs>
          <linearGradient
            id="gaugeGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor={startColor} />
            <stop offset="79%" stopColor={midColor} />
            <stop offset="100%" stopColor={endColor} />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center justify-center mt-5">
        <div
          className="text-[calc(1rem*(16/16))] leading-none font-[520] mb-1"
          style={{ color: titleColor }}
        >
          {title}
        </div>
        <div
          className="text-[calc(1rem*(10/16))] leading-none"
          style={{ color: subtitleColor }}
        >
          {subtitle}
        </div>
      </div>
    </div>
  )
}

export default GaugeChart