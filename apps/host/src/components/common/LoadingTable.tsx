import { cn } from '@/lib/utils.ts'
import lottieData from '@/lottie/loadingTable.json'
import Lottie from 'lottie-react'

export interface LoadingProps {
  className?: string
}

export const LoadingTable = (props: LoadingProps) => {
  const { className } = props
  return <Lottie animationData={lottieData} loop autoplay className={cn('size-16', className)} />
}
