import { cn } from '@/lib/utils.ts'

type StatsCardProps = {
  title: string | React.ReactNode,
  titleClassName?: string,
  content: string | React.ReactNode,
  contentClassName?: string,
  className?: string,
}

const StatsCard = ({title, titleClassName, content, contentClassName, className}: StatsCardProps) => {
  return (
    <div
      className={cn(
        'text-center rounded-[6px] overflow-hidden leading-[1] bg-[#ECECED0A] px-[6px] pt-[6px] pb-[9px]',
        className,
      )}
    >
      <div
        className={cn(
          'text-[calc(1rem*(13/16))] text-[#B7B2BF] relative z-2 mb-[6px]',
          titleClassName,
        )}
      >
        {title}
      </div>
      <div
        className={cn(
          'text-[calc(1rem*(17/16))] text-[#FCFCFC] relative z-2',
          contentClassName,
        )}
      >
        {content}
      </div>
    </div>
  )
}

export default StatsCard
