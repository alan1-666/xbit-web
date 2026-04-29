import React from 'react'

// Định nghĩa kiểu dữ liệu cho props
interface CircularProgressBarProps {
  initialPercentage: number
  color?: string 
  size?: number
}

const CircularProgressBar: React.FC<CircularProgressBarProps> = ({
  initialPercentage,
  color = '#00FFB4',
  size = 80,
}) => {
  // Tính toán thuộc tính SVG
  const viewBoxSize = size
  const center = viewBoxSize / 2
  const radius = (viewBoxSize * 0.8) / 2
  const strokeWidth = radius * 0.2
  const normalizedRadius = radius - strokeWidth / 2
  const circumference = 2 * Math.PI * normalizedRadius
  const strokeDashoffset = circumference - (initialPercentage / 100) * circumference

  return (
    <div className="flex flex-col items-center justify-center">
      <div style={{ width: `${size}px`, height: `${size}px` }} className="relative">
        <svg className="w-full h-full" viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}>
          {/* Vòng tròn nền với các dấu gạch */}
          <circle cx={center} cy={center} r={radius} fill="#14141499" stroke="none" />

          {/* Các vạch chia nhỏ với chiều dài tăng */}
          {Array.from({ length: 60 }).map((_, i) => {
            const angle = (i * 6 * Math.PI) / 180
            // Tăng chiều dài vạch chia
            const innerRadius = radius - 3
            const x1 = center + innerRadius * Math.cos(angle)
            const y1 = center + innerRadius * Math.sin(angle)
            const x2 = center + radius * Math.cos(angle)
            const y2 = center + radius * Math.sin(angle)

            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={'#444'} strokeWidth={1} />
          })}

          {/* Vòng tròn tiến trình */}
          <circle
            cx={center}
            cy={center}
            r={normalizedRadius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform={`rotate(-90 ${center} ${center})`}
            className="transition-all duration-500 ease-in-out"
          />

          {/* Vòng tròn nền */}
          <circle cx={center} cy={center} r={radius * 0.77} fill={'#ECECED14'} />

          {/* Phần trăm ở giữa */}
          <text
            x={center}
            y={center}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={color}
            fontSize={radius * 0.4}
            fontFamily="Noto Sans SC"
            fontWeight="500"
          >
            {initialPercentage}%
          </text>
        </svg>
      </div>
    </div>
  )
}

export default CircularProgressBar
