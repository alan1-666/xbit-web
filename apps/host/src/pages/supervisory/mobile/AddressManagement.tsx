import { SmartTabs } from '@/components/common/SmartTabs'
import { EmptyList } from '@/components/discover/EmptyList'
import { useListAddresses } from '@/hooks/useListAddresses'
import { useAddressGroups } from '@/providers/AddressGroupsProvider'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Loading } from '@components/common/Loading.tsx'
import { DataTable } from '@/components/DataTable'
import { AddressResponse } from '../types'
import { walletColumnsFactory } from '../components/WalletManagerDialog/walletColumns'
import { toast } from 'sonner'
import { useDeleteAddress } from '@/hooks/useDeleteAddress'
import { useUpdateAddress } from '@/hooks/useUpdateAddress'
import { useTranslation } from 'react-i18next'
import { ReactComponent as AddAddrIcon } from '@/components/icon/supervisory/add_addr_new.svg'
import { ReactComponent as ImportAddrIcon } from '@/components/icon/supervisory/import_addr_new.svg'
import { AddAddressDialog } from '../components/AddAddressDialog'
import { useResponsive } from '@/hooks/useResponsive'

type AddressManagementProp = {
  handleBack: () => void
}

const AddressManagement = ({ handleBack }: AddressManagementProp) => {
  const { t } = useTranslation()
  const [selectedGroup, setSelectedGroup] = useState('')
  const [openAddAddr, setOpenAddAddr] = useState(false)
  const [openImportAddr, setOpenImportAddr] = useState(false)

  const { isDesktop } = useResponsive()
  const { groupList } = useAddressGroups()
  const { deleteAddress } = useDeleteAddress()
  const { updateAddress } = useUpdateAddress()

  const {
    data: addressList,
    loading: addrListLoading,
    error: addrListError,
    refetch,
  } = useListAddresses({
    groupId: selectedGroup,
    enabled: !!selectedGroup,
  })

  const selectedGroupRef = useRef(selectedGroup)
  useEffect(() => {
    selectedGroupRef.current = selectedGroup
  }, [selectedGroup])

  const addressListRef = useRef<AddressResponse[] | undefined>(addressList)
  useEffect(() => {
    addressListRef.current = addressList
  }, [addressList])

  const [localRows, setLocalRows] = useState<AddressResponse[] | undefined>(addressList)
  useEffect(() => {
    setLocalRows(addressList)
  }, [addressList])

  const refetchRef = useRef(refetch)
  useEffect(() => {
    refetchRef.current = refetch
  }, [refetch])

  useEffect(() => {
    if (!selectedGroup && groupList.length > 0) {
      setSelectedGroup(groupList[0].value)
    }
  }, [groupList, selectedGroup])

  const copyAddressRef = useRef<(text: string) => Promise<void>>()
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

  useEffect(() => {
    copyAddressRef.current = copyAddress
  }, [copyAddress])

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

  const onDeleteRef = useRef(onDelete)
  useEffect(() => {
    onDeleteRef.current = onDelete
  }, [onDelete])

  const onCopy = useCallback(
    async (id: string) => {
      const list = addressListRef.current
      const addr = list?.find((a) => a.id === id)?.address
      if (!addr) {
        toast.error(t('smartMoney.supervisory.addressNotExist'))
        return
      }
      await copyAddressRef.current?.(addr)
    },
    [],
  )

  const onCopyRef = useRef(onCopy)
  useEffect(() => {
    onCopyRef.current = onCopy
  }, [onCopy])

  const onSaveRemark = useCallback(
    async (id: string, nextText: string, address: string) => {
      try {
        await updateAddress({ id, address, remarkName: nextText.trim() || null })

        setLocalRows((prev) =>
          prev?.map((r) => (r.id === id ? { ...r, remarkName: nextText.trim() || null } : r)),
        )

        toast.success(t('notice.confirmSaved'))
      } catch (e) {
        console.error(e)
        toast.error(t('toast.saveFailed'))
      }
    },
    [updateAddress],
  )

  const onSaveRemarkRef = useRef(onSaveRemark)
  useEffect(() => {
    onSaveRemarkRef.current = onSaveRemark
  }, [onSaveRemark])

  const columns = useMemo(() => {
    return walletColumnsFactory({
      t,
      onDelete: (id: string) => onDeleteRef.current?.(id),
      onCopy: (id: string) => onCopyRef.current?.(id),
      onSaveRemark: (id: string, nextText: string, address: string) => onSaveRemarkRef.current?.(id, nextText, address),
    })
  }, [t])

  return (
    <div className="fixed inset-0 z-50 py-4 px-3 bg-[#0A0A0A] w-full max-w-[768px] mx-auto">
      <div className="w-full h-11 relative flex items-center gap-2 overflow-hidden">
        <div className="flex w-3 h-full items-center justify-center">
          <button onClick={handleBack}>
            <img src="/images/smart-money/back.svg" />
          </button>
        </div>
        <div className="flex w-full h-full px-4 py-3 justify-center items-center">{t('smartMoney.supervisory.addressManagement')}</div>
      </div>

      <div className="w-full inline-flex flex-col justify-start items-start gap-4">
        <div className="justify-start text-base font-medium font-['PingFang_SC'] leading-4">{t('smartMoney.supervisory.followAddress')}</div>
        <div className="inline-flex w-full justify-start items-start gap-1">
          <SmartTabs value={selectedGroup} onChange={setSelectedGroup} options={groupList} />
        </div>
      </div>

      <div className="mt-4 flex-1 max-h-[calc(100%-170px)] min-h-0 overflow-auto">
        {addrListError ? (
          <EmptyList emptyText="Error loading addresses." />
        ) : addrListLoading ? (
          <div className="h-full w-full grid place-items-center">
            <Loading className="size-7.5" />
          </div>
        ) : (
          <DataTable<AddressResponse> columns={columns} data={localRows} maxHeight={'calc(100% - 170px)'} />
        )}
      </div>

      <div className="w-full pt-2 bg-[#0a0a0a] inline-flex flex-col justify-start items-start gap-3">
        <div className="self-stretch px-3 inline-flex justify-start items-start gap-2.5">
          <button 
            className="flex-1 h-10 px-3 bg-[#2B2B33] rounded-md flex justify-center items-center gap-1"
            onClick={() => setOpenAddAddr(true)}
          >
            <AddAddrIcon />
            <div className="justify-center text-xs font-medium font-['Geist'] leading-3">
              {t('smartMoney.supervisory.addAddress')}
            </div>
          </button>
          <div className="flex-1 h-10 px-3 bg-[#2B2B33] rounded-md flex justify-center items-center gap-1">
            <ImportAddrIcon />
            <button 
              className="justify-center text-xs font-medium font-['Geist'] leading-3"
              onClick={() => setOpenImportAddr(true)}
            >
              {t('smartMoney.supervisory.importExport')}
            </button>
          </div>
        </div>
      </div>

        {openAddAddr && (
          <AddAddressDialog
            open={openAddAddr}
            onOpenChange={() => setOpenAddAddr(false)}
            onSuccess={async () => {
              await refetch()
            }}
          />
        )}
        {openImportAddr && (
          <AddAddressDialog
            defaultTab='export'
            open={openImportAddr}
            onOpenChange={() => setOpenImportAddr(false)}
            onSuccess={async () => {
              await refetch()
            }}
          />
        )}

    </div>
  )
}

export default AddressManagement
