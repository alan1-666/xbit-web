import { CSSProperties, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import './style.css'
import { useResponsive } from '@/hooks/useResponsive'

const CONFETTI_DURATION_MS = 7500 // Tổng thời gian tồn tại của hiệu ứng (mili-giây)
const PARTICLE_COUNT = 300 // Tổng số lượng hạt pháo (chia đều 2 bên)
const PARTICLE_COUNT_MOBILE = 160 // Tổng số lượng hạt pháo (chia đều 2 bên)
const COLORS = [
  // Bảng màu hoa giấy
  '#ff6b6b',
  '#4ecdc4',
  '#45b7d1',
  '#f9ca24',
  '#f0932b',
  '#eb4d4b',
  '#6c5ce7',
  '#a29bfe',
  '#fd79a8',
  '#e17055',
]

const VELOCITY_X_MIN = 0.1 // Lực bắn ngang tối thiểu (10% chiều rộng)
const VELOCITY_X_MAX = 0.9 // Lực bắn ngang tối đa (90% chiều rộng)
const VELOCITY_X_MAX_MOBILE = 1.1 // Lực bắn ngang tối đa (110% chiều rộng !isDesktop)
const VELOCITY_Y_MIN = 0.3 // Độ cao tối thiểu (30% chiều cao)
const VELOCITY_Y_MAX = 0.9 // Độ cao tối đa (90% chiều cao)
const VELOCITY_Y_MAX_MOBILE = 0.6 // Độ cao tối đa (50% chiều cao !isDesktop)
const DROP_MIN = 0.8 // Quãng đường rơi tối thiểu sau khi đạt đỉnh
const DROP_MAX = 1.4 // Quãng đường rơi tối đa

const SIZE_MIN = 5 // Kích thước nhỏ nhất của hạt pháo
const SIZE_MAX = 7.5 // Kích thước lớn nhất của hạt pháo
const SIZE_MIN_MOBILE = 1 // Kích thước nhỏ nhất của hạt pháo
const SIZE_MAX_MOBILE = 2 // Kích thước lớn nhất của hạt pháo

const DURATION_MIN = 2 // Thời gian rơi nhanh nhất
const DURATION_MAX = 3 // Thời gian rơi chậm nhất (lơ lửng)
const DURATION_MIN_MOBILE = 1.5 
const DURATION_MAX_MOBILE = 2.6 
const DELAY_MAX = 0.15 // Độ trễ tối đa giữa các hạt (tạo cảm giác nổ liên tục)

const CONFETTI_EVENT = 'claim-success-confetti'

export const triggerClaimConfetti = () => {
  window.dispatchEvent(new CustomEvent('claim-success-confetti'))
}

type Particle = {
  id: number
  side: 'left' | 'right'
  x: number
  bottom: number
  dx: number
  dy: number
  drop: number
  width: number
  height: number
  color: string
  delay: number
  duration: number
  rotate: number
}

const buildParticles = (isDesktop: boolean): Particle[] => {
  if (typeof window === 'undefined') return []

  const width = window.innerWidth
  const height = window.innerHeight
  const prarticle = isDesktop ? PARTICLE_COUNT : PARTICLE_COUNT_MOBILE
  const perSide = Math.max(1, Math.floor(prarticle / 2))

  const makeSide = (side: 'left' | 'right', offset: number) =>
    Array.from({ length: perSide }).map((_, i) => {
      // Vị trí xuất phát (giấu nhẹm dưới góc màn hình)
      const startX = side === 'left' ? -30 : width + 30
      const bottom = -20
      const velocityX = isDesktop ? VELOCITY_X_MAX : VELOCITY_X_MAX_MOBILE
      const velocityY = isDesktop ? VELOCITY_Y_MAX : VELOCITY_Y_MAX_MOBILE

      // Tính toán vật lý dựa trên hằng số
      const rangeX = velocityX - VELOCITY_X_MIN
      const dx = (side === 'left' ? 1 : -1) * (VELOCITY_X_MIN + Math.random() * rangeX) * width

      const rangeY = velocityY - VELOCITY_Y_MIN
      const dy = -(VELOCITY_Y_MIN + Math.random() * rangeY) * height

      const rangeDrop = DROP_MAX - DROP_MIN
      const drop = (DROP_MIN + Math.random() * rangeDrop) * height

      // Tính toán hình dáng và kích thước
      const sizeMaxItemConfetti = isDesktop ? SIZE_MAX : SIZE_MAX_MOBILE
      const sizeMinItemConfetti = isDesktop ? SIZE_MIN : SIZE_MIN_MOBILE
      const sizeRange = sizeMaxItemConfetti - sizeMinItemConfetti
      const size = SIZE_MIN + Math.random() * sizeRange
      const isSquare = Math.random() > 0.5
      const widthPx = size
      const heightPx = isSquare ? size : size * (1.5 + Math.random() * 1.5)

      // Tính toán thời gian
      const durationRangeDeviceMax = isDesktop ? DURATION_MAX : DURATION_MAX_MOBILE
      const durationRangeDeviceMin = isDesktop ? DURATION_MIN : DURATION_MIN_MOBILE
      const durationRange = durationRangeDeviceMax - durationRangeDeviceMin

      return {
        id: offset + i,
        side,
        x: startX,
        bottom,
        dx,
        dy,
        drop,
        width: widthPx,
        height: heightPx,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        delay: Math.random() * DELAY_MAX,
        duration: DURATION_MIN + Math.random() * durationRange,
        rotate: Math.random() * 1080 - 540,
      }
    })

  return [...makeSide('left', 0), ...makeSide('right', perSide)]
}

export const ClaimConfetti = () => {
  const [burstId, setBurstId] = useState<number | null>(null)
  const [particles, setParticles] = useState<Particle[]>([])
  const timeoutRef = useRef<number | null>(null)
  const { isDesktop } = useResponsive()

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return

    const handler = () => {
      setParticles(buildParticles(isDesktop))
      setBurstId(Date.now())

      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = window.setTimeout(() => {
        setBurstId(null)
        setParticles([])
        timeoutRef.current = null
      }, CONFETTI_DURATION_MS)
    }
    window.addEventListener(CONFETTI_EVENT, handler)
    return () => {
      window.removeEventListener(CONFETTI_EVENT, handler)
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  if (!burstId || particles.length === 0 || typeof document === 'undefined') return null

  return createPortal(
    <>
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 70 }}>
        {particles.map((particle) => {
          const particleStyle: CSSProperties = {
            left: `${particle.x}px`,
            bottom: `${particle.bottom}px`,
            width: `${particle.width}px`,
            height: `${particle.height}px`,
            background: particle.color,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
            '--tx': `${particle.dx}px`,
            '--ty': `${particle.dy}px`,
            '--drop': `${particle.drop}px`,
            '--rot': `${particle.rotate}deg`,
          }
          return <span key={`${burstId}-${particle.id}`} className="claim-confetti-piece" style={particleStyle} />
        })}
      </div>
    </>,
    document.body,
  )
}
