import { ReactNode } from 'react'
import { cn } from '@/lib/utils.ts'
import './animated-gradient-spin.css'

export interface AnimatedGradientButtonProps {
  children: ReactNode
  innerClassName?: string
  className?: string
}
export const AnimatedGradientButton = (props: AnimatedGradientButtonProps) => {
  const { children, className } = props
  return (
    <div
      className={cn(
        'transition group/animated cursor-pointer',
        'inline-flex animated-angle p-0.5 overflow-hidden bg-[conic-gradient(from_var(--angle)_at_50%_50%,_#23074B_0deg,_#A362FF_71deg,_#00FF93_108deg,_#721CE2_135deg,_#23074B_249deg,_#23074B_360deg)]',
        'hover:bg-gradient-to-b from-[#0D002200] to-[#9F63FF]',
        className,
      )}
    >
      <div className="w-full bg-[#0A0A0AE5] rounded-full backdrop-blur-lg flex justify-center items-center group-hover/animated:bg-gradient-to-b group-hover/animated:from-[#20005400] group-hover:to-[#4905B7] transition">
        {children}
      </div>
    </div>
  )
}
