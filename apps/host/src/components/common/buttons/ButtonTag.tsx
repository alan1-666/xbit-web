import { Button, ButtonProps } from '@components/ui/button.tsx'
import { cn } from '@/lib/utils.ts'

type ButtonTagProps = ButtonProps & {
  isActive?: boolean,
}

const ButtonTag = ({className, isActive, children, ...rest}: ButtonTagProps) => {
  return (
    <Button
      className={cn(
        'px-[10px] py-[4px] bg-[#ECECED14] h-auto text-[calc(1rem*(12/16))] text-[#FFFFFF99] font-[400] rounded-[4px] leading-[1] relative transition-all duration-100 hover:scale-[1.05]',
        isActive && 'text-[#FFFFFF]',
        className,
      )}
      {...rest}
    >
      <span
        className={cn(
          'bg-[linear-gradient(45deg,#E149F8,#9945FF,#00F3AB)] absolute inset-0 rounded-[4px] leading-[1] transition-all duration-300 opacity-0',
          isActive && 'opacity-100',
        )}
      />
      <span className={cn(
        'relative transition-all duration-300 ease-in-out',
        isActive && 'transform scale-[1.03]',
      )}>
        {children}
      </span>
    </Button>
  )
}

export default ButtonTag