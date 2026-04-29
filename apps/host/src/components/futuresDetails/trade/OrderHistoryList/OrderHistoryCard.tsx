import Tag from '@/components/common/Tag'
import { cn, showMathSymbol } from '@/lib/utils'
import ToastCenterScreen from '@/components/futuresDetails/ToastCenterScreen'
import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import CardWithGrey from '@/components/common/CardWithGrey'
import { xHistoryTrade } from '../types'
import dayjs from 'dayjs'
import ImgWithFallback from '@/components/common/ImgWithFallback'
import { Configs } from '@/const/configs'
import { formatNumberWithCommas } from '@/utils/helpers'
import { useTranslation } from 'react-i18next'
import { position } from 'html2canvas/dist/types/css/property-descriptors/position'
import { Link, useNavigate } from 'react-router-dom'
import DesktopShare from '@/components/futuresDetails/desktopShare'
interface OrderHistoryCardProps {
  orderInfo: xHistoryTrade
}
const OrderHistoryCard = ({ orderInfo }: OrderHistoryCardProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [showToast, setShowToast] = useState(false)
  const [open, setOpen] = useState<boolean>(false)
  const [info, setInfo] = useState<any>({})
  const bgColor = orderInfo.side === 'B' ? 'green' : 'purple'

  const formattedTime = useMemo(() => dayjs(orderInfo.time).format('YYYY-MM-DD HH:mm:ss'), [orderInfo.time])

  const orderValue = useMemo(() => {
    return (parseFloat(orderInfo.px) * parseFloat(orderInfo.sz)).toFixed(2)
  }, [orderInfo.px, orderInfo.sz])

  const dirText = useMemo(() => {
    switch (orderInfo.dir) {
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
        return orderInfo.dir
    }
  }, [orderInfo.dir])

  /* const notional = parseFloat(orderInfo.px) * parseFloat(orderInfo.sz)
  const adjusted_pnl = parseFloat(orderInfo.closedPnl) - parseFloat(orderInfo.fee) */

const handleNavigate = (coin: string) =>{
  const searchParams = location?.search;
  navigate(`/futures/${coin}${searchParams}`)
  // 页面滚回顶部（延迟执行确保页面已渲染）
  // setTimeout(() => {
  //   window.scrollTo(0, 0)
  // }, 100)
  
}

  return (
    <>
      <CardWithGrey
        header={
          <div className="flex items-center justify-between">
            <div className="flex items-center">

              {/*  <ImgWithFallback
                src={`${Configs.getHyperliquidConfig().imgUrl}/${orderInfo.coin}.svg`}
                srcFallback="/images/logo-pair-fallback.webp"
                sharedClassName="size-7 mr-2"
                loadedClassName="bg-[#fff] rounded-full"
              /> */}
              <div className="">
                <div className='flex items-center h-[22px]'>
                  <p className="text-[calc(13rem/16)] leading-[calc(14rem/16)] mr-2" onClick={() => handleNavigate(orderInfo.coin)}>{orderInfo.coin}USDC {t('futuresDetails.common.perp')}</p>
                  <span className={cn("text-[#C8A7FD] bg-[#3E2761] flex items-center text-[calc(11rem/16)] leading-[calc(11rem/16)] h-4 py-0.5 px-1 rounded-[3px]")}>
                    {dirText}
                  </span>
                </div>
              </div>


            </div> 


            <div className="flex items-center">
              <p className="text-[#605E68] text-[calc(11rem/16)] leading-[calc(11rem/16)] underline">

                <Link to={`https://hypurrscan.io/tx/${orderInfo.hash}`} target="_blank">
                  {formattedTime} 
                </Link>

              </p>
              {(orderInfo.dir === "Close Long" || orderInfo.dir === "Close Short") &&
                <Button
                  variant={'ghost'}
                  className="p-0 text-[#B9B9B9] cursor-pointer text-[calc(13rem/16)] h-[calc(13rem/16)]"
                  onClick={() => {
                    setOpen(true)
                    setInfo({
                      coin: orderInfo.coin,
                      dir: orderInfo.dir,
                      transaction:orderValue,
                      closePrice: orderInfo.px,
                      unrealizedPnl: Number(orderInfo.closedPnl),
                    })
                  }}
                >
                  <img className="ml-1" src="/images/futuresDetail/new-share-icon.svg" alt="" />
                </Button>
              }
            </div>

          </div>
        }
        content={
          <div className="px-3 py-3.5">
            <div className="flex items-center justify-between gap-2 mb-[16px]">
              <div>
                <p className="text-[#605E68] mb-1.5 text-[calc(11rem/16)] leading-[calc(12rem/16)]">
                  {t('position.realizedPnl')} (USDC)
                </p>
                <p className="flex  leading-[calc(14rem/16)]">
                  <span className={cn("text-[calc(15rem/16)] font-bold mr-1",
                    parseFloat(orderInfo.closedPnl) > 0 ? 'text-rise' :
                      parseFloat(orderInfo.closedPnl) < 0 ? 'text-fall' :
                        'text-[#FFFFFF]'
                  )}>{orderInfo.closedPnl}</span>
                  {/* <span className="text-[calc(12rem/16)]">(+0.55%)</span> */}
                </p>
              </div>

              <div className="text-end">
                <p className="text-[#605E68] mb-1.5 text-[calc(11rem/16)] leading-[calc(12rem/16)]">{t('position.quantity')} ({orderInfo.coin})</p>
                <p className="text-[#FFFFFF] text-[calc(14rem/16)] leading-[calc(14rem/16)] font-bold">{orderInfo.sz}</p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-[#605E68] mb-1.5 text-[calc(11rem/16)] leading-[calc(12rem/16)]">{t("position.transactionPrice")}</p>
                <p className="text-[#FFFFFF] text-[calc(12rem/16)] leading-[calc(12rem/16)]">{formatNumberWithCommas(orderInfo.px)}</p>
              </div>

              <div>
                <p className="text-[#605E68] mb-1.5 text-[calc(11rem/16)] leading-[calc(12rem/16)]">{t('futuresDetailsOrder.volume')} (USDC)</p>
                <p className="text-[#FFFFFF] text-[calc(12rem/16)] leading-[calc(12rem/16)]">{formatNumberWithCommas(orderValue)}</p>
              </div>

              <div className="text-end">
                <p className="text-[#605E68] mb-1.5 text-[calc(11rem/16)] leading-[calc(12rem/16)]">{t('position.fee')} (USDC)</p>
                <p className="text-[#FFFFFF] text-[calc(12rem/16)] leading-[calc(12rem/16)]">{orderInfo.fee}</p>
              </div>
            </div>
          </div>
        }
      />
      {open &&  <DesktopShare open={open} onClose={setOpen} info={info} shareType='orderHistory' />}
    </>
  )
}

export default OrderHistoryCard
