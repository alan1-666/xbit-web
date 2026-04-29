import { cn } from '@/lib/utils.ts'

type LogoXBitProps = {
  className?: string;
  alt?: string;
  hasText?: boolean;
}

const LogoXBit = ({className, alt ='logo xbit', hasText = false}: LogoXBitProps) => {
  const combinedClassName = cn('w-[27px] min-w-[27px] h-[25px]', className)

  return (
    <div className="flex items-center">
      <img src="/images/xbit-logo.svg" className={combinedClassName} alt={alt} />
      {hasText && (
        <img src="/images/logo-xbit-txt.webp" className='ml-1' alt={alt} />
      )}
    </div>
  )
}

export default LogoXBit
