import { Button, ButtonProps } from '@components/ui/button.tsx'
import { cn } from '@/lib/utils.ts'

type DetailHeaderButtonProps = ButtonProps & {
  icon: string,
  iconClassName?: string,
}

const DetailHeaderButton = ({className, icon, iconClassName, ...rest}: DetailHeaderButtonProps) => {
  return (
    <Button
      aria-label="Detail header button"
      className={cn(
        'bg-[none] w-auto h-auto p-0',
        className,
      )}
      {...rest}
    >
      <img
        src={icon}
        className={cn(
          'w-[18px] min-w-[18px]',
          iconClassName,
        )}
        alt=""
      />
    </Button>
  )
}

export default DetailHeaderButton
