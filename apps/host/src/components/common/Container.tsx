import { ReactNode } from 'react'
import { cn } from '@/lib/utils.ts'

type ContainerProps = {
  children: ReactNode;
  className?: string;
}

const Container = ({className, children}: ContainerProps) => {
  const containerBaseClassnames = 'mx-auto px-3'
  const combinedClassnames = cn(containerBaseClassnames, className)

  return (
    <div
      className={combinedClassnames}
    >
      {children}
    </div>
  )
}

export default Container