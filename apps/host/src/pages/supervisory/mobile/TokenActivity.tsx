import DrawerCheckSelect from '@/components/common/DrawerCheckSelect'
import { Loading } from '@/components/common/Loading'
import { useGetFollowedTokenPosition } from '@/hooks/useGetFollowedTokenPosition'
import { useHyperliquidActiveAssetCtx } from '@/hooks/useHyperliquidActiveAssetCtx'
import { useAddressGroups } from '@/providers/AddressGroupsProvider'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Tabs, type TabItem } from '@/components/Tabs'
import { TabKey } from '../DynamicMonitoring'
import { CoinCardList } from '../components/CoinCardList'
import { EmptyList } from '@/components/discover/EmptyList'
import { TokenCard } from '../components/TokenCard'
import { AddressList } from '../components/AddressList'
import { ReactComponent as TradeIcon } from '@/components/icon/supervisory/trade.svg'
import { ReactComponent as AddrMenageIcon } from '@/components/icon/supervisory/addr.svg'
import AddressManagement from './AddressManagement'
import { useTranslation } from 'react-i18next'
import { AddAddressDialog } from '../components/AddAddressDialog'

const TokenActivity = () => {
  const { t } = useTranslation()
  const [openAddressManagement, setOpenAddressManagement] = useState<boolean>(false)
  const [tab, setTab] = useState<TabKey>('token')
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
  const { data, loading, error, refetch: refetchTokens } = useGetFollowedTokenPosition({
    enabled,
    groupId: enabled ? effectiveGroupId : undefined,
  })

  const positionGroups = data?.getFollowedAddressesPositions?.positionGroups ?? []
  const coins = useMemo(() => positionGroups.map((x) => x.coin), [positionGroups])
  const assetCtxMap = useHyperliquidActiveAssetCtx({ coins, enabled: coins.length > 0 })

  const TAB_ITEMS = useMemo(
    () =>
      [
        { key: 'token', label: t('smartMoney.supervisory.tokenList') },
        // { key: 'overview', label: '总览看板' },
      ] as const satisfies ReadonlyArray<TabItem<TabKey>>,
    [],
  )

  const getLabelByValue = (value: string) => {
    const option = groupList.find((opt) => opt.value === value)
    return option ? option.label : ''
  }

  const handleGroupSeleted = (value: string) => {
    setSelectedGroupId(value)
  }

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
                <div className="flex items-center bg-[#18181D] px-2 py-[5px] min-w-[92px] rounded-md text-[#908E9A] app-font-regular gap-1">
                  <div className="cursor-pointer text-[#908E9A] text-[calc(1rem*(12/16))] leading-[calc(1rem*(12/16))]  app-font-regular w-[calc(100%_-_10px)] truncate">
                    {getLabelByValue(selectedGroupId)}
                  </div>
                  <img className="ml-1" src="/images/futuresDetail/select-down-icon.svg" />
                </div>
              }
              options={groupList}
              value={selectedGroupId}
              onChange={handleGroupSeleted}
              maxLabelWidth='100%'
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
          <div className="w-full flex items-center gap-4">
            <div className="shrink-0">
              <Tabs className="text-white" value={tab} items={TAB_ITEMS as any} onChange={setTab} />
            </div>
            <div className="flex-1 min-w-0">
              <CoinCardList list={coinList as any} />
            </div>
          </div>

          <div>
            {error ? (
              <div className="text-red-400 text-center">
                <EmptyList emptyText="Error loading token list" />
              </div>
            ) : loading ? (
              <div className="h-full w-full grid place-items-center">
                <Loading className="size-7.5" />
              </div>
            ) : positionGroups && positionGroups.length ? (
              positionGroups.map((group) => {
                const rows = (group.positions ?? []).map((p) => ({
                  address: p.address,
                  token: p.coin,
                  positionType: p.positionType,
                  leverageType: p.leverageType,
                  leverageValue: Number(p.leverageValue ?? 0),
                  entryPx: p.entryPx,
                  liquidationPx: p.liquidationPx,
                  marginUsed: p.marginUsed,
                  positionValue: p.positionValue,
                  unrealizedPnl: p.unrealizedPnl,
                  returnOnEquity: p.returnOnEquity,
                  crossMarginRatio: p.crossMarginRatio,
                  szi: p.szi,
                  coin: p.coin,
                }))

                return (
                  <div className="w-full rounded-lg inline-flex flex-col justify-start items-center border mb-3">
                    <div className="self-stretch rounded-lg flex flex-col justify-start items-start">
                      <TokenCard token={group} assetCtx={assetCtxMap[(group.coin || '')?.toUpperCase()]} />
                    </div>
                    <div className='w-full px-2'>
                      <AddressList data={rows} />
                    </div>
                    
                    <div className="self-stretch px-2 py-3 flex flex-col justify-center items-end gap-2.5">
                      <Link to={`/futures/${group.coin}`} className="self-stretch h-9 px-3 bg-[#843BEA] rounded-[999px] inline-flex justify-center items-center gap-2">
                        <TradeIcon className="w-4 h-4 mr-2" />
                        <div className="justify-center text-white text-xs font-normal font-['Geist'] leading-3">
                          {t('smartMoney.supervisory.goToTrade')}
                        </div>
                      </Link>
                    </div>
                  </div>
                )
              })
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
                await refetchTokens()
              } catch (e) {
                console.log("e: ", e)
              }
          }}
        />
      )}
    </>
  )
}

export default TokenActivity
