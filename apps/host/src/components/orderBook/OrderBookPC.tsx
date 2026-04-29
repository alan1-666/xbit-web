import { TokenDetail, TradingTransactionInput, TransactionClassification } from '@/@generated/gql/graphql-meme2'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { RealtimeTransaction } from '@/redux/modules/transactionsHistory.slice.ts'
import { ChainIds, DisplayPriceType } from '@/types/enums.ts'
import { IconSortDown, IconSortUp } from '@components/icon'
import IconArrowSwap from '@components/icon/stroke/IconArrowSwap.tsx'
import IconFund from '@components/icon/stroke/IconFund.tsx'
import BaseListOrderBook from '@components/orderBook/BaseListOrderBookPC.tsx'
import ItemLastTransaction from '@components/orderBook/ItemLastTransactionPC.tsx'
import { Button } from '@components/ui/button.tsx'
import { Dialog, DialogContent, DialogFooter, DialogHeader } from '@components/ui/dialog.tsx'
import { TooltipProvider } from '@components/ui/tooltip.tsx'
import { useActiveChainId } from '@hooks/useActiveChain.ts'
import { useGetTotalFollowings } from '@hooks/useGetTotalFollowings.ts'
import { DialogTitle } from '@radix-ui/react-dialog'
import React, { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { TradesPanelPositon } from '@/pages/detail/pc'
import uesDetailTokenTable from '@components/detaiTokenTable/hooks/uesDetailTokenTable.tsx'
import { useAggregatedTradingTransactions } from '@hooks/meme/useAggregatedTradingTransactions.ts'
import { IconPause } from '@components/icon/stroke'
import eventBus from '@/lib/eventBus'

interface OrderBookProps {
  tokenDetail: TokenDetail
  height: number
  tradesPanelPosition: TradesPanelPositon
  setTradesPanelPosition: Dispatch<SetStateAction<TradesPanelPositon>>
}

export const EVENT_MESSAGE_ORDERBOOK_ADDRESS_SELECTED = 'EVENT_MESSAGE_ORDERBOOK_ADDRESS_SELECTED'

const OrderBook: React.FC<OrderBookProps> = ({ tokenDetail, height }) => {
  const { t } = useTranslation()
  const location = useLocation()
  const activeWallet = useSelector(_activeWallet)
  const userAddress = activeWallet?.walletAddress

  const tokenAddress = useMemo(() => {
    const segments = location.pathname.split('/').filter(Boolean)
    return segments.at(-1) || ''
  }, [location.pathname])
  const { data: followings } = useGetTotalFollowings()
  const devAccount = tokenDetail?.creator

  const totalSupply = Number(tokenDetail?.circulatingSupply ?? tokenDetail?.totalSupply)

  // const [currency, setCurrency] = useState<FilterTransactionAmountType>(FilterTransactionAmountType.SOL)
  const { currency, handleChangeCurrency } = uesDetailTokenTable()
  const [priceType, setPriceType] = useState<DisplayPriceType>(DisplayPriceType.MC)
  const [makerFilter, setMakerFilter] = useState<'dev' | 'tracked' | 'you' | 'selected' | undefined>(undefined)
  const [sortBy, setSortBy] = useState<'-timestamp' | '+timestamp'>('-timestamp')
  const [openFilterDialog, setOpenFilterDialog] = useState(false)
  const [addressesSelect, setAddressesSelect] = useState<string>()
  const [inputMarker, setInputMarker] = useState('')
  const [inputMinAmount, setInputMinAmount] = useState('')
  const [inputMaxAmount, setInputMaxAmount] = useState('')

  // const [exclusiveTransactions, setExclusiveTransactions] = useState<KlineExclusiveTx[]>([])

  const scrollRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const activeChainId = useActiveChainId()
  const [pausedAt, setPausedAt] = useState<string>()
  // const [paused, setPaused] = useState<boolean>(false)

  const [maxHeight, setMaxHeight] = useState<number>(0)

  useEffect(() => {
    if (scrollRef.current && height) {
      setMaxHeight(height - 62)
    }

    const handleResize = () => {
      if (scrollRef.current && height) {
        setMaxHeight(height - 62)
      }
    }
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [height])

  const addressesFilter = useMemo(() => {
    // Filter by dev address
    if (makerFilter === 'dev' && devAccount) {
      return devAccount
    }
    // Filter by tracked addresses
    if (makerFilter === 'tracked' && followings) {
      const arr = followings.map((item) => item.address)
      return arr.join(',')
    }
    // Filter by user address
    if (makerFilter === 'you' && userAddress) {
      return userAddress
    }
    // Filter by custom input address
    if (makerFilter === 'selected' && addressesSelect) {
      return addressesSelect
    }
    if (inputMarker) return inputMarker

    // No address filter
    return undefined
  }, [makerFilter, followings, userAddress, devAccount, inputMarker, addressesSelect])
  
  useEffect(() => {
    const handler = ({ data }: { data: { address: string } }) => {
      setAddressesSelect(data?.address)
      setMakerFilter('selected')
    }
    eventBus.on(EVENT_MESSAGE_ORDERBOOK_ADDRESS_SELECTED, handler)
    return () => eventBus.remove?.(EVENT_MESSAGE_ORDERBOOK_ADDRESS_SELECTED, handler)
  }, [])

  const queryInput = useMemo(() => {
    return {
      token: tokenAddress,
      chainId: activeChainId,
      transactionUsdAmountFrom: inputMinAmount ? Number(inputMinAmount) : undefined,
      transactionUsdAmountTo: inputMaxAmount ? Number(inputMaxAmount) : undefined,
      addresses: addressesFilter !== undefined ? addressesFilter : inputMarker ? inputMarker : undefined,
      classification: makerFilter === 'tracked' ? TransactionClassification.Followed : undefined,
    } as TradingTransactionInput
  }, [inputMarker, inputMinAmount, inputMaxAmount, addressesFilter, makerFilter, tokenAddress, activeChainId])

  // const { message: exclusiveTransactionMessage } = useSubscription(
  //   `public/kline/exclusive/${tokenDetail?.chainId}/${tokenAddress}`,
  //   {
  //     shouldSkip: !tokenAddress,
  //     clientOptions: {
  //       qos: 0,
  //     },
  //   },
  // )

  const handleChangePriceType = () => {
    setPriceType((prev) => (prev === DisplayPriceType.PRICE ? DisplayPriceType.MC : DisplayPriceType.PRICE))
  }

  const addressesSet = useMemo(() => {
    if (addressesFilter !== undefined && addressesFilter !== '') {
      return new Set(
        addressesFilter
          .toLowerCase()
          .split(',')
          .map((addr) => addr.trim()),
      )
    }
    if (addressesFilter === '') {
      return new Set<string>()
    }
    return null
  }, [addressesFilter])

  const filterFn = useCallback(
    (tx: RealtimeTransaction) => {
      const min = inputMinAmount ? Number(inputMinAmount) : 0
      const max = inputMaxAmount ? Number(inputMaxAmount) : Infinity
      // Filter by volume
      if (tx.volumeUsd < min || (max !== Infinity && tx.volumeUsd > max)) {
        return false
      }

      // Filter by addresses
      if (addressesSet) {
        if (addressesSet.size === 0) return false
        if (!tx.maker) return false
        if (!addressesSet.has(tx.maker.toLowerCase())) {
          return false
        }
      }

      // return tx.type === RealtimeTransactionType.Buy || tx.type === RealtimeTransactionType.Sell
      return true
    },
    [inputMinAmount, inputMaxAmount, addressesSet],
  )

  const {
    transactions: filteredTransactions,
    loadMore,
    refetch,
    isPending,
    hasNextPage,
  } = useAggregatedTradingTransactions({
    filterFn: filterFn,
    input: queryInput,
  })

  const maxPriceUsd = useMemo(() => {
    if (!filteredTransactions.length) return 0

    return filteredTransactions.slice(0, 20).reduce((max, tx) => {
      const price = Number(tx?.baseAmount) * Number(tx?.usdPrice)
      return price > max ? price : max
    }, 0)
  }, [filteredTransactions])

  const updateOverlayState = () => {
    const parentDiv = scrollRef.current
    if (!parentDiv) return

    const div = parentDiv.querySelector('.rounded-md.overflow-auto')
    if (!div) return
  }

  const handleScrollToBottom = async () => {
    loadMore()
    return true
  }

  useEffect(() => {
    updateOverlayState() // Initial check

    const parentDiv = scrollRef.current
    if (!parentDiv) return
    const div = parentDiv.querySelector('div.rounded-md.overflow-auto')
    if (!div) return

    div.addEventListener('scroll', updateOverlayState)

    const resizeObserver = new ResizeObserver(updateOverlayState)
    resizeObserver.observe(div)

    return () => {
      div.removeEventListener('scroll', updateOverlayState)
      resizeObserver.disconnect()
    }
  }, [])

  // useEffect(() => {
  //   if (exclusiveTransactionMessage) {
  //     try {
  //       const messageStr = exclusiveTransactionMessage?.message?.toString()
  //       if (messageStr) {
  //         const parsedTransactions = JSON.parse(messageStr)as KlineExclusiveTx | KlineExclusiveTx[]
  //         if (Array.isArray(parsedTransactions) && parsedTransactions.length > 0) {
  //           setExclusiveTransactions((prevState) => parsedTransactions.concat(prevState).slice(0, 100))
  //         } else {
  //           console.warn('Exclusive transactions message is not an array:', parsedTransactions)// }
  //         if (Array.isArray(parsedTransactions)) {
  //           setExclusiveTransactions((prevState) => parsedTransactions.concat(prevState).slice(0, 100))
  //         } else {
  //           setExclusiveTransactions((prevState) => [parsedTransactions, ...prevState].slice(0, 100))
  //         }
  //       }
  //     } catch (error) {
  //       console.error('Error parsing exclusive transaction message:', error)
  //     }
  //   }
  // }, [exclusiveTransactionMessage])

  // useEffect(() => {
  //   if (filteredTransactions && filteredTransactions.length > 0) {
  //     filteredTransactions?.forEach((item) => {
  //       if (!item?.isKlineTx) {
  //         const newExclusiveItem = { ...item, txid: item?.txHash, txHash: item.txHash } as KlineExclusiveTx
  //         setExclusiveTransactions((prevState) => [...prevState, newExclusiveItem])
  //       }
  //     })
  //   }
  // }, [filteredTransactions])

  const sortedTransactions = useMemo(() => {
    if (!filteredTransactions) return []
    if (sortBy === '+timestamp') {
      return filteredTransactions.concat([]).reverse()
    }
    return filteredTransactions
  }, [filteredTransactions, sortBy])

  // useEffect(() => {
  //   if (!paused) {
  //     setDisplayedTransactions(sortedTransactions)
  //   }
  // }, [paused, sortedTransactions])

  const handlePause = () => {
    const firstTx = sortedTransactions[0]
    const key = `${firstTx?.txHash}-${firstTx?.eventIndex}`
    setPausedAt(key)
  }

  const handleUnPause = () => {
    setPausedAt(undefined)
  }

  const displayedTransactions = useMemo(() => {
    const index = sortedTransactions.findIndex((tx) => `${tx?.txHash}-${tx?.eventIndex}` === pausedAt)
    if (pausedAt && index !== -1) {
      return sortedTransactions.slice(index)
    }
    return sortedTransactions
  }, [sortedTransactions, pausedAt])

  return (
    <div
      ref={containerRef}
      className="h-full flex flex-col border-[0.5px] border-[#ECECED14] ml-1"
      style={{ height: height }}
    >
      <div ref={scrollRef} className={`relative flex flex-col overflow-y-auto overscroll-contain h-full`}>
        {/* <span
          className={cn(
            'absolute top-1/2 -left-2 -translate-y-1/2 cursor-pointer bg-[#1b1b1d] w-[12px] h-[26px] flex items-center justify-center rounded-[4px] border-[0.5px] border-[#ECECED1F] hover:bg-[#2c2c2e] z-2',
          )}
          onClick={() => setTradesPanelPosition(tradesPanelPosition === 'side' ? 'bottom' : 'side')}
        >
          <img
            src="/images/icons/arrow-left-2.svg"
            alt=""
            className={`w-[6px] transition-transform ${tradesPanelPosition === 'side' ? 'rotate-180' : ''}`}
          />
        </span> */}
        <div className="flex items-center justify-between p-1 border-b-[0.5px] border-[#ECECED1F]">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-[2px] p-1 rounded-[4px] cursor-pointer hover:bg-[#333333]"
              onClick={() => {
                if (!devAccount) {
                  toast.error(t('listCoin.blacklist.devAddressMissing'))
                  return
                }
                setMakerFilter(makerFilter === 'dev' ? undefined : 'dev')
              }}
            >
              <span className="font-[330] text-[13px] text-[#79778C] uppercase leading-none">{t('orderBook.dev')}</span>
              <img
                src={makerFilter === 'dev' ? '/images/icons/icon-filter-solid.svg' : '/images/icons/icon-filter.svg'}
                className="w-[10px] h-[10px]"
                alt=""
              />
            </div>
            <div
              className="flex items-center gap-[2px] p-1 rounded-[4px] cursor-pointer hover:bg-[#333333]"
              onClick={() => setMakerFilter(makerFilter === 'tracked' ? undefined : 'tracked')}
            >
              <span className="font-[330] text-[13px] text-[#79778C] uppercase leading-none">
                {t('orderBook.tracked')}
              </span>
              <img
                src={
                  makerFilter === 'tracked' ? '/images/icons/icon-filter-solid.svg' : '/images/icons/icon-filter.svg'
                }
                className="w-[10px] h-[10px]"
                alt=""
              />
            </div>
            <div
              className="flex items-center gap-[2px] px-2 py-1 rounded-[4px] cursor-pointer hover:bg-[#333333]"
              onClick={() => setMakerFilter(makerFilter === 'you' ? undefined : 'you')}
            >
              <span className="font-[330] text-[13px] text-[#79778C] uppercase leading-none">{t('orderBook.you')}</span>
              <img
                src={makerFilter === 'you' ? '/images/icons/icon-filter-solid.svg' : '/images/icons/icon-filter.svg'}
                className="w-[10px] h-[10px]"
                alt=""
              />
            </div>
          </div>
          {/* <div className="drag-handle grid grid-cols-4 gap-0.5 cursor-grab active:cursor-grabbing z-100 ml-auto mr-1">
            {[...Array(8)].map((_, index) => (
              <div className="h-0.5 w-0.5 rounded-full bg-[#c6c3c3]"></div>
            ))}
          </div> */}
          <div className="flex items-center gap-2">
            {!!pausedAt && <IconPause className="text-[#d9a508]" />}
            <span
              className="flex items-center p-1 rounded-[4px] cursor-pointer hover:bg-[#333333]"
              onClick={() => setOpenFilterDialog(true)}
            >
              <img src="/images/icons/more.svg" className="w-[10px] h-[10px]" alt="" />
            </span>
          </div>
          <Dialog open={openFilterDialog} onOpenChange={setOpenFilterDialog}>
            <DialogContent className="bg-[#232329] border-none max-w-[400px]">
              <DialogHeader className="border-b border-[#ECECED0A] pb-3">
                <DialogTitle>{t('orderBook.filter.title')}</DialogTitle>
              </DialogHeader>
              <div className="mt-3 leading-none">
                <div className="font-[330] text-[12px]">{t('orderBook.filter.makerAddress')}</div>
                <input
                  type="text"
                  className="mt-3 px-2 py-[14px] rounded-md bg-[#141414] w-full font-[330] text-[12px]"
                  placeholder={t('orderBook.filter.makerAddressPlaceHolder')}
                  value={inputMarker}
                  onChange={(e) => setInputMarker(e.target.value)}
                  autoFocus
                />
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div>
                    <div className="mt-3 font-[330] text-[12px]">{t('orderBook.filter.minAmount')} (USD)</div>
                    <input
                      type="number"
                      className="mt-3 px-2 py-[14px] rounded-md bg-[#141414] w-full font-[330] text-[12px]"
                      placeholder={t('orderBook.filter.minAmountPlaceHolder') + ' USD'}
                      value={inputMinAmount}
                      onChange={(e) => setInputMinAmount(e.target.value)}
                    />
                  </div>
                  <div>
                    <div className="mt-3 font-[330] text-[12px]">{t('orderBook.filter.maxAmount')} (USD)</div>
                    <input
                      type="number"
                      className="mt-3 px-2 py-[14px] rounded-md bg-[#141414] w-full font-[330] text-[12px]"
                      placeholder={t('orderBook.filter.maxAmountPlaceHolder') + ' USD'}
                      value={inputMaxAmount}
                      onChange={(e) => setInputMaxAmount(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter className="pt-5 border-t border-[#ECECED14] flex items-center !justify-between">
                <button
                  className="rounded-full h-9 flex items-center gap-1 text-[#FFFFFFB2] font-[380] text-[14px]"
                  onClick={() => {
                    setInputMarker('')
                    setInputMinAmount('')
                    setInputMaxAmount('')
                  }}
                >
                  <img src="/images/icons/reset.svg" className="w-5 h-5" alt="" />
                  {t('button.reset')}
                </button>

                <Button
                  variant="gradient"
                  className="rounded-full h-9 w-[80px] max-w-[80px] font-[380] text-[14px]"
                  onClick={() => {
                    refetch()
                    setOpenFilterDialog(false)
                  }}
                >
                  {t('button.apply')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="pt-2 px-2" onMouseEnter={handlePause} onMouseLeave={handleUnPause}>
          <div className="w-full grid grid-cols-4 bg-[#121214]">
            <div className="flex items-center gap-[2px] select-none cursor-pointer" onClick={handleChangeCurrency}>
              <div className="font-[330] text-[11px] text-[#6C6A74]">{t('detail.tokenDetail.volume')}</div>
              <IconFund className="size-3 text-[#6C6A74]" />
            </div>

            <div className="flex items-center gap-[2px] select-none cursor-pointer" onClick={handleChangePriceType}>
              <div className="font-[330] text-[11px] text-[#6C6A74]">
                {priceType === DisplayPriceType.PRICE ? t('orderBook.price') : t('orderBook.marketCap')}
              </div>
              <IconArrowSwap className="size-2.5 text-[#6C6A74]" />
            </div>

            <div className="flex items-center gap-[2px] min-w-9 select-none">
              <div className="font-[330] text-[11px] text-[#6C6A74]">{t('orderBook.trader')}</div>
            </div>

            <div
              className="flex items-center justify-end gap-[2px] select-none cursor-pointer"
              onClick={() => setSortBy((prev) => (prev === '-timestamp' ? '+timestamp' : '-timestamp'))}
            >
              <div className="font-[330] text-[11px] text-[#6C6A74]">{t('orderBook.time')}</div>
              <div className="flex flex-col">
                <IconSortUp currentColor={sortBy === '+timestamp' ? '#843BEA' : '#6C6A74'} />
                <IconSortDown currentColor={sortBy === '-timestamp' ? '#843BEA' : '#6C6A74'} />
              </div>
            </div>
          </div>
          <TooltipProvider delayDuration={50} disableHoverableContent={false}>
            <BaseListOrderBook
              height={maxHeight}
              loading={isPending}
              hasMore={hasNextPage}
              data={displayedTransactions}
              loadMoreFn={handleScrollToBottom}
              renderItem={(item, index) => (
                <ItemLastTransaction
                  key={item?.txHash || index}
                  chainId={tokenDetail?.chainId as ChainIds}
                  tokenAddress={tokenAddress}
                  transaction={item}
                  currency={currency}
                  maxPriceUsd={maxPriceUsd}
                  totalSupply={totalSupply}
                  priceType={priceType}
                  baseSymbol={tokenDetail?.symbol || ''}
                  exclusive={!item.isKlineTx}
                  exclusiveReason={item.reasonFiltering}
                />
              )}
            />
          </TooltipProvider>
        </div>
      </div>
    </div>
  )
}

export default OrderBook
