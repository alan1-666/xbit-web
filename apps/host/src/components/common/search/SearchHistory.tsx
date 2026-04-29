import { APP_PATH, CHAIN_SYMBOLS } from '@/lib/constant.ts'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { IconTrash } from '@components/icon/IconTrash.tsx'
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar.tsx'
import { getBlockChainLogo } from '@/utils/helpers.ts'
import { useLayoutEffect, useRef, useState } from 'react'
import { cn, getPath } from '@/lib/utils.ts'

export type SearchHistory = {
  address: string
  name: string
  chainId: number
  logo?: string | null
  type?: 'dex' | 'meme' | 'xstock' | 'address' | 'prediction'
  slug?: string // For prediction events
}

interface SearchHistoryProps {
  searchHistory: SearchHistory[]
  handleClearHistory: () => void
  saveToHistory: (item: SearchHistory, type?: 'dex' | 'meme' | 'xstock' | 'address' | 'prediction') => void
}

export const SearchHistory = (props: SearchHistoryProps) => {
  const { searchHistory, handleClearHistory, saveToHistory } = props
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [expand, setExpand] = useState(false)

  const listRef = useRef<HTMLDivElement>(null)
  const moreRef = useRef<HTMLButtonElement>(null)

  const handleHistoryClick = (item: SearchHistory) => {
    saveToHistory(item, item.type)

    if (item.type === 'prediction' && item.slug) {
      navigate(getPath(APP_PATH.PREDICTION.EVENT_DETAILS, { slug: item.slug }))
    } else {
      navigate(getPath(APP_PATH.MEME_TOKEN_DETAIL, { address: item.address, chain: CHAIN_SYMBOLS[+item.chainId] }), {
        state: { symbol: item.name },
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
    // let childrenWidth = Array.from(children).reduce((acc, cur) => {
    //   if (cur instanceof HTMLDivElement) {
    //     const childWidth = cur.getBoundingClientRect().width + gap
    //     return acc + childWidth
    //   } else {
    //     return acc
    //   }
    // }, 0)

    // console.log(childrenWidth, listWidth)
    // if (childrenWidth <= listWidth * 2) {
    //   moreElement.style.display = 'none'
    // } else {
    //   moreElement.style.display = 'flex'
    // }

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
          // calculate with of row
          const rowWidth = rows[i].reduce((acc, cur) => {
            if (cur instanceof HTMLDivElement) {
              const childWidth = cur.getBoundingClientRect().width + gap
              return acc + childWidth
            } else {
              return acc
            }
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

  if (!searchHistory || searchHistory.length === 0) {
    return null
  }

  return (
    <div>
      <div className="flex justify-between items-center">
        <div className="text-title align-baseline font-bold text-[calc(1rem*(13/16))] leading-[calc(1rem*(13/16))] mb-3">
          {t('search.recent')}
        </div>
        <button
          className="text-[calc(1rem*(10/16))] text-[#FFFFFF99] hover:text-white leading-[calc(1rem*(10/16))]"
          onClick={handleClearHistory}
        >
          <IconTrash className="text-[#878B99]" />
        </button>
      </div>
      <div ref={listRef} className="flex flex-wrap gap-2.5 max-h-[410px]">
        {searchHistory.map((item) => (
          <div
            key={item.address}
            className="flex items-center  pl-1 pr-3 py-1.5 bg-[#232329] hover:bg-[#FFFFFF30] rounded-full cursor-pointer"
          >
            <Avatar className="size-5 bg-[#111111] mr-1">
              <AvatarFallback className="capitalize text-[calc(9rem/16)] bg-[#111111]">
                {item.name.slice(0, 2).toLowerCase()}
              </AvatarFallback>
              <AvatarImage src={item.logo || getBlockChainLogo(item.chainId, item.address)} />
            </Avatar>
            <div
              className=" text-[#FFFFFFD9] text-[calc(1rem*(12/16))] flex items-center"
              onClick={() => handleHistoryClick(item)}
            >
              {item.name}
            </div>
          </div>
        ))}
        <button
          ref={moreRef}
          onClick={() => setExpand((prev) => !prev)}
          className="size-8 hidden items-center justify-center bg-[#232329] hover:bg-[#FFFFFF30] rounded-full cursor-pointer"
        >
          <svg
            width="8"
            height="6"
            viewBox="0 0 8 6"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn('transition', expand ? 'rotate-0' : 'rotate-180')}
          >
            <path
              d="M4.73304 0.790078C4.33737 0.363652 3.66263 0.363653 3.26695 0.790078L0.36286 3.91988C-0.23093 4.55982 0.222916 5.60006 1.0959 5.60006L6.90409 5.60006C7.77708 5.60006 8.23093 4.55982 7.63714 3.91988L4.73304 0.790078Z"
              fill="#CBCDD4"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
