import { IconHeaderSearch } from '@/components/icon'
import useDebounceValue from '@/hooks/useDebounceValue'
import { cn } from '@/lib/utils'
import { getUrlParam, setUrlParam } from '@/utils/helpers'
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import MobileAdBanner from '@/components/mobile/MobileAdBanner'
import { useFuturesHotSearchText } from '@/hooks/useFuturesHotSearchText'

const URL_PARAM = 'search'

export const TokenSearch = (props: {
  setSearch: Dispatch<SetStateAction<string>>
  closeDialog: () => void
  currentTab: string
  open: boolean
  isPredictionSearch?: boolean
  isFuturesSearch?: boolean
  /** 从 tokenSearchDrawer 进入时不显示 banner */
  hideBanner?: boolean
  board?: 'CONTRACT' | 'MEME' | 'USTOCK'
}) => {
  const {
    open,
    setSearch,
    closeDialog,
    isPredictionSearch = false,
    isFuturesSearch = false,
    hideBanner = false,
    board = 'CONTRACT',
  } = props
  const { t } = useTranslation()
  const ref = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState<string>('')
  const debounceValue = useDebounceValue(value, 700)
  const { hotSearchText, isLoading } = useFuturesHotSearchText({
    board: board,
  })

  useEffect(() => {
    if (!open) {
      return
    }

    if (!ref.current) {
      return
    }

    ref.current.focus()
  }, [open])

  // Initialize value from URL params when component mounts
  useEffect(() => {
    const urlSearchValue = getUrlParam(URL_PARAM).value
    if (urlSearchValue) {
      setValue(urlSearchValue)
    }
  }, [])

  // Update search state and URL params when debounceValue changes
  useEffect(() => {
    setSearch(debounceValue)

    // Set URL param when there's a search value
    if (debounceValue) {
      setUrlParam(URL_PARAM, debounceValue)
    } else {
      // setUrlParam(URL_PARAM, '')
    }
  }, [debounceValue, setSearch])

  useEffect(() => {
    if (open && ref.current) {
      ref.current?.focus()
    }
  }, [open])

  // Handle clear search
  const onClickClearSearch = () => {
    setValue('')
    setUrlParam(URL_PARAM, '')
  }

  // Handle cancel - clear search and close dialog
  const onClickCancel = () => {
    setValue('')
    closeDialog()
    ref.current?.blur()
  }

  return (
    <>
      <div className="sticky top-0 z-10 flex justify-center py-1">
        <div className="group flex w-full items-center">
          <div
            className={`mr-2.5 flex-1 rounded-full p-[1px] transition-all duration-300`}
          >
            <div
              className={cn(
                'inline-flex w-full items-center rounded-full px-3 py-2 transition-all duration-300 h-[32px]',
                isFuturesSearch ? 'bg-[#FFFFFF1A]' : 'bg-[#0A0A0A] border border-[#2B2B33]',
              )}
            >
              <IconHeaderSearch className="mr-1.5 text-white size-4" />

              <input
                ref={ref}
                type="text"
                value={value}
                onChange={(e) => {
                  setValue(e.target.value)
                  if (!e.target.value) {
                    setUrlParam(URL_PARAM, '')
                  }
                }}
                className="h-full w-full bg-transparent text-[13px] text-white outline-none placeholder:text-[#FFFFFF80]"
                placeholder={
                  isPredictionSearch
                    ? 'Search event'
                    : isFuturesSearch
                      ? isLoading
                        ? t('search.loadingPlaceholder')
                        : (hotSearchText ?? t('tokenSearchDrawer.placeholderInput'))
                      : t('tokenSearchDrawer.placeholderInput')
                }
                inputMode="search"
                // autoFocus={delayAutoFocus}
              />
              {value.length > 0 && (
                <img
                  className="size-[calc(1rem*(13/16))] cursor-pointer"
                  src="/images/icons/circle-cancel.svg"
                  alt=""
                  onClick={onClickClearSearch}
                />
              )}
            </div>
          </div>

          <button
            onMouseDown={(e) => {
              e.preventDefault()
              onClickCancel()
            }}
            className={`w-auto translate-x-0 overflow-hidden text-sm font-[350] text-[#908E98] opacity-100 transition-all duration-300`}
          >
            {t('tokenSearchDrawer.cancel')}
          </button>
        </div>
      </div>
      {/* 搜索页的 banner 不要了 */}
      {/* {!hideBanner && <MobileAdBanner size="small" className="mt-2" />} */}
    </>
  )
}
