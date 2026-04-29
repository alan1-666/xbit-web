import { useTranslation } from 'react-i18next'
import { getBlockChainLogo, getBlockchainLogo2, getLaunchpad } from '@/utils/helpers.ts'
import { useNavigate } from 'react-router-dom'
import { SearchHistory } from '@components/common/search/SearchHistory.tsx'
import { APP_PATH, CHAIN_SYMBOLS } from '@/lib/constant.ts'
import { ConfirmCollectModal } from '@components/common/Card/CurrencyListCard.tsx'
import ChainCurrencyIcon from '@components/common/ChainCurrencyIcon.tsx'
import LaunchPlatformIcon from '@components/common/Card/LaunchPlatformIcon.tsx'
import { MarketDisplay } from '@components/common/FormattingDisplay.tsx'
import { formatAddressWallet } from '@/lib/string.ts'
import { CopyButton } from '@components/common/copy-button.tsx'
import { parseNumber } from '@/lib/number.ts'
import { TokenTrending } from '@/types/token.ts'
import { formatPercentageChange } from '@/lib/format.ts'
import { cn, getPath } from '@/lib/utils.ts'
import { TokenAge } from '@components/listCoin/TokenAge.tsx'
import { useQueryClient } from '@tanstack/react-query'

interface SearchResultItemProps {
  token: TokenTrending
}

const PriceChange = (props: { value: number | undefined }) => {
  const { value } = props
  const formatted = value !== undefined ? formatPercentageChange(value).label : '--'
  const isPositive = value !== undefined && value > 0

  return (
    <div
      className={cn(
        'w-16 py-1.5 text-[calc(1rem*(12/16))] text-[#FFFFFF] leading-[calc(1rem*(12/16))] rounded-[4px] flex items-center justify-center',
        value === undefined || value >= 0
          ? 'bg-[linear-gradient(79.15deg,#0085D2_0.68%,#00CE89_83.92%)]'
          : 'bg-[linear-gradient(47.78deg,#8420FF_2.71%,#E149F8_93.06%)]',
      )}
    >
      <span>
        {isPositive ? '+' : ''}
        {formatted}
      </span>
    </div>
  )
}

export const SearchResultItem = (props: SearchResultItemProps) => {
  const { token } = props
  const isFavorite: boolean = 'isFavorite' in token ? (token.isFavorite as boolean) : false
  const { t } = useTranslation()
  const chainLogo = getBlockchainLogo2(token.chainId)
  const tokenLogo = token.image ?? getBlockChainLogo(token.chainId, token.token)
  const navigate = useNavigate()
  const launchpad = getLaunchpad(token.dexes)
  const queryClient = useQueryClient()

  const handleClick = () => {
    const searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]') as SearchHistory[]
    const newHistory = searchHistory.filter((item) => item.address !== token.token)
    newHistory.unshift({ address: token.token, name: token.symbol, logo: token.image, chainId: token.chainId })
    if (newHistory.length > 40) {
      newHistory.pop()
    }
    localStorage.setItem('searchHistory', JSON.stringify(newHistory))
    navigate(
      getPath(APP_PATH.MEME_TOKEN_DETAIL, {
        address: token.token,
        chain: CHAIN_SYMBOLS[+token.chainId],
      }),
      {
        state: { symbol: token.symbol },
      }
    )
  }

  const invalidateFavorites = () => {
    queryClient.invalidateQueries({
      queryKey: ['tokens', 'watchlist'],
      exact: false,
    })
  }

  return (
    <div
      className="flex items-center justify-between gap-2 py-3 border-b last:border-b-0 cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex items-center gap-2 flex-3">
        <div className="w-[26px]">
          <ConfirmCollectModal
            defaultCollect={isFavorite}
            token={token.token}
            onRemoveSuccess={invalidateFavorites}
            onAdded={invalidateFavorites}
            tokenSymbol={token.symbol}
            triggerClassName="p-0"
          />
        </div>
        <ChainCurrencyIcon
          chainIcon={chainLogo}
          currencyIcon={tokenLogo}
          name={token.symbol}
          fallbackClassName="bg-secondary"
        />
        <div className="">
          <div className="mb-1 flex items-center text-title align-baseline font-bold text-[calc(1rem*(13/16))] leading-[calc(1rem*(13/16))]">
            <span className="mr-1">{token.symbol}</span>
            {launchpad && <LaunchPlatformIcon className={'mr-1'} value={launchpad} />}
            <TokenAge createdTime={token.createdTime} />
          </div>
          <div className="flex items-center">
            <div className="text-[calc(1rem*(10/16))] text-[#FFFFFF99] leading-[calc(1rem*(10/16))] mr-1">
              {formatAddressWallet(token.token, 5, 4)}
            </div>
            <div className="cursor-copy mr-2">
              <CopyButton
                icon="/images/tokenDetail/icon-copy.webp"
                className="w-[10px] min-w-[10px] h-[10px]"
                text={token.token}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="text-right">
        <MarketDisplay
          value={parseNumber(token.marketcap)}
          className={'text-title text-[calc(1rem*(13/16))] leading-[calc(1rem*(13/16))] font-bold mb-1'}
        />
        <p className="text-[calc(1rem*(10/16))] leading-[calc(1rem*(10/16))] text-(--text-tertiary) whitespace-nowrap">
          {t('listCoin.columns.marketCap')}
        </p>
      </div>

      <div className="flex-1 sm:flex-2 flex justify-end">
        <PriceChange value={token.price24hChange ? parseFloat(token.price24hChange) : 0} />
      </div>
    </div>
  )
}
