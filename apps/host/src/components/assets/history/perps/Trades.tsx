import { getPerpUserHistoryTrades } from '@/api/hyperliquid'
import DesktopShare from '@/components/futuresDetails/desktopShare'
import { useCheckLoginOnArb } from '@/hooks/hyperliquid/useCheckLoginOnArb'
import { formatAmount, formatBalance, formatPrice, formatVolume } from '@/lib/format'
import { cn } from '@/lib/utils'
import { _walletDex } from '@/redux/modules/newWallet.slice'
import { Loading } from '@components/common/Loading.tsx'
import { IconEmpty } from '@components/icon'
import { useQuery } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import LogoWithChain from '@components/common/LogoWithChain.tsx'

const Trades = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const walletDex = useSelector(_walletDex)
  const userAddress = walletDex?.walletAddress
  const [openShare, setOpenShare] = useState<boolean>(false)
  const [shareInfo, setShareInfo] = useState<any>({})

  const { data: histories = [], isLoading } = useQuery({
    queryKey: ['ordersHistory', userAddress],
    queryFn: () => getPerpUserHistoryTrades(userAddress!),
    enabled: useCheckLoginOnArb(),
    select: (rawOrders) => {
      return rawOrders.filter((item: any) => {
        return ['Close Long', 'Close Short', 'Open Long', 'Open Short'].indexOf(item.dir) > -1
      })
    },
  })

  useEffect(() => {
    if (!openShare) {
      setShareInfo({})
    }
  }, [open])

  return (
    <div className="no-scrollbar space-y-3 overflow-auto p-4">
      {!isLoading && histories && histories.length > 0 && (
        <>
          {histories.map((order: any) => {
            const orderValue = new BigNumber(order.px).multipliedBy(new BigNumber(order.sz)).toString()

            return (
              <div key={order?.tid} className="rounded-[6px] border-[0.5px] border-[#343339] bg-[#18181D] px-3 py-2.5">
                <div className="space-y-5">
                  <div className="flex items-center gap-2">
                    <span
                      className="cursor-pointer text-[14px] font-semibold flex items-center gap-2"
                      onClick={() => navigate(`/futures/${order.coin}?tab=history`)}
                    >
                      <LogoWithChain
                        logo={`https://cdn.xbit.com/coins/${order.coin}.svg`}
                        logoClassName="size-6 min-w-6"
                        name={order.coin}
                      />
                      {order.coin}-USDC
                    </span>
                    <span
                      className={cn(
                        'rounded-[3px] px-1 py-0.5 text-[11px] font-medium',
                        order.dir.includes('Long') ? 'bg-rise/20 text-rise' : 'bg-fall/20 text-fall',
                      )}
                    >
                      {order.dir}
                    </span>
                  </div>
                  <div>
                    <div className="text-[12px] leading-3 font-medium text-[#605E68]">{t('position.realizedPnl')}</div>
                    <div className="mt-1.5 flex items-center gap-1">
                      <span
                        className={cn(
                          'text-[15px] font-medium',
                          parseFloat(order.closedPnl) > 0
                            ? 'text-rise'
                            : parseFloat(order.closedPnl) < 0
                              ? 'text-fall'
                              : 'text-white',
                        )}
                      >
                        {formatBalance(order.closedPnl, {
                          showSign: true,
                          showCurrency: true,
                          roundMode: 'floor',
                        })}
                      </span>
                      {(order.dir === 'Close Long' || order.dir === 'Close Short') && (
                        <img
                          src="/images/futuresDetail/share-icon.svg"
                          alt=""
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => {
                            setShareInfo({
                              coin: order.coin,
                              unrealizedPnl: order.closedPnl,
                              markPrice: order.px,
                              transaction: orderValue,
                              dir: order.dir,
                            })
                            setOpenShare(true)
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-2.5 grid grid-cols-3 gap-3.5 border-t-[0.5px] border-[#25242B] pt-2.5">
                  <div>
                    <div className="text-[12px] leading-3 font-medium text-[#605E68]">
                      {t('position.transactionPrice')}
                    </div>
                    <div className="mt-1.5 text-[12px] leading-3 font-medium">
                      {formatPrice(order.px, {
                        showCurrency: true,
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="text-[12px] leading-3 font-medium text-[#605E68]">{t('position.size')}</div>
                    <div className="mt-1.5 text-[12px] leading-3 font-medium">
                      {formatAmount(order.sz, {
                        roundMode: 'floor',
                      })}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[12px] leading-3 font-medium text-[#605E68]">{t('position.volume')}</div>
                    <div className="mt-1.5 text-[12px] leading-3 font-medium">
                      {formatVolume(orderValue, {
                        roundMode: 'floor',
                        showCurrency: true,
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="text-[12px] leading-3 font-medium text-[#605E68]">{t('position.fee')}</div>
                    <div className="mt-1.5 text-[12px] leading-3 font-medium">
                      {formatAmount(order.fee, {
                        roundMode: 'ceil',
                        showCurrency: true,
                      })}
                    </div>
                  </div>

                  <div className="col-span-2 text-right">
                    <div className="text-[12px] leading-3 font-medium text-[#605E68]">{t('position.time')}</div>
                    <div className="mt-1.5 text-[12px] leading-3 font-medium text-[#605E68]">
                      {dayjs(order.time).format('YYYY/MM/DD HH:mm:ss')}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </>
      )}
      {!isLoading && histories && histories.length === 0 && (
        <div className="flex h-[calc(100vh-200px)] flex-col items-center justify-center py-10">
          <IconEmpty />
          <span className="text-[0.75rem] text-[#FFFFFF80]">{t('history.nodata')}</span>
        </div>
      )}
      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <Loading />
        </div>
      )}

      <DesktopShare open={openShare} onClose={setOpenShare} info={shareInfo} shareType="orderHistory" />
    </div>
  )
}

export default Trades
