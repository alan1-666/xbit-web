import CardWithGrey from '@/components/common/CardWithGrey'
import Tag from '@/components/common/Tag'
import ToastCenterScreen from '@/components/futuresDetails/ToastCenterScreen'
import { Button } from '@/components/ui/button'
import ImgWithFallback from '@/components/common/ImgWithFallback'
import { useMemo, useRef, useState, forwardRef, useImperativeHandle } from 'react'
import { xPositions, PositionModeValue, xOpenOrders } from '../types'
import { getPositionDescription } from '../tools'
import { showRate, cn } from '@/lib/utils'
import MarketPriceCloseButton from './MarketPriceCloseButton'
import TpslButton from './TpslButton'
import EditMargin from './EditMargin'
import { selectSzMap, selectAllPerpMeta } from '@/redux/modules/futuresMeta.slice'
import { useAppSelector, useAppDispatch } from '@/redux/store.ts'
import { formatPrice } from '@/components/futuresDetails/trade/tools'
import dayjs from 'dayjs'
import { formatNumberWithCommas } from '@/utils/helpers'

import { CoinsIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { 
  CollapsedCardWrap,
  CollapsedCoinItem,
  CollapsedBaseItem,
  CollapsedPnlItem
} from "@/components/futuresDetails/trade/CollapsedCard.tsx"
import { useNavigate } from 'react-router-dom'
import { selectPricePrecisionBySymbol } from '@/redux/modules/futuresMeta.slice'
import { de } from '@faker-js/faker'
import DesktopShare from '../../desktopShare'




interface MyPositionCardProps {
  positionInfo: xPositions
}


export interface MyPositionCardRef {
  expand: () => void
  collapse: () => void
  globalIsAllExpand?: boolean
}

interface MyPositionCardProps {
  positionInfo: xPositions
  globalIsAllExpand?: boolean
  setCurrentTab?: (tab: string) => void
}

const MyPositionCard = forwardRef<MyPositionCardRef, MyPositionCardProps>(({ positionInfo, globalIsAllExpand, setCurrentTab}, ref) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const bgColor = positionInfo.side === 'B' ? 'green' : 'purple'
  const [showToast, setShowToast] = useState(false)
  const [open, setOpen] = useState<boolean>(false)
  const [info, setInfo] = useState<any>({})
  const [isExpand, setIsExpand] = useState<boolean>(globalIsAllExpand ?? false)
  const pricePrecision = useAppSelector(selectPricePrecisionBySymbol(positionInfo.coin));
  
  

  useImperativeHandle(ref, () => ({
    expand: () => {
      setIsExpand(true)
    },
    collapse: () => {
      setIsExpand(false)
    },
  }))

  const szMap = useAppSelector(selectSzMap)

  const positionDesc = getPositionDescription(
    positionInfo.leverage.type as PositionModeValue,
    positionInfo.leverage.value,
  )
  const unrealizedPnlText =
    parseFloat(positionInfo.unrealizedPnl) >= 0 ? `+${Number(positionInfo.unrealizedPnl)?.toFixed(2)}` : Number(positionInfo.unrealizedPnl)?.toFixed(2)

  const roeText = showRate(positionInfo?.returnOnEquity * 100)

  const liqPx = useMemo(() => {
    const px = positionInfo?.liquidationPx
    if (px == null) return '--'
    const num = Number(px)
    return Number.isFinite(num) ? num.toFixed(pricePrecision) : ''
  }, [positionInfo?.liquidationPx, pricePrecision])

  const tpPx = useMemo(() => {
    if (!positionInfo.tpPrice) return ''
    return parseFloat(formatPrice(positionInfo.tpPrice, szMap[positionInfo.coin])).toString()
  }, [positionInfo.tpPrice, szMap])

  const slPx = useMemo(() => {
    if (!positionInfo.slPrice) return ''
    return parseFloat(formatPrice(positionInfo.slPrice, szMap[positionInfo.coin])).toString()
  }, [positionInfo.slPrice, szMap])

  const szi = Math.abs(parseFloat(positionInfo.szi))

  const fundingFee = (-Number(positionInfo?.cumFunding?.sinceOpen)).toString()
  
  const handleNavigate = (coin: string) =>{
    // const searchParams = location?.search;
    navigate(`/futures/${coin}?tab=position`)
  }

  const handleCheckOrderClick = () => {
    if (setCurrentTab) {
      setCurrentTab('order')
    } else {
      navigate(`/futures/${positionInfo.coin}?tab=order`)
    }
  }


  return (
    <>
      {
        !isExpand ?
        <CollapsedCardWrap
           onClickExpand={() => setIsExpand(true)}
        >
          <CollapsedCoinItem coin={positionInfo.coin} leverage={positionInfo.leverage.value} />
          <CollapsedBaseItem label={`${t('futuresDetails.common.quantity')} (${positionInfo.coin})`} value={szi.toString()} />
          <CollapsedPnlItem pnl={positionInfo.unrealizedPnl} roe={roeText}/>
        </CollapsedCardWrap>
        : <CardWithGrey
        isHoverScaleCard={false}
        header={
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {/* <ImgWithFallback
                src={`${Configs.getHyperliquidConfig().imgUrl}/${positionInfo.coin}.svg`}
                srcFallback="/images/logo-pair-fallback.webp"
                sharedClassName="size-6 mr-2"
                loadedClassName="bg-[#fff] rounded-full"
              /> */}
              <div className="mr-1 text-[calc(13rem/16)] leading-[calc(14rem/16)]" onClick={() => handleNavigate(positionInfo.coin)}>
                {positionInfo.coin}USDC {t('futuresDetails.common.perp')}
              </div>

              <div className="flex gap-1">

                <span className={cn("text-[#FFFFFF] flex items-center text-[calc(11rem/16)] leading-[calc(11rem/16)] h-4 py-0.5 px-1 rounded-[3px]",
                    positionInfo.side === 'B' ? 'bg-[var(--tab-buy-bg)]' : 'bg-[var(--tab-sell-bg)]'
                  )}>{positionInfo.side === 'B' ? t('futuresDetails.common.long') : t('futuresDetails.common.short')}
                </span>

                <span className={cn("text-[#C8A7FD] bg-[#3E2761] flex items-center text-[calc(11rem/16)] leading-[calc(11rem/16)] h-4 py-0.5 px-1 rounded-[3px]")}>
                {`${positionInfo.leverage.value}x`}
                </span>
              </div>
            </div>

            <div className="flex items-center">
             {/*   {positionInfo?.timestamp && (
                <span className="text-[calc(12rem/16)] leading-[calc(12rem/16)] text-[#605E68]">
                  {dayjs(positionInfo?.timestamp).format('MM-DD HH:mm:ss')}
                </span>
              )} */}

              <Button
                variant={'ghost'}
                className="p-0 text-[#605E68]  h-[calc(16rem/16)]"
                onClick={() => { setIsExpand(false)}}
              >
                <img  src="/images/futuresDetail/card-arrow-down2.svg" className="rotate-180" alt="card-arrow-down" />
              </Button>
              {/* <Button
                variant={'ghost'}
                className="p-0 h-[calc(20rem/16)]"
                onClick={() => {
                  setOpen(true)
                  setInfo({
                    entryPx: positionInfo.entryPx,
                    markPrice: positionInfo.markPrice,
                    coin: positionInfo.coin,
                    unrealizedPnl: unrealizedPnlText,
                    pnlPercentage: roeText,
                    leverage: positionInfo.leverage.value,
                    side: positionInfo.side
                  })
                }}
              >
                <img className="ml-1" src="/images/futuresDetail/new-share-icon.svg" alt="new-share-icon" />
              </Button> */}

              
            </div>

           
          </div>
        }
        classNameHeader="px-3 py-2.5"
        content={
          <>
            <div className="p-3">
              <div className="flex items-center justify-between gap-1 mb-[14px]">
                <div className=''>
                  <p className="text-[#605E68] text-[calc(11rem/16)] leading-[calc(12rem/16)]  mb-1.5">{t('position.pnl')}</p>
                  <div className='flex items-center'>
                    <p
                      className={cn(
                        'flex items-center text-[calc(14rem/16)] leading-[calc(14rem/16)] font-bold mr-1',
                        parseFloat(positionInfo.unrealizedPnl) >= 0 ? 'text-rise' : 'text-fall',
                      )}
                    >
                      <span className="mr-1">{unrealizedPnlText}</span>
                      <span className="">({roeText})</span>
                    </p>

                    <Button
                      variant={'ghost'}
                      className="p-0 h-[calc(12rem/16)]"
                      onClick={() => {
                        setOpen(true)
                        setInfo({
                          entryPx: positionInfo.entryPx,
                          markPrice: positionInfo.markPrice,
                          coin: positionInfo.coin,
                          unrealizedPnl: unrealizedPnlText,
                          pnlPercentage: roeText,
                          leverage: positionInfo.leverage.value,
                          side: positionInfo.side
                        })
                      }}
                      >
                      <img className="" src="/images/futuresDetail/share-icon2.svg" alt="share-icon2" />
                    </Button> 
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-[#605E68] mb-1.5 text-[calc(11rem/16)] leading-[calc(12rem/16)]">
                    {t('position.openInterest')} ({positionInfo.coin})
                  </p>
                  <p className="text-[#FFFFFF] text-[calc(14rem/16)] leading-[calc(14rem/16)] font-bold">
                    {szi}
                  </p>
                </div>
              </div>

              <table className="w-full ">
                <tbody>
                  <tr>
                    <td className="pb-3 pr-2">
                      <div>
                        <p className="text-[#605E68] mb-1.5 text-[calc(11rem/16)] leading-[calc(12rem/16)]">
                          {t('position.entryPrice')}
                        </p>
                        <p className="text-[#FFFFFF] text-[calc(13rem/16)] leading-[calc(14rem/16)]">
                          {formatNumberWithCommas(positionInfo.entryPx)}
                        </p>
                      </div>
                    </td>

                    <td className="pb-3">
                      <div className="flex ">
                        <div className="min-w-18">
                          <p className="text-[#605E68] mb-1.5 text-[calc(11rem/16)] leading-[calc(12rem/16)]">
                            {t('position.markPrice')}
                          </p>
                          <p className="text-[#FFFFFF] text-[calc(14rem/16)] leading-[calc(14rem/16)]">
                            {formatNumberWithCommas(positionInfo.markPrice)}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="pb-3">
                      <div className="flex justify-end">
                        <div className="text-right">
                          <p className="text-[#605E68] mb-1.5 text-[calc(11rem/16)] leading-[calc(12rem/16)]">
                            {t('position.liquidationPrice')}
                          </p>
                          <p className="text-[#FFFFFF] text-[calc(14rem/16)] leading-[calc(14rem/16)]">
                            {formatNumberWithCommas(liqPx.toString()) === '0' ? '--' : formatNumberWithCommas(liqPx.toString())}
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td className="pr-2">
                      <div className="flex flex-col gap-3 col-span-2">
                        <div className="">
                          <p className="text-[#605E68] mb-1.5 text-[calc(11rem/16)] leading-[calc(12rem/16)]">
                            {t('position.holdingValue')} (USDC)
                          </p>
                          <p className="text-[#FFFFFF] text-[calc(13rem/16)] leading-[calc(14rem/16)]">
                            {positionInfo.positionValue}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="">
                      <div className="flex ">
                        <div className="min-w-18">
                          <p className="text-[#605E68] mb-1.5 text-[calc(11rem/16)] leading-[calc(12rem/16)]">
                            {t('position.margin')} (USD)
                          </p>
                          <p className="text-[#FFFFFF] text-[calc(14rem/16)] leading-[calc(14rem/16)] flex items-center">
                            {positionInfo.marginUsed}
                            <span className='ml-1.5 text-[calc(13rem/16)] leading-[calc(13rem/16)] text-[#908E98]'>{`(${positionInfo?.leverage?.type === 'cross' ? t('futuresDetails.positionMode.cross') : t('futuresDetails.positionMode.isolated')})`}</span>
                            {
                              positionInfo?.leverage?.type === 'isolated' && 
                              <EditMargin 
                                info={{
                                ...positionInfo,
                              }}/>
                            }
                            
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="flex justify-end">
                      <div>
                        <p className="text-[#605E68] mb-1.5 text-[calc(11rem/16)] leading-[calc(12rem/16)]">
                          {t('position.fundingRate')} (USD)
                        </p>
                        <p
                          className={cn(
                            'text-[#FFFFFF] text-[calc(13rem/16)] leading-[calc(14rem/16)] text-right',
                            parseFloat(fundingFee) > 0
                              ? 'text-rise'
                              : parseFloat(fundingFee) < 0
                                ? 'text-fall'
                                : 'text-[#FFFFFF]',
                          )}
                        >
                          
                          {formatNumberWithCommas(Number(fundingFee)?.toFixed(2))}
                        </p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-2.5 flex justify-between gap-2 items-center border-t-[0.5px] border-solid border-[#ECECED14]">
              <div className="flex items-center flex-2">
                {
                  positionInfo.hasTriggerOrder ?
                   <div
                      className="flex items-center justify-center  w-full min-w-[130px] p-2.5 rounded-[6px] text-[calc(12rem/16)] text-[#FFFFFF] h-[calc(32rem/16)] border-[0.5px] border-[#343339] bg-[#282830] relative"
                    >
                      <Button
                        variant={'ghost'}
                        className="p-0 text-[#FFFFFF] text-[calc(12rem/16)]  h-[calc(12rem/16)]"
                        onClick={() => handleCheckOrderClick()}
                      >
                        {t('position.viewOrder')}
                      </Button>
                      <TpslButton
                        info={{
                          ...positionInfo,
                          tpPrice: tpPx,
                          slPrice: slPx
                        }}
                        childrenTrigger={
                          <Button
                            // variant={'borderGradient'}
                            variant={'ghost'}
                            className="p-0 h-[calc(12rem/16)] ml-1"
                          >
                            <img className="ml-0.5" src="/images/futuresDetail/edit-icon.svg" alt="edit-icon" />
                          </Button>
                        }
                      />

                    </div>
                  : 
                  <TpslButton
                    info={{
                      ...positionInfo,
                      tpPrice: tpPx,
                      slPrice: slPx
                    }}
                    childrenTrigger={
                      <Button
                        // variant={'borderGradient'}
                        className="w-full min-w-[130px] pl-2.5 pr-4 rounded-[6px] text-[calc(12rem/16)] text-[#FFFFFF] h-[calc(32rem/16)] border-[0.5px] border-[#343339] bg-[#282830] relative"
                      >
                        {positionInfo?.tpPrice || positionInfo?.slPrice ? (
                          <div className="flex w-full justify-end flex-col items-start position-relative">
                            <p className="text-[#FFFFFF] text-[calc(8rem/16)]  leading-[calc(12rem/16)] absolute top-[-6px] left-4 px-1 py-0.5 rounded-[4px]">
                              {t('futuresDetails.common.tpSl')}
                            </p>
                            <div className='w-full pl-2 flex items-center justify-between'>
                              <p className="text-[calc(12rem/16)] leading-[calc(14rem/16)] flex items-center">
                                <span className="text-rise">{tpPx ? formatNumberWithCommas(tpPx) : '-'}</span>
                                <span className="text-[#FFFFFF] mx-0.5 text-[calc(10rem/16)]">/</span>
                                <span className="text-fall">{slPx ? formatNumberWithCommas(slPx) : '-'}</span>
                              </p>
                              <img className="ml-0.5" src="/images/futuresDetail/edit-icon.svg" alt="edit-icon" />
                            </div>
                          </div>
                        ) : (
                          t('futuresDetails.common.tpSl')
                        )}
                      </Button>
                    }
                  />
                }
                
              </div>
              <MarketPriceCloseButton info={positionInfo} />

            </div>
          </>
        }
      />
      }
      

      <ToastCenterScreen showModal={showToast} setShowModal={setShowToast} text={t('futuresDetails.tips.cancelOrderSuccess')} />
      {open && (
        // DesktopShare
        <DesktopShare open={open} onClose={setOpen} info={info}/>
      )}
    </>
  )
})



export default MyPositionCard
