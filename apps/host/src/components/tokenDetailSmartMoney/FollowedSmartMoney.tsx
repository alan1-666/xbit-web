import { setRealtimeTxFilterAddress } from '@/redux/modules/monitoringPcSlice.ts'
import { useAppDispatch } from '@/redux/store'
import { SmartMoneyFilterType } from '@/types/monitoring.ts'
import { getFirstAndLastFiveChars } from '@/utils/helpers'
import { Drawer, DrawerContent, DrawerHeader, DrawerTrigger } from '@components/ui/drawer.tsx'
import { useActiveWallet } from '@hooks/useActiveWallet.ts'
import { useAllFollowingWallets } from '@hooks/useAllFollowingWallets.ts'
import React, { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { IconCheckCircleSolid, IconSearch } from '../icon'
import { Button } from '../ui/button'
import { DialogTitle } from '../ui/dialog'
import { CopyButton } from '../common/copy-button'
import { WalletAvatar } from '@components/assets/funding/WalletAvatar.tsx'

export interface FollowedSmartMoneyProps {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  setFilter: Dispatch<SetStateAction<SmartMoneyFilterType>>
  listFollowing: string[]
}
export const FOLLOWED_SMART_MONEY = 'FOLLOWED_SMART_MONEY'
export const CACHED_FOLLOWING_LIST = 'CachedFollowedSmartMoney'

export default function FollowedSmartMoney(props: FollowedSmartMoneyProps) {
  const { open, setOpen } = props
  const { t } = useTranslation()
  const activeWallet = useActiveWallet()
  const {
    allFollowingWallets: listFollowings,
    normalizedSelectedItems: filter,
    data: allFollowingData,
  } = useAllFollowingWallets()
  const dispatch = useAppDispatch()

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

  const handleApply = () => {
    if (isSelectedAll) {
      dispatch(setRealtimeTxFilterAddress(undefined))
    } else {
      dispatch(setRealtimeTxFilterAddress(selectedItems))
    }
    setOpen(false)
  }

  const handleCancel = () => {
    setOpen(false)
  }

  useEffect(() => {
    if (!activeWallet?.isConnected) {
      setSelectedItems([])
    }
  }, [activeWallet])

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <div className="rounded-[6px] border-[0.8px] border-[#ECECED1F] flex items-center justify-between gap-[6px] p-2 pr-3 cursor-pointer w-1/3 min-w-36">
          <span className="text-[calc(1rem*(13/16))] leading-3.25 text-[#FFFFFFCC] whitespace-nowrap">
            {t('detail.smartMoney.follow8SmartMoney', {
              length: listFollowings?.length === 0 ? '0' : `${filter?.length}/${listFollowings?.length}`,
            })}
          </span>
          <img src="/images/icons/icon-chevron-down.svg" className="w-[6.67px] h-[4.67px]" alt="" />
        </div>
      </DrawerTrigger>
      <DrawerContent className="w-full max-w-[768px] mx-auto bg-[#232329] border-none rounded-t-[20px]">
        <DrawerHeader className="p-4 pb-2">
          <DialogTitle className="mb-0.5 flex items-center justify-between w-full pb-3">
            <div className="flex gap-2 items-end">
              <span className="text-[calc(18rem/16)] leading-4.5 app-font-medium text-[#FFFFFF]">
                {t('detail.smartMoney.smartMoney')} (<span className="text-[#AB57FF]">{filter.length}</span>/
                {listFollowings.length})
              </span>
            </div>
            <img src="/images/icons/icon-x.svg" className="w-6 h-6 cursor-pointer" onClick={handleClose} alt="" />
          </DialogTitle>
          <div className="group w-full">
            <div className="p-px rounded-full transition-all duration-300 w-full">
              <div className="bg-[#ECECED14] rounded-full h-10 px-4 flex items-center gap-2 w-full border-[0.5px] border-[#ECECED14] group-focus-within:border-[#C8A7FD] transition-all duration-300">
                <input
                  className="bg-transparent border-none outline-none text-[14px] text-white placeholder:text-[#FFFFFF80] w-full"
                  placeholder={t('detail.smartMoney.searchWalletAddress') || 'Search wallet address'}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
                <IconSearch className="w-4 h-4 text-[#9B9B9B]" />
              </div>
            </div>
          </div>
        </DrawerHeader>

        {!searchValue && (
          <div className="px-4">
            <div className="py-3 flex items-center justify-between cursor-pointer group" onClick={onSelectAll}>
              <span className="text-[16px] font-medium text-white">{t('detail.smartMoney.all')}</span>
              {isSelectedAll && <IconCheckCircleSolid className="w-5 h-5 text-[#A851FF]" />}
            </div>
          </div>
        )}

        <div className="px-4 max-h-[60vh] overflow-y-auto no-scrollbar">
          {filteredList.map((item) => {
            const isSelected = selectedItems.includes(item.address)
            return (
              <div
                key={item.address}
                className="py-3 flex items-center justify-between cursor-pointer group border-b last:border-none first:border-t
                border-[linear-gradient(90deg,rgba(236,236,237,0)_0%,rgba(255,255,255,0.04)_10%,rgba(255,255,255,0.06)_50%,rgba(255,255,255,0.04)_90%,rgba(255,255,255,0)_100%)]"
                onClick={() => onSelectItem(item.address)}
              >
                <div className="flex items-center gap-3">
                  <WalletAvatar
                    source={item.avatar}
                    address={item.address}
                    className="size-[36px] block rounded-full"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-[380] text-white leading-5">
                      {item.alias || item.name || getFirstAndLastFiveChars(item.address)}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-[#FFFFFF80] leading-4 font-[330]">
                        {getFirstAndLastFiveChars(item.address)}
                      </span>
                      {/* <img src="/images/icons/icon-copy.webp" className="w-3 h-3 opacity-60" alt="copy" /> */}
                      <CopyButton text={item.address} icon="/images/icons/ic-copy-solid.svg" />
                    </div>
                  </div>
                </div>

                {isSelected && <IconCheckCircleSolid className="w-5 h-5 text-[#A851FF]" />}
              </div>
            )
          })}
        </div>

        <div className="flex items-center justify-between gap-3 p-4 pt-3">
          <Button className="flex-1 rounded-full h-11 bg-[#2B2B33] text-white" onClick={handleCancel}>
            {t('detail.smartMoney.cancel')}
          </Button>
          <Button
            variant="gradient"
            onClick={handleApply}
            disabled={selectedItems.length === 0}
            className="text-[#261236] flex-1 rounded-[50px] h-11"
          >
            {t('detail.smartMoney.confirm')}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
