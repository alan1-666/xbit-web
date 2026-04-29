import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@components/ui/dropdown-menu.tsx'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { IconCheckCircleSolid, IconSearch } from '@components/icon'
import { useTranslation } from 'react-i18next'
import { useAppDispatch } from '@/redux/store'
import { Button } from '@components/ui/button.tsx'
import { setRealtimeTxFilterAddress } from '@/redux/modules/monitoringPcSlice.ts'
import { useAllFollowingWallets } from '@hooks/useAllFollowingWallets.ts'
import { getFirstAndLastFiveChars } from '@/utils/helpers'
import { CopyButton } from '@/components/common/copy-button'
import { WalletAvatar } from '@components/assets/funding/WalletAvatar.tsx'

const FollowedSmDropdown = () => {
  const { t } = useTranslation()

  const dispatch = useAppDispatch()

  const {
    allFollowingWallets: listFollowings,
    normalizedSelectedItems: filter,
    data: allFollowingData,
  } = useAllFollowingWallets()

  const [open, setOpen] = useState<boolean>(false)
  const [selectedItems, setSelectedItems] = useState<string[]>(filter)
  const [searchValue, setSearchValue] = useState('')

  const isSelectedAll = useMemo(() => {
    const followingWallets = listFollowings || []
    return followingWallets.every((wallet) => selectedItems.includes(wallet))
  }, [listFollowings, selectedItems])

  const filteredList = useMemo(() => {
    if (!searchValue) return allFollowingData || []
    const lowerSearch = searchValue.toLowerCase()
    return (allFollowingData || []).filter((item) => {
      const address = item?.address?.toLowerCase() || ''
      const alias = item?.alias?.toLowerCase() || ''
      const name = item?.name?.toLowerCase() || ''
      return address.includes(lowerSearch) || alias.includes(lowerSearch) || name.includes(lowerSearch)
    })
  }, [allFollowingData, searchValue])

  useEffect(() => {
    if (filter === undefined) {
      setSelectedItems(listFollowings || [])
    } else {
      setSelectedItems(filter || [])
    }
  }, [listFollowings, filter, open])

  const onSelectAll = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation()
      event.preventDefault()
      if (isSelectedAll) {
        setSelectedItems([])
      } else {
        setSelectedItems(listFollowings || [])
      }
    },
    [isSelectedAll, listFollowings],
  )

  const onSelectItem = (item: string) => {
    setSelectedItems((prev) => {
      if (prev.includes(item)) {
        return prev.filter((smartMoney) => smartMoney !== item)
      } else {
        return [...prev, item]
      }
    })
  }

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation()
    setOpen(false)
  }

  const handleApply = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isSelectedAll) {
      dispatch(setRealtimeTxFilterAddress(undefined))
    } else {
      dispatch(setRealtimeTxFilterAddress(selectedItems))
    }
    setOpen(false)
  }

  const totalSelected = useMemo(() => {
    if (isSelectedAll) return listFollowings?.length || 0
    return filter?.length || 0
  }, [filter, listFollowings, isSelectedAll])

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <div className="rounded-[6px] border-[0.8px] border-[#212127] flex items-center justify-between gap-[6px] p-2 pr-3 cursor-pointer min-w-40 w-fit max-w-[360px]">
          <span className="text-[calc(1rem*(13/16))] leading-3.25 text-[#FFFFFFCC] whitespace-nowrap truncate">
            {t('detail.smartMoney.follow8SmartMoney', {
              length: listFollowings?.length > 0 ? `${totalSelected}/${listFollowings?.length}` : '0',
            })}
          </span>
          <img src="/images/icons/icon-chevron-down.svg" className="w-[6.67px] h-[4.67px]" alt="" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[360px] bg-[#1a1a1d] border-[#2B2B33] p-0">
        <div className="p-3 pb-0">
          <div className="flex gap-2 items-end pb-3">
            <span className="text-[calc(18rem/16)] leading-4.5 app-font-medium text-[#FFFFFF]">
              {t('detail.smartMoney.smartMoney')} (<span className="text-[#AB57FF]">{filter.length}</span>/
              {listFollowings.length})
            </span>
          </div>
          <div className="group w-full">
            <div className="p-px rounded-full transition-all duration-300 w-full">
              <div className="bg-[#2B2B33] rounded-full h-9 px-3 flex items-center gap-2 w-full border-[0.5px] border-transparent group-focus-within:border-[#C8A7FD] transition-all duration-300">
                <input
                  className="bg-transparent border-none outline-none text-[13px] text-white placeholder:text-[#FFFFFF80] w-full"
                  placeholder={t('detail.smartMoney.searchWalletAddress') || 'Search wallet address'}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
                <IconSearch className="w-3.5 h-3.5 text-[#9B9B9B]" />
              </div>
            </div>
          </div>
        </div>

        {!searchValue && (
          <div className="px-3 pt-2">
            <div
              className="py-2.5 flex items-center justify-between cursor-pointer group hover:bg-[#2B2B33] px-2"
              onClick={onSelectAll}
            >
              <span className="text-[14px] font-medium text-white">{t('detail.smartMoney.all')}</span>
              {isSelectedAll && <IconCheckCircleSolid className="w-5 h-5 text-[#A851FF]" />}
            </div>
          </div>
        )}

        <div className="px-3 max-h-[280px] overflow-auto no-scrollbar pb-2">
          {filteredList.map((item) => {
            const isSelected = selectedItems.includes(item.address)
            return (
              <div
                key={item.address}
                className="py-2.5 flex items-center justify-between cursor-pointer group hover:bg-[#2B2B33] px-2 border-b last:border-none first:border-t
                border-[linear-gradient(90deg,rgba(236,236,237,0)_0%,rgba(255,255,255,0.04)_10%,rgba(255,255,255,0.06)_50%,rgba(255,255,255,0.04)_90%,rgba(255,255,255,0)_100%)]"
                onClick={(e) => {
                  e.stopPropagation()
                  onSelectItem(item.address)
                }}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <WalletAvatar
                    source={item.avatar}
                    address={item.address}
                    className="size-8 block rounded-full shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-[13px] font-[380] text-white leading-5 truncate">
                      {item.alias || item.name || getFirstAndLastFiveChars(item.address)}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] text-[#FFFFFF80] leading-4 font-[330]">
                        {getFirstAndLastFiveChars(item.address)}
                      </span>
                      <CopyButton text={item.address} icon="/images/icons/ic-copy-solid.svg" />
                    </div>
                  </div>
                </div>

                {isSelected && <IconCheckCircleSolid className="w-5 h-5 text-[#A851FF] shrink-0" />}
              </div>
            )
          })}
        </div>

        <div className="flex items-center justify-between gap-2 p-3 pt-2 border-t border-[#2B2B33]">
          <Button className="flex-1 rounded-full h-9 bg-[#2B2B33] text-white hover:bg-[#3E3E46]" onClick={handleCancel}>
            {t('detail.smartMoney.cancel')}
          </Button>
          <Button
            variant="gradient"
            onClick={handleApply}
            disabled={selectedItems.length === 0}
            className="text-[#261236] flex-1 rounded-full h-9"
          >
            {t('detail.smartMoney.confirm')}
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default FollowedSmDropdown
