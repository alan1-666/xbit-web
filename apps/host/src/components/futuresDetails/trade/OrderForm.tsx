import { useCheckLoginOnArb } from '@/hooks/hyperliquid/useCheckLoginOnArb'
import { cn, fixNumber, MathFun, hasPercent, removePercent } from '@/lib/utils'
import { symbolInfoSelector } from '@/redux/modules/futuresCurrentSymbol.slice'
import { futuresUserInfoActions } from '@/redux/modules/futuresUserInfo.slice'
import { resetOrderInfo, setOrderInfo } from '@/redux/modules/orderContract.slice'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import { formatNumberWithCommas } from '@/utils/helpers'
import FilterSelect from '@components/common/FilterSelect'
import { Signature } from 'ethers'
import { memo, SetStateAction, useEffect, useState, useMemo } from 'react'
import ConfirmPlaceOrder from './ConfirmPlaceOrder'
import { orderTypeOptions } from './Constans'
import DepositDrawer from './DepositDrawer'
import FormLimitPrice from './FormLimitPrice'
import FormMarketPrice from './FormMarketPrice'
import SwitchWalletDrawer from './SwitchWalletDrawer'
import { OrderContractState, OrderTypeEnum } from './type.order'
import WalletAuthorizationDrawer from './WalletAuthorizationDrawer'
import DrawerTip from './DrawerTip'
import { useTranslation } from 'react-i18next'
import { createPublicClient, http, formatUnits } from 'viem'
import { arbitrum } from 'viem/chains'
import { CHAIN_CONFIGS } from '@/components/transfer/constants'
import { USDC_ADDRESS_ARBITRUM } from '@/components/transfer/constants'
import { useSelector } from 'react-redux'
import { _walletDex } from '@/redux/modules/newWallet.slice'
import { useWebData2 } from '@/hooks/hyperliquid/useWebData2'
import useOrderFormCalucate from '../hooks/useOrderFormCalucate'
import { selectAllPerpMeta } from '@/redux/modules/futuresMeta.slice'
import { futuresTradeConfigSelector } from '@/redux/modules/futuresTradeConfigs.slice'
import DialogDeposit from '@/pages/deposit/DialogDeposit'
import NewLoginDrawer from '@/components/auth/NewLoginDrawer'
import { useResponsive } from '@/hooks/hyperliquid/useResponsive'
import { useNavigate } from 'react-router-dom'
import PositionLever from './PositionLever'
import PositionMode from './PositionMode'
import PositionDesc from './PositionDesc'
import CalcInfoCard from './CalcInfoCard'
import { fundingSelector } from '@/redux/modules/futuresUserInfo.slice'
import { DepositCard, PerpsDeposit } from '@/pages/assets/overview/components/DepositCard'
import { ACCOUNT_TYPE } from '@/components/swap/lib/constants'
import { exchangeActions } from '@/redux/modules/exchange.slice'



export interface IPOrderForm {
  signature?: Signature
  baseCoin: string
  containerClassName?: string
  positions?: any
}


const OrderForm = memo(({ baseCoin, containerClassName, positions }: IPOrderForm) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const walletDex = useSelector(_walletDex)
  const { price: symbolPrice, lastTradePrice, szDecimals } = useAppSelector(symbolInfoSelector)


  const {
    symbolListCtxs
  } = useWebData2()



  const allMeta = useAppSelector(selectAllPerpMeta)
  const coinIndex = allMeta.findIndex((item) => baseCoin === item.name)

  const { orderInfo } = useAppSelector<RootState, OrderContractState>((state) => state.orderContract)

  const { available: availableToTrade } = useAppSelector(fundingSelector)

  const isLogin = useCheckLoginOnArb()
  const { isDesktop } = useResponsive()
  const navigate = useNavigate()

  const [openWalletDrawer, setOpenWalletDrawer] = useState(false)
  const [openDepositDrawer, setOpenDepositDrawer] = useState(false)
  const [openDialogDeposit, setOpenDialogDeposit] = useState(false)

  const [isOpenTip, setIsOpenTip] = useState<boolean>(false)
  const [tipTitle, setTipTitle] = useState<string>('')
  const [tipDesc, setTipDesc] = useState<string>('')

  const [memeBalance, setMemeBalance] = useState<string>('0')
  const [availableBalance, setAvailableBalance] = useState(0)
  const [showLoginDrawer, setShowLoginDrawer] = useState(false)

  const { leverage } = useAppSelector(futuresTradeConfigSelector(baseCoin))

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
    makerFee
  } = useOrderFormCalucate(baseCoin, positions)

  const handleShowTip = (type: string) => {
    if (type === 'limit') {
      setTipTitle(t('futuresDetails.tabs.limitOrder'))
      setTipDesc(t('futuresDetails.tips.limitOrderDesc'))
      setIsOpenTip(true)
    }

  }

  const handleDeposit = (type: string) => {
    if (isDesktop) {
      setOpenDialogDeposit(true)
      return
    }

    navigate(`/deposit`, { state: { type, source: 'futuresTrade' } })
  }

  useEffect(() => {
    if (!baseCoin) return
    if (orderInfo.currency === 'USDC') {
      dispatch(resetOrderInfo({ currency: 'USDC', orderCoin: baseCoin }))
    } else {
      dispatch(resetOrderInfo({ currency: baseCoin, orderCoin: baseCoin }))
    }
  }, [dispatch, baseCoin])

  useEffect(() => {
    retrieveBalance()
  }, [baseCoin])

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

  const baseCoinCtx = useMemo(() => {
    if (!symbolListCtxs?.length || coinIndex < 0) return {}

    return {...symbolListCtxs[coinIndex], lastestPx: lastTradePrice}

  }, [symbolListCtxs, coinIndex, lastTradePrice])

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

  const currentBaseCoinPosition = useMemo(() => {
    return positions.filter((item: any) => item.coin === baseCoin)?.[0] || {}
  }, [positions, baseCoin])


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
    <div className={cn("rounded-[6px] relative overflow-hidden", containerClassName)}>
      <div className='flex items-center gap-1.5 justify-between w-full mb-2.5'>
        <PositionMode isFullWidth />
        <PositionLever isFullWidth />
        <PositionDesc isFullWidth />
      </div>
      <div className="flex justify-between items-center mb-3">
        <div className="text-[calc(12rem/16)] leading-[calc(12rem/16)]">{t('futuresDetails.common.available')}</div>
        <div
          className="flex items-start text-[calc(11rem/16)] leading-[calc(11rem/16)]"
          onClick={() => {
            if (!isLogin) {
              setShowLoginDrawer(true)
              return
            }
            navigate('/perps-deposit')
          }}
        >
          {formatNumberWithCommas(`${Number(availableBalance).toFixed(2)}`)} USDC
          <img className={cn("ml-1", isLogin ? "cursor-pointer" : "")} src="/images/futuresDetail/add-circle.svg" alt="add-icon" />
        </div>
      </div>
      {
        currentBaseCoinPosition?.szi &&  
        <div className="flex justify-between items-center mb-3">
          <div className="text-[calc(12rem/16)] leading-[calc(12rem/16)]">{t('futuresDetails.tpsl.currentPosition')}</div>
          <div className={cn("flex items-start text-[calc(11rem/16)] leading-[calc(11rem/16)] font-bold",
            currentBaseCoinPosition?.side === 'A' ? 'text-fall' : 'text-rise',
            !currentBaseCoinPosition.szi && 'text-white'
          )}>
            {`${(currentBaseCoinPosition?.szi || 0)} ${baseCoin}`}
          </div>
        </div>
      }
     


      <div className="relative">
        <FilterSelect
          options={orderTypeOptions()}
          triggerIcon="/images/futuresDetail/select-down-icon.svg"
          triggerIconClassname="w-[14px] h-[14px] absolute top-[50%] translate-y-[-50%] right-[7.69px]"
          value={orderInfo.type}
          // defaultValue={orderTypeOptions[0].value}
          selectTriggerProps={{
            className:
              'w-full max-w-auto justify-left bg-[#1F1E25] rounded-[4px]  relative p-[7px] app-font-medium text-[calc(1rem*(12/16))] leading-[1rem])] text-white mb-2.5',
          }}
          onValueChange={(e) => {
            dispatch(
              setOrderInfo({
                ...orderInfo,
                type: e as OrderTypeEnum,
                price: Number(lastTradePrice),
              }),
            )
          }}
        />
       {/*  {(orderInfo.type === 'limit') && (
          <Button
            variant="ghost"
            className="absolute top-[50%] transform -translate-y-1/2 left-1 p-0 text-[calc(1rem*(18/16))] !bg-transparent"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleShowTip('limit')
            }}
          >
            <img
              className="absolute top-1/2 left-1  translate-y-[-50%] w-[16px] min-w-[16px]"
              src="/images/orderSetting/icon-info.svg"
              alt="icon-info"
            />
          </Button>

        )} */}
      </div>


      {orderInfo.type === 'market' && <FormMarketPrice />}
      {orderInfo.type === 'limit' && <FormLimitPrice baseCoinCtx={baseCoinCtx} />}

      <CalcInfoCard calcInfo={calcInfo} orderInfo={orderInfo}/>

      <ConfirmPlaceOrder
        calcInfo={calcInfo}
        orderInfo={orderInfo}
        orderSide={orderInfo.side}
        baseCoin={baseCoin}
        price={symbolPrice?.toString()}
        memeBalance={memeBalance}
        containerClassName="absolute bottom-0 w-full right-0"
        currentPositionSzi={currentBaseCoinPosition?.szi || 0}
      />




      <SwitchWalletDrawer open={openWalletDrawer} setOpenWalletDrawer={setOpenWalletDrawer} />
      <NewLoginDrawer setOpen={setShowLoginDrawer} open={showLoginDrawer} />
      <WalletAuthorizationDrawer
        open={false}
        setOpen={function (value: SetStateAction<boolean>): void {
          throw new Error('Function not implemented.')
        }}
        initialCompletedSteps={[1]}
      />

      <DrawerTip
        title={tipTitle}
        desc={tipDesc}
        isOpen={isOpenTip}
        onOpenChange={(status) => { setIsOpenTip(status) }} />
    </div>
  )
})

export default OrderForm
