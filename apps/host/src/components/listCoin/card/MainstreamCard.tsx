import { CardHead, CardBottom, CardWrapper, ConfirmCollectModal } from '@components/common/Card/CurrencyListCard.tsx'
import LaunchPlatformIcon from '@/components/common/Card/LaunchPlatformIcon'
import { MarketDisplay } from '@/components/common/FormattingDisplay'
import ChainCurrencyIcon from '@/components/common/ChainCurrencyIcon'
import { TradeDetailItem } from '@components/listCoin/TabMainstream.tsx'
import AIAnalysisDrawer from '@components/listCoin/AIAnalysisDrawer.tsx'
import { TokenTrending } from '@/types/token.ts'
import { formatTokenPrice, getBlockChainLogo, getBlockchainLogo2, getLaunchpad } from '@/utils/helpers.ts'
import { parseNumber } from '@/lib/number.ts'
import { useTranslation } from 'react-i18next'
import { useTokenInfo } from '@hooks/useTokenPrice.ts'
import TrendChart from '@components/listCoin/card/TrendChart.tsx'
import { f } from 'fintech-number'
import { useTrendChartData } from '@hooks/useTrendChartData.ts'
import { listCoinHelper } from '@/utils/list-coin-helper.ts'
import { TokenAge } from '@components/listCoin/TokenAge.tsx'

type MainstreamCardProps = {
  token: TokenTrending
  tradeDetails: TradeDetailItem[]
  timeframe: string
}

function MainstreamCard(props: MainstreamCardProps) {
  const { tradeDetails, timeframe } = props
  const token = useTokenInfo(props.token)
  const { t } = useTranslation()
  const chainLogo = getBlockchainLogo2(token.chainId)
  const tokenLogo = token.image ?? getBlockChainLogo(token.chainId, token.token)
  const address = token.token
  const { pricesData, volumesData, chartLength } = useTrendChartData({ token, timeframe })
  const price = parseNumber(token.price)
  const launchpad = getLaunchpad(token.dexes)

  const formatedPrice = formatTokenPrice(price)

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
                {token.symbol ?? '--'}
              </span>
              {launchpad && <LaunchPlatformIcon className={'mr-1'} value={launchpad} />}
              <TokenAge createdTime={token.createdTime} />
              <AIAnalysisDrawer tokenAddress={token.token} />
            </div>

            <div className="text-[rgba(255,255,255,0.7)] text-[calc(1rem*(11/16))] leading-[calc(1rem*(11/16))] mr-1">
              <span>
                ${f(+formatedPrice.integerPart)}
                {!!formatedPrice.decimalPart && (
                  <>
                    .
                    {formatedPrice.zeroCount > 0 && (
                      <span>
                        0<span className="text-[70%]">{formatedPrice.zeroCount}</span>
                      </span>
                    )}
                    {formatedPrice.decimalPart.replace(/0+$/, '')}
                  </>
                )}
                {formatedPrice.unit || ''}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <div className="mr-4 text-right">
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
            barLength={chartLength}
            trend={listCoinHelper.getTokenTrend(token, timeframe)}
          />
          <ConfirmCollectModal token={token.token} defaultCollect={token.isFavorite} tokenSymbol={token.symbol} />
        </div>
      </CardHead>
      <CardBottom tradeDetails={tradeDetails}></CardBottom>
    </CardWrapper>
  )
}

export default MainstreamCard
