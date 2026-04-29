import ChainCurrencyIcon from '@/components/common/ChainCurrencyIcon'
import { SearchHistory as SearchHistoryType } from '@/components/common/search/SearchHistory'
import { APP_PATH, CHAIN_SYMBOLS } from '@/lib/constant.ts'
import { cn, getPath } from '@/lib/utils.ts'
import { routerActions } from '@/redux/modules/router.slice'
import { useAppDispatch } from '@/redux/store'
import { ChainIds } from '@/types/enums'
import { getBlockChainLogo, getBlockchainLogo2 } from '@/utils/helpers'
// import { getAvatarFromAddress } from '@/utils/list-coin-helper'
import { IconTrash } from '@components/icon/IconTrash.tsx'
import { SetStateAction, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { TokenSearchDrawerType } from '.'
import { WalletAvatar } from '@components/assets/funding/WalletAvatar.tsx'
import { NAVIGATIONS } from '@/lib/navigations'

interface SearchHistoryProps {
  type?: TokenSearchDrawerType
  searchHistory: SearchHistoryType[]
  handleClearHistory: () => void
  saveToHistory: (item: SearchHistoryType, type?: 'dex' | 'meme' | 'xstock' | 'address' | 'prediction') => void
  setOpen: (value: SetStateAction<boolean>) => void
  isPC?: boolean
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
        avatarClassName="size-5 m-0"
        avatarImageClassName="size-5"
      />
    </div>
  )
}

export const SearchHistory = (props: SearchHistoryProps) => {
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const { searchHistory, handleClearHistory, saveToHistory, setOpen, isPC } = props
  const navigate = useNavigate()
  const [expand, setExpand] = useState(false)

  const listRef = useRef<HTMLDivElement>(null)
  const moreRef = useRef<HTMLButtonElement>(null)

  const handleHistoryClick = (item: SearchHistoryType) => {
    saveToHistory(item, item?.type)
    if (item.type === 'dex') {
      dispatch(routerActions.setHeaderTab('crypto'))
      navigate(`${APP_PATH.FUTURES}/${item.address}`)
      // navigate(
      //   getPath(APP_PATH.FUTURES, {
      //     address: item.address,
      //     chain: CHAIN_SYMBOLS[+item.chainId],
      //   }),
      // )
    }
    if (item.type === 'meme') {
      console.log('item.type === meme', item)
      dispatch(routerActions.setHeaderTab('meme'))
      navigate(
        getPath(APP_PATH.MEME_TOKEN_DETAIL, {
          address: item.address,
          chain: CHAIN_SYMBOLS[+item.chainId],
        }),
        {
          state: {
            symbol: item.name,
            tokenLogo: item.logo,
            // createdTime: createdTime * 1000,
            address: item.address,
            chainId: CHAIN_SYMBOLS[+item.chainId],
          },
        },
      )
    } else if (item.type === 'xstock') {
      dispatch(routerActions.setHeaderTab('xstocks'))
      navigate(
        getPath(APP_PATH.X_STOCK_DETAIL, {
          address: item.address,
          chain: CHAIN_SYMBOLS[+item.chainId],
        }),
        {
          state: { symbol: item?.name },
        },
      )
    } else if (item.type === 'address') {
      // navigate(`${APP_PATH.MEME_WALLET}/${item.address}`)
      navigate(
        getPath(`${APP_PATH.MEME_WALLET}/${item.address}`, {
          address: item.address,
          chain: CHAIN_SYMBOLS[+item.chainId],
        }),
        {
          state: { symbol: item?.name },
        },
      )
    } else if (item.type === 'prediction' && item.slug) {
      navigate(NAVIGATIONS.prediction.eventDetails(item.slug || ''))
    }
    setOpen(false)
  }

  // 注释：原有的限制显示逻辑已移除，现在全部显示搜索历史
  // const cols = isPC ? 3 : 4
  const maxItems = 15 // 最多显示15条
  // const itemsToShow = expand
  //   ? Math.min(searchHistory.length, maxItems)
  //   : searchHistory.length > 6
  //     ? Math.min(searchHistory.length, cols * 2) - 1
  //     : searchHistory.length
  // const shouldShowMoreButton = searchHistory.length > cols * 2 && searchHistory.length > itemsToShowngth

  // The display of the "More" button no longer needs to be controlled based on the quantity.
  // useLayoutEffect(() => {
  //   const moreElement = moreRef.current
  //   if (!moreElement) return
  //   moreElement.style.display = shouldShowMoreButton ? 'flex' : 'none'
  // }, [shouldShowMoreButton])

  if (!searchHistory || searchHistory.length === 0) {
    return null
  }

  return (
    <div className="py-2">
      <div className="flex justify-between items-center">
        <div
          className={cn('text-title align-baseline app-font-medium text-base leading-4', 'text-[16px] font-[500] mb-3')}
        >
          {isPC ? t('search.HistoricalSearch') : t('tokenSearchDrawer.searchHistory')}
        </div>
        <button
          className="text-[calc(1rem*(10/16))] text-[#FFFFFF99] hover:text-white leading-[calc(1rem*(10/16))]"
          onClick={handleClearHistory}
        >
          <IconTrash className="text-[#878B99]" />
        </button>
      </div>
      <div ref={listRef} className={cn('flex flex-wrap gap-2')}>
        {searchHistory.slice(0, 15).map((item) => (
          <div key={item.address} className="cursor-pointer">
            <div
              className={cn(
                'text-[#FFFFFFD9] text-[calc(1rem*(12/16))] flex items-center',
                isPC && 'text-white text-[calc(1rem*(14/16))] font-[330] bg-[#2B2B33] rounded-[50px] px-2 py-1',
                item.type === 'prediction' && isPC && 'max-w-[200px]',
              )}
              onClick={() => handleHistoryClick(item)}
            >
              {item.type === 'dex' && (
                <>
                  {item.name}/{t('assets.overview.perpetual', { pair: 'USDC' })}
                </>
              )}
              {(item.type === 'xstock' || item.type === 'meme') && (
                <>
                  <RenderImgChain
                    chainId={item.chainId}
                    image={item.logo ?? ''}
                    symbol={item.name}
                    token={item.address}
                  />
                  {item.name}
                </>
              )}
              {item.type === 'address' && (
                <>
                  <WalletAvatar
                    data-avatar-type="wallet"
                    address={item.address}
                    className="size-5 block rounded-full mr-2"
                  />
                  {item.name}
                </>
              )}
              {item.type === 'prediction' && (
                <>
                  {item.logo && <img src={item.logo} alt="" className="size-5 rounded mr-2 object-cover" />}
                  <span className="truncate">{item.name}</span>
                </>
              )}

              {/* <RenderImgChain
                  chainId={item.chainId}
                  image={item.logo ?? ''}
                  symbol={item.name}
                  token={item.address}
                />


              {item.name} */}
            </div>
          </div>
        ))}

        {/* {shouldShowMoreButton && (
          <button
            ref={moreRef}
            onClick={() => setExpand((prev) => !prev)}
            className="cursor-pointer flex justify-start items-center bg-[#2B2B33] rounded-[50px] w-[24px] h-[24px] leading-[24px] mt-[3px]"
          >
            <div className="space-x-2 flex justify-center items-center m-auto">
              {expand ? (
                <>
                  <Text text={t('ai.collapse')} fontSize={12} fontWeight="light" color="#FFFFFF80" />
                  <img src="/images/icons/vector-arrow.svg" className="w-[8.09px] h-[4.05px]" alt="" />
                </>
              ) : (
                <>
                  <Text text={t('tokenSearchDrawer.moreSearch')} fontSize={12} fontWeight="light" color="#FFFFFF80" />
                  <img src="/images/icons/vector-arrow.svg" className="w-[8.09px] h-[4.05px] rotate-180" alt="" />
                </>
              )}
            </div>
          </button>
        )} */}
      </div>
    </div>
  )
}
