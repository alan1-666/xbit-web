import { useRef } from 'react'

type BaseTooltipProps = {
  children: React.ReactNode;
}

type TooltipTagProps = BaseTooltipProps & {
  variant?: 'normal' | 'gradient';
}


const TooltipNormal = ({children}: BaseTooltipProps) => {
  return (
    <div className="flex align-middle justify-center absolute top-[-22px] right-0 bg-[#00FFCD] text-[#261236] text-[calc(1rem*(11/16))] font-[400] leading-[1] px-[6.5px] py-[3px] rounded-full">
      {children}
      <div
        className="bg-[#00FFCD] w-[calc(1rem*(10/16))] h-[calc(1rem*(10/16))] rounded-[2pc])] absolute bottom-[-2px] left-[50%] translate-x-[-50%] rotate-[45deg] transform-gpu z-[-1] rounded-[1px]"
      />
    </div>
  )
}

const TooltipGradient = ({children}: BaseTooltipProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const backgroundSize = containerRef?.current ? `${containerRef?.current?.offsetWidth + 1}px ${containerRef?.current?.offsetHeight + 4}px` : ''
  const arrowHeight = containerRef?.current ? containerRef?.current?.offsetHeight + 4 : 0

  return (
    <div
      className="tooltip-gradient"
      ref={containerRef}
      style={{
        backgroundSize: backgroundSize,
      }}
    >
      <div className="z-1">
        {children}
      </div>
      <div
        className="arrow"
        style={{
          backgroundSize: backgroundSize,
          height: arrowHeight,
        }}
      />
    </div>
  )
}

const TooltipTag = ({ variant = 'normal', children }: TooltipTagProps) => {
  if (variant === 'gradient') {
    return (
      <TooltipGradient>
        {children}
      </TooltipGradient>
    )
  }

  return (
    <TooltipNormal>
      {children}
    </TooltipNormal>
  )
}

export default TooltipTag
