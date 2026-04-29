import { cn } from '@/lib/utils'

interface TextBorderProps {
  text: string
  className?: string
  borderColor?: string
  textColor?: string
}

const TextBorder = ({ text, className, borderColor, textColor }: TextBorderProps) => {
  return (
    <div
      className={cn('px-1 py-1 rounded-sm border border-[#00FFF6] text-[#00FFF6] font-[400] text-[calc(1rem*(12/16))]', className)}
      style={{
        borderColor,
        color: textColor,
      }}
    >
      {text}
    </div>
  )
}

export default TextBorder
