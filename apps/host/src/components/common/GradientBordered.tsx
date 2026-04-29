import { cn } from '@/lib/utils.ts'

const defaultGradientValue = '45deg, #E149F8, #9945FF, #00F3AB'

export type GradientBorderedProps = {
  gradientValue?: string
  containerClassName?: string
  innerBgClassName?: string
  children?: React.ReactNode
  onClick?: () => void
}

const GradientBordered = ({
  gradientValue,
  containerClassName,
  innerBgClassName,
  onClick,
  children,
}: GradientBorderedProps) => {
  return (
    <div
      className={cn('p-[0.6px] bg-impartal', containerClassName)}
      // style={{
      //   backgroundImage: `linear-gradient(${gradientValue ?? defaultGradientValue})`,
      // }}
      onClick={onClick}
    >
      <div className={cn('bg-[#000000] w-full h-full', innerBgClassName)}>{children}</div>
    </div>
  )
}

export default GradientBordered
