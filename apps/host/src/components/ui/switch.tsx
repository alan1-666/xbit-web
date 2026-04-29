import * as React from 'react'
import * as SwitchPrimitives from '@radix-ui/react-switch'
import { cn } from '@/lib/utils'

interface SwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
  classNameThumb?: string
}

const Switch = React.forwardRef<React.ComponentRef<typeof SwitchPrimitives.Root>, SwitchProps>(
  ({ className, classNameThumb, ...props }, ref) => (
    <SwitchPrimitives.Root
      className={cn(
        'peer p-[1px] inline-flex h-[16px] w-[31px] min-w-[31px] shrink-0 cursor-pointer items-center rounded-full shadow-sm transition-colors focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[#00FFB4] data-[state=unchecked]:bg-[#878787]',
        className,
      )}
      {...props}
      ref={ref}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          'pointer-events-none block h-[100%] w-[14.5px] min-w-[14.5px] rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-[100%] data-[state=unchecked]:translate-x-0',
          classNameThumb,
        )}
      />
    </SwitchPrimitives.Root>
  ),
)
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
