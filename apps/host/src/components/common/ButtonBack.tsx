import { Button, ButtonProps } from '@components/ui/button.tsx'
import { cn } from '@/lib/utils.ts'

type ButtonBackProps = ButtonProps & {
  text?: string,
}

const ButtonBack = ({className, text, ...rest}: ButtonBackProps) => {
  return (
    <Button
      className={cn(
        'p-[5px] bg-[none] w-auto h-auto relative bottom-[-1.5px] leading-[1]',
        className,
      )}
      {...rest}
    >
      <img src="/images/icons/icon-back.svg" className="w-[7px] min-w-[7px]" alt="" />
      {text && (
        <span className="text-white">{text}</span>
      )}
    </Button>
  )
}

export default ButtonBack
