import { CardHead, CardBottom, CardWrapper, ConfirmCollectModal } from '@components/common/Card/CurrencyListCard.tsx'
import LaunchPlatformIcon from '@/components/common/Card/LaunchPlatformIcon'
import { PercentageChangeDisplay, MarketDisplay } from '@/components/common/FormattingDisplay'
import ChainCurrencyIcon from '@/components/common/ChainCurrencyIcon'
import { TradeDetailItem } from '@components/listCoin/TabMainstream.tsx'
import AIAnalysisDrawer from '@components/listCoin/AIAnalysisDrawer.tsx'
import { TokenTrending } from '@/types/token.ts'
import { getBlockChainLogo, getBlockchainLogo2, getLaunchpad } from '@/utils/helpers.ts'
import { useTranslation } from 'react-i18next'
import { parseNumber } from '@/lib/number.ts'
import TrendChart from '@components/listCoin/card/TrendChart.tsx'
import { useTrendChartData } from '@hooks/useTrendChartData.ts'
import { useTokenInfo } from '@hooks/useTokenPrice.ts'
import { listCoinHelper } from '@/utils/list-coin-helper.ts'
import { TokenAge } from '@components/listCoin/TokenAge.tsx'

type NewCoinCardProps = {
  token: TokenTrending
  priceChange: string
  tradeDetails: TradeDetailItem[]
  timeframe: string
}

function NewCoinCard({ tradeDetails, token: original, priceChange, timeframe }: NewCoinCardProps) {
  const { t } = useTranslation()
  const token = useTokenInfo(original)
  const chainLogo = getBlockchainLogo2(token.chainId)
  const tokenLogo = token.image ?? getBlockChainLogo(token.chainId, token.token)
  const address = token.token
  const launchpad = getLaunchpad(token.dexes)

  const { pricesData, volumesData } = useTrendChartData({ token, timeframe })

  return (
    <CardWrapper address={address} chainId={token.chainId}>
      <CardHead>
        <div className="flex items-center">
          <div className="mr-2">
            <ChainCurrencyIcon chainIcon={chainLogo} currencyIcon={tokenLogo} name={token.symbol} />
          </div>
          <div>
            <div className="mb-1 flex items-center">
              <span className="text-title font-bold text-[calc(1rem*(13/16))] leading-[calc(1rem*(13/16))] mr-1">
                {token.symbol || token.name || '--'}
              </span>
              {launchpad && <LaunchPlatformIcon className={'mr-1'} value={launchpad} />}
              <TokenAge createdTime={token.createdTime} />
              <AIAnalysisDrawer address={token.token} />
            </div>

            <PercentageChangeDisplay
              value={+priceChange}
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
          <ConfirmCollectModal token={token.token} defaultCollect={token.isFavorite} tokenSymbol={token.symbol} />
        </div>
      </CardHead>
      <CardBottom tradeDetails={tradeDetails}></CardBottom>
    </CardWrapper>
  )
}

export default NewCoinCard
