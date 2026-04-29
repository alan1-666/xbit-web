import { useEffect, useRef } from 'react'

export interface ChanceChartProps {
  percentage: number
}

export const ChanceChart = (props: ChanceChartProps) => {
  const { percentage } = props
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Handle high DPI screens
    const dpr = window.devicePixelRatio || 1
    const width = 64
    const height = 36

    // Set canvas size for high DPI
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    const centerX = 32
    const centerY = 32
    const radius = 28
    const lineWidth = 4

    // Draw background arc
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, Math.PI, 2 * Math.PI)
    ctx.strokeStyle = '#2a2a2f'
    ctx.lineWidth = lineWidth
    ctx.lineCap = 'round'
    ctx.stroke()

    // Draw progress arc
    const endAngle = Math.PI + (percentage / 100) * Math.PI
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, Math.PI, endAngle)
    ctx.strokeStyle = '#843BEA'
    ctx.lineWidth = lineWidth
    ctx.lineCap = 'round'
    ctx.stroke()
  }, [percentage])

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[64px] h-[36px]">
        <canvas ref={canvasRef} style={{ width: '64px', height: '36px' }} />
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[15px] font-medium text-white leading-[1]">
          {percentage}%
        </div>
      </div>
      <p className="text-[11px] text-[#838385] leading-[1] text-center mt-0">chance</p>
    </div>
  )
}
