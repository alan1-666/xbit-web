import { EnhancedPosition } from '@/components/futuresDetails/desktop/DesktopOrderForm.tsx'
import MoneyFormatted from '@components/common/MoneyFormatted.tsx'
import { formatMoney, formatPercentage } from '@/utils/helpers'
import { useTranslation } from 'react-i18next'
import { Tooltip } from '@components/discover/Tooltip.tsx'
import { useMemo, useState } from 'react'
import { useWebData2 } from '@/hooks/hyperliquid/useWebData2'
import { xPositions } from '@/components/futuresDetails/trade/types'
import Decimal from 'decimal.js'
import { useAppSelector, useAppDispatch } from '@/redux/store'
import { exchangeActions } from '@/redux/modules/exchange.slice'
import { UserEmbeddedWalletDto } from '@/@generated/gql/graphql-user'
import { useQuery } from '@tanstack/react-query'
import { ethers } from 'ethers'
import NewLoginDrawer from '@/components/auth/NewLoginDrawer'
import { useCheckLoginOnArb } from '@/hooks/hyperliquid/useCheckLoginOnArb'
import { ChainIds } from '@/types/enums.ts'

// usePrices hook
const usePrices = () => {
  const priceList = useAppSelector((state) => state.price.list)
  return useMemo(() => {
    return {
      solPrice: priceList['SOL'],
      ethPrice: priceList['ETH'],
    }
  }, [priceList])
}

// ARB USDC balance fetcher
const fetchArbUsdcBalance = async (walletAddress: string): Promise<number> => {
  const endpoint = `https://arb1.arbitrum.io/rpc`
  const USDC_ADDRESS = '0xaf88d065e77c8cc2239327c5edb3a432268e5831'
  const ERC20_ABI = ['function balanceOf(address) view returns (uint256)', 'function decimals() view returns (uint8)']
  const provider = new ethers.JsonRpcProvider(endpoint)
  const usdcContract = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, provider)
  const [balanceRaw, decimals] = await Promise.all([usdcContract.balanceOf(walletAddress), usdcContract.decimals()])
  const balance = ethers.formatUnits(balanceRaw, decimals)
  return parseFloat(balance)
}

const EquityPannel = () => {
  const isLogin = useCheckLoginOnArb()
  const { t } = useTranslation()

  const {
    positions: positionsWebData2,
    webData2: { clearinghouseState },
  } = useWebData2()

  // Dialog states
  const [showLoginDrawer, setShowLoginDrawer] = useState(false)
  const dispatch = useAppDispatch()
  // Wallet management
  // @ts-ignore
  const listWalletsByChain =
    useAppSelector((state) => state.newWallet.listWalletsByChain as UserEmbeddedWalletDto[]) || []
  const solWallets = listWalletsByChain.filter((wallet) => wallet.chain === 'SOLANA')
  const ethWallets = listWalletsByChain.filter((wallet) => wallet.chain === 'EVM')
  const arbWallets = listWalletsByChain.filter((wallet) => wallet.chain === 'ARB')
  const [selectedWallet] = useState<UserEmbeddedWalletDto | null>(null)

  const { solPrice, ethPrice } = usePrices()

  // Wallet balances calculation
  const solBalances = useMemo(() => {
    const balances: Record<string, number> = {}
    solWallets.forEach((wallet) => {
      const address = wallet.walletAddress
      balances[address] = wallet.balance || 0
    })
    return balances
  }, [solWallets])

  const ethBalances = useMemo(() => {
    const balances: Record<string, number> = {}
    ethWallets.forEach((wallet) => {
      const address = wallet.walletAddress
      balances[address] = wallet.balance || 0
    })
    return balances
  }, [ethWallets])

  const arbEthBalances = useMemo(() => {
    const balances: Record<string, number> = {}
    arbWallets.forEach((wallet) => {
      const address = wallet.walletAddress
      balances[address] = wallet.balance || 0
    })
    return balances
  }, [arbWallets])

  const { data: arbUsdcBalances = {} } = useQuery({
    queryKey: ['arbUsdcBalances', arbWallets],
    queryFn: async () => {
      const balances: Record<string, number> = {}
      for (const wallet of arbWallets) {
        balances[wallet.walletAddress] = await fetchArbUsdcBalance(wallet.walletAddress)
      }
      return balances
    },
  })

  const walletBalances = useMemo(() => {
    const solUsdBalances: Record<string, number> = {}
    const ethUsdBalances: Record<string, number> = {}
    const arbEthUsdBalances: Record<string, number> = {}
    const arbUsdcUsdBalances: Record<string, number> = {}

    Object.entries(solBalances).forEach(([address, balance]) => {
      solUsdBalances[address] = balance * (solPrice || 0)
    })

    Object.entries(ethBalances).forEach(([address, balance]) => {
      ethUsdBalances[address] = balance * (ethPrice || 0)
    })

    Object.entries(arbEthBalances).forEach(([address, balance]) => {
      arbEthUsdBalances[address] = balance * (ethPrice || 0)
    })

    Object.entries(arbUsdcBalances).forEach(([address, balance]) => {
      arbUsdcUsdBalances[address] = balance
    })

    return {
      sol: solBalances,
      eth: ethBalances,
      arbEth: arbEthBalances,
      arbUsdc: arbUsdcBalances,
      solUsd: solUsdBalances,
      ethUsd: ethUsdBalances,
      arbEthUsd: arbEthUsdBalances,
      arbUsdcUsd: arbUsdcUsdBalances,
    }
  }, [solBalances, ethBalances, arbEthBalances, arbUsdcBalances, solPrice, ethPrice])

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

  const data = useMemo(() => {
    if (clearinghouseState?.crossMarginSummary?.accountValue) {
      const totalPositionValue = enhancedPositions.reduce((a, b) => a + Number(b.positionValue), 0)
      const totalUnrealizedPnl = enhancedPositions.reduce((a, b) => a + Number(b.unrealizedPnl), 0)
      const totalMargin = enhancedPositions.reduce((a, b) => a + Number(b.marginUsed), 0)
      const totalMaintenanceMargin = enhancedPositions.reduce(
        (sum: number, pos: EnhancedPosition) => sum + Number(pos.positionValue) / pos.maxLeverage / 2,
        0,
      )

      const balance = Number(clearinghouseState?.crossMarginSummary?.accountValue)
      const crossAccountLeverage = balance !== 0 ? totalPositionValue / balance : 0
      const crossMarginRatio = balance !== 0 ? (totalMaintenanceMargin / balance) * 100 : 0
      // Available margin = Total Balance (Total Balance) - Total margin of all positions (Margin)
      const availableMargin = new Decimal(balance).sub(totalMargin).toNumber()
      const availableWithdraw = new Decimal(availableMargin).sub(totalMargin).toNumber()

      return {
        balance,
        unrealizedPnl: totalUnrealizedPnl,
        positionValue: totalPositionValue,
        maintenanceMargin: totalMaintenanceMargin,
        crossAccountLeverage,
        crossMarginRatio,
        availableMargin,
        availableWithdraw: Math.max(0, availableWithdraw),
        totalMargin: totalMargin,
      }
    }
  }, [enhancedPositions, clearinghouseState?.crossMarginSummary?.accountValue])

  const handleBtnClick = (key: string) => {
    if (!isLogin) {
      setShowLoginDrawer(true)
      return
    }
    dispatch(
      exchangeActions.openExchangeDialog({
        defaultTab: key as 'deposit' | 'withdraw' | 'transfer',
      }),
    )
  }

  const btnList = [
    {
      icon: '/images/pc-futures/payin-icon.svg',
      label: t('assets.overview.deposit'),
      key: 'deposit',
    },
    {
      icon: '/images/pc-futures/payout-icon.svg',
      label: t('assets.withdraw.withdrawLabel'),
      key: 'withdraw',
    },
    {
      icon: '/images/pc-futures/transfer-icon.svg',
      label: t('assets.transfer'),
      key: 'transfer',
    },
  ]

  return (
    <>
      <div className="pt-[20px]">
        <div className="mb-[12px] text-[14px] leading-[14px] text-[#FCFCFC] font-medium">
          {t('futuresDetails.common.accountEquity')}
        </div>

        <div className="flex items-center justify-between gap-1.5 mb-[8px]">
          {btnList.map((item) => (
            <BtnItem key={item.key} icon={item.icon} label={item.label} onClick={() => handleBtnClick(item.key)} />
          ))}
        </div>
        <div>
          <p className="flex items-center justify-between gap-1 py-[12px] h-[37px]">
            <Tooltip content={t('assets.futures.balanceContent')}>
              <span className="cursor-help underline underline-offset-2 text-[13px] leading-[13px] text-[#908E98]">
                {t('assets.futures.balance')}
              </span>
            </Tooltip>
            <span className="text-[13px] leading-[13px] text-[#FCFCFC]">
              {data?.balance ? <MoneyFormatted value={data.balance} /> : '--'}
            </span>
          </p>

          <p className="flex items-center justify-between gap-1 py-[12px] h-[37px]">
            <span className="text-[13px] leading-[13px] text-[#908E98]">{t('assets.futures.unrealizedPnl')}</span>
            <span
              className={`text-[13px] leading-[13px] text-[#FCFCFC] ${Number(data?.unrealizedPnl ?? 0) >= 0 ? 'text-rise' : 'text-fall'}`}
            >
              {data?.unrealizedPnl ? (
                <>
                  {Number(data.unrealizedPnl) >= 0 ? '+' : '-'}
                  <MoneyFormatted value={Math.abs(Number(data.unrealizedPnl))} />
                </>
              ) : (
                '--'
              )}
            </span>
          </p>

          <p className="flex items-center justify-between gap-1 py-[12px] h-[37px]">
            <Tooltip content={t('assets.futures.crossMarginRatioContent')}>
              <span className="cursor-help underline underline-offset-2 text-[13px] leading-[13px] text-[#908E98]">
                {t('assets.futures.crossMarginRatio')}
              </span>
            </Tooltip>
            <span className="text-[13px] leading-[13px] text-[#FCFCFC]">
              {data?.crossMarginRatio ? formatPercentage(data?.crossMarginRatio) : '--'}
            </span>
          </p>

          <p className="flex items-center justify-between gap-1 py-[12px] h-[37px]">
            <Tooltip content={t('assets.futures.maintenanceMarginContent')}>
              <span className="cursor-help underline underline-offset-2 text-[13px] leading-[13px] text-[#908E98]">
                {t('assets.futures.maintenanceMargin')}
              </span>
            </Tooltip>
            <span className="text-[13px] leading-[13px] text-[#FCFCFC]">
              {data?.maintenanceMargin ? formatMoney(Number(data.maintenanceMargin.toFixed(2))) : '--'}
            </span>
          </p>

          <p className="flex items-center justify-between gap-1 py-[12px] h-[37px]">
            <Tooltip content={t('assets.futures.leverageContent')}>
              <span className="cursor-help underline underline-offset-2 text-[13px] leading-[13px] text-[#908E98]">
                {t('assets.futures.leverage')}
              </span>
            </Tooltip>

            <span className="text-[13px] leading-[13px] text-[#FCFCFC]">
              {data?.crossAccountLeverage !== undefined &&
              data?.crossAccountLeverage !== null &&
              data?.crossAccountLeverage !== 0
                ? `${data.crossAccountLeverage.toFixed(2)}X`
                : '--'}
            </span>
          </p>
        </div>
      </div>

      <NewLoginDrawer setOpen={setShowLoginDrawer} open={showLoginDrawer} />
    </>
  )
}
interface BtnItemProps {
  label: string
  icon: string
  onClick: () => void
}
const BtnItem = ({ label, icon, onClick }: BtnItemProps) => {
  return (
    <button
      className="flex items-center justify-center h-[46px] bg-[#212127] rounded-[6px] p-2 flex-1"
      onClick={onClick}
    >
      <img className="" src={icon} alt="icon" />
      <span className="text-[13px] leading-[13px] text-[#FCFCFC] ml-0.5">{label}</span>
    </button>
  )
}

export default EquityPannel
