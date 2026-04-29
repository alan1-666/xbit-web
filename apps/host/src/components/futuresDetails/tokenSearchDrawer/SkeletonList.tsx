import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

const SkeletonList = ({ className }: { className?: string }) => {
  return (
    <>
      {Array.from({ length: 8 }).map((_, index) => (
        <Skeleton key={index} className={cn('w-[106px] h-[52px]', className)} />
      ))}
    </>
  )
}

export default SkeletonList
