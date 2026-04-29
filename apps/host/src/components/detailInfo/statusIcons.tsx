import { cn } from '@/lib/utils'
import { IconHeaderSpinner } from '../icon'

export type BuyerStatus = 'hold' | 'increase' | 'partialSell' | 'fullSell' | 'targetedBuyer' | 'none'

export const getStatusIcon = (
  status: BuyerStatus,
  size: 'normal' | 'small' = 'normal',
  isFirst: boolean = false,
  isSniper: boolean = false,
) => {
  const iconSize = size === 'normal' ? 1.5 : 1
  const iconStyle = {
    width: `${iconSize}rem`,
    height: `${iconSize}rem`,
  }

  const renderIcon = () => {
    switch (status) {
      case 'hold':
        return (
          <div className="relative w-fit">
            <i className="bg-[#AB57FF] rounded-full aspect-square block" style={iconStyle}></i>
            {isSniper && (
              <div className={cn('absolute bottom-0 -right-0.5 ')}>
                <IconHeaderSpinner />
              </div>
            )}
          </div>
        )
      case 'increase':
        return (
          <div className="relative w-fit">
            <i className="bg-[#2ffd95] rounded-full aspect-square block" style={iconStyle}></i>
            {isSniper && (
              <div className={cn('absolute bottom-0 -right-0.5')}>
                <IconHeaderSpinner />
              </div>
            )}
          </div>
        )
      case 'partialSell':
        return (
          <div className="relative w-fit">
            <i className="p-[3.5px] bg-[#F25461] via-40% rounded-full aspect-square block" style={iconStyle}>
              <i className="w-full h-1/2 bg-[#232329] rounded-t-full block"></i>
            </i>
            {isSniper && (
              <div className={cn('absolute bottom-0 -right-0.5')}>
                <IconHeaderSpinner />
              </div>
            )}
          </div>
        )
      case 'fullSell':
        return (
          <div className="relative w-fit">
            <i
              className={cn(
                'bg-[#232329] rounded-full aspect-square flex items-center justify-center border-[#F25461] overflow-hidden box-border',
                size === 'normal' ? 'border-[3.14px]' : 'border-[2.25px]',
              )}
              style={iconStyle}
            ></i>
            {isSniper && (
              <div className={cn('absolute bottom-0 -right-0.5')}>
                <IconHeaderSpinner />
              </div>
            )}
          </div>
        )
      case 'targetedBuyer':
        return (
          <div className="relative w-fit">
            {/*<i className="bg-[#00FFB4] rounded-full aspect-square inline-block" style={iconStyle}></i>*/}
            {isSniper && (
              <div>
                <IconHeaderSpinner className={cn('scale-175')} />
              </div>
            )}
          </div>
        )
      default:
        return (
          <div className="relative w-fit">
            <i className="size-6" />
          </div>
        )
    }
  }

  if (isFirst) {
    return <div className="relative w-fit">{renderIcon()}</div>
  }

  return renderIcon()
}
