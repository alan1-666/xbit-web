import { TokenDetail } from '@/@generated/gql/graphql-core'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ChainIds } from '@/types/enums.ts'
import { cn } from '@/lib/utils.ts'
import { useAppSelector } from '@/redux/store'
import { priceChain } from '@/redux/modules/price.slice.ts'
import { NumericFormat } from 'react-number-format'
import eventBus from '@/lib/eventBus.ts'
import { EVENT_MESSAGE_OHLC_UPDATED } from '@/datafeeds/dataUpdater.ts'
import { TokenLogo } from '../detailInfo/TokenLogo'
import { getBlockChainLogo } from '@/utils/helpers'

export interface CompareTokenPriceProps {
  tokenDetail: TokenDetail | undefined
}

const CompareTokenPrice = (props: CompareTokenPriceProps) => {
  const { tokenDetail } = props
  const [currentPrice, setCurrentPrice] = useState(0)
  const chain = tokenDetail?.chainId ? Number(tokenDetail?.chainId) : undefined
  const tokenLogo = tokenDetail?.info?.logoUrl ?? getBlockChainLogo(chain as ChainIds, tokenDetail?.address ?? '')
  const tokenSymbol = tokenDetail?.symbol ?? '--'
  const activeChain = useAppSelector((state) => state.newWallet.activeChain)

  useEffect(() => {
    if (tokenDetail?.price) {
      setCurrentPrice(tokenDetail.price)
    }
  }, [tokenDetail])

  useEffect(() => {
    eventBus.on(EVENT_MESSAGE_OHLC_UPDATED, (data: any) => {
      if (data?.data) {
        setCurrentPrice(data?.data.close)
      }
    })
    return () => {
      eventBus.remove(EVENT_MESSAGE_OHLC_UPDATED)
    }
  }, [])

  const [quoteTokenType, setQuoteTokenType] = useState<'usd' | 'native'>('native')
  const quoteToken = useMemo(() => {
    if (!tokenDetail) return undefined
    const chainId = tokenDetail.chainId
    if (chainId === ChainIds.Solana) return 'SOL'
    if (chainId === ChainIds.Ethereum) return 'ETH'
    if (chainId === ChainIds.Bsc) return 'BNB'
    return undefined
  }, [tokenDetail])

  const [fromAmount, setFromAmount] = useState<string>('')
  const [inputFocus, setInputFocus] = useState<'from' | 'to' | null>(null)
  const [toAmount, setToAmount] = useState<string>('')
  const priceNativeToken = useAppSelector(priceChain(activeChain))
  const updateToAmount = useCallback(
    (fromAmount: string) => {
      if (!currentPrice) {
        return
      }
      // Calculate toAmount based on fromAmount and token price
      if (quoteTokenType === 'usd') {
        const price = Number(currentPrice)
        const amount = parseFloat(fromAmount)
        if (!isNaN(price) && !isNaN(amount)) {
          const calculatedToAmount = (amount * price).toFixed(10).replace(/\.?0+$/, '')
          setToAmount(calculatedToAmount)
        } else {
          setToAmount('')
        }
      } else {
        const price = currentPrice / Number(priceNativeToken)
        const amount = parseFloat(fromAmount)
        if (!isNaN(price) && !isNaN(amount)) {
          const calculatedToAmount = (amount * price).toFixed(10).replace(/\.?0+$/, '')
          setToAmount(calculatedToAmount)
        } else {
          setToAmount('')
        }
      }
    },
    [fromAmount, quoteTokenType, tokenDetail, priceNativeToken, currentPrice],
  )

  const updateFromAmount = useCallback(
    (toAmount: string) => {
      // Calculate fromAmount based on toAmount and token price
      if (!currentPrice) {
        return
      }
      if (quoteTokenType === 'usd') {
        const price = Number(currentPrice)
        const amount = parseFloat(toAmount)
        if (!isNaN(price) && !isNaN(amount)) {
          const calculatedFromAmount = (amount / price).toFixed(10).replace(/\.?0+$/, '')
          setFromAmount(calculatedFromAmount)
        } else {
          setFromAmount('')
        }
      } else {
        const price = currentPrice / Number(priceNativeToken)
        const amount = parseFloat(toAmount)
        if (!isNaN(price) && !isNaN(amount)) {
          const calculatedFromAmount = (amount / price).toFixed(10).replace(/\.?0+$/, '')
          setFromAmount(calculatedFromAmount)
        } else {
          setFromAmount('')
        }
      }
    },
    [quoteTokenType, tokenDetail, priceNativeToken, currentPrice],
  )

  const handleFromAmountChange = (value: string) => {
    // remove non-numeric characters
    const numericValue = value.replace(/[^0-9.]/g, '').replace(/\.+/g, '.')
    setFromAmount(numericValue)
    updateToAmount(numericValue)
  }

  const handleToAmountChange = (value: string) => {
    // remove non-numeric characters
    const numericValue = value.replace(/[^0-9.]/g, '')
    setToAmount(numericValue)
    updateFromAmount(numericValue)
  }

  useEffect(() => {
    updateToAmount(fromAmount)
  }, [quoteTokenType, currentPrice, updateToAmount])

  const networkLogo = (quoteToken: 'SOL' | 'ETH' | 'BNB' | undefined) => {
    switch (quoteToken) {
      case 'ETH':
        return '/images/icons/chains/ic-ethereum.svg'
      case 'SOL':
        return '/images/icons/ic-solana.svg'
      case 'BNB':
        return '/images/icons/chains/ic-bnb.svg'
      default:
        return '/images/icons/ic-solana.svg'
    }
  }

  return (
    <div className="relative mt-3.5 flex flex-col items-center gap-2.5 mx-2.5 text-[calc(14rem/16)] text-white bg-[#18181d] px-3 py-2.5 rounded-lg">
      <div
        className={cn(
          'w-full bg-[#212127] flex items-center gap-2 rounded-[4px] relative h-[48px] p-[10px] pr-1 border-[0.5px]',
          inputFocus === 'from' ? 'border-[#C8A7FD]' : 'border-[#343339]',
        )}
      >
        <div className={cn('absolute inset-[1px] bg-[#212127] rounded-[4px] z-0')} />
        <NumericFormat
          allowLeadingZeros
          thousandSeparator=","
          className="flex-1 text-[calc(15rem/16)] app-font-medium"
          value={fromAmount ? Number(fromAmount) : ''}
          onChange={(e) => handleFromAmountChange(e.target.value)}
          onFocus={() => setInputFocus('from')}
          onBlur={() => setInputFocus(null)}
        />
        <div className="flex gap-1 items-center">
          <TokenLogo
            tokenLogo={tokenLogo}
            tokenSymbol={tokenSymbol}
            chainLogo={''}
            className="size-[24px] rounded-full"
            styleAvatarImage="rounded-full border-0"
          />
          <div className="app-font-light text-[calc(15rem/16)] py-1 text-white">{tokenDetail?.symbol ?? '--'}</div>
        </div>
      </div>
      <img
        src="/images/tokenDetail/icon-group-swap.svg"
        className="z-10 w-8 h-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        alt=""
      />
      <div
        className={cn(
          'w-full bg-[#1D1D22] flex items-center gap-2 rounded-[4px] relative h-[48px] p-[10px] pr-1 border-[0.5px]',
          inputFocus === 'to' ? 'border-[#C8A7FD]' : 'border-[#343339]',
        )}
      >
        <div className={cn('absolute inset-[1px] bg-[#212127] rounded-[4px] z-0')} />
        <div className="flex-1">
          <NumericFormat
            allowLeadingZeros
            thousandSeparator=","
            className="w-full text-[calc(15rem/16)] app-font-medium"
            value={toAmount ? Number(toAmount) : ''}
            onChange={(e) => handleToAmountChange(e.target.value)}
            onFocus={() => setInputFocus('to')}
            onBlur={() => setInputFocus(null)}
          />
        </div>
        <div className="flex items-center gap-1 divide-x divide-[#ECECED1F] rounded-[4px] text-[calc(11rem/16)]">
          {/* remove by design 09/29/2025 only show sol */}

          {/* <div
            className={`py-1 px-2 flex items-center gap-1 cursor-pointer ${quoteTokenType === 'usd' ? 'text-[#843BEA]' : ''}`}
            onClick={() => setQuoteTokenType('usd')}
          >
            USD
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M14.3495 6.32095L15.1075 7.11153C15.3168 7.32984 15.3095 7.67648 15.0911 7.88578L8.71362 14C8.49933 14.2055 8.16038 14.2028 7.94941 13.9939L4.69557 10.773C4.48063 10.5602 4.47887 10.2135 4.69163 9.99858L5.46211 9.22023C5.65848 9.0218 5.96901 9.00503 6.18468 9.17097L6.2365 9.21632L8.16274 11.1234C8.26821 11.2278 8.43769 11.2291 8.54484 11.1264L13.5752 6.3046C13.7936 6.09537 14.1402 6.10269 14.3495 6.32095Z"
                fill={quoteTokenType === 'usd' ? '#843BEA' : '#908E98'}
              />
            </svg>
          </div> */}
          <div
            className={`py-1 px-2 flex items-center gap-1 text-[calc(15rem/16)] cursor-pointer app-font-light`}
            onClick={() => setQuoteTokenType('native')}
          >
            <img src={networkLogo(quoteToken)} alt="" className="size-[24px]" />
            {quoteToken}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CompareTokenPrice
