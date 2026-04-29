import DrawerCheckSelect from '@/components/common/DrawerCheckSelect'
import { useGetFollowedAddressesLatestPositions } from '@/hooks/useGetFollowedAddressesLatestPositions'
import { useGetFollowedTokenPosition } from '@/hooks/useGetFollowedTokenPosition'
import { useAddressGroups } from '@/providers/AddressGroupsProvider'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loading } from '@components/common/Loading'
import { EmptyList } from '@/components/discover/EmptyList'
import { AddressCard } from '../components/AddressCard'
import { ReactComponent as AddrMenageIcon } from '@/components/icon/supervisory/addr.svg'
import AddressManagement from './AddressManagement'
import { useResponsive } from '@/hooks/useResponsive'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import { AddAddressDialog } from '../components/AddAddressDialog'

const AddressActivity = () => {
  const { t } = useTranslation()
  const { isDesktop } = useResponsive()
  const navigate = useNavigate()
  const [openAddressManagement, setOpenAddressManagement] = useState<boolean>(false)
  const [openAddAddr, setOpenAddAddr] = useState<boolean>(false)

  const { groupList, selectedGroupId, setSelectedGroupId, isReady, guardGroupSelection } = useAddressGroups()

  const effectiveGroupId = useMemo(() => {
    const fallback = groupList?.[0]?.value
    return selectedGroupId ?? fallback ?? ''
  }, [selectedGroupId, groupList])

  useEffect(() => {
    if (!selectedGroupId && groupList.length > 0) {
      setSelectedGroupId(groupList[0].value)
    }
  }, [groupList, selectedGroupId, setSelectedGroupId])

  useEffect(() => {
    if (!isReady) return
    guardGroupSelection({ toast: true, onceKey: 'DynamicMonitoringPage' })
  }, [isReady, guardGroupSelection])

  const enabled = !!effectiveGroupId

  // 代币动态：10s 刷新 + 不读缓存 + groupId 筛选
  const { data } = useGetFollowedTokenPosition({
    enabled,
    groupId: enabled ? effectiveGroupId : undefined,
  })

  const {
    data: latestPositionsData,
    loading: latestPositionsLoading,
    error: latestPositionsError,
    refetch: refetchLatest,
  } = useGetFollowedAddressesLatestPositions({
    enabled,
    groupId: enabled ? effectiveGroupId : undefined,
  })
  const positionGroups = data?.getFollowedAddressesPositions?.positionGroups ?? []
  const latestPositions = latestPositionsData?.getFollowedAddressesLatestPositions?.positions ?? []

  const onAddressListClick = (coin: string) => {
    if (!coin) return
    navigate(`/futures/${coin.toLowerCase()}`)
  }

  const getLabelByValue = (value: string) => {
    const option = groupList.find((opt) => opt.value === value)
    return option ? option.label : ''
  }

  const handleGroupSeleted = (value: string) => {
    setSelectedGroupId(value)
  }

  // 顶部 coin list：同样不自行排序，跟随服务端顺序
  const coinList = useMemo(() => {
    return positionGroups.map((g) => ({
      icon: '',
      symbol: g.coin,
      follower: g.addressCount ?? 0,
      value: g.totalPositionValue ?? '0',
    }))
  }, [positionGroups])

  const handleAddAddress = async () => {
    setOpenAddAddr(!openAddAddr)
  }

  return (
    <>
      <div className="w-full py-3 inline-flex justify-start items-center gap-2">
        <div className="w-24 h-7 py-[5px] bg-[#18181D] rounded-md flex justify-between items-center">
          <div className="flex w-full justify-start items-center gap-1 overflow-hidden">
            <DrawerCheckSelect
              childrenTrigger={
                <div className="flex items-center bg-[#18181D] px-2 py-[5px] min-w-[92px]  rounded-md text-[#908E9A] app-font-regular gap-1">
                  <div className="cursor-pointer text-[#908E9A] text-[calc(1rem*(12/16))] leading-[calc(1rem*(12/16))]  app-font-regular w-[calc(100%_-_10px)] truncate">
                    {getLabelByValue(selectedGroupId)}
                  </div>
                  <img className="ml-1" src="/images/futuresDetail/select-down-icon.svg" />
                </div>
              }
              maxLabelWidth="100%"
              options={groupList}
              value={selectedGroupId}
              onChange={handleGroupSeleted}
            />
          </div>
        </div>

        <button
          className="h-7 px-2 py-[5px] bg-[#18181D] rounded-md inline-flex justify-between items-center"
          onClick={() => setOpenAddressManagement(true)}
        >
          <div className="flex justify-start items-center gap-1">
            <AddrMenageIcon className="w-4 h-4" />
            <div className="text-center justify-start text-[#908E98] text-xs font-normal font-['Geist'] leading-3">
              {t('smartMoney.supervisory.addressManagement')}
            </div>
          </div>
        </button>
      </div>

      {!isReady ? (
        <div className="h-[300px] w-full grid place-items-center">
          <p className="text-center">{t('smartMoney.supervisory.selectGroupToast')}</p>
          <Loading className="size-7.5" />
        </div>
      ) : (
        <>
          <div className={cn(isDesktop ? 'min-w-0 p-3 rounded-xl border border-[#201E27]' : '')}>
            {isDesktop && (
              <h1 className="text-sm font-semibold leading-5 mb-3">{t('smartMoney.supervisory.addressActivity')}</h1>
            )}

            {latestPositionsError ? (
              <div className="text-red-400 text-center">
                <EmptyList emptyText="Error loading positions" />
              </div>
            ) : latestPositionsLoading ? (
              <div className="h-[200px] w-full grid place-items-center">
                <Loading className="size-7.5" />
              </div>
            ) : latestPositions.length ? (
              <div className="space-y-3">
                {latestPositions.map((p, i) => (
                  <AddressCard
                    key={`${p.address}-${p.coin}-${i}`}
                    data={p}
                    onClick={() => onAddressListClick(p.coin)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
                <EmptyList containerClassName="h-[100px]" />

                <button
                  className="w-auto h-10 px-4 py-2 bg-[#843BEA] rounded-md inline-flex justify-center items-center"
                  onClick={handleAddAddress}
                >
                  <span className="text-white text-sm font-medium leading-5">
                    {t('smartMoney.supervisory.addAddress')}
                  </span>
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {openAddressManagement && <AddressManagement handleBack={() => setOpenAddressManagement(false)} />}
      {openAddAddr && (
        <AddAddressDialog
          open={openAddAddr}
          onOpenChange={setOpenAddAddr}
          onSuccess={async () => {
            try {
              await refetchLatest()
            } catch (e) {
              console.log('e: ', e)
            }
          }}
        />
      )}
    </>
  )
}

export default AddressActivity
