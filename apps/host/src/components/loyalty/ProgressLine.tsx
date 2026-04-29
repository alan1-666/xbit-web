import { cn } from '@/lib/utils'
import { useMemo } from 'react'

interface Milestone {
  points: number
  label: string
}

interface ProgressLineProps {
  milestones?: Milestone[]
  className?: string
  extendStart?: number
  extendEnd?: number
  curveDepth?: number 
}

const ProgressLine = ({
  milestones = [
    { points: 1000, label: '积分 1000' },
    { points: 5000, label: '积分 5000' },
    { points: 10000, label: '积分 10000' },
  ],
  className,
  extendStart = 100,
  extendEnd = 100,
  curveDepth = 170,
}: ProgressLineProps) => {
  const maxPoints = milestones[milestones.length - 1].points

  // Generate single parabolic curve from start to end
  const generateLinePath = () => {
    const points = milestones.map((m) => {
      const percentage = (m.points / maxPoints) * 100
      const x = 50 + (900 * percentage) / 100
      const y = 250 - (220 * percentage) / 100
      return { x, y }
    })

    if (points.length === 0) return ''

    const firstPoint = points[0]
    const lastPoint = points[points.length - 1]

    // Calculate extensions
    if (points.length > 1) {
      const secondPoint = points[1]
      const secondLastPoint = points[points.length - 2]

      const startDx = secondPoint.x - firstPoint.x
      const startDy = secondPoint.y - firstPoint.y
      const startLength = Math.sqrt(startDx * startDx + startDy * startDy)
      const startUnitX = startDx / startLength
      const startUnitY = startDy / startLength

      const endDx = lastPoint.x - secondLastPoint.x
      const endDy = lastPoint.y - secondLastPoint.y
      const endLength = Math.sqrt(endDx * endDx + endDy * endDy)
      const endUnitX = endDx / endLength
      const endUnitY = endDy / endLength

      const startX = firstPoint.x - startUnitX * extendStart
      const startY = firstPoint.y - startUnitY * extendStart
      const endX = lastPoint.x + endUnitX * extendEnd // Sửa lỗi: endEnd → extendEnd
      const endY = lastPoint.y + endUnitY * extendEnd // Sửa lỗi: endEnd → extendEnd

      // Create single quadratic curve from start to end
      // Control point is at the middle X, pushed down by curveDepth
      const midX = (startX + endX) / 2
      const midY = (startY + endY) / 2 + curveDepth

      return `M ${startX} ${startY} Q ${midX} ${midY}, ${endX} ${endY}`
    }

    return `M ${firstPoint.x} ${firstPoint.y}`
  }

  // Generate area path for gradient fill
  const generateAreaPath = () => {
    const linePath = generateLinePath()
    if (!linePath) return ''

    const points = milestones.map((m) => {
      const percentage = (m.points / maxPoints) * 100
      const x = 50 + (900 * percentage) / 100
      return { x }
    })

    if (points.length === 0) return ''

    if (points.length > 1) {

      const firstMilestone = milestones[0]
      const secondMilestone = milestones[1]
      const lastMilestone = milestones[milestones.length - 1]
      const secondLastMilestone = milestones[milestones.length - 2]

      const firstPercentage = (firstMilestone.points / maxPoints) * 100
      const secondPercentage = (secondMilestone.points / maxPoints) * 100
      const lastPercentage = (lastMilestone.points / maxPoints) * 100
      const secondLastPercentage = (secondLastMilestone.points / maxPoints) * 100

      const firstX = 50 + (900 * firstPercentage) / 100
      const firstY = 250 - (220 * firstPercentage) / 100
      const secondX = 50 + (900 * secondPercentage) / 100
      const secondY = 250 - (220 * secondPercentage) / 100
      const lastX = 50 + (900 * lastPercentage) / 100
      const lastY = 250 - (220 * lastPercentage) / 100
      const secondLastX = 50 + (900 * secondLastPercentage) / 100
      const secondLastY = 250 - (220 * secondLastPercentage) / 100

      const startDx = secondX - firstX
      const startDy = secondY - firstY
      const startLength = Math.sqrt(startDx * startDx + startDy * startDy)
      const startUnitX = startDx / startLength

      const endDx = lastX - secondLastX
      const endDy = lastY - secondLastY
      const endLength = Math.sqrt(endDx * endDx + endDy * endDy)
      const endUnitX = endDx / endLength

      const startX = firstX - startUnitX * extendStart
      const endX = lastX + endUnitX * extendEnd

      // Close the path with the curve
      return `${linePath} L ${endX} 280 L ${startX} 280 Z`
    }

    return ''
  }

  return (
    <div className={cn('relative w-full py-3 px-4 overflow-hidden', className)}>
      {/* Main content */}
      <div className="relative">
        {/* SVG Line, area fill and dots */}
        <div className="relative h-[120px] mb-4">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 280" preserveAspectRatio="none">
            <defs>
              <linearGradient id="activeLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#843BEA" />
                <stop offset="100%" stopColor="#843BEA" />
              </linearGradient>

              {/* Area fill gradient - from top to bottom */}
              <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#843BEA33" />
                <stop offset="100%" stopColor="#4A218400" />
              </linearGradient>
            </defs>

            {/* Active filled area */}
            <path d={generateAreaPath()} fill="url(#areaGradient)" />

            {/* Single parabolic curved line */}
            <path
              d={generateLinePath()}
              stroke="url(#activeLineGradient)"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {/* Milestone dots positioned absolutely */}
          {milestones.map((milestone, index) => {
            const percentage = (milestone.points / maxPoints) * 100
            const leftPosition = 5 + (90 * percentage) / 100
            const topPosition = 100 - (78.6 * percentage) / 100

            return (
              <div
                key={index}
                className="absolute z-10"
                style={{
                  left: `${leftPosition}%`,
                  top: index === 1 ? `80%` : `${topPosition}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {/* Dot */}
                <div
                  className={cn(
                    'relative size-[10.13px] rounded-full transition-all duration-500 border border-[#000000] bg-[#843BEA]',
                  )}
                />
              </div>
            )
          })}
        </div>

        {/* Labels */}
        <div className="relative flex justify-between items-center px-2">
          {milestones.map((milestone, index) => {
            const percentage = (milestone.points / maxPoints) * 100

            return (
              <div
                key={index}
                className="absolute"
                style={{
                  left: `${5 + (90 * percentage) / 100}%`,
                  transform: 'translateX(-50%)',
                }}
              >
                <div className="text-[#FBFBFB] text-xs font-[380] whitespace-nowrap">{milestone.label}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default ProgressLine