import PositionMode from '@/components/futuresDetails/trade/PositionMode'
import PositionLever from '@/components/futuresDetails/trade/PositionLever'
import PositionDesc from '@/components/futuresDetails/trade/PositionDesc'
import NewLoginDrawer from '@/components/auth/NewLoginDrawer'
import ConfirmPlaceOrder from '@/components/futuresDetails/trade/ConfirmPlaceOrder'
import DepositDrawer from '@/components/futuresDetails/trade/DepositDrawer'
import FormLimitPrice from '@/components/futuresDetails/trade/FormLimitPrice'
import FormMarketPrice from '@/components/futuresDetails/trade/FormMarketPrice'
import TradingButton from '@/components/futuresDetails/trade/TradingButton'
import { OrderContractState, OrderTypeEnum } from '@/components/futuresDetails/trade/type.order'
import { xPositions } from '@/components/futuresDetails/trade/types'
import { CHAIN_CONFIGS, USDC_ADDRESS_ARBITRUM } from '@/components/transfer/constants'
import { useCheckLoginOnArb } from '@/hooks/hyperliquid/useCheckLoginOnArb'
import { useWebData2 } from '@/hooks/hyperliquid/useWebData2'
import { cn, fixNumber } from '@/lib/utils'
import { exchangeActions } from '@/redux/modules/exchange.slice'
import { symbolInfoSelector } from '@/redux/modules/futuresCurrentSymbol.slice'
import { selectAllPerpMeta } from '@/redux/modules/futuresMeta.slice'
import { futuresTradeConfigSelector } from '@/redux/modules/futuresTradeConfigs.slice'
import { _walletDex } from '@/redux/modules/newWallet.slice'
import { resetOrderInfo, setOrderInfo } from '@/redux/modules/orderContract.slice'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import { ChainIds } from '@/types/enums.ts'
import { formatNumberWithCommas } from '@/utils/helpers'
import MovingLineTabs from '@components/common/MovingLineTabs.tsx'
import { Signature } from 'ethers'
import { memo, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { createPublicClient, formatUnits, http } from 'viem'
import { arbitrum } from 'viem/chains'
import useOrderFormCalucate from '../hooks/useOrderFormCalucate'
import CalcInfoCard from '@/components/futuresDetails/trade/CalcInfoCard'
import { fundingSelector } from '@/redux/modules/futuresUserInfo.slice'

export interface IPOrderForm {
  signature?: Signature
  baseCoin: string
  containerClassName?: string
}

export interface EnhancedOverviewData {
  balance: number
  unrealizedPnl: number
  positionValue: number
  maintenanceMargin: number
  crossAccountLeverage: number
  crossMarginRatio: number
  availableMargin: number
  rawUSD: number
  availableWithdraw: number
  totalMargin: number
}

export interface EnhancedPosition {
  symbol: string
  size: string
  type: string // cross/isolated
  leverage: number
  maxLeverage: number
  unrealizedPnl: number
  pnlPercent: number
  marginUsed: number
  positionValue: number
  liqPrice: number
  entryPrice: number
  markPrice: number
  funding: number
  fundingFee: number
  time: string
  maintenanceMargin: number
  side: 'A' | 'B'
  positionInfo: xPositions
}

const OrderForm = memo(({ baseCoin, containerClassName }: IPOrderForm) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const walletDex = useSelector(_walletDex)
  const { price: symbolPrice, szDecimals, lastTradePrice, markPrice } = useAppSelector(symbolInfoSelector)

  const allMeta = useAppSelector(selectAllPerpMeta)
  const coinIndex = allMeta.findIndex((item) => baseCoin === item.name)

  const { orderInfo } = useAppSelector<RootState, OrderContractState>((state) => state.orderContract)

  const tradeConfigs = useAppSelector(futuresTradeConfigSelector(baseCoin))

  const [mode, setMode] = useState(tradeConfigs.positionMode)

  const [showLoginDrawer, setShowLoginDrawer] = useState(false)
  const isLogin = useCheckLoginOnArb()

  const {
    positions: positionsWebData2,
    webData2: { clearinghouseState },
    symbolListCtxs,
  } = useWebData2()


  const { available: availableToTrade } = useAppSelector(fundingSelector)

  const [availableBalance, setAvailableBalance] = useState(0)
  const [openDepositDrawer, setOpenDepositDrawer] = useState(false)

  const {
    buyOrderValue,
    buyOrderLiqPrice,
    buyOrderMarginRequired,
    maxBuyOrderValue,
    buySlippage,
    sellOrderValue,
    sellOrderLiqPrice,
    sellOrderMarginRequired,
    maxSellOrderValue,
    sellSlippage,
    takerFee,
    makerFee,
  } = useOrderFormCalucate(baseCoin, positionsWebData2) 
  const enhancedPositions = useMemo((): EnhancedPosition[] => {
    return positionsWebData2.map((position: xPositions): EnhancedPosition => {
      const positionValue = Number(position.positionValue)
      const pnlPercent = Number(position.returnOnEquity || '0') * 100
      const liqPrice = Number(position.liquidationPx || '0')
      const currentTime = new Date().toISOString()
      const maintenanceMargin = positionValue / position.maxLeverage / 2

      return {
        symbol: position.coin,
        size: position.szi,
        type: position.leverage.type,
        leverage: position.leverage.value,
        maxLeverage: position.maxLeverage,
        unrealizedPnl: Number(position.unrealizedPnl || '0'),
        pnlPercent: pnlPercent,
        marginUsed: Number(position.marginUsed),
        positionValue,
        liqPrice,
        entryPrice: Number(position.entryPx),
        markPrice: Number(position.markPrice),
        funding: parseFloat(position.cumFunding.allTime),
        fundingFee: parseFloat(position.cumFunding.sinceOpen),
        time: currentTime,
        maintenanceMargin,
        side: position.side,
        positionInfo: position,
      }
    })
  }, [positionsWebData2])

  const currentListTabs = [
    {
      value: 'market',
      label: t('futuresDetails.common.market'),
    },
    {
      value: 'limit',
      label: t('futuresDetails.common.limit'),
    },
  ]
  const [memeBalance, setMemeBalance] = useState<string>('0')

  const initialTab = orderInfo.type

  const handleOrderTypeChange = (val: string) => {
    dispatch(
      setOrderInfo({
        ...orderInfo,
        type: val as OrderTypeEnum,
        price: Number(lastTradePrice),
      }),
    )
  }

  const retrieveBalance = async () => {
    // Create a public client for Arbitrum
    const arbitrumClient = createPublicClient({
      chain: arbitrum,
      transport: http(CHAIN_CONFIGS.ARBITRUM.rpc),
    })

    // Read USDC balance using the public client
    const balance = (await arbitrumClient.readContract({
      address: USDC_ADDRESS_ARBITRUM,
      abi: [
        {
          constant: true,
          inputs: [{ name: 'account', type: 'address' }],
          name: 'balanceOf',
          outputs: [{ name: '', type: 'uint256' }],
          type: 'function',
        },
      ],
      functionName: 'balanceOf',
      args: [walletDex?.walletAddress],
    })) as bigint

    // Format balance with 6 decimals (USDC standard)
    const formattedBalance = formatUnits(balance, 6)
    setMemeBalance(formattedBalance)
  }

  useEffect(() => {
    retrieveBalance()
  }, [baseCoin])

  const baseCoinCtx = useMemo(() => {
    if (!symbolListCtxs?.length || coinIndex < 0) return {}

    return {...symbolListCtxs[coinIndex], lastestPx: lastTradePrice}

  }, [symbolListCtxs, coinIndex, lastTradePrice])

  const currentBaseCoinPosition = useMemo(() => {
    return enhancedPositions.filter((item: any) => item.symbol === baseCoin)?.[0] || {}
    return symbolListCtxs[coinIndex]
  }, [symbolListCtxs, coinIndex])

  
  useEffect(() => {
    if (!baseCoin) return
    if (orderInfo.currency === 'USDC') {
      dispatch(resetOrderInfo({ currency: 'USDC', orderCoin: baseCoin }))
    } else {
      dispatch(resetOrderInfo({ currency: baseCoin, orderCoin: baseCoin }))
    }
  }, [dispatch, baseCoin])


  /* useEffect(() => {
    if (availableToTrade) {
      if (orderInfo.side === 'buy') {
        setAvailableBalance(availableToTrade?.[0] || 0)
      } else {
        setAvailableBalance(availableToTrade?.[1] || 0)
      }
    }
  }, [availableToTrade, orderInfo.side]) */

  useEffect(() => {
    if (availableToTrade) {
      const availableToBuy = availableToTrade?.[0] || 0
      const availableToSell = availableToTrade?.[1] || 0
      setAvailableBalance(Math.min(availableToBuy, availableToSell))
    }
  }, [availableToTrade])

  const calcInfo = {
    buyOrderValue,
    buyOrderLiqPrice,
    buyOrderMarginRequired,
    maxBuyOrderValue,
    buySlippage,
    sellOrderValue,
    sellOrderLiqPrice,
    sellOrderMarginRequired,
    maxSellOrderValue,
    sellSlippage,
    takerFee,
    makerFee
  }
  return (
    <div className={cn("rounded-[6px] relative flex flex-col h-full gap-[220px] justify-between", containerClassName)}>

      <div className='flex-1'>
        <div className='flex items-center gap-2.5 justify-between mb-2'>
          <PositionMode />
          <PositionLever />
          <PositionDesc />
        </div>

        <MovingLineTabs
          tabs={currentListTabs}
          onTabChange={handleOrderTypeChange}
          defaultTab={initialTab}
          containerClassName="bg-[none] w-full mb-[10px] h-[36px] after:bg-[#79778C29]"
          tabsClassName="w-full h-[36px]"
          tabsListClassName="w-full"
          itemClassName="flex-1 text-[16px] p-[5px] font-bold"
          showContainerBottomLine={true}

        />


        <div className='mb-[12px]  text-[14px] leading-[14px]'>
          <div className='w-full flex items-center justify-between mb-[12px]'>
            <div className='text-[#908E98]'>{t('futuresDetails.common.available')}</div>
            <div className='flex items-center'>
              <p className='text-[#FCFCFC] mr-2'>
                <span className='font-bold'>{`${formatNumberWithCommas(`${fixNumber(availableBalance, 2)}`)}`}</span>
                <span className='text-[#605E68] ml-1'>USDC</span>
              </p>
              <div
                className='cursor-pointer flex items-center'
                onClick={() => {
                if (!isLogin) {
                  setShowLoginDrawer(true)
                  return
                }

                dispatch(
                  exchangeActions.openExchangeDialog({
                    defaultTab: 'deposit',
                    defaultChainId: ChainIds.Arbitrum,
                  }),
                )
              }}
              >
                <img
                  className='size-[12px]'
                  src='/images/pc-futures/add-margin-icon.svg'
                  alt="icon margin"
                />
              </div>


            </div>
          </div>
          {
            currentBaseCoinPosition?.size && <div className='w-full flex items-center justify-between '>
            <div className='text-[#908E98] '>{t('futuresDetails.tpsl.currentPosition')}</div>
            <div className='flex items-center'>
              <p className={cn('mr-1 font-bold', currentBaseCoinPosition?.side === 'A' ? 'text-fall' : 'text-rise',
                !currentBaseCoinPosition?.size && 'text-white')}>{`${(currentBaseCoinPosition?.size || 0)} ${baseCoin}`}</p>
            </div>
          </div>

          }
          
        </div>

        {orderInfo.type === 'market' && <FormMarketPrice />}
        {orderInfo.type === 'limit' && <FormLimitPrice baseCoinCtx={baseCoinCtx} />}
      </div>

      <div className='h-full relative'>
        <div className={cn('absolute bottom-0 left-0 w-full')}>
          <CalcInfoCard calcInfo={calcInfo} orderInfo={orderInfo} />
          <ConfirmPlaceOrder
            calcInfo={calcInfo}
            orderInfo={orderInfo}
            orderSide={orderInfo.side}
            baseCoin={baseCoin}
            price={symbolPrice?.toString()}
            memeBalance={memeBalance}
            containerClassName="h-[37px] mb-[16px] w-full mt-[20px]"
            currentPositionSzi={Number(currentBaseCoinPosition?.size || 0)}
          />
        </div>
      </div>


      <DepositDrawer open={openDepositDrawer} setOpenDrawer={setOpenDepositDrawer} />
      <NewLoginDrawer setOpen={setShowLoginDrawer} open={showLoginDrawer} />




    </div>
  )
})

export default OrderForm
