import { useState, useEffect, useMemo } from 'react'
import { useSmartMoneyInfinite } from '@/hooks/useSmartMoneyInfinite'
import { SmartMoneySortField } from '@/types/hypertrader.types'
import { TraderCard } from '../Card'
import { formatAddressWallet } from '@/lib/string'
import { IconEmpty } from '@components/icon'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { EmptyList } from '@/components/discover/EmptyList'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { useSelector } from 'react-redux'

type SearchViewProp = {
  periodDays: number
  tagIdsNumber: number[]
  seletecteType: SmartMoneySortField
  handleBack: () => void
}

const STORAGE_KEY = 'smartMoneySearch'

const SearchView = ({ periodDays, tagIdsNumber, seletecteType, handleBack }: SearchViewProp) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [address, setAddress] = useState<string>('')
  const [history, setHistory] = useState<string[]>([])

  const activeWallet = useSelector(_activeWallet)
  const walletAddress = activeWallet.walletAddress

  const storageKey = useMemo(() =>{
    return `${STORAGE_KEY}_${walletAddress}`
  }, [walletAddress])


  const { list } = useSmartMoneyInfinite({
    address: address,
    periodDays: 30,
    recentDays: 1,
    pageSize: 100,
    tagIds: tagIdsNumber.length ? tagIdsNumber : undefined,
    sortBy: seletecteType,
  })

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(storageKey) || '[]')
    setHistory(stored)
  }, [])

  useEffect(() => {
    if (address) {
    }
  }, [list, address])

  const onChange = (value: string) => {
    setAddress(value)
  }

  const onSearch = (value: string) => {
    addSearchRecord(value)
    const updated = JSON.parse(localStorage.getItem(storageKey) || '[]')
    setHistory(updated)
  }

  const cleanHistory = () => {
    localStorage.removeItem(storageKey)
    setHistory([])
    setAddress('')
  }

  const addSearchRecord = (value: string) => {
    if (!value) return
    const records: string[] = JSON.parse(localStorage.getItem(storageKey) || '[]')

    const filtered = records.filter((record) => record !== value)

    filtered.unshift(value)

    const latest = filtered.slice(0, 8)

    localStorage.setItem(storageKey, JSON.stringify(latest))
    setHistory(latest)
  }

  const onCardClick = (addr: string) => {
    addSearchRecord(addr)
    navigate(`/futures/smart-money/${addr}`, { replace: true })
  }

  const onClickClearSearch = () => {
    setAddress('')
  }

  return (
    <div className="fixed inset-0 z-50 py-4 px-3 bg-[#0A0A0A] max-w-[768px] mx-auto">
      <div className="w-full h-11 flex items-center gap-2">
        <div className="flex w-3 h-full items-center justify-center shrink-0">
          <button onClick={handleBack}>
            <img src="/images/smart-money/back.svg" />
          </button>
        </div>
        <div className="flex flex-1 min-w-0 h-full px-4 py-3 bg-[#1D1D22] rounded-[200px] items-center">
          <img src="/images/smart-money/search.svg" className="mr-2 shrink-0" />
          <input
            value={address}
            placeholder={t('smartMoney.search')}
            className="w-full"
            onChange={(e) => onChange(e.target.value.trim())}
            onKeyDown={(e) => e.key === 'Enter' && onSearch(e.currentTarget.value.trim())}
          />

          {address.length > 0 && (
            <img
              className="size-[calc(1rem*(14/16))] cursor-pointer shrink-0"
              src="/images/icons/circle-cancel.svg"
              alt=""
              onClick={onClickClearSearch}
            />
          )}
        </div>
        <button className="shrink-0 whitespace-nowrap text-white" onClick={() => onSearch(address)}>
          {t('smartMoney.search')}
        </button>
      </div>

      {!(address && list.length > 0) && (
        <div className="w-full mt-5 flex flex-col justify-start items-start gap-4">
          <div className="self-stretch inline-flex justify-between items-center">
            <div className="justify-start text-white text-base font-normal font-['Geist'] leading-4">{t('smartMoney.searchHistory')}</div>
            {history.length > 0 && (
              <button onClick={cleanHistory}>
                <img src="/images/smart-money/trash.svg" />
              </button>
            )}
          </div>
          <div className="flex flex-col justify-start items-start gap-2.5">
            <div className="w-full flex flex-wrap gap-x-1.5 gap-y-2">
              {history.map((h) => (
                <button
                  className="h-6 pl-1 pr-2 py-1 bg-[#18181D] rounded-[200px] flex justify-center items-center gap-1"
                  onClick={() => setAddress(h)}
                >
                  <div className="text-white text-xs font-normal font-['Geist'] leading-4">
                    {formatAddressWallet(h.toUpperCase(), 4, 4)}
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="h-[calc(100vh-160px)] w-full grid place-items-center">
            <div className="flex flex-col items-center gap-2 text-white/60 text-center">
              <EmptyList containerClassName="h-[100px]" />
            </div>
          </div>
        </div>
      )}

      {address && list.length > 0 && (
        <div className="flex flex-col mt-5 pb-5 w-full space-y-4 overflow-y-auto h-[calc(100vh-80px)]">
          {list.length > 0 &&
            list.map((item, index) => (
              <div>
                <TraderCard
                  key={item.user_address}
                  id={item.user_address}
                  item={item}
                  commitMode="debounce"
                  onClick={onCardClick}
                  isSearchView={true}
                />
              </div>
            ))}
        </div>
      )}
    </div>
  )
}

export default SearchView
