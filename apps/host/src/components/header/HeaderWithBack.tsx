import { ReactNode } from 'react'
import { IconChevronLeft } from '@components/icon'
import { cn } from '@/lib/utils'
import { useLocation, useNavigate } from 'react-router-dom'

export interface HeaderWithBackProps {
  title: string | ReactNode
  onBack?: () => void
  right?: ReactNode
  onRightClick?: () => void
  className?: string
  titleClassName?: string
  backHref?: string
  rightClassName?: string
  leftClassName?: string
  isHidenIconLeft?: boolean
  customIconLeft?: ReactNode
}

export default function HeaderWithBack(props: HeaderWithBackProps) {
  const {
    title,
    onBack,
    right,
    className,
    titleClassName,
    backHref,
    rightClassName,
    leftClassName,
    isHidenIconLeft,
    customIconLeft,
  } = props
  const navigate = useNavigate()
  const location = useLocation()
  const handleBack = () => {
    if (onBack) return onBack()
    if (location.state?.from)
      return navigate(location.state.from, {
        replace: true,
        state: {
          ...location.state?.callbackState,
        },
      })
    if (backHref) return navigate(backHref, { replace: true })
    return navigate(-1)
  }

  return (
    <div className={cn('flex items-center justify-between px-5 py-4 bg-[#111111] w-full relative', className)}>
      <button onClick={handleBack} className={cn('w-[70px]', leftClassName)}>
        {!isHidenIconLeft && (customIconLeft ? customIconLeft : <IconChevronLeft className="text-white" />)}
      </button>
      <div className={cn('text-lg font-normal text-center flex-1', titleClassName)}>{title}</div>
      <div
        className={cn('flex items-center font-normal w-[70px] cursor-pointer', rightClassName)}
        onClick={props.onRightClick}
      >
        {right}
      </div>
    </div>
  )
}
