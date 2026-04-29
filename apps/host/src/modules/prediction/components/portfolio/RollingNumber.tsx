import { motion, useAnimationControls } from 'framer-motion'
import { memo, useEffect, useLayoutEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface RollingNumberProps {
  value: string | number
  className?: string
}

// 3 repetitions of 0-9 for seamless wrap-around animation
const DIGITS_LIST = Array.from({ length: 30 }, (_, i) => i % 10)
// Each cell occupies this percentage of the total column height
const CELL_PERCENT = 100 / 30

const RollingDigit = memo(({ digit, height }: { digit: number; height: string }) => {
  const controls = useAnimationControls()
  const prevDigitRef = useRef(digit)
  const mountedRef = useRef(false)

  // Set initial position instantly (no animation) on mount
  useLayoutEffect(() => {
    // Position at the middle repetition (index 10-19), digit D is at index 10+D
    controls.set({ y: `${-(10 + digit) * CELL_PERCENT}%` })
    mountedRef.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!mountedRef.current) return
    const prev = prevDigitRef.current
    if (prev === digit) return
    prevDigitRef.current = digit

    // Calculate shortest path: choose the direction with fewer steps
    let diff = digit - prev
    if (diff > 5) diff -= 10 // e.g. 0→9: diff=9 → -1 (roll down by 1)
    if (diff < -5) diff += 10 // e.g. 9→0: diff=-9 → +1 (roll up by 1)

    // Animate from prev's home position (10+prev) by `diff` steps
    // This may land in first rep (index <10) or third rep (index >=20)
    const targetIndex = 10 + prev + diff
    const capturedDigit = digit

    controls
      .start({
        y: `${-targetIndex * CELL_PERCENT}%`,
        transition: { type: 'spring', stiffness: 100, damping: 20 },
      })
      .then(() => {
        // Snap back to middle repetition (same visual digit, no visible change)
        controls.set({ y: `${-(10 + capturedDigit) * CELL_PERCENT}%` })
      })
  }, [digit, controls])

  return (
    <div
      style={{ height }}
      className="relative w-[0.6em] overflow-hidden tabular-nums inline-flex justify-center"
    >
      <motion.div
        animate={controls}
        className="absolute inset-x-0 top-0 flex flex-col items-center"
      >
        {DIGITS_LIST.map((n, i) => (
          <div key={i} style={{ height }} className="flex w-full items-center justify-center">
            {n}
          </div>
        ))}
      </motion.div>
      {/* Invisible placeholder to maintain width */}
      <span className="invisible">0</span>
    </div>
  )
})

RollingDigit.displayName = 'RollingDigit'

export const RollingNumber = ({ value, className }: RollingNumberProps) => {
  const stringValue = String(value)
  const chars = stringValue.split('')
  const height = '1em'

  return (
    <div className={cn('inline-flex items-center overflow-hidden', className)}>
      {chars.map((char, index) => {
        if (/[0-9]/.test(char)) {
          return <RollingDigit key={index} digit={parseInt(char)} height={height} />
        }
        return (
          <span key={index} style={{ height }} className="inline-flex items-center">
            {char}
          </span>
        )
      })}
    </div>
  )
}

