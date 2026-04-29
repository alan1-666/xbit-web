import { CardHead, CardBottom, CardWrapper, ConfirmCollectModal } from '@components/common/Card/CurrencyListCard.tsx'
import LaunchPlatformIcon from '@/components/common/Card/LaunchPlatformIcon'
import { PercentageChangeDisplay, MarketDisplay } from '@/components/common/FormattingDisplay'
import ChainCurrencyIcon from '@/components/common/ChainCurrencyIcon'
import { TradeDetailItem } from '@components/listCoin/TabMainstream.tsx'
import AIAnalysisDrawer from '@components/listCoin/AIAnalysisDrawer.tsx'
import { TokenTrending } from '@/types/token.ts'
import { getBlockChainLogo, getBlockchainLogo2, getLaunchpad } from '@/utils/helpers.ts'
import { useState } from 'react'
import { parseNumber } from '@/lib/number.ts'
import useCustomTranslation from '@hooks/useCustomTranslation.ts'
import TrendChart from '@components/listCoin/card/TrendChart.tsx'
import { useTrendChartData } from '@hooks/useTrendChartData.ts'
import { useTokenInfo } from '@hooks/useTokenPrice.ts'
import { listCoinHelper } from '@/utils/list-coin-helper.ts'
import { TokenAge } from '@components/listCoin/TokenAge.tsx'

type WatchlistCardProps = {
  token: TokenTrending
  priceChange: number
  tradeDetails: TradeDetailItem[]
  onRemoved?: () => void
  timeframe: string
}

function WatchlistCard(props: WatchlistCardProps) {
  const { tradeDetails, token: original, priceChange, onRemoved, timeframe } = props
  const token = useTokenInfo(original)
  const { t } = useCustomTranslation()
  const [removing, setRemoving] = useState(false)
  const chainLogo = getBlockchainLogo2(token.chainId)
  const tokenLogo = token.image ?? getBlockChainLogo(token.chainId, token.token)
  const address = token.token
  const { pricesData, volumesData } = useTrendChartData({ token, timeframe })
  const launchpad = getLaunchpad(token.dexes)

  const handleRemoved = () => {
    setRemoving(false)
    onRemoved?.()
  }

  const handleRemoveFailed = () => {
    setRemoving(false)
  }

  return (
    <CardWrapper address={address} chainId={token.chainId} disabled={removing}>
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
              <AIAnalysisDrawer />
            </div>

            <PercentageChangeDisplay
              value={priceChange}
              className="text-[calc(1rem*(11/16))] leading-[calc(1rem*(11/16))] mr-1"
            />
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

          <ConfirmCollectModal
            token={token.token}
            defaultCollect={token.isFavorite}
            onRemove={() => setRemoving(true)}
            onRemoveSuccess={handleRemoved}
            onRemoveFailed={handleRemoveFailed}
            showDialog
            tokenSymbol={token.symbol}
          />
        </div>
      </CardHead>
      <CardBottom tradeDetails={tradeDetails}></CardBottom>
    </CardWrapper>
  )
}

export default WatchlistCard
