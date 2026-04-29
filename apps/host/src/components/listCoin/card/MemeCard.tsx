import { MouseEvent } from 'react'
import { CardHead, CardBottom, CardWrapper, ConfirmCollectModal } from '@components/common/Card/CurrencyListCard.tsx'
import ProgressBar from '@/components/common/Card/ProgressBar'
import LaunchPlatformIcon from '@/components/common/Card/LaunchPlatformIcon'
import { MarketDisplay, PercentageChangeDisplay } from '@/components/common/FormattingDisplay'
import ChainCurrencyIcon from '@/components/common/ChainCurrencyIcon'
import { TradeDetailItem } from '@components/listCoin/TabMainstream.tsx'
import { TokenTrending } from '@/types/token.ts'
import { getBlockChainLogo, getBlockchainLogo2, getLaunchpad } from '@/utils/helpers.ts'
import { parseNumber } from '@/lib/number.ts'
import { useTranslation } from 'react-i18next'
import TrendChart from '@components/listCoin/card/TrendChart.tsx'
import { useTrendChartData } from '@hooks/useTrendChartData.ts'
import { useTokenInfo } from '@hooks/useTokenPrice.ts'
import { listCoinHelper } from '@/utils/list-coin-helper.ts'
import { TokenAge } from '@components/listCoin/TokenAge.tsx'
import AiIcon from '@components/common/Card/AiIcon.tsx'

type NewCoinCardProps = {
  token: TokenTrending
  tradeDetails: TradeDetailItem[]
  lifecycleState: string
  priceChange: string
  timeframe: string
  onAiAnalysisClick?: () => void
}

function MemeCard({
  tradeDetails,
  token: original,
  lifecycleState,
  priceChange,
  timeframe,
  onAiAnalysisClick,
}: NewCoinCardProps) {
  const { t } = useTranslation()
  const token = useTokenInfo(original)
  const chainLogo = getBlockchainLogo2(token.chainId)
  const tokenLogo = token.image ?? getBlockChainLogo(token.chainId, token.token)
  const { pricesData, volumesData } = useTrendChartData({ token, timeframe })
  const launchpad = getLaunchpad(token.dexes)

  const handleAiAnalysisClick = (event: MouseEvent) => {
    event.stopPropagation()
    onAiAnalysisClick?.()
  }

  return (
    <CardWrapper address={token.token} chainId={token.chainId}>
      <CardHead>
        <div className="flex items-center">
          <div className="mr-2">
            <ChainCurrencyIcon chainIcon={chainLogo} currencyIcon={tokenLogo} name={token.symbol} />
          </div>
          <div>
            <div className="mb-1 flex items-center">
              <span className="text-title font-bold text-[calc(1rem*(13/16))] leading-[calc(1rem*(13/16))] mr-1">
                {token.symbol ?? '--'}
              </span>
              {launchpad && <LaunchPlatformIcon className={'mr-1'} value={launchpad} />}
              <TokenAge createdTime={token.createdTime} />
              {/*<AIAnalysisDrawer />*/}
              <button className="cursor-pointer" onClick={handleAiAnalysisClick}>
                <AiIcon />
              </button>
            </div>

            {lifecycleState === 'completed' ? (
              <PercentageChangeDisplay
                value={+priceChange}
                className="text-[calc(1rem*(11/16))] leading-[calc(1rem*(11/16))] mr-1"
              />
            ) : (
              <ProgressBar
                value={parseFloat(token.internalMarketProgress ?? '0')}
                label={
                  lifecycleState === 'completing' && token.internalMarketProgress === '100'
                    ? t('listCoin.toBeOpened')
                    : ''
                }
              />
            )}
          </div>
        </div>
        <div className="flex items-center">
          <div className="mr-4">
            <MarketDisplay
              value={parseNumber(token.marketcap)}
              className={'text-title text-[calc(1rem*(13/16))] leading-[calc(1rem*(13/16))] font-bold mb-1'}
            />
            <p className="text-[calc(1rem*(10/16))] leading-[calc(1rem*(10/16))] text-(--text-tertiary)">
              {t('listCoin.columns.marketCap')}
            </p>
          </div>

          <TrendChart
            lineData={pricesData}
            barData={volumesData}
            barLength={10}
            trend={listCoinHelper.getTokenTrend(token, timeframe)}
          />

          <ConfirmCollectModal token={token.token} defaultCollect={token.isFavorite} tokenSymbol={token.symbol} />
        </div>
      </CardHead>
      <CardBottom tradeDetails={tradeDetails}></CardBottom>
    </CardWrapper>
  )
}

export default MemeCard
