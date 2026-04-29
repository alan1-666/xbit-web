import dayjs from 'dayjs'
import { TabKey } from '../../store/usePositionsStore'
import { formatCurrency } from '@/utils/address'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

type Props = {
  // type: TabKey
  type: 'positions' | 'openOrders' | 'trades'
  data: any
}

const PositionCard = ({ type, data }: Props) => {
  const { t } = useTranslation()

  const formatDir = (dir) => {
    switch (dir) {
      case 'Close Long':
        return t('futuresDetails.common.closeLong')
      case 'Close Short':
        return t('futuresDetails.common.closeShort')
      case 'Open Long':
        return t('futuresDetails.common.long')
      case 'Open Short':
        return t('futuresDetails.common.short')
      case 'Liquidated Cross Long':
        return t('futuresDetails.common.liquidated')
      case 'Liquidated Cross Short':
        return t('futuresDetails.common.liquidated')
      case 'Liquidated Isolated Long':
        return t('futuresDetails.common.liquidated')
      case 'Liquidated Isolated Short':
        return t('futuresDetails.common.liquidated')
      case 'Auto-Deleveraging':
        return t('futuresDetails.common.autoDeleveraging')
      default:
        return dir
    }
  }

  const renderPositionCard = () => {
    const pnlPositive = (data.pnl ?? 0) >= 0
    const pnlColor = pnlPositive ? 'text-[#2FFD95]' : 'text-[#F65333]'

    return (
      <div className="w-full inline-flex flex-col justify-start items-start gap-3">
        <div className="w-full bg-[#101114] rounded-lg inline-flex flex-col justify-start items-center border">
          <div
            className={cn(
              'self-stretch h-9 p-3 rounded-tl-lg rounded-tr-lg inline-flex justify-between items-center bg-[#18181B]',
            )}
          >
            <div className="flex justify-start items-center gap-2">
              <div className="justify-start text-white text-sm font-semibold font-['Geist'] leading-4">
                {t('assets.overview.perpetual', { pair: `${data.symbol}USD ` })}
              </div>
              <div
                className={cn(
                  'h-4 px-[5px] py-1 rounded-[3px] flex justify-center items-center gap-3',
                  data.size > 0 ? 'bg-[#04332B]' : 'bg-[#38120B]',
                )}
              >
                <div
                  className={cn(
                    "justify-start text-[10px] font-normal font-['Geist'] leading-[10px]",
                    data.size > 0 ? 'text-[#00CE89]' : 'text-[#F65333]',
                  )}
                >
                  {data.leverage}x
                </div>
              </div>
            </div>
          </div>
          <div className="self-stretch p-3 inline-flex justify-between items-start">
            <div className="inline-flex flex-col justify-start items-start gap-2">
              <div className="inline-flex justify-start items-start gap-0.5">
                <div className="text-center justify-center text-[#605E68] text-xs font-normal font-['Geist'] leading-3">
                  {t('assets.futures.unrealizedPnl')}
                </div>
              </div>
              <div className="h-3.5 inline-flex justify-start items-center gap-1">
                <div
                  className={cn(
                    "text-center justify-center text-sm font-medium font-['Geist'] leading-4 tracking-wide",
                    pnlColor,
                  )}
                >
                  {formatCurrency(data.pnl.toFixed(2))} ({(Number(data.pnlPct) * 100).toFixed(2)}%)
                </div>
              </div>
            </div>
            <div className="inline-flex flex-col justify-start items-end gap-2">
              <div className="inline-flex justify-start items-start gap-0.5">
                <div className="text-center justify-center text-[#605E68] text-xs font-normal font-['Geist'] leading-3">
                  {t('smartMoney.addressDetail.size')}
                </div>
              </div>
              <div className="inline-flex justify-start items-start gap-0.5">
                <div className="text-center justify-center text-white text-sm font-medium font-['Geist'] leading-4">
                  {Math.abs(data.size)}
                </div>
              </div>
            </div>
          </div>
          <div className="w-[97%] h-0 outline outline-[0.50px] outline-offset-[-0.25px] outline-[#FFFFFF1A]"></div>
          <div className="self-stretch p-3 flex flex-col justify-start items-start gap-4">
            <div className="self-stretch inline-flex justify-start items-center gap-5">
              <div className="w-28 inline-flex flex-col justify-start items-start gap-2">
                <div className="inline-flex justify-start items-start gap-0.5">
                  <div className="text-center justify-center text-[#605E68] text-xs font-normal font-['Geist'] leading-3">
                    {t('smartMoney.addressDetail.entryPrice')}
                  </div>
                </div>
                <div className="inline-flex justify-start items-start gap-0.5">
                  <div className="text-center justify-center text-white text-sm font-normal font-['Geist'] leading-4">
                    {formatCurrency(data.avgPrice)}
                  </div>
                </div>
              </div>
              <div className="flex-1 h-8 inline-flex flex-col justify-start items-start gap-2">
                <div className="w-0 h-3"></div>
              </div>
              <div className="w-24 inline-flex flex-col justify-start items-end gap-2">
                <div className="inline-flex justify-start items-start gap-0.5">
                  <div className="text-center justify-center text-[#605E68] text-xs font-normal font-['Geist'] leading-3">
                    {t('position.liquidationPrice')}
                  </div>
                </div>
                <div className="inline-flex justify-start items-start gap-0.5">
                  <div className="text-center justify-center text-white text-sm font-normal font-['Geist'] leading-4">
                    {formatCurrency(data.liqPrice)}
                  </div>
                </div>
              </div>
            </div>
            <div className="self-stretch inline-flex justify-start items-center gap-5">
              <div className="w-28 h-8 inline-flex flex-col justify-center items-start gap-2">
                <div className="inline-flex justify-start items-start gap-1">
                  <div className="justify-center text-[#605E68] text-xs font-normal font-['Geist'] leading-3">
                    {t('smartMoney.addressDetail.margin')}
                  </div>
                </div>
                <div className="inline-flex justify-start items-end gap-1.5">
                  <div className="justify-center text-white text-sm font-normal font-['Geist'] leading-4">
                    {formatCurrency(data.marginUsd)}
                  </div>
                </div>
              </div>
              <div className="flex-1 h-8 inline-flex flex-col justify-start items-end gap-2">
                <div className="inline-flex justify-start items-start gap-1">
                  <div className="text-center justify-center text-[#605E68] text-xs font-normal font-['Geist'] leading-3">
                    {t('smartMoney.addressDetail.positionValue')}
                  </div>
                </div>
                <div className="text-center justify-center text-white text-sm font-normal font-['Geist'] leading-4">
                  {formatCurrency(data.valueUsd)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderOpenOrdersCard = () => {
    return (
      <div className="w-full bg-[#101114] rounded-lg inline-flex flex-col justify-start items-center border">
        <div className="self-stretch h-9 p-3 bg-[#18181B] rounded-tl-lg rounded-tr-lg inline-flex justify-between items-center">
          <div className="flex justify-start items-center gap-2">
            <div className="justify-start text-white text-sm font-semibold font-['Geist'] leading-4">
              {t('assets.overview.perpetual', { pair: `${data.symbol}USD ` })}
            </div>
            <div
              className={cn(
                'h-4 px-[5px] py-1 rounded-[3px] flex justify-center items-center gap-3',
                data.side.toUpperCase() === 'BUY' ? 'bg-[#04332B]' : 'bg-[#38120B]',
              )}
            >
              <div
                className={cn(
                  "justify-start text-[10px] font-normal font-['Geist'] leading-[10px]",
                  data.side.toUpperCase() === 'BUY' ? 'text-[#00CE89]' : 'text-[#F65333]',
                )}
              >
                {data.side.toUpperCase() === 'BUY' ? t('futuresDetails.common.long') : t('futuresDetails.common.short')}
              </div>
            </div>
          </div>
        </div>
        <div className="self-stretch p-3 flex flex-col justify-start items-start gap-4">
          <div className="self-stretch inline-flex justify-start items-center gap-5">
            <div className="w-28 inline-flex flex-col justify-start items-start gap-2">
              <div className="inline-flex justify-start items-start gap-0.5">
                <div className="text-center justify-center text-[#605E68] text-xs font-normal font-['Geist'] leading-3">
                  {t('smartMoney.addressDetail.type')}
                </div>
              </div>
              <div className="inline-flex justify-start items-start gap-0.5">
                <div className="text-center justify-center text-white text-sm font-normal font-['Geist'] leading-4">
                  {data.type}
                </div>
              </div>
            </div>
            <div className="flex-1 h-8 inline-flex flex-col justify-start items-start gap-2">
              <div className="inline-flex justify-start items-start gap-1">
                <div className="text-center justify-center text-[#605E68] text-xs font-normal font-['Geist'] leading-3">
                  {t('smartMoney.addressDetail.orderPrice')}
                </div>
              </div>
              <div className="text-center justify-center text-white text-sm font-normal font-['Geist'] leading-4">
                {formatCurrency(data.price)}
              </div>
            </div>
            <div className="w-24 inline-flex flex-col justify-start items-end gap-2">
              <div className="inline-flex justify-start items-start gap-0.5">
                <div className="text-center justify-center text-[#605E68] text-xs font-normal font-['Geist'] leading-3">
                  {t('smartMoney.addressDetail.orderAmount')}
                </div>
              </div>
              <div className="inline-flex justify-start items-start gap-0.5">
                <div className="text-center justify-center text-white text-sm font-normal font-['Geist'] leading-4">
                  {data.size}
                </div>
              </div>
            </div>
          </div>
          <div className="self-stretch inline-flex justify-start items-center gap-5">
            <div className="w-28 h-8 inline-flex flex-col justify-center items-start gap-2">
              <div className="inline-flex justify-start items-start gap-1">
                <div className="justify-center text-[#605E68] text-xs font-normal font-['Geist'] leading-3">
                  {t('smartMoney.triggerCondition')}
                </div>
              </div>
              <div className="inline-flex justify-start items-end gap-1.5">
                <div className="justify-center text-white text-sm font-normal font-['Geist'] leading-4">
                  {data.triggerCondition}
                </div>
              </div>
            </div>
            <div className="flex-1 inline-flex flex-col justify-center items-end gap-2">
              <div className="text-center justify-center text-[#605E68] text-xs font-normal font-['Geist'] leading-3">
                {t('smartMoney.addressDetail.orderTime')}
              </div>
              <div className="text-center justify-center text-[#908E98] text-xs font-normal font-['Geist'] leading-4">
                {dayjs(data.ts).format('YYYY-MM-DD HH:mm:ss')}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderTWAPCard = () => {
    return 'render twap card'
  }

  const renderTradesCard = () => {
    const pnlPositive = (Number(data.closedPnl.replace('$', '')) ?? 0) >= 0
    const pnlColor = pnlPositive ? 'text-[#2FFD95]' : 'text-[#F65333]'

    return (
      <div className="w-full bg-[#101114] rounded-lg inline-flex flex-col justify-start items-center border">
        <div className="self-stretch h-9 p-3 bg-[#18181B] rounded-tl-lg rounded-tr-lg inline-flex justify-between items-center ">
          <div className="flex justify-start items-center gap-2">
            <div className="justify-start text-white text-sm font-semibold font-['Geist'] leading-4">
              {t('assets.overview.perpetual', { pair: `${data.coin}USD ` })}
            </div>
            <div
              className={cn(
                'h-4 px-[5px] py-1 rounded-[3px] flex justify-center items-center gap-3',
                data.side.toUpperCase() === 'BUY' ? 'bg-[#04332B]' : 'bg-[#38120B]',
              )}
            >
              <div
                className={cn(
                  "justify-start text-[10px] font-normal font-['Geist'] leading-[10px]",
                  data.side.toUpperCase() === 'BUY' ? 'text-[#00CE89]' : 'text-[#F65333]',
                )}
              >
                {formatDir(data.dir)}
              </div>
            </div>
          </div>
        </div>
        <div className="self-stretch p-3 flex flex-col justify-start items-start gap-4">
          <div className="self-stretch inline-flex justify-start items-center gap-5">
            <div className="w-28 inline-flex flex-col justify-start items-start gap-2">
              <div className="inline-flex justify-start items-start gap-0.5">
                <div className="text-center justify-center text-[#605E68] text-xs font-normal font-['Geist'] leading-3">
                  {t('smartMoney.addressDetail.closedPnL')}
                </div>
              </div>
              <div className="inline-flex justify-start items-start gap-0.5">
                <div
                  className={cn(
                    "text-center justify-center text-emerald-400 text-sm font-medium font-['Geist'] leading-4",
                    pnlColor,
                  )}
                >
                  {data.closedPnl}
                </div>
              </div>
            </div>
            <div className="flex-1 h-8 inline-flex flex-col justify-start items-start gap-2">
              <div className="inline-flex justify-start items-start gap-1">
                <div className="text-center justify-center"></div>
              </div>
              <div className="text-center justify-center"></div>
            </div>
            <div className="w-24 inline-flex flex-col justify-start items-end gap-2">
              <div className="inline-flex justify-start items-start gap-0.5">
                <div className="text-center justify-center text-[#605E68] text-xs font-normal font-['Geist'] leading-3">
                  {t('smartMoney.addressDetail.filledQuantity')}
                </div>
              </div>
              <div className="inline-flex justify-start items-start gap-0.5">
                <div className="text-center justify-center text-white text-sm font-normal font-['Geist'] leading-4">
                  {data.sz}
                </div>
              </div>
            </div>
          </div>
          <div className="self-stretch inline-flex justify-start items-center gap-5">
            <div className="w-28 h-8 inline-flex flex-col justify-center items-start gap-2">
              <div className="inline-flex justify-start items-start gap-1">
                <div className="justify-center text-[#605E68] text-xs font-normal font-['Geist'] leading-3">
                  {t('smartMoney.addressDetail.filledPrice')}
                </div>
              </div>
              <div className="inline-flex justify-start items-end gap-1.5">
                <div className="justify-center text-white text-sm font-normal font-['Geist'] leading-4">{data.px}</div>
              </div>
            </div>
            <div className="flex-1 inline-flex flex-col justify-center items-end gap-2">
              <div className="text-center justify-center text-[#605E68] text-xs font-normal font-['Geist'] leading-3">
                {t('smartMoney.addressDetail.filledTime')}
              </div>
              <div className="text-center justify-center text-[#908E98] text-xs font-normal font-['Geist'] leading-4">
                {dayjs(data.time).format('YYYY-MM-DD HH:mm:ss')}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderCompletedTradesCard = () => {
    return 'complete trades card'
  }

  const renderFundingCard = () => {
    return 'funding card'
  }

  const renderOrderHistoryCard = () => {
    return 'order history card'
  }

  const renderAccountCard = () => {
    return 'account card'
  }

  const renderByType = () => {
    switch (type) {
      case 'positions':
        return renderPositionCard()
      case 'openOrders':
        return renderOpenOrdersCard()
      // case 'twap':
      // return renderTWAPCard()
      case 'trades':
        return renderTradesCard()
      // case 'completedTrades':
      //   return renderCompletedTradesCard()
      // case 'funding':
      //   return renderFundingCard()
      // case 'orderHistory':
      //   return renderOrderHistoryCard()
      // case 'account':
      //   return renderAccountCard()
      default:
        return null
    }
  }

  return <div>{renderByType()}</div>
}

export default PositionCard
