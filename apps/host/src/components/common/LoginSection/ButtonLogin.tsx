import ButtonGradient, { ButtonGradientProps } from '@components/common/buttons/ButtonGradient.tsx'
import { cn } from '@/lib/utils.ts'
import { Button } from '@/components/ui/button'

type ButtonLoginProps = ButtonGradientProps

const ButtonLogin = ({ className, children, ...rest }: ButtonLoginProps) => {
  return (
    <Button
      variant={'gradient'}
      className={cn(
        'gap-[calc(1rem*(8/16))] text-[#141414] text-[calc(1rem*(14/16))] leading-[1] font-[500] tracking-[calc(1rem*(0.5/16))] p-[13px 12.5px] w-[50%] max-w-[calc(1rem*(144/16))] rounded-[50px]',
        className,
      )}
      {...rest}
    >
      {children}
    </Button>
  )
}

export default ButtonLogin
