import React from 'react'
import { cn } from '@/lib/utils'
import { isRealIOSSafari } from '@/utils/helpers'

interface SafeAreaWrapperProps {
  children: React.ReactNode
  className?: string
}

const SafeAreaWrapper: React.FC<SafeAreaWrapperProps> = ({ children, className }) => {
  return (
    <div className={cn(className, isRealIOSSafari() && 'pb-[80px]')}>
      {children}
    </div>
  )
}

export default SafeAreaWrapper
