import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { capitalize } from 'lodash-es';
import { HtmlHTMLAttributes } from 'react';

export type WalletType = 'smartmoney' | 'new' | 'kol' | 'sniper' | 'pumpsm' | 'whale' | string

const walletTypeMap: Record<WalletType, { label: string; bgColor: string; textColor: string }> = {
  toptrader: {
    label: 'walletCopy.tags.toptrader',
    bgColor: '#00FFB4',
    textColor: '#00FFB4',
  },
  smartmoney: {
    label: 'walletCopy.tags.smartmoney',
    bgColor: '#00FFB4',
    textColor: '#00FFB4',
  },
  fresh: {
    label: 'walletCopy.tags.fresh',
    bgColor: '#20D3EE',
    textColor: '#20D3EE',
  },
  kol: {
    label: 'walletCopy.tags.kol',
    bgColor: '#E7B008',
    textColor: '#E7B008',
  },
  sniper: {
    label: 'walletCopy.tags.sniper',
    bgColor: '#F471B5',
    textColor: '#F471B5',
  },
  pumpsm: {
    label: 'walletCopy.tags.pumpsm',
    bgColor: 'transparent',
    textColor: 'trasparent',
  },
  whale: {
    label: 'walletCopy.tags.whale',
    bgColor: '#F471B5',
    textColor: '#F471B5',
  },
}

type WalletTypeBadgeProps = {
  type: WalletType[] | string;
  className?: HtmlHTMLAttributes<HTMLSpanElement>['className'];
}

const WalletTypeBadge = ({ type, className }: WalletTypeBadgeProps) => {
  const { t } = useTranslation()
  const normalizedType = typeof type === 'string' ? [String(type).toLowerCase()] : type;
  if (!normalizedType || normalizedType.length === 0) {
    return null
  }
  return (
    <div className="flex gap-0.5">
      {[...normalizedType].sort().map((item, index) => {
        //exclude 'toptrader' and any unrecognized types
        if (!walletTypeMap[String(item).toLowerCase()] || String(item).toLowerCase() === 'toptrader') {
          return null
        }
        const { label, bgColor, textColor } = walletTypeMap[String(item).toLowerCase()]
        return (
          <TooltipProvider delayDuration={200} key={`wallet-type-${index}`}>
            <Tooltip>
              <TooltipTrigger>
                <span
                  className={cn(
                    'text-[calc(1rem*(8/16))] leading-[calc(1rem*(8/16))] border-[0.5px] rounded-[2px] p-[2px] w-[14px] h-[14px] aspect-square flex items-center justify-center',
                    className,
                  )}
                  style={{
                    borderColor: bgColor,
                    color: textColor,
                  }}
                >
                  {
                    label === 'walletCopy.tags.pumpsm' ?
                      <img src="/images/icons/pump-icon.svg" className="w-[14px] h-[14px] max-w-none" alt="" />
                      : String(t(label)).slice(0, 1).toUpperCase()
                  }
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-[360px]">
                <p className="text-xs leading-none">
                  {capitalize(t(label))}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      })}
    </div>
  )
}

export default WalletTypeBadge
