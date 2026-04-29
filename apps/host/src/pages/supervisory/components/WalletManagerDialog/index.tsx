import { useState, useEffect, useMemo, useRef, useCallback, memo } from 'react'
import { useTranslation } from 'react-i18next'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { SmartTabs } from '@/components/common/SmartTabs'
import { DataTable } from '@/components/DataTable'
import { Loading } from '@components/common/Loading.tsx'
import { EmptyList } from '@components/discover/EmptyList.tsx'
import { ReactComponent as AddAddrIcon } from '@/components/icon/supervisory/add_addr_new.svg'
import { ReactComponent as ImportAddrIcon } from '@/components/icon/supervisory/import_addr_new.svg'
import { AddAddressDialog } from '../AddAddressDialog'
import { useAddressGroups } from '@/providers/AddressGroupsProvider'
import { useListAddresses } from '@/hooks/useListAddresses'
import type { AddressResponse } from '../../types'
import { walletColumnsFactory } from './walletColumns'
import { useDeleteAddress } from '@/hooks/useDeleteAddress'
import { useUpdateAddress } from '@/hooks/useUpdateAddress'
import { toast } from 'sonner'

type Props = {
  open: boolean
  onOpenChange: (v: boolean) => void
}

export const WalletManagerDialog = memo(function WalletManagerDialog({ open, onOpenChange }: Props) {
  const { t } = useTranslation()
  const [openAddAddr, setOpenAddAddr] = useState(false)
  const [openImportAddr, setOpenImportAddr] = useState(false)

  const { groupList } = useAddressGroups()
  const [selectedGroup, setSelectedGroup] = useState('')

  useEffect(() => {
    if (!selectedGroup && groupList.length > 0) {
      setSelectedGroup(groupList[0].value)
    }
  }, [groupList, selectedGroup])

  const {
    data: addressList,
    loading: addrListLoading,
    error: addrListError,
    refetch,
  } = useListAddresses({
    groupId: selectedGroup,
    enabled: open && !!selectedGroup,
  })

  const { deleteAddress } = useDeleteAddress()
  const { updateAddress } = useUpdateAddress()

  const addressListRef = useRef<AddressResponse[] | undefined>(addressList)
  useEffect(() => {
    addressListRef.current = addressList
  }, [addressList])

  const selectedGroupRef = useRef(selectedGroup)
  useEffect(() => {
    selectedGroupRef.current = selectedGroup
  }, [selectedGroup])

  const refetchRef = useRef(refetch)
  useEffect(() => {
    refetchRef.current = refetch
  }, [refetch])

  const copyAddress = useCallback(async (text: string) => {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      toast.success(t('toast.copiedSuccess'))
    } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
      toast.success(t('toast.copiedSuccess'))
    }
  }, [])

  const onDelete = useCallback(
    async (id: string) => {
      const g = selectedGroupRef.current
      if (!g) {
        toast.error(t('smartMoney.supervisory.unfollowedToast'))
        return
      }

      try {
        const ok = await deleteAddress(id, g)
        if (ok) {
          toast.success(t('smartMoney.supervisory.unfollowedSuccessfully'))
          await refetchRef.current?.()
        } else {
          toast.error(t('smartMoney.supervisory.failedUnfollow'))
        }
      } catch (e) {
        console.error(e)
        toast.error(t('smartMoney.supervisory.failedUnfollow'))
      }
    },
    [deleteAddress],
  )

  const onCopy = useCallback(
    async (id: string) => {
      const list = addressListRef.current
      const addr = list?.find((a) => a.id === id)?.address
      if (!addr) {
        toast.error(t('smartMoney.supervisory.addressNotExist'))
        return
      }
      await copyAddress(addr)
    },
    [copyAddress],
  )

  const onSaveRemark = useCallback(
    async (id: string, nextText: string, address: string) => {
      try {
        await updateAddress({
          id,
          address,
          remarkName: nextText.trim() || null,
        })
        toast.success(t('notice.confirmSaved'))
        await refetchRef.current?.()
      } catch (e) {
        console.error(e)
        toast.error(t('toast.saveFailed'))
      }
    },
    [updateAddress],
  )

  const columns = useMemo(() => {
    return walletColumnsFactory({
      t,
      onDelete,
      onCopy,
      onSaveRemark,
    })
  }, [t, onDelete, onCopy, onSaveRemark])

  // console.log('selectedGroup', selectedGroup)
  // console.log('addressList', addressList)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showDialogPrimitiveClose={false}
        className="
          max-w-[880px] min-w-[500px]
          p-6 bg-[#191A1F] text-white rounded-xl
          flex flex-col
          h-[500px] max-h-[500px]
        "
      >
        <DialogHeader className="shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">{t('smartMoney.supervisory.addressManagement')}</DialogTitle>

            <button
              type="button"
              onClick={() => onOpenChange?.(false)}
              className="p-2 rounded-lg hover:bg-white/5 text-white/70 hover:text-white"
              aria-label="Close"
            >
              <span className="text-2xl leading-none">×</span>
            </button>
          </div>
        </DialogHeader>

        <div className="shrink-0 flex justify-between items-center">
          <div>
            <h3>{t('smartMoney.supervisory.followAddress')}</h3>
          </div>
          <div className="flex gap-2 mt-4">
            <div className="flex gap-2 mt-4">
              <button
                className="flex items-center gap-1 px-3 py-1.5 bg-[#2b2c34] rounded-md text-[13px] hover:bg-[#6F3FF5]"
                onClick={() => setOpenAddAddr(true)}
              >
                <AddAddrIcon />
                <span>{t('smartMoney.supervisory.addAddress')}</span>
              </button>
              <button
                className="flex items-center gap-1 px-3 py-1.5 bg-[#2b2c34] rounded-md text-[13px] hover:bg-[#6F3FF5]"
                onClick={() => setOpenImportAddr(true)}
              >
                <ImportAddrIcon />
                <span>{t('smartMoney.supervisory.importExport')}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="shrink-0 flex min-w-0">
          <SmartTabs value={selectedGroup} onChange={setSelectedGroup} options={groupList} />
        </div>

        <div className="mt-4 flex-1 min-h-0 overflow-auto">
          {addrListError ? (
            <EmptyList emptyText='Error loading addresses.' />
          ) : addrListLoading ? (
            <div className="h-full w-full grid place-items-center">
              <Loading className="size-20" />
            </div>
          ) : (
            <DataTable<AddressResponse> columns={columns} data={addressList} />
          )}
        </div>

        {openAddAddr && (
          <AddAddressDialog
            open={openAddAddr}
            onOpenChange={setOpenAddAddr}
            onSuccess={async () => {
              await refetch()
            }}
          />
        )}
        {openImportAddr && (
          <AddAddressDialog
            open={openImportAddr}
            onOpenChange={setOpenImportAddr}
            defaultTab="export"
            onSuccess={async () => {
              await refetch()
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  )
})
