import { useEffect, useRef } from 'react'

export interface PieChartItem {
  label: string
  value: number
  color: string
}

export interface PieChartProps {
  data: PieChartItem[]
}

export const PieChart = (props: PieChartProps) => {
  const { data } = props

  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const canvas = ref.current
    const context = canvas.getContext('2d')
    if (!context) return

    const ctx = context!

    const cx = canvas.width / 2
    const cy = canvas.height / 2
    const radius = canvas.width / 2
    const innerRadius = radius - 16

    const total = data.reduce((s, d) => s + d.value, 0)

    // guard against division by zero
    if (total <= 0) return

    // respect user's reduced motion preference
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      (window as any).matchMedia &&
      (window as any).matchMedia('(prefers-reduced-motion: reduce)').matches

    let progress = prefersReducedMotion ? 1 : 0 // animation 0 → 1

    // ease-out cubic for a smooth deceleration at the end
    function easeOutCubic(t: number) {
      return 1 - Math.pow(1 - t, 3)
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      let startAngle = -Math.PI / 2 // start at top

      // apply easing to progress when calculating slice angles
      const easedProgress = easeOutCubic(progress)

      data.forEach((item) => {
        const sliceAngle = (item.value / total) * Math.PI * 2 * easedProgress

        ctx.beginPath()
        ctx.arc(cx, cy, radius, startAngle, startAngle + sliceAngle)
        ctx.arc(cx, cy, innerRadius, startAngle + sliceAngle, startAngle, true)
        ctx.closePath()
        ctx.fillStyle = item.color
        ctx.fill()

        startAngle += sliceAngle
      })

      if (progress < 1) {
        progress += 0.02
        if (progress > 1) progress = 1
        requestAnimationFrame(draw)
      }
    }

    draw()
  }, [data])

  return (
    <div className="w-full h-full flex items-center justify-center">
      <canvas ref={ref} width={200} height={200} className="w-full h-full" />
    </div>
  )
}
