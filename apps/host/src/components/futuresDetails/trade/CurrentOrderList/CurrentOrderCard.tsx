import CardWithGrey from '@/components/common/CardWithGrey'
import Tag from '@/components/common/Tag'
import ToastCenterScreen from '@/components/futuresDetails/ToastCenterScreen'
import { Button } from '@/components/ui/button'
import React, { useMemo, useState, useImperativeHandle, forwardRef, useEffect } from 'react'
import CircularProgressBar from './CircularProgressBar'
import { xOpenOrders } from '../types'
import { getOrderTypeDescription, getOrderSideDescription, isHyperOrderSuccess, getTpOrSlChild } from '../tools'
import isEqual from 'lodash/isEqual'
import dayjs from 'dayjs'
import { useAppSelector, useAppDispatch } from '@/redux/store'
import { selectAllPerpMeta } from '@/redux/modules/futuresMeta.slice'
import { toast } from 'sonner'
import { formatNumberWithCommas } from '@/utils/helpers'
import { agentWalletSelector } from '@/redux/modules/futuresUserInfo.slice'
import { handleHyperliquidOrderError } from '@/components/futuresDetails/helper/handleHyperliquidOrderError'
import { getAgentWalletByHashKey } from '@/utils/agent/agentWalletManager'
import { useTranslation } from 'react-i18next'
import { hanleHyperliquidAction } from '@/components/futuresDetails/helper/hanleHyperliquidAction'
import {
  CollapsedCardWrap,
  CollapsedCoinItem,
  CollapsedBaseItem,
  CollapsedPnlItem
} from "@/components/futuresDetails/trade/CollapsedCard.tsx"
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'




interface CurrentOrderCardProps {
  orderInfo: xOpenOrders
  globalIsAllExpand?: boolean
}

export interface CurrentOrderCardRef {
  expand: () => void
  collapse: () => void
}
const CARD_STORAGE_KEY = 'futures_current_order_cards_expand_state'

const CurrentOrderCard = forwardRef<CurrentOrderCardRef, CurrentOrderCardProps>(({ orderInfo, globalIsAllExpand }, ref) => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const agentWallet = useAppSelector(agentWalletSelector)

  const [showToast, setShowToast] = useState(false)
  
  // 从 localStorage 读取个别卡片的展开状态
  const getInitialCardExpandState = () => {
    // 优先使用全局状态
    if (globalIsAllExpand !== undefined) {
      return globalIsAllExpand
    }
    
    // 如果没有全局状态，检查个别卡片状态
    // try {
    //   const stored = localStorage.getItem(CARD_STORAGE_KEY)
    //   const cardStates = stored ? JSON.parse(stored) : {}
    //   if (cardStates[orderInfo.oid] !== undefined) {
    //     return cardStates[orderInfo.oid]
    //   }
    // } catch (error) {
    //   console.warn('Failed to read card expand state from localStorage:', error)
    // }
    
    // // 如果都没有，从全局缓存中读取默认状态
    // try {
    //   const globalStored = localStorage.getItem('futures_current_orders_expand_state')
    //   return globalStored !== null ? JSON.parse(globalStored) : true
    // } catch (error) {
    //   return true
    // }
  }
  
  const [isExpand, setIsExpand] = useState<boolean>(getInitialCardExpandState())

  // 监听全局状态变化，同步更新卡片状态
  useEffect(() => {
    if (globalIsAllExpand !== undefined) {
      setIsExpand(globalIsAllExpand)
    }
  }, [globalIsAllExpand])

  // 保存个别卡片状态到 localStorage
  const saveCardExpandState = (expandState: boolean) => {
    setIsExpand(expandState)
    // try {
    //   const stored = localStorage.getItem(CARD_STORAGE_KEY)
    //   const cardStates = stored ? JSON.parse(stored) : {}
    //   cardStates[orderInfo.oid] = expandState
    //   localStorage.setItem(CARD_STORAGE_KEY, JSON.stringify(cardStates))
    //   setIsExpand(expandState)
    // } catch (error) {
    //   console.warn('Failed to save card expand state to localStorage:', error)
    //   setIsExpand(expandState)
    // }
  }

  useImperativeHandle(ref, () => ({
    expand: () => saveCardExpandState(true),
    collapse: () => saveCardExpandState(false),
  }))


  const typeDesc = getOrderTypeDescription(orderInfo.orderType)
  const sideDesc = getOrderSideDescription(orderInfo.side, orderInfo)

  const origSz_1 = parseFloat(orderInfo.origSz_1 || '0')
  const completedSz = orderInfo.completedSz
  const allMeta = useAppSelector(selectAllPerpMeta)
  const percentage = useMemo(() => {
    return completedSz === 0 ? 0 : ((completedSz / origSz_1) * 100).toFixed(2)
  }, [origSz_1, completedSz])

  const bgColor = orderInfo.side === 'B' ? 'green' : 'purple'

  const formattedTime = useMemo(() => dayjs(orderInfo.timestamp).format('MM-DD HH:mm:ss'), [orderInfo.timestamp])

  const tpOpenOrder = getTpOrSlChild(orderInfo, 'tp')[0]
  const slOpenOrder = getTpOrSlChild(orderInfo, 'sl')[0]
  const originSize = parseFloat(orderInfo.origSz) === 0 ? t('futuresDetails.common.allPosition') : origSz_1
  const orderPrice = orderInfo.orderType.indexOf('Market') > -1 ? t('futuresDetails.common.market') : formatNumberWithCommas(orderInfo.limitPx)

  const cancelOrder = async () => {
    if (!agentWallet) {
      console.warn('Agent wallet not available')
      return
    }
    
    const orderAction = {
      type: 'cancel',
      cancels: [
        {
          a: allMeta.findIndex((item: any) => orderInfo.coin === item.name),
          o: orderInfo.oid,
        },
      ],
    }

    const realAgentWallet = await getAgentWalletByHashKey(agentWallet.key)

    const response = await hanleHyperliquidAction({
      agentPrivateKey: realAgentWallet.privateKey,
      action: orderAction, 
      dispatch: null, 
      showError: false,
      walletAddress: agentWallet.id,
      allMeta
    });
    

     if (response === 'fail') return
    const result = isHyperOrderSuccess(response)
    
    if (!result.ok) {
      handleHyperliquidOrderError(result.error as string, dispatch)
      return
    }
    toast.success(t('futuresDetails.tips.cancelOrderSuccess'))
  }
  const handleNavigate = (coin: string) =>{
    // const searchParams = location?.search;
    navigate(`/futures/${coin}?tab=order`)
  }
  

  return (
    <>
      {
        !isExpand ?
          <CollapsedCardWrap
            onClickExpand={() => saveCardExpandState(true)}
          >
            <CollapsedCoinItem coin={orderInfo.coin} />
            <CollapsedBaseItem label={`${t('currentOrdersList.orderQuantity')} (${orderInfo.coin})`} value={originSize.toString()} />
            <CollapsedBaseItem label={t('futuresDetails.common.orderPrice')} value={orderPrice.toString()} />
          </CollapsedCardWrap>
          : <CardWithGrey
            header={
              <div className="flex items-center  justify-between w-full">
                <div className="flex items-center w-full">
                  {/*   <ImgWithFallback
                    src={`${Configs.getHyperliquidConfig().imgUrl}/${orderInfo.coin}.svg`}
                    srcFallback="/images/logo-pair-fallback.webp"
                    sharedClassName="size-7 mr-2"
                    loadedClassName="bg-[#fff] rounded-full"

                  /> */}
                  <div className="mr-2">
                    <p className="text-[calc(13rem/16)] leading-[calc(14rem/16)] app-font-medium" onClick={() => handleNavigate(orderInfo.coin)}>
                      {orderInfo.coin}USDC {t('futuresDetails.common.perp')}
                    </p>
                    {/* <p className="text-[#605E68] text-[calc(11rem/16)] leading-[calc(11rem/16)]">{formattedTime}</p> */}
                  </div>

                  <div className="flex gap-1.5">

                    <span className={cn("text-[#FFFFFF] flex items-center text-[calc(11rem/16)] leading-[calc(11rem/16)] h-4 py-0.5 px-1 rounded-[3px]",
                        orderInfo.side === 'B' ? 'bg-[var(--tab-buy-bg)]' : 'bg-[var(--tab-sell-bg)]'
                      )}>{sideDesc}
                    </span>

                     <span className={cn("text-[#C8A7FD] max-w-[100px] truncate bg-[#3E2761] flex items-center text-[calc(11rem/16)] leading-[calc(11rem/16)] h-4 py-0.5 px-1 rounded-[3px]")}>
                      {typeDesc}
                    </span>

                    {/*  <Tag
                    label="全仓 100x"
                    color="#00FFF6"
                    containerClassName="!border-transparent bg-[#00FFF633] rounded-[4px] px-1 py-0.75"
                  /> */}
                  </div>
                </div>
                <Button
                  variant={'ghost'}
                  className="p-0 text-[#FFFFFF] cursor-pointer text-[calc(12rem/16)] leading-[calc(12rem/16)] rounded-[4px] py-2 px-2.5 bg-[#2C2C34]  h-6.5"
                  onClick={() => cancelOrder()}
                >
                  {t('currentOrdersList.cancelOrder')}

                </Button>
              </div>
            }
            classNameHeader="px-3 py-2.5"
            content={
              <>
                <div className="p-3 flex items-center relative z-1">
                  <div className="flex-1 flex items-center justify-between gap-2">
                    {/* <div className="flex items-center gap-1">
                      <CircularProgressBar
                        initialPercentage={percentage}
                        color={bgColor === 'green' ? '#00FFB4' : '#AB57FF'}
                        size={68}
                      />
                    </div> */}

                    <table className="w-full text-[calc(12rem/16)] leading-[calc(12rem/16)] text-white">
                      <tbody>
                        <tr className="">
                          <td className="pb-3.5 pr-2 align-top">
                            <p className="text-[#605E68] text-[calc(11rem/16)] leading-[calc(11rem/16)] mb-1.5">{t('currentOrdersList.orderQuantity')} ({orderInfo.coin})</p>
                            <p className="app-font-medium">{originSize}</p>
                          </td>

                          <td className="pb-3.5 pr-2 align-top">
                            <p className="text-[#605E68] text-[calc(11rem/16)] leading-[calc(11rem/16)] mb-1.5">{t('futuresDetails.common.completedQuantity')} ({orderInfo.coin})</p>
                            <p>{completedSz}</p>
                          </td>

                          <td className="pb-3.5 pr-0 text-right align-top">
                            <p className="text-[#605E68] text-[calc(11rem/16)] leading-[calc(11rem/16)] mb-1.5">{t('currentOrdersList.orderPrice')}</p>
                            <p>{orderPrice}</p>
                          </td>
                        </tr>

                        <tr className="">
                          <td className="pr-2 text-left align-top">
                            <p className="text-[#605E68] text-[calc(11rem/16)] leading-[calc(11rem/16)] mb-1.5">{t('position.reduceOnly')}</p>
                            <p>{orderInfo.reduceOnly ? t('futuresDetails.common.yes') : t('futuresDetails.common.no')}</p>
                          </td>
                           {orderInfo.isTrigger || orderInfo.children.length ? (
                            <td className="pr-2 align-top">
                              {!orderInfo.children.length ? (
                                <>
                                  <p className="text-[#605E68] mb-1.5">{t('futuresDetails.common.triggerPrice')}</p>
                                  <p>{formatNumberWithCommas(orderInfo.triggerPx)}</p>
                                </>
                              ) : (
                                <>
                                  <p className="text-[#605E68] text-[calc(11rem/16)] leading-[calc(11rem/16)] mb-1.5">{t('futuresDetails.common.tpSl')}</p>
                                  <p className="text-[calc(14rem/16)] leading-[calc(14rem/16)] font-bold">
                                    <span className="text-rise font-semibold">{tpOpenOrder?.triggerPx || '-'}</span>
                                    <span className="text-[#605E68] mx-0.5">/</span>
                                    <span className="text-fall font-semibold">{slOpenOrder?.triggerPx || '-'}</span>
                                  </p>
                                </>
                              )}
                            </td>
                        ) : (
                          <></>
                        )}
                        </tr>

                        <td></td>
                        

                       
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className='flex items-center justify-between gap-4 px-3 mb-3.5'>
                  <div className='text-[#605E68] text-[calc(11rem/16)] leading-[calc(11rem/16)]'>{t('futuresDetails.common.filledRatio')}</div>
                  <div className="bg-[#101114]  rounded-[4px] flex-1 h-[6px] relative border-[0.5px] border-[#1D1C22]">
                      <p
                        className={cn("absolute left-0 top-0  h-full rounded-[4px]",
                          orderInfo.side === 'B' ? 'bg-rise' : 'bg-fall'
                        )}
                        style={{ width: `${percentage}%` }}
                      ></p>
                  </div>
                  <div className={
                    cn('text-[#605E68] text-[calc(13rem/16)] leading-[calc(13rem/16)] font-bold',
                      orderInfo.side === 'B' ? 'text-rise' : 'text-fall'
                    )}>
                  {`${percentage}%`}
                  </div>
                </div>

                <div className="p-3 flex items-center justify-between border-t-[0.5px] border-solid border-[#ECECED14]">
                  <p className="text-[#605E68] text-[calc(11rem/16)] leading-[calc(11rem/16)]">{formattedTime}</p>
                   <Button
                      variant={'ghost'}
                      className="p-0 text-[#605E68]  h-[calc(16rem/16)]"
                      onClick={() => { saveCardExpandState(false)}}
                    >
                      <img  src="/images/futuresDetail/card-arrow-down2.svg" className="rotate-180" alt="card-arrow-down" />
                    </Button>
                </div>


              </>
            }
          />
      }
      <ToastCenterScreen showModal={showToast} setShowModal={setShowToast} text={t('futuresDetails.tips.cancelOrderSuccess')} />
    </>
  )
})

export default React.memo(CurrentOrderCard, (prevProps, nextProps) => isEqual(prevProps.orderInfo, nextProps.orderInfo))
