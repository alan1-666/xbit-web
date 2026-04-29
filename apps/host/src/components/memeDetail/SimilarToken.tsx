import { SearchSimilarData } from '@/@generated/gql/graphql-future.ts'
import { cn, getPath } from '@/lib/utils.ts'
import { TokenAvatar } from '@components/discover/cards/TokenAvatar.tsx'
import { formatAddressWallet } from '@/lib/string.ts'
import { CopyButton } from '@components/common/copy-button.tsx'
import { fShortenNumber } from '@/lib/number.ts'
import { TokenAge } from '@components/listCoin/TokenAge.tsx'
// import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
// import { MouseEvent } from 'react'
import { APP_PATH, CHAIN_SYMBOLS } from '@/lib/constant.ts'
import { getChainId } from '@/lib/blockchain'
import { useAppSelector } from '@/redux/store'

export interface SimilarTokenProps {
  token: SearchSimilarData
  className?: string
}

export const SimilarToken = (props: SimilarTokenProps) => {
  const { token, className } = props
  // const navigate = useNavigate()
  const { t } = useTranslation()
  const activeChain = useAppSelector((state) => state.newWallet.activeChain)
  const address = token.token
  const chainId = getChainId(activeChain)
  const marketCap = token.marketCap ? +token.marketCap : 0

  // const handleClick = (event: MouseEvent) => {
  //   event.stopPropagation()
  //   event.preventDefault()
  //   if (!address || !chainId) return
  //   navigate(getPath(APP_PATH.MEME_TOKEN_DETAIL, { address: address, chain: CHAIN_SYMBOLS[chainId] }))
  // }

  return (
    <a
      className={cn(
        'flex items-stretch p-2.5 gap-2 border-[#ECECED14] border-[0.6px] rounded-[8px] mb-2 cursor-pointer',
        className,
      )}
      // onClick={handleClick}
      href={getPath(APP_PATH.MEME_TOKEN_DETAIL, { address: address, chain: CHAIN_SYMBOLS[chainId] })}
      target="_blank"
      rel="noopener noreferrer"
    >
      <TokenAvatar name={token.symbol} tokenAvatar={token.image ?? ''} className="size-8" />
      <div className="flex-1 text-[calc(12rem/16)] text-white flex flex-col justify-between whitespace-nowrap">
        <div className="flex items-baseline gap-1">
          <div className="font-[450] text-[calc(14rem/16)]">{token.symbol}</div>
          <div className="flex items-center text-[#6C6A74] text-[calc(12rem/16)]">
            {formatAddressWallet(address)}
            <CopyButton icon="/images/icons/ic-copy2.svg" text={address} className="size-4 ml-1" type="tokenAddress" />
          </div>
        </div>
        <div className="flex items-baseline gap-1 text-[calc(12rem/16)]">
          <div className="text-[#6C6A74]">{t('detail.tokenInfo.similarToken.lastTx')}:</div>{' '}
          <TokenAge createdTime={token.lastTxAt} />
        </div>
      </div>
      <div className="flex flex-col justify-between text-[calc(12rem/16)] text-right text-white">
        <div className="text-right whitespace-nowrap">
          {t('listCoin.tooltip.similarTokenMC')}{' '}
          <span className="text-[#FACC14]">{marketCap > 0 ? `$${fShortenNumber(marketCap)}` : '--'}</span>
        </div>
        <div className="text-[calc(12rem/16)] flex items-baseline gap-1 justify-end whitespace-nowrap">
          <div className="text-[#6C6A74]">{t('detail.tokenInfo.similarToken.createdAt')}</div>
          <TokenAge createdTime={token.createdAt} />
        </div>
      </div>
    </a>
  )
}
