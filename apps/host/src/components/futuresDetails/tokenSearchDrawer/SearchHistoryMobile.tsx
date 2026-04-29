import ChainCurrencyIcon from '@/components/common/ChainCurrencyIcon'
import { SearchHistory as SearchHistoryType } from '@/components/common/search/SearchHistory'
import { TYPE_CHAIN } from '@/lib/blockchain'
import { APP_PATH, CHAIN_SYMBOLS } from '@/lib/constant.ts'
import ls from '@/lib/local-storage'
import { cn, getPath } from '@/lib/utils.ts'
import { newWalletActions } from '@/redux/modules/newWallet.slice'
import { routerActions } from '@/redux/modules/router.slice'
import { walletActions } from '@/redux/modules/wallet.slice'
import { useAppDispatch } from '@/redux/store'
import { ChainIds } from '@/types/enums'
import { getBlockChainLogo, getBlockchainLogo2 } from '@/utils/helpers'
import { IconTrash } from '@components/icon/IconTrash.tsx'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { TokenSearchDrawerType } from '.'
import { Configs } from '@/const/configs'
import { getAvatarFromAddress } from '@/utils/list-coin-helper'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface SearchHistoryProps {
  type?: TokenSearchDrawerType
  searchHistory: SearchHistoryType[]
  handleClearHistory: () => void
  saveToHistory: (item: SearchHistoryType, type?: 'dex' | 'meme' | 'xstock' | 'address' | 'prediction') => void
}

const RenderImgChain = ({
  chainId,
  token,
  image,
  symbol,
}: {
  chainId: ChainIds
  token: string
  image: string
  symbol: string
}) => {
  const chainLogo = getBlockchainLogo2(chainId)
  const tokenLogo = image ?? getBlockChainLogo(chainId, token)

  return (
    <div className="mr-2">
      <ChainCurrencyIcon
        chainIcon={chainLogo}
        currencyIcon={tokenLogo}
        name={symbol}
        fallbackClassName="bg-secondary size-5"
        avatarClassName="size-[16px] m-0"
        avatarImageClassName="size-[16px]"
      />
    </div>
  )
}

export const SearchHistoryMobile = (props: SearchHistoryProps) => {
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const { searchHistory, handleClearHistory, saveToHistory, type } = props
  const navigate = useNavigate()
  const [expand, setExpand] = useState(false)

  const filteredSearchHistory = useMemo(() => {
    if (Configs.enableSolana()) return searchHistory
    return searchHistory.filter((item) => item.chainId !== ChainIds.Solana)
  }, [searchHistory])

  const listRef = useRef<HTMLDivElement>(null)
  const moreRef = useRef<HTMLButtonElement>(null)

  /**
   * Async avatar cache by address.
   * Key: wallet address
   * Value: image src (already suitable for <img src="...">)
   */
  const [avatarMap, setAvatarMap] = useState<Record<string, string>>({})

  const addressItems = useMemo(
    () => filteredSearchHistory.filter((i) => i.type === 'address' && !!i.address),
    [filteredSearchHistory],
  )

  useEffect(() => {
    if (!addressItems.length) return

    let cancelled = false

    const uniqueAddresses = Array.from(new Set(addressItems.map((i) => i.address)))

    // Load only missing ones
    uniqueAddresses.forEach(async (address) => {
      if (!address) return
      if (avatarMap[address]) return

      try {
        const src = await getAvatarFromAddress(address)
        if (cancelled) return
        setAvatarMap((prev) => {
          // double-check to avoid extra set
          if (prev[address]) return prev
          return { ...prev, [address]: src }
        })
      } catch (e) {
        // keep silent or log
        console.error('getAvatarFromAddress failed:', address, e)
      }
    })

    return () => {
      cancelled = true
    }
    // intentionally NOT depending on avatarMap object (prevents loop)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addressItems])

  const handleHistoryClick = (item: SearchHistoryType) => {
    saveToHistory(item, item?.type)

    if (item.type === 'prediction') {
      console.log('item.slug', item.slug)
      console.log('item.address', item.address)
      console.log('getPath(APP_PATH.PREDICTION.EVENT_DETAILS, { eventId: item.slug || item.address })', getPath(APP_PATH.PREDICTION.EVENT_DETAILS, { eventId: item.slug || item.address }))
      navigate(getPath(`/prediction${APP_PATH.PREDICTION.EVENT_DETAILS}`, { eventId: item.slug || item.address }))
    } else if (item.type === 'meme' || item.type === 'xstock') {
      if (type === TokenSearchDrawerType.CRYPTO) {
        // default switch to chain Sol when click from memeSearch
        const memeChain = ls.get('meme_chain') || TYPE_CHAIN.SOLANA
        // create variable to check if need to block transfer back to chain arb on page DetailToken
        ls.set('disableSwitchChain', true)
        dispatch(walletActions.setActiveChain(memeChain))
        dispatch(newWalletActions.setActiveChain(memeChain))
      }

      if (item.type === 'meme') {
        navigate(
          getPath(APP_PATH.MEME_TOKEN_DETAIL, {
            address: item.address,
            chain: CHAIN_SYMBOLS[+item.chainId],
          }),
          {
            state: {
              symbol: item.name,
              chain: CHAIN_SYMBOLS[item.chainId],
              tokenLogo: item.logo,
              address: item.address,
            },
          },
        )
      } else {
        navigate(
          getPath(APP_PATH.X_STOCK_DETAIL, { address: item.address ?? '', chain: CHAIN_SYMBOLS[+item.chainId] }),
          {
            state: {
              symbol: item.name,
              chain: CHAIN_SYMBOLS[item.chainId],
              tokenLogo: item.logo,
              address: item.address,
            },
          },
        )
      }
    } else if (item.type === 'dex') {
      dispatch(routerActions.setHeaderTab('crypto'))
      navigate(APP_PATH.FUTURES + '/' + item.address)
    } else {
      navigate(`${APP_PATH.MEME_WALLET}/${item.address}?tab=Summary`, {
        state: { fromSearch: true },
      })
    }
  }

  useLayoutEffect(() => {
    const listElement = listRef.current
    const moreElement = moreRef.current
    if (!listElement || !moreElement) return

    const children = listElement.children
    const listWidth = listElement.getBoundingClientRect().width
    const gap = parseInt(getComputedStyle(listElement).gap) || 0

    if (expand) {
      for (let i = 0; i < children.length; i++) {
        const child = children[i]
        if (child instanceof HTMLDivElement) {
          child.style.display = 'flex'
        }
      }
    } else {
      const moreButtonWidth = moreElement.getBoundingClientRect().width
      const availableWidth = listWidth - moreButtonWidth

      const rows: Element[][] = []
      let lastTop = -1
      for (const child of children) {
        if (child instanceof HTMLDivElement) {
          const childTop = child.getBoundingClientRect().top
          if (lastTop != childTop) {
            // new row
            rows.push([child])
          } else {
            // existing row
            const lastRow = rows[rows.length - 1]
            lastRow.push(child)
          }
          lastTop = childTop
        }
      }

      moreElement.style.display = rows.length > 2 ? 'flex' : 'none'

      for (let i = 1; i < rows.length; i++) {
        if (i === 1 && rows.length > 2) {
          // calculate width of row
          const rowWidth = rows[i].reduce((acc, cur) => {
            if (cur instanceof HTMLDivElement) {
              const childWidth = cur.getBoundingClientRect().width + gap
              return acc + childWidth
            }
            return acc
          }, 0)
          if (rowWidth >= availableWidth) {
            // hide last item
            const lastChild = rows[i][rows[i].length - 1]
            if (lastChild instanceof HTMLDivElement) {
              lastChild.style.display = 'none'
            }
          }
        } else if (rows.length > 2) {
          // hide all
          for (const child of rows[i]) {
            if (child instanceof HTMLDivElement) {
              child.style.display = 'none'
            }
          }
        }
      }
    }
  }, [listRef.current, expand])

  if (!filteredSearchHistory || filteredSearchHistory.length === 0) {
    return null
  }

  return (
    <div className="py-3">
      <div className="flex justify-between items-center">
        <div className="text-title align-baseline app-font-regular text-base leading-4">
          {t('search.HistoricalSearch')}
        </div>
        <button
          className="text-[calc(1rem*(10/16))] text-[#FFFFFF99] hover:text-white leading-[calc(1rem*(10/16))]"
          onClick={handleClearHistory}
        >
          <IconTrash />
        </button>
      </div>

      <div ref={listRef} className="flex flex-wrap space-x-1.5 max-h-[410px] mt-[6px]">
        {filteredSearchHistory.map((item) => (
          <div
            key={item.address}
            className=" cursor-pointer mt-[10px] border border-[#25242B] rounded-[4px] h-[24px] text-white text-[calc(1rem*(12/16))] flex items-center app-font-light px-1"
            onClick={() => handleHistoryClick(item)}
          >
            {item.type === 'meme' && (
              <RenderImgChain chainId={item.chainId} image={item.logo ?? ''} symbol={item.name} token={item.address} />
            )}

            {item.type === 'address' && (
              <RenderImgChain
                chainId={item.chainId}
                // IMPORTANT: async loaded src
                image={avatarMap[item.address] ?? ''}
                symbol={item.name}
                token={item.address}
              />
            )}

            {item.type === 'xstock' && (
              <RenderImgChain chainId={item.chainId} image={item.logo ?? ''} symbol={item.name} token={item.address} />
            )}

            {item.type === 'prediction' && (
              <div className="mr-2 flex items-center">
                <Avatar className="size-[16px] mr-1 shrink-0">
                  <AvatarImage src={item.logo || '/images/placeholder-event.png'} className="object-cover" />
                  <AvatarFallback className="text-[10px] bg-[#333]">{item.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="truncate max-w-[120px]">{item.name}</span>
              </div>
            )}

            {item.type === 'dex' ? (
              <>
                {item.name}/{t('assets.overview.perpetual', { pair: 'USDC' })}
              </>
            ) : item.type !== 'prediction' ? (
              <>{item.name}</>
            ) : null}
          </div>
        ))}

        <button ref={moreRef} onClick={() => setExpand((prev) => !prev)} className="cursor-pointer mt-[10px] hidden">
          <div className="rounded-[4px] bg-[#18181D] size-[24px] flex items-center justify-center">
            <img
              src="/images/icons/vector-arrow.svg"
              className={cn('w-[8.09px] h-[4.05px] transition-all duration-300', !expand ? 'rotate-180' : '')}
              alt=""
            />
          </div>
        </button>
      </div>
    </div>
  )
}
