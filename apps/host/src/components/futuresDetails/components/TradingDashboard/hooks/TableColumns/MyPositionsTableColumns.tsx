import Tag from '@/components/common/Tag'
import Text from '@/components/common/Text'
import { formatPrice, getPositionDescription } from '@/components/futuresDetails/trade/tools'
import { PositionModeValue, xPositions } from '@/components/futuresDetails/trade/types'
import { cn, showRate, fixNumber } from '@/lib/utils'
import useSortableTable from '@/pages/futures-market/hooks/useSortableTable'
import { selectSzMap } from '@/redux/modules/futuresMeta.slice'
import { useAppSelector } from '@/redux/store'
import { formatMoney, formatNumberWithCommas } from '@/utils/helpers'
import { createColumnHelper } from '@tanstack/react-table'
import { Dispatch, SetStateAction, useMemo, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import ButtonAction from '../../../ButtonAction'
import SortHeader from '../../SortHeader'
import { KEY_ENUM, default as useTradingDashboard } from '../useTradingDashboard'
import { useNavigate } from 'react-router-dom'
import { selectPricePrecisionBySymbol } from '@/redux/modules/futuresMeta.slice'

interface PriceActionCellProps {
  info: any
  setInfo: Dispatch<SetStateAction<xPositions | undefined>>
  setOpen: Dispatch<SetStateAction<boolean>>
  setShowMarketPriceClose: Dispatch<SetStateAction<boolean>>
  setCurrentTab?: (tab: string) => void
  szMap: Record<string, any>
  t: (key: string) => string
}

const PriceActionCell = ({
  info,
  setInfo,
  setOpen,
  setShowMarketPriceClose,
  szMap,
  t,
  setCurrentTab,
}: PriceActionCellProps) => {
  const { tpPrice, coin, slPrice, hasTriggerOrder } = info.row.original

  const tpPx = tpPrice ? parseFloat(formatPrice(tpPrice, szMap[coin])).toString() : ''
  const slPx = slPrice ? parseFloat(formatPrice(slPrice, szMap[coin])).toString() : ''

  return (
    <div className="flex gap-1 pl-2 whitespace-nowrap flex-nowrap">
      {hasTriggerOrder ? (
        <div className="px-[8px] py-[6px] bg-[#ECECED14] rounded-[4px]  flex items-center flex-shrink">
          <Text
            text={t('position.viewOrder')}
            className="!text-[14px] cursor-pointer whitespace-nowrap"
            fontSize={11}
            onClick={() => {
              setCurrentTab && setCurrentTab(KEY_ENUM.ORDER)
            }}
          />
          <img
            className="ml-1.5 cursor-pointer hover:scale-[1.1] !pointer-events-auto flex-shrink-0"
            src="/images/futuresDetail/edit-icon.svg"
            alt="edit-icon"
            onClick={() => {
              setOpen((prev) => !prev)
              setInfo((prev) => ({
                ...prev,
                ...info.row.original,
                tpPrice: tpPx,
                slPrice: slPx,
              }))
            }}
          />
        </div>
      ) : (
        <div
          className="px-[8px] py-[6px] pr-[15px]  cursor-pointer !font-[330] bg-[#ECECED14] rounded-[4px]  flex items-center whitespace-nowrap  flex-shrink min-w-0"
          onClick={() => {
            setOpen((prev) => !prev)
            setInfo((prev) => ({
              ...prev,
              ...info.row.original,
              tpPrice: tpPx,
              slPrice: slPx,
            }))
          }}
        >
          {tpPx || slPx ? (
            <>
              <span className="text-rise">{tpPx ? formatNumberWithCommas(tpPx) : '-'}</span>
              <span className="text-[#FFFFFF] mx-0.5 flex-shrink-0">/</span>
              <span className="text-fall">{slPx ? formatNumberWithCommas(slPx) : '-'}</span>
              <img className="ml-1 flex-shrink-0" src="/images/futuresDetail/edit-icon.svg" alt="edit-icon" />
            </>
          ) : (
            t('position.TakeProfitandStopLoss')
          )}
        </div>
      )}

      <div
        className="px-[8px] py-[6px] cursor-pointer !font-[330] bg-[#ECECED14] rounded-[4px]  flex items-center flex-shrink whitespace-nowrap"
        onClick={() => {
          setShowMarketPriceClose((prev) => !prev)
          setInfo((prev) => ({
            ...prev,
            ...info.row.original,
          }))
        }}
      >
        {t('futuresDetails.common.marketPriceClose')}
        
      </div>
    </div>
  )
}
const MyPositionsTableColumns = ({
  positions,
  setInfo,
  setOpen,
  setIsOpenMargin,
  setShowMarketPriceClose,
  setCurrentTab,
  setOpenShare,
  setShareInfo,
}: {
  positions: xPositions[]
  setOpen: Dispatch<SetStateAction<boolean>>
  setIsOpenMargin: Dispatch<SetStateAction<boolean>>
  setInfo: Dispatch<SetStateAction<xPositions | undefined>>
  setShowMarketPriceClose: Dispatch<SetStateAction<boolean>>
  setCurrentTab?: (tab: string) => void
  setOpenShare: Dispatch<SetStateAction<boolean>>
  setShareInfo: Dispatch<SetStateAction<sundefined>>
}) => {
  const { t } = useTranslation()
  const szMap = useAppSelector(selectSzMap)
  const navigate = useNavigate()

  const { sortedData, handleSort, getSortIndicator } = useSortableTable<xPositions>(positions)
  
  const handleNavigate = (coin: string) =>{
    navigate(`/futures/${coin}`)
  }
  
  const sortIndicators = useMemo(
    () => ({
      coin: getSortIndicator('coin', '#6A2AE0'),
      szi: getSortIndicator('szi', '#6A2AE0'),
      positionValue: getSortIndicator('positionValue', '#6A2AE0'),
      entryPx: getSortIndicator('entryPx', '#6A2AE0'),
      markPrice: getSortIndicator('markPrice', '#6A2AE0'),
      unrealizedPnl: getSortIndicator('unrealizedPnl', '#6A2AE0'),
      liquidationPx: getSortIndicator('liquidationPx', '#6A2AE0'),
      marginUsed: getSortIndicator('marginUsed', '#6A2AE0'),
      cumFunding: getSortIndicator('cumFunding', '#6A2AE0'),
    }),
    [getSortIndicator],
  )

  const sortHandlers = useMemo(
    () => ({
      coin: () => handleSort('coin'),
      szi: () => handleSort('szi'),
      positionValue: () => handleSort('positionValue'),
      entryPx: () => handleSort('entryPx'),
      markPrice: () => handleSort('markPrice'),
      unrealizedPnl: () => handleSort('unrealizedPnl'),
      liquidationPx: () => handleSort('liquidationPx'),
      marginUsed: () => handleSort('marginUsed'),
      cumFunding: () => handleSort('cumFunding'),
    }),
    [handleSort],
  )

  const useTableColumns = () => {
    const columnHelper = createColumnHelper<xPositions>()

    return useMemo(
      () => [
        columnHelper.accessor('coin', {
          header: () => (
            <div className="flex items-center">
              <div className="flex items-center gap-0.5 pl-0.5">
                <SortHeader text={t('history.token')} onSort={sortHandlers.coin} sortIndicator={sortIndicators.coin} />
              </div>
            </div>
          ),
          cell: (info) => {
            const symbol = info.getValue()
            const { side, leverage } = info.row.original

            const isLong = side === 'B'
            const gradientBg = isLong ? 'var(--rise-transaction-bg-reverse)' : 'var(--fall-transaction-bg-reverse)'
            const textColor = isLong ? 'var(--desktop-rise)' : 'var(--desktop-fall)'
            const leverageColor = isLong ? 'var(--rise)' : 'var(--fall)'

            return (
              <button
                className="flex items-center gap-2 w-full h-full -mx-4 px-3 py-2 relative"
                style={{
                  background: gradientBg,
                }}
                onClick={() => handleNavigate(symbol)}
              >
                <div className="absolute left-[6px] top-0 bottom-0 w-1" style={{ backgroundColor: textColor }} />
                <Text text={symbol} fontSize={14} color={textColor} fontWeight='medium' className='pl-1.5' />
                <Text text={`${leverage.value}x`} fontSize={13} className="!font-[450]" color={leverageColor} />
              </button>
            )
          },
          minSize: 170,
        }),
        columnHelper.accessor('szi', {
          header: () => (
            <div className="flex items-center gap-0.5">
              <SortHeader text={t('position.quantity')} onSort={sortHandlers.szi} sortIndicator={sortIndicators.szi} />
            </div>
          ),
          cell: (info) => {
            const szi = Math.abs(Number(info.getValue()))
            const { coin } = info.row.original
            return (
              <div className="flex gap-1">
                <Text text={szi.toString()} fontSize={14} className="!font-[305]" color="#DAD8E2" />
                <Text text={coin} fontSize={14} className="!font-[305]" color="#DAD8E2" />
              </div>
            )
          },
        }),
        columnHelper.accessor('positionValue', {
          header: () => (
            <div className="flex items-center">
              <div className="flex items-center gap-0.5">
                <SortHeader
                  text={t('walletDetail.holdings.holdingValue')}
                  onSort={sortHandlers.positionValue}
                  sortIndicator={sortIndicators.positionValue}
                />
              </div>
            </div>
          ),
          cell: (info) => {
            const positionValue = info.getValue()
            // const { marketCap } = info.row.original;
            return (
              <div className="flex gap-1 flex-col relative  w-full">
                <Text text={formatNumberWithCommas(Number(positionValue), 2) + ' USDC'} fontSize={14} className="!font-[305]" color="#DAD8E2" />
              </div>
            )
          },
          minSize: 90,
        }),
        columnHelper.accessor('entryPx', {
          header: () => (
            <div className="flex items-center gap-0.5">
              <SortHeader
                text={t('position.entryPrice')}
                onSort={sortHandlers.entryPx}
                sortIndicator={sortIndicators.entryPx}
              />
            </div>
          ),
          cell: (info: any) => {
            const entryPx = info.getValue()
            return (
              <div className="flex gap-1 flex-col relative  w-full">
                <Text text={formatNumberWithCommas(entryPx)} fontSize={14} className="!font-[305]" color="#DAD8E2" />
              </div>
            )
          },
        }),
        columnHelper.accessor('markPrice', {
          header: () => (
            <div className="flex gap-2">
              <div className="flex items-center">
                <SortHeader
                  text={t('position.markPrice')}
                  onSort={sortHandlers.markPrice}
                  sortIndicator={sortIndicators.markPrice}
                />
              </div>
            </div>
          ),
          cell: (info) => {
            const markPrice = info.getValue()
            return (
              <div className="flex gap-1 flex-col relative">
                <Text text={formatNumberWithCommas(markPrice)} fontSize={14} className="!font-[305]" color="#DAD8E2" />
              </div>
            )
          },
        }),
        columnHelper.accessor('unrealizedPnl', {
          header: () => (
            <div className="flex">
              <div className="flex items-center">
                <SortHeader
                  text={t('position.pnl') + '(ROE%)'}
                  onSort={sortHandlers.unrealizedPnl}
                  sortIndicator={sortIndicators.unrealizedPnl}
                />
              </div>
            </div>
          ),
          cell: (info) => {
            const unrealizedPnl = Number(info.getValue())
            const formatUnrealizedPnl = unrealizedPnl?.toFixed(2)
            const unrealizedPnlText = unrealizedPnl >= 0 ? `$${formatUnrealizedPnl}` : `-$${formatUnrealizedPnl.replace('-', '')}`
            const { returnOnEquity } = info.row.original

            const roeText = showRate(Number(returnOnEquity) * 100)

            return (
              <div className="flex gap-1 w-full items-center z-50">
                <Text
                  text={`${unrealizedPnlText}(${roeText})`}
                  fontSize={14}
                  className={`!font-[380] ${Number(unrealizedPnl) > 0 ? '!text-desktop-rise' : '!text-desktop-fall'}`}
                />
                <img
                  src="/images/futuresDetail/share-icon-new.svg"
                  alt="share"
                  className="w-[16px] h-[16px] cursor-pointer  !pointer-events-auto"
                  onClick={() => 
                    {
                      setOpenShare(true)
                      setShareInfo({
                        coin: info.row.original.coin,
                        leverage: info.row.original.leverage.value,
                        side: info.row.original.side,
                        entryPx: info.row.original.entryPx,
                        markPrice: info.row.original.markPrice,
                        unrealizedPnl: Number(info.row.original.unrealizedPnl),
                        pnlPercentage: roeText,
                      })
                     
                    }
                  }
                />
              </div>
            )
          },
          minSize: 150,
        }),
        columnHelper.accessor('liquidationPx', {
          header: () => (
            <div className="flex gap-2">
              <div className="flex items-center">
                <SortHeader
                  text={t('position.liquidationPrice')}
                  onSort={sortHandlers.liquidationPx}
                  sortIndicator={sortIndicators.liquidationPx}
                />
              </div>
            </div>
          ),
          cell: (info) => {
            let { liquidationPx, coin } = info.row.original
            let liqPx
            if (liquidationPx === null) {
              liqPx = ''
            } else {
              const pricePrecision = useAppSelector(selectPricePrecisionBySymbol(coin));
              const num = Number(liquidationPx || '0')  
              liqPx = Number.isFinite(num) ? num.toFixed(pricePrecision) : ''
            }
           
            
            return (
              <div className="flex gap-1 flex-col">
                {!liqPx ? (
                  <div className="flex w-full justify-start">
                    <div className="flex items-center gap-0.5">
                      <Text text={'--'} fontSize={14} className={'!font-[305]'} color="#DAD8E2" />
                    </div>
                  </div>
                ) : (
                  <Text
                    text={formatNumberWithCommas(liqPx)}
                    fontSize={14}
                    className={'!font-[305]'}
                    color="#DAD8E2"
                  />
                )}
              </div>
            )
          },
          minSize: 100,
          maxSize: 120,
        }),
        columnHelper.accessor('marginUsed', {
          header: () => (
            <div className="flex gap-2">
              <div className="flex items-center">
                <SortHeader
                  text={t('position.margin')}
                  onSort={sortHandlers.marginUsed}
                  sortIndicator={sortIndicators.marginUsed}
                />
              </div>
            </div>
          ),
          cell: (info) => {
            const marginUsed = Number(info.getValue()).toFixed(2)
            const { leverage } = info.row.original
            const positionType = leverage.type
            return (
              <div className="flex items-center">
                <Text text={`$${marginUsed}`} fontSize={15} fontWeight="regular" />
                <Text
                  text={`(${positionType === 'cross' ? 'Cross' : 'Isolated'})`}
                  fontSize={11}
                  fontWeight="light"
                  className='pl-1'
                  // color="#6B7280"
                />
                {positionType === 'isolated' && (
                  <img
                    className="ml-1 size-4 cursor-pointer hover:scale-[1.1] !pointer-events-auto"
                    src="/images/futuresDetail/edit-icon.svg"
                    alt="edit-icon"
                    onClick={() => {
                      setIsOpenMargin((prev) => !prev)
                      setInfo((prev) => ({
                        ...prev,
                        ...info.row.original,
                      }))
                    }}
                  />
                )}
              </div>
            )
          },
        }),
        columnHelper.accessor('cumFunding', {
          header: () => (
            <div className="">
              <div className="flex items-center">
                <SortHeader
                  text={t('position.fundingRate')}
                  onSort={sortHandlers.cumFunding}
                  sortIndicator={sortIndicators.cumFunding}
                />
              </div>
            </div>
          ),
          cell: (info) => {
            const cumFunding = info.getValue()
            const fundingFee = Number((-Number(cumFunding?.sinceOpen)))
            const formatFundingFee = fundingFee?.toFixed(2)

            const displayText = fundingFee < 0 
              ? `-$${Math.abs(fundingFee).toFixed(2)}`
              : `$${formatFundingFee}`


            

            return (
              <div className="flex gap-1 flex-col">
                <Text
                  text={displayText}
                  fontSize={15}
                  className={cn(
                    '!font-[380]',
                    parseFloat(fundingFee.toString()) > 0
                      ? '!text-rise'
                      : parseFloat(fundingFee.toString()) < 0
                        ? '!text-fall'
                        : '!text-[#FFFFFF]',
                  )}
                />
              </div>
            )
          },
        }),
        // columnHelper.accessor('cumFunding', {
        //   header: () => (
        //     <div className="">
        //       <div className="flex items-center">
        //         <SortHeader
        //           text={t('position.fundingRate')}
        //           onSort={sortHandlers.cumFunding}
        //           sortIndicator={sortIndicators.cumFunding}
        //         />
        //       </div>
        //     </div>
        //   ),
        //   cell: (info) => {
        //     const cumFunding = info.getValue()
        //     return (
        //       <div className="flex gap-1 flex-col">
        //         <Text
        //           text={formatNumberWithCommas(cumFunding?.sinceOpen)}
        //           fontSize={15}
        //           className={cn(
        //             '!font-[450]',
        //             parseFloat(cumFunding?.sinceOpen) > 0
        //               ? 'text-rise'
        //               : parseFloat(cumFunding?.sinceOpen) < 0
        //                 ? 'text-fall'
        //                 : 'text-[#FFFFFF]',
        //           )}
        //         />
        //       </div>
        //     )
        //   },
        //   maxSize: 110,
        //   minSize: 65,
        // }),
        columnHelper.accessor('tpPrice', {
          // minSize: 230,
          // maxSize: 230,
          header: () => (
            <div className="flex gap-2 pl-2">
              <div className="flex items-center">
                <Text
                  text={t('walletDetail.activityTable.actions')}
                  fontSize={12}
                  fontWeight="light"
                  color="#FFFFFF80"
                  className="!font-[330]"
                />
              </div>
            </div>
          ),
          cell: (info) => (
            <PriceActionCell
              info={info}
              setInfo={setInfo}
              setOpen={setOpen}
              setCurrentTab={setCurrentTab}
              setShowMarketPriceClose={setShowMarketPriceClose}
              szMap={szMap}
              t={t}
            />
          ),
        }),
      ],
      [
        columnHelper,
        sortHandlers,
        sortIndicators,
        t,
        szMap,
        setInfo,
        setOpen,
        setShowMarketPriceClose,
        setIsOpenMargin,
      ],
    )
  }

  return {
    sortedData,
    useTableColumns,
  }
}

export default MyPositionsTableColumns
