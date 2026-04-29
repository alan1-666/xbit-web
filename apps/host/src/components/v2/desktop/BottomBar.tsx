import { ConnectorDex } from '@/lib/mqtt-dex'
import { fShortenNumber } from '@/lib/number.ts'
import DialogAboutUs from '@/pages/settings/dialog-about-us'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import MoneyFormatted, { Loader } from '@components/common/MoneyFormatted.tsx'
import { IconBookmark } from '@components/icon'
import { IconTelegram } from '@components/icon/brands/IconTelegram.tsx'
import { IconTwitter } from '@components/icon/brands/IconTwitter.tsx'
import { IconCoins } from '@components/icon/stroke/IconCoins.tsx'
import { IconGasStation } from '@components/icon/stroke/IconGasStation.tsx'
import { IconLayout } from '@components/icon/stroke/IconLayout.tsx'
import { IconLeaderboard } from '@components/icon/stroke/IconLeaderboard.tsx'
import { IconSmartMoney } from '@components/icon/stroke/IconSmartMoney.tsx'
import { IconWallets } from '@components/icon/stroke/IconWallets.tsx'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip.tsx'
import { SimpleTooltip } from '@components/v2/ui-shared/components/SimpleTooltip.tsx'
import { IconWithValue } from '@pages/meme/discover/desktop/components/IconWithValue.tsx'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import FuturesFooterListCard from './FuturesFooterListCard'
import { homeActions } from '@/redux/modules/home.slice.ts'
import { selectCachedCandleData } from '@/redux/modules/candleCacheSlice.slice.ts'
import { useCandleOneDay } from '@hooks/hyperliquid/useCandleOneDay.ts'
import { Link } from 'react-router-dom'
import { APP_PATH } from '@/lib/constant.ts'
import { useNetworkLatency } from '@/hooks/useNetworkLatency'

const Trackers = () => {
  const { t } = useTranslation()
  return (
    <div className="items-center gap-2.5 text-white/70 text-[calc(13rem/16)] font-[380] leading-[13px] pr-2 hidden">
      <IconWithValue
        icon={<IconWallets className="size-3.5" />}
        value={t('bottomNav.trackers.wallet')}
        className="cursor-pointer"
      />
      <IconWithValue
        icon={<IconTwitter className="size-3.5 text-[#B9B9B9]" />}
        value={t('bottomNav.trackers.twitter')}
        className="cursor-pointer"
      />
      <IconWithValue
        icon={<img src="/images/icons/ic-network.svg" alt="" className="size-3.5" />}
        value={t('listCoin.tabs.meme')}
        className="cursor-pointer"
      />
      <IconWithValue
        icon={<IconLeaderboard className="size-3.5" />}
        value={t('bottomNav.ranking')}
        className="cursor-pointer"
      />
      <IconWithValue
        icon={<IconSmartMoney className="size-3.5" />}
        value={t('bottomNav.trackers.profitAndLoss')}
        className="cursor-pointer"
      />
    </div>
  )
}

const Launchpads = () => {
  return (
    <div className="pr-2 hidden">
      <div className="flex items-center bg-[#ECECED2E] px-2 py-1 rounded-full gap-1">
        <img src="/images/icons/pump-icon.svg" alt="" />
        <img src="/images/icons/dex/bonk.svg" alt="" />
        <img src="/images/icons/dex/bags.svg" alt="" />
      </div>
    </div>
  )
}

const PriceList = () => {
  const { t } = useTranslation()
  const { ETH: ethPrice, SOL: solPrice, BNB: bnbPrice } = useAppSelector((state) => state.price.list)

  const cachedCandleData = useAppSelector((state) => {
    return selectCachedCandleData('BTC')(state)
  })

  const { ticker } = useCandleOneDay('BTC')

  const btcPrice = useMemo(() => {
    const candleData = ticker || cachedCandleData
    return candleData ? +candleData.c : undefined
  }, [ticker, cachedCandleData])

  return (
    <div className="flex items-center gap-4 text-white/70 text-[calc(13rem/16)] font-[380] leading-[13px] pr-2">
      <SimpleTooltip content={t('bottomNav.tooltip.coinPrice', { coin: 'Bitcoin' })}>
        <IconWithValue
          icon={<img src="/images/futuresDetail/CryptoCoins/btc.svg" alt="" className="size-3.5" />}
          value={btcPrice ? '$' + fShortenNumber(btcPrice ?? 0) : <Loader />}
        />
      </SimpleTooltip>
      <SimpleTooltip content={t('bottomNav.tooltip.coinPrice', { coin: 'Ethereum' })}>
        <IconWithValue
          icon={<img src="/images/icons/chains/ic-ethereum.svg" alt="" className="size-3.5" />}
          value={'$' + fShortenNumber(Number(ethPrice ?? 0))}
        />
      </SimpleTooltip>
      <SimpleTooltip content={t('bottomNav.tooltip.coinPrice', { coin: 'Solana' })}>
        <IconWithValue
          icon={<img src="/images/icons/chains/ic-solana.svg" alt="" className="size-3.5" />}
          value={'$' + fShortenNumber(Number(solPrice ?? 0))}
        />
      </SimpleTooltip>
      <SimpleTooltip content={t('bottomNav.tooltip.coinPrice', { coin: 'BNB' })}>
        <IconWithValue
          icon={<img src="/images/icons/chains/ic-bnb.svg" alt="" className="size-3.5" />}
          value={'$' + fShortenNumber(Number(bnbPrice ?? 0))}
        />
      </SimpleTooltip>
    </div>
  )
}

const EstimateFee = () => {
  const { t } = useTranslation()
  const solPrice: number = useAppSelector((state) => state.price.list.SOL ?? 0)
  const priorityFee: number = useAppSelector((state) => state.networkFee.priorityFeePrice?.medium || 0)
  const estimatedPumpfunMigrationMC = useMemo(() => {
    return solPrice * 411.5
  }, [solPrice])
  return (
    <div className="">
      <div className="flex items-center gap-2 text-white/70 text-[calc(13rem/16)] font-[380] leading-[13px] pr-2">
        <SimpleTooltip content={t('bottomNav.tooltip.estimatedPumpfunMigrationMC')}>
          <IconWithValue
            icon={<img src="/images/icons/pump-icon.svg" alt="" />}
            value={'$' + fShortenNumber(estimatedPumpfunMigrationMC)}
          />
        </SimpleTooltip>
        <SimpleTooltip content={t('bottomNav.tooltip.recommendedPriorityFee')}>
          <IconWithValue icon={<IconGasStation />} value={<MoneyFormatted value={priorityFee * solPrice} unit="$" />} />
        </SimpleTooltip>
        <SimpleTooltip content={t('bottomNav.tooltip.recommendedBribeFee')} className="hidden">
          <IconWithValue icon={<IconCoins />} value="0.05" />
        </SimpleTooltip>
      </div>
    </div>
  )
}

const MAX_STABLE_LATENCY = 2000

interface ConnectionStatusProps {
  color: string
  bgColor: string
  text: string
  description?: string
}
const ConnectionStatus = () => {
  const { t } = useTranslation()
  const { latency, isOnline } = useNetworkLatency(6000) // Measure latency every 5 seconds

  // Determine status based on connection and latency
  const getStatus = (): ConnectionStatusProps => {
    if (!isOnline) {
      return { text: t('bottomNav.connectionHealth.offline'), color: '#FF4444', bgColor: '#FF44441A' }
    }

    if (latency === null) {
      return { text: t('bottomNav.connectionHealth.connecting'), color: '#FFA500', bgColor: '#FFA5001A' }
    }

    if (latency > 500) {
      return {
        text: t('bottomNav.connectionHealth.poor'),
        color: '#FF4444',
        bgColor: '#FF44441A',
        description: t('bottomNav.connectionHealth.description.poor'),
      }
    }

    if (latency > 200) {
      return {
        text: t('bottomNav.connectionHealth.fair'),
        color: '#FFA500',
        bgColor: '#FFA5001A',
        description: t('bottomNav.connectionHealth.description.fair'),
      }
    }

    if (latency > 100) {
      return {
        text: t('bottomNav.connectionHealth.good'),
        color: '#009C46',
        bgColor: '#00FFB41A',
        description: t('bottomNav.connectionHealth.description.good'),
      }
    }

    return {
      text: t('bottomNav.connectionHealth.excellent'),
      color: '#009C46',
      bgColor: '#00FFB41A',
      description: t('bottomNav.connectionHealth.description.excellent'),
    }
  }

  const status = getStatus()

  return (
    <div className="pr-2 mr-1 border-r">
    <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild disabled={!status.description}>
      <div className={`rounded-[4px] flex items-center gap-1 px-1.5 h-6`} style={{ backgroundColor: status.bgColor }}>
        <div className={`rounded-full size-1.5`} style={{ backgroundColor: status.color }} />
        <div className="text-[calc(13rem/16)] leading-[13px] font-[380]" style={{ color: status.color }}>
          {status.text}
          {latency !== null && latency < MAX_STABLE_LATENCY && <span> {latency}ms</span>}
        </div>
      </div>
      </TooltipTrigger>
      <TooltipContent>
        {status.description}
      </TooltipContent>
    </Tooltip>
    </TooltipProvider>
    </div>
  )
}

const ServerSelect = () => {
  return (
    // <SimpleTooltip content="Global auto routing">
    <div className="pr-2 opacity-60 cursor-not-allowed">Global</div>
    // </SimpleTooltip>
  )
}

const Socials = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const toggleTopBar = () => {
    dispatch(homeActions.toggleTopBar())
  }

  return (
    <div>
      <div className="flex items-center gap-2 text-white/70 text-[calc(13rem/16)] font-[380] leading-[13px] pr-2">
        <SimpleTooltip content={t('bottomNav.tooltip.hideWatchlistTicker')}>
          <IconLayout className="size-4 cursor-pointer" onClick={toggleTopBar} />
        </SimpleTooltip>
        <SimpleTooltip content="Twitter (X)">
          <a href="https://x.com/XBITDEX" target="_blank" rel="noopener noreferrer" aria-label="button X" >
            <IconTwitter className="size-4 cursor-pointer" />
          </a>
        </SimpleTooltip>
        <SimpleTooltip content="Telegram">
          <a href="https://t.me/xbit_dex" target="_blank" rel="noopener noreferrer" aria-label="button Telegram" >
            <IconTelegram className="size-4 cursor-pointer" />
          </a>
        </SimpleTooltip>
      </div>
    </div>
  )
}

const Guideline = () => {
  const { t } = useTranslation()
  return (
    <div>
      <div className="flex items-center gap-2">
        <a href="https://docs.xbit.com" target="_blank" rel="noopener noreferrer">
          <IconWithValue icon={<IconBookmark />} value={t('bottomNav.tutorial')} className="cursor-pointer" />
        </a>
        <a href={APP_PATH.DOWNLOAD_APP} target="_blank">
          <IconWithValue
            icon={<img src="/images/icons/ic-gift.png" alt="" />}
            value={t('bottomNav.downloadApp')}
            className="cursor-pointer"
          />
        </a>
        <DialogAboutUs />
      </div>
    </div>
  )
}

export const BottomBar = () => {
  const headerTab = useAppSelector((state) => state.router.headerTab)
  const isDex = headerTab === 'crypto'

  return (
    <TooltipProvider delayDuration={50}>
      <div className="flex items-center justify-between px-4 py-1.5 bg-black border-[#AB57FF4D] border-t z-30 fixed inset-x-0 w-full bottom-0">
        {!isDex ? (
          <div className="flex items-center gap-2 divide-x">
            <Trackers />
            <Launchpads />
            <ConnectorDex>
              <PriceList />
            </ConnectorDex>
          </div>
        ) : (
          <div className="flex-1 overflow-x-auto _hidescrollbar">
            <FuturesFooterListCard />
          </div>
        )}
        <div className="flex items-center gap-2 divide-x text-white/70 text-[calc(13rem/16)] font-[380] leading-[13px]">
          {!isDex && <EstimateFee />}
          <div className="flex items-center pr-2">
            {!isDex && (
              <>
                <ConnectionStatus />
                <ServerSelect />
              </>
            )}
            {isDex && <div className="w-[2px] h-[14px] bg-[#79778C29] mx-3" />}
            <Socials />
          </div>
          <Guideline />
        </div>
      </div>
    </TooltipProvider>
  )
}
