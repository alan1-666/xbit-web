import { shortAddr } from '@/utils/address'
import { TopTrader } from '../Api/api'
import { useTranslation } from 'react-i18next'
import { Configs } from '@/const/configs'
import { formatCurrency } from '@/utils/address'
import { cn, MathFun } from '@/lib/utils'
import { ReactComponent as UpIcon } from '@/components/icon/smart-money/up-icon.svg'
import { ReactComponent as DownIcon } from '@/components/icon/smart-money/down_icon.svg'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getClearinghouseState } from '@/api/hyperliquid'
import { useResponsive } from '@/hooks/hyperliquid/useResponsive'

type TopTraderCardProp = {
  trader: TopTrader,
  onClick?: (addr: string, item: any) => void
}

const TopTraderCard = ({ trader, onClick }: TopTraderCardProp) => {
  const { t } = useTranslation()
  const { isDesktop } = useResponsive()

  const [position, setPosition] = useState<any>()
  
  useEffect(() => {
    if (!trader.userAddress || isDesktop) return

    const getPositions = async () => {
      const {assetPositions } = await getClearinghouseState(trader.userAddress)
      
      setPosition(assetPositions[0].position)
    }

    getPositions()
  }, [trader.userAddress])
  
  return (
    <div
      className="p-3 bg-[#18181B] rounded-xl inline-flex flex-col justify-center items-start gap-3 cursor-pointer"
      onClick={(e) => {
        e.stopPropagation()
        onClick?.(trader.userAddress, trader)
      }}
    >
      <div className="self-stretch inline-flex justify-start items-start gap-3">
        <div className="flex-1 inline-flex flex-col justify-start items-start gap-1">
          <div className="text-center justify-center text-[#908E98] text-[10px] font-light font-['Geist'] leading-[10px]">
            {t('smartMoney.topTrader')}
          </div>
          <div className="self-stretch justify-start text-white text-sm font-medium font-['Geist'] leading-4">
            {shortAddr(trader.userAddress)}
          </div>
        </div>
        <div className="px-1 py-0.5 bg-[#2F2F32] rounded-[999px] flex justify-start items-center gap-0.5">
          <div className="w-1 h-1 bg-red-500 rounded-full"></div>
          <div className="text-center justify-center text-red-500 text-[10px] font-normal font-['Geist'] leading-[10px]">
            LIVE
          </div>
        </div>
      </div>
      <div className="self-stretch inline-flex justify-between items-end gap-2.5">
        <div className="inline-flex flex-col justify-center items-start gap-1">
          <div className="text-center justify-center text-[#908E98] text-[10px] font-light font-['Geist'] leading-[10px]">
            {t('smartMoney.pnlLast7Days')}
          </div>
          <div className={cn("text-right justify-start text-base font-medium font-['Geist'] leading-4", trader.roi > 0 ? "text-[#00CE89]" : "text-[#F65333]")}>
            {trader.roi.toFixed(2)}%
          </div>
        </div>
        <div className="flex justify-start items-center">
          <div className="flex justify-start items-center gap-1">
            <div className="w-4 h-4 relative rounded-2xl">
              {position && <img
                src={`${Configs.getHyperliquidConfig().imgUrl}/${position.coin}.svg`}
                className="size-4 rounded-full"
                onError={(e) => {
                  e.currentTarget.src = '/images/xbit-logo-rounded.webp'
                }}
              />}
            </div>
            {position && <div>
              <div className="text-center justify-start text-sm font-medium font-['Geist'] leading-4">
                <div
                  className={cn(
                    Number(position.szi) < 0
                      ? 'text-[#F65333]'
                      : 'text-[#00CE89]',
                  )}
                >
                  {position
                    ? formatCurrency(position.positionValue)
                    : '-'}
                </div>
              </div>
            </div>}
            {position && <div className="w-4 h-4">
              {Number(position.szi) < 0 ? (
                <DownIcon className="w-3 h-3 mt-0.5" />
              ) : (
                <UpIcon className="w-4 h-4" />
              )}
            </div>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TopTraderCard


export const TopTraderCardSkeleton = () => {
 
  return (
    <div className="flex gap-2 mb-3.5 overflow-hidden">
      {Array.from({ length: 5 }).map((_, idx) => (
        <div
          key={idx}
          className="w-[200px] h-[90px] rounded-xl flex-shrink-0 bg-gradient-to-br from-purple-500/15 to-purple-700/10 animate-pulse"
        />
      ))}
    </div>
  )
}