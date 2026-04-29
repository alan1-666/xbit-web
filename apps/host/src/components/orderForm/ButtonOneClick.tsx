import { Button, ButtonProps } from '@components/ui/button.tsx'
import { cn } from '@/lib/utils.ts'
import React from 'react'
import { fShortenNumberAdvanced } from '@/lib/number'
import { TransactionType } from '@/@generated/gql/graphql-trading'

type ButtonOneClickProps = ButtonProps & {
  value: string
  unit: string
  isActive?: boolean
  iconUrl?: string
  iconProps?: React.ReactNode
  unitClassName?: string
  transactionType: TransactionType
}

const ButtonOneClick = ({
  className,
  value,
  unit,
  isActive,
  iconUrl,
  iconProps,
  unitClassName,
  transactionType,
  ...rest
}: ButtonOneClickProps) => {
  return (
    <Button
      className={cn(
        'rounded-[12px] bg-[#18171e] flex items-center justify-between gap-[4px] px-2 py-2.5 h-[36px] leading-[1] shadow-inset-dark',
        className,
        isActive && 'bg-[#843bea] shadow-inset-purple',
        //   background: linear-gradient(41.31deg, #951DC5 24.56%, #00F7A5 71.55%);
        // linear-gradient(41.31deg, color(display-p3 0.537 0.161 0.745) 24.56%, color(display-p3 0.000 0.953 0.671) 71.55%);
      )}
      {...rest}
    >
      <div className="flex items-center justify-start gap-[4px] flex-1 overflow-hidden">
        <span className="text-white text-[15px] font-[450] leading-none whitespace-nowrap mx-auto">
          {/* {value} */}
          {transactionType === TransactionType.Buy ? fShortenNumberAdvanced(+value, 2, 'down') : value}
        </span>
      </div>
      <div className="flex items-end flex-shrink-0">
        <span
          className={cn(
            `inline-block text-[#908e98] text-[10px] font-[300] leading-none ${unitClassName}`,
            isActive && 'text-white',
          )}
        >
          {unit}
        </span>
        {iconUrl && <img src={iconUrl} className={cn('w-[16px] min-w-[12px] h-3', !isActive && 'text-white')} alt="" />}
        {iconProps && iconProps}
      </div>
    </Button>
  )
}

export default ButtonOneClick
