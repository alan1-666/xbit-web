import { SmartMoneyAction } from '@/@generated/gql/graphql-future.ts'
import useTimeAgoGlobal from '@/hooks/useTimeAgoGlobal'
import { APP_PATH, CHAIN_EXPLORER_TX_URLS, CHAIN_SYMBOLS } from '@/lib/constant'
import { formatAmount, formatVolume } from '@/lib/format'
import { cn, getPath } from '@/lib/utils'
import { ChainIds, TransactionType } from '@/types/enums.ts'
import { formatWalletName, getBlockChainLogo } from '@/utils/helpers.ts'
import ChainCurrencyIcon from '@components/common/ChainCurrencyIcon.tsx'
import TokenAge from '@components/detailInfo/TokenAge.tsx'
import { QuickBuyButton } from '@components/discover/QuickBuyButton.tsx'
import TxList from '@components/tokenDetailSmartMoney/TxList.tsx'
import dayjs from 'dayjs'
import { HTMLAttributes, MouseEvent, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { CopyButton } from '../common/copy-button'
import { IconChevronDown } from '../icon'
import TransactionTypeText from '../common/TransactionTypeText'

const handleTextColor = (type: string) => {
  switch (type) {
    case TransactionType.Buy:
    case TransactionType.AddLiquidity:
    case 'Buy':
      return 'text-rise'
    case TransactionType.Sell:
    case TransactionType.RemoveLiquidity:
    case 'Sell':
      return 'text-fall'
    default:
      return 'text-white'
  }
}

const iconMap: Record<number, string> = {
  [ChainIds.Solana]: '/images/icons/icon-sol.svg',
  [ChainIds.Ethereum]: '/images/icons/ic-ethereum.png',
  [ChainIds.Bsc]: '/images/icons/ic-bsc.png',
  [ChainIds.Mon]: '/images/icons/chains/ic-monad.svg',
}

export interface SmartMoneyItemProps {
  item: SmartMoneyAction
  chainId?: ChainIds
}

const IconBuy = (props: HTMLAttributes<SVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      d="M12 5.33398C15.68 5.33398 18.6666 8.32065 18.6666 12.0007C18.6666 15.6807 15.68 18.6673 12 18.6673C8.31996 18.6673 5.33329 15.6807 5.33329 12.0007"
      stroke="currentColor"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M5.33277 5.33398L10.7994 10.8007" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M11.3334 8.11328V11.3333H8.11337" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const IconSell = (props: HTMLAttributes<SVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      d="M12 5.33398C8.32004 5.33398 5.33337 8.32065 5.33337 12.0007C5.33337 15.6807 8.32004 18.6673 12 18.6673C15.68 18.6673 18.6667 15.6807 18.6667 12.0007"
      stroke="currentColor"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M12.6666 11.3339L18.1333 5.86719" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M18.6667 8.55398V5.33398H15.4467" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const SmartMoneyItem = (props: SmartMoneyItemProps) => {
  const { item, chainId = ChainIds.Solana } = props
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

  const [open, setOpen] = useState(false)
  const { address, token, timestamp, txType, txHash, avatar } = item

  const handleOnTokenDetail = (e: MouseEvent) => {
    e.stopPropagation()
    navigate(
      getPath(APP_PATH.MEME_TOKEN_DETAIL, {
        address: token?.address,
        chain: CHAIN_SYMBOLS[chainId],
      }),
      {
        state: { symbol: token?.symbol },
      },
    )
  }

  const timeAgo = useTimeAgoGlobal(timestamp, {
    formatFn: (timestampMs) => {
      const lang = i18n.language || 'en'
      const time = dayjs(timestampMs)
      return time.locale(lang).fromNow()
    },
  })

  const marketCap = useMemo(() => {
    if (!token.totalSupply) return '--'
    const price = Number(item.usdPrice)
    const totalSupply = Number(token.totalSupply)
    return formatVolume(price * totalSupply, {
      showCurrency: true,
    })
  }, [item])

  // const [bgBuy, bgSell] = useMemo(() => {
  //   const colorMode = preference.priceChangeColor
  //   const classNames = [
  //     'border-gradient-funding-record-success-item funding-record-success-item-background',
  //     'border-gradient-funding-record-failed-item funding-record-failed-item-background',
  //   ]
  //   if (colorMode === 'normal') {
  //     return classNames
  //   } else {
  //     return [...classNames].reverse()
  //   }
  // }, [preference])

  const getSolscanUrl = useCallback((txHash: string, chainId: ChainIds) => {
    const baseUrls = CHAIN_EXPLORER_TX_URLS[chainId]

    return `${baseUrls}/${txHash}`
  }, [])

  const isBuy = useMemo(() => {
    return [TransactionType.Buy, TransactionType.AddLiquidity].includes(txType.toLocaleLowerCase() as TransactionType)
  }, [txType])

  const handleOpenWallet = (event: MouseEvent) => {
    event.stopPropagation()
    event.preventDefault()
    if (!address) return
    navigate(`${APP_PATH.MEME_WALLET}/${address}?referrer=monitoring_tx`)
  }

  return (
    <div className={cn('rounded-[6px]', ' border-[0.6px] border-[#ECECED14]')}>
      <div
        className={cn('p-2 rounded-t-[6px]', 'rounded-b-[6px] bg-[#0F0F0F] cursor-pointer')}
        onClick={() => {
          if (!txHash) {
            return
          }
          const solscanUrl = getSolscanUrl(txHash, chainId)
          window.open(solscanUrl, '_blank', 'noopener,noreferrer')
        }}
      >
        <span className="text-[calc(1rem*(10/16))] leading-[calc(1rem*(12/16))] text-[#00FFB4] font-normal">
          {timeAgo}
        </span>
        <div className="mt-3 flex items-center justify-between gap-1">
          <div className="flex gap-[5px] flex-1 min-w-0">
            <ChainCurrencyIcon
              currencyIcon={avatar}
              avatarClassName="flex items-center justify-center size-7 rounded-full border-[0.5px] border-[#d3d3d345] shrink-0"
              avatarImageClassName="w-full h-full absolute w-full"
              fallbackImageEnable
              fallbackNFT={address}
            />
            <div className="flex flex-col justify-center gap-1.5 min-w-0">
              <div className="flex items-center gap-1">
                <span
                  onClick={handleOpenWallet}
                  className="text-[calc(1rem*(12/16))] leading-[calc(1rem*(12/16))] font-medium text-[#FFFFFF] truncate"
                >
                  {formatWalletName(address)}
                </span>
                <CopyButton icon="/images/icons/ic-copy.svg" className="!size-3 min-w-3 shrink-0" text={item.address} />
              </div>
              <div className="flex items-center gap-0.5 min-w-0">
                <span
                  className={cn(
                    'text-[calc(1rem*(11/16))] leading-[calc(1rem*(11/16))] shrink-0',
                    handleTextColor(txType),
                  )}
                >
                  <span className="bg-[#ECECED14] px-1 rounded-[2px] mr-1">
                    <TransactionTypeText type={txType} />
                  </span>
                </span>
                <div className="flex items-center gap-1 h-4 bg-[#ECECED14] px-1 rounded-[2px] font-semibold text-[calc(1rem*(11/16))] leading-[calc(1rem*(11/16))] min-w-0">
                  <span className="text-[#FFFFFFCC] hidden @min-[390px]:block shrink-0">
                    {t('detail.tokenDetail.amount')}
                  </span>{' '}
                  <span className="truncate">{formatAmount(+item.nativeAmount)}</span>
                  <img className="size-2.5 shrink-0" alt="" src={iconMap[chainId]} />
                </div>
              </div>
            </div>
          </div>
          <div className="shrink-0">
            {isBuy ? <IconBuy className="h-6 w-6 text-rise" /> : <IconSell className="h-6 w-6 text-fall" />}
          </div>
          <div className="flex gap-[5px] items-center justify-end flex-1 min-w-0 md:gap-3">
            <div className="flex gap-[5px] items-center justify-end min-w-0 flex-1">
              <div onClick={handleOnTokenDetail} className="size-7 shrink-0">
                <ChainCurrencyIcon
                  currencyIcon={token?.logo ?? getBlockChainLogo(chainId, token.address)}
                  name={token.symbol}
                  className="size-7 rounded-[6px] cursor-pointer border-[#2E0066] block"
                  avatarClassName="rounded-[6px] cursor-pointer block ml-0 mt-0"
                  fallbackClassName="size-7 rounded-[6px] cursor-pointer border-[#2E0066]"
                />
              </div>
              <div
                className="flex flex-col justify-center gap-1.5 cursor-pointer min-w-0"
                onClick={handleOnTokenDetail}
              >
                <div className="flex items-center gap-1 min-w-0 justify-end">
                  <span className="text-[calc(1rem*(12/16))] leading-[calc(1rem*(12/16))] text-[#FFFFFF] truncate max-w-[14vw] @min-[390px]:max-w-[100px]">
                    {token?.symbol}
                  </span>
                  <TokenAge
                    createdTime={token.createdAt ? dayjs(token.createdAt * 1000).toISOString() : undefined}
                    className="shrink-0"
                  />
                  <CopyButton icon="/images/icons/ic-copy.svg" className="!size-3 min-w-3 shrink-0" text={token?.address} />
                </div>
                <span className="text-[calc(1rem*(11/16))] leading-[calc(1rem*(11/16))] text-[#FFFFFF80] break-keep truncate text-right">
                  {t('monitoring.transactions.marketcap')} {marketCap}
                </span>
              </div>
            </div>
            <div className="max-w-20 shrink-0">
              <QuickBuyButton
                token={{
                  ...token,
                  token: token.address,
                  symbol: token.symbol,
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <div>
        <div
          className={cn(
            'flex items-center justify-between px-3 py-1.5 bg-[#ECECED14] rounded-b-[6px] border-[0.5px] border-t-0 border-[#ECECED0A] ',
            item?.totalSMTx > 0 ? 'cursor-pointer' : '',
          )}
          onClick={() => setOpen(!open)}
        >
          <div className="flex items-center gap-2">
            <span className="text-[calc(1rem*(12/16))] leading-[calc(1rem*(12/16))] text-[#FFFFFF]">
              {t('detail.tokenDetail.recentTrades', {
                hours: 6,
                count: item?.totalSMTx,
              })}
            </span>
          </div>
          {item?.totalSMTx > 0 && (
            <IconChevronDown className={`transition-transform duration-300 size-4 ${open ? 'rotate-180' : ''}`} />
          )}
        </div>
        <TxList chainId={chainId} open={open} token={item?.token} />
      </div>
    </div>
  )
}

export default SmartMoneyItem
