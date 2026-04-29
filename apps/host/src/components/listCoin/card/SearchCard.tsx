import { CardHead, CardBottom, CardWrapper } from '@components/common/Card/CurrencyListCard.tsx'
import LaunchPlatformIcon from '@/components/common/Card/LaunchPlatformIcon'
import { DurationDisplay, MarketDisplay, PercentageChangeDisplay } from '@/components/common/FormattingDisplay'
import ChainCurrencyIcon from '@/components/common/ChainCurrencyIcon'
import { TokenTrending } from '@/types/token.ts'
import { getBlockChainLogo, getBlockchainLogo2 } from '@/utils/helpers.ts'
import dayjs from 'dayjs'
import { fShortenNumber, parseNumber } from '@/lib/number.ts'
import { useTranslation } from 'react-i18next'
import { formatVolume } from '@/lib/format.ts'
import { formatAddressWallet } from '@/lib/string.ts'
import { CopyButton } from '@components/common/copy-button.tsx'

type NewCoinCardProps = {
  token: TokenTrending
  priceChange: string
}

function getTradeDetail(token: TokenTrending, t: any) {
  const time = '24h'
  return [
    {
      label: t('listCoin.fields.liquidityPool'),
      value: `$${fShortenNumber(token.liquidity)}`,
    },
    {
      label: t('detail.trading.transactions', { time }),
      value: token.txs24h,
    },
    {
      label: t('detail.trading.volume', { time }),
      value: '$' + formatVolume(+token.volume24h),
    },
    {
      label: t('detail.tabs.holders'),
      value: token.numberOfHolder > 0 ? fShortenNumber(token.numberOfHolder) : '--',
    },
  ]
}

function SearchCard({ token }: NewCoinCardProps) {
  const { t } = useTranslation()
  const chainLogo = getBlockchainLogo2(token.chainId)
  const tokenLogo = token.image ?? getBlockChainLogo(token.chainId, token.token)
  const duration = dayjs().unix() - dayjs(token.createdTime).unix()
  const address = token.token

  return (
    <CardWrapper address={address} chainId={token.chainId}>
      <CardHead>
        <div className="flex items-center flex-1">
          <div className="mr-2">
            <ChainCurrencyIcon chainIcon={chainLogo} currencyIcon={tokenLogo} name={token.symbol} />
          </div>
          <div>
            <div className="mb-1 flex items-center">
              <span className="text-(--text-tertiary) text-[calc(1rem*(10/16))] leading-[calc(1rem*(10/16))] mr-1 flex-1 whitespace-nowrap">
                <span className="text-title align-baseline font-bold text-[calc(1rem*(13/16))] leading-[calc(1rem*(13/16))]">
                  {token.symbol}
                </span>{' '}
                <span className="whitespace-nowrap inline-flex leading-[calc(1rem*(10/16))">
                  (
                  <span className="text-ellipsis max-w-[80px] min-[400px]:max-w-fit overflow-hidden">{token.name}</span>
                  )
                </span>
              </span>
              {token.dexes?.map((dex) => <LaunchPlatformIcon key={dex} className={'mr-1'} value={dex} />)}
              <DurationDisplay
                value={duration}
                className={'text-[calc(1rem*(12/16))] leading-[calc(1rem*(12/16))] mr-1'}
              />
            </div>

            <div className="flex items-center gap-1">
              <div className="text-[calc(1rem*(10/16))] text-[#FFFFFF99] leading-[calc(1rem*(10/16))]">
                {formatAddressWallet(token.token, 5, 4)}
              </div>
              <div className="cursor-copy">
                <CopyButton
                  icon="/images/tokenDetail/icon-copy.webp"
                  className="w-[10px] min-w-[10px] h-[10px]"
                  text={token.token}
                  type="tokenAddress"
                />
              </div>
              <PercentageChangeDisplay
                value={parseFloat(token.price24hChange)}
                className="text-[calc(1rem*(10/16))] leading-[calc(1rem*(10/16))] mr-1"
              />
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <div className="text-right">
            <MarketDisplay
              value={parseNumber(token.marketcap)}
              className={'text-title text-[calc(1rem*(13/16))] leading-[calc(1rem*(13/16))] font-bold mb-1'}
            />
            <p className="text-[calc(1rem*(10/16))] leading-[calc(1rem*(10/16))] text-(--text-tertiary) whitespace-nowrap">
              {t('listCoin.columns.marketCap')}
            </p>
          </div>
        </div>
      </CardHead>
      <CardBottom tradeDetails={getTradeDetail(token, t)}></CardBottom>
    </CardWrapper>
  )
}

export default SearchCard
