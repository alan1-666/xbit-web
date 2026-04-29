import { MouseEvent } from 'react'
import { HTMLMotionProps, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

export interface MotionLinkProps extends Omit<HTMLMotionProps<'a'>, 'ref'> {
  to: string
}

export const MotionLink = (props: MotionLinkProps) => {
  const { to } = props
  const navigate = useNavigate()
  const handleClick = (e: MouseEvent) => {
    if (
      e.button === 1 || // Middle mouse
      e.ctrlKey || // Ctrl+Click
      e.metaKey || // Cmd+Click (Mac)
      e.shiftKey // Shift+Click -> open new window
    ) {
      return
    }
    e.preventDefault()
    navigate(to)
  }
  return <motion.a href={to} {...props} onClick={handleClick} />
}
