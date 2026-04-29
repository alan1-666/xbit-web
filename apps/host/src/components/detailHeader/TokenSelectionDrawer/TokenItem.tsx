import { useTranslation } from 'react-i18next'
import { Token } from './types'
import { formatAddressWallet } from '@/lib/string.ts'
import { formatMarketValue, formatPercentageChange } from '@/lib/format.ts'
import LaunchPlatformIcon from '@components/common/Card/LaunchPlatformIcon.tsx'
import { ConfirmCollectModal } from '@components/common/Card/CurrencyListCard.tsx'
import ChainCurrencyIcon from '@components/common/ChainCurrencyIcon.tsx'

/**
 * Props for token item component
 */
interface TokenItemProps {
  token: Token
  onSelect: (token: Token) => void
}

/**
 * Component for displaying a single token in the token list
 */
const TokenItem = ({ token, onSelect }: TokenItemProps) => {
  const { t } = useTranslation()
  const isPriceNegative = token.priceChange < 0

  // Determine gradient background based on price change direction
  const priceChangeGradient = isPriceNegative
    ? 'linear-gradient(48deg, #8420FF 2.71%, #E149F8 93.06%)'
    : 'linear-gradient(48deg, #0085D2 2.71%, #00CE89 93.06%)'

  const handleTokenSelect = () => {
    onSelect(token)
  }

  return (
    <div
      className="w-full border-[#ECECED14] border-solid border-b-[0.5px] flex items-center justify-between gap-2 py-3 
      text-left text-sm text-[#FFFFFF] cursor-pointer"
      onClick={handleTokenSelect}
    >
      <div className="flex items-center gap-2.5 flex-3">
        <div className="w-[26px]">
          <ConfirmCollectModal
            defaultCollect={token.isFavorite ?? false}
            token={token.address}
            tokenSymbol={token.symbol}
          />
        </div>
        <div className="flex items-center gap-[7px]">
          <ChainCurrencyIcon currencyIcon={token.logo} chainIcon={token.chainLogo} name={token.symbol} />
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <span className="font-medium">{token.symbol}</span>
              {token.launchpad && <LaunchPlatformIcon value={token.launchpad} />}
            </div>
            <span className="text-3xs text-[#FFFFFFB2] leading-[12px]">{formatAddressWallet(token.address, 5, 4)}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className="font-medium">{formatMarketValue(token.marketCap ? +token.marketCap : 0, '$')}</span>
        <span className="text-3xs text-[#FFFFFFB2]">{t('tokenSelectionDrawer.marketCap')}</span>
      </div>
      <div className="flex-1 sm:flex-2 flex justify-end items-center">
        <div
          style={{ background: priceChangeGradient }}
          className="w-[70px] rounded py-1.5 px-2 text-center text-[12px]"
        >
          {isPriceNegative ? '' : '+'}
          {formatPercentageChange(+token.priceChange).label}
        </div>
      </div>
    </div>
  )
}

export default TokenItem
