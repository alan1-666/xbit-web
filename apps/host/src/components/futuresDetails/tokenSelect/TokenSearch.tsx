import { IconHeaderSearch } from '@/components/icon'
import useDebounceValue from '@/hooks/useDebounceValue'
import { getUrlParam } from '@/utils/helpers'
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

const URL_PARAM = 'search'

export const TokenSearch = ({
  open,
  setSearch,
  closeDialog,
  isFuturesSearch = false,
}: {
  setSearch: Dispatch<SetStateAction<string>>
  closeDialog: () => void
  currentTab: string
  open: boolean
  isFuturesSearch?: boolean
}) => {
  const { t } = useTranslation()
  const ref = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState<string>('')
  const debounceValue = useDebounceValue(value, 700)

  // Helper functions for URL params
  const setUrlParam = (key: string, value: string) => {
    const url = new URL(window.location.href)
    url.searchParams.set(key, value)
    window.history.pushState({}, '', url.toString())
  }

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
    }
  }, [debounceValue, setSearch])

  useEffect(() => {
    if (open && ref.current) {
      setTimeout(() => {
        ref.current?.focus()
        ref.current?.click()
      }, 100)

      setUrlParam(URL_PARAM, '')
    }
  }, [open])

  // Handle clear search
  const handleClearSearch = () => {
    setValue('')
    setUrlParam(URL_PARAM, '')
  }

  // Handle cancel - clear search and close dialog
  const handleCancel = () => {
    setValue('')
    closeDialog()
    ref.current?.blur()
  }

  return (
    <div className="flex justify-center sticky top-0 z-10">
      <div className="group w-full flex items-center">
        <div
          className={`rounded-full transition-all duration-300 flex-1`}
        >
          <div className="bg-[#ECECED]/8 rounded-full py-2 px-[15px] inline-flex items-center w-full transition-all duration-300">
            <IconHeaderSearch className="mr-1.5 text-white" />
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
              className="w-full h-full bg-transparent outline-none text-[14px] text-white placeholder:text-[#FFFFFF80]"
              placeholder={isFuturesSearch ? t('tokenSearchDrawer.placeholderInput') : t('history.searchToken')}
              inputMode="search"
              autoFocus={isFuturesSearch}
            />
            {value.length > 0 && (
              <img
                className="size-[calc(1rem*(14/16))] cursor-pointer"
                src="/images/icons/circle-cancel.svg"
                alt=""
                onClick={handleClearSearch}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
