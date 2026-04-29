import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { TokenCard } from './components/TokenCard'
import { AddressCard } from './components/AddressCard'
import { AddressList } from './components/AddressList'
import { Tabs, type TabItem } from '@/components/Tabs'
import { CoinCardList } from './components/CoinCardList'
import { ReactComponent as AddrMenageIcon } from '@/components/icon/supervisory/addr.svg'
import FilterSelect from '@/components/common/FilterSelect'
import { useWalletManager } from '@/hooks/useWalletManager'
import { WalletManagerDialog } from './components/WalletManagerDialog'
import { EmptyList } from '@components/discover/EmptyList.tsx'
import { Link } from 'react-router-dom'
import { useAddressGroups } from '@/providers/AddressGroupsProvider'
import { Loading } from '@components/common/Loading'
import { useGetFollowedTokenPosition } from '@/hooks/useGetFollowedTokenPosition'
import { toNum } from '@/utils/smart-money'
import { useHyperliquidActiveAssetCtx } from '@/hooks/useHyperliquidActiveAssetCtx'
import { useGetFollowedAddressesLatestPositions } from '@/hooks/useGetFollowedAddressesLatestPositions'
import { ReactComponent as TradeIcon } from '@/components/icon/supervisory/trade.svg'
import { AddAddressDialog } from './components/AddAddressDialog'

export type TabKey = 'token' | 'overview'

const DynamicMonitoringPage = () => {
  const [tab, setTab] = useState<TabKey>('token')
  const { open, setOpen } = useWalletManager()
  const [openAddAddr, setOpenAddAddr] = useState<boolean>(false)
  const navigate = useNavigate()
  const { groupList, selectedGroupId, setSelectedGroupId, isReady, guardGroupSelection } = useAddressGroups()
  const { t } = useTranslation()

  const effectiveGroupId = useMemo(() => {
    const fallback = groupList?.[0]?.value
    return selectedGroupId ?? fallback ?? ''
  }, [selectedGroupId, groupList])

  // 确保默认选中第一个分组（避免 selectedGroupId 为空导致 skip）
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
  const {
    data,
    loading,
    error,
    refetch: refetchTokens,
  } = useGetFollowedTokenPosition({
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

  // 接口已排序
  const positionGroups = data?.getFollowedAddressesPositions?.positionGroups ?? []
  const coins = useMemo(() => positionGroups.map((x) => x.coin), [positionGroups])
  const assetCtxMap = useHyperliquidActiveAssetCtx({ coins, enabled: coins.length > 0 })
  const latestPositions = latestPositionsData?.getFollowedAddressesLatestPositions?.positions ?? []

  const TAB_ITEMS = useMemo(
    () =>
      [
        { key: 'token', label: t('smartMoney.supervisory.tokenList') },
        // { key: 'overview', label: '总览看板' },
      ] as const satisfies ReadonlyArray<TabItem<TabKey>>,
    [],
  )

  const onAddressListClick = (coin: string) => {
    if (!coin) return
    navigate(`/futures/${coin.toLowerCase()}`)
  }

  const coinList = useMemo(() => {
    return positionGroups.map((g) => ({
      icon: '',
      symbol: g.coin,
      follower: g.addressCount ?? 0,
      value: g.totalPositionValue ?? '0',
    }))
  }, [positionGroups])

  // 右侧地址动态
  const addrInfo = useMemo(() => {
    return positionGroups
      .flatMap((g) =>
        (g.positions ?? []).map((p: any) => ({
          address: p.address,
          side: String(p.positionType || '').toLowerCase(),
          token: p.coin,
          leverage: toNum(p.leverageValue),
          value: toNum(p.positionValue),
          entryPrice: toNum(p.entryPx),
          liqPrice: toNum(p.liquidationPx),
          margin: toNum(p.marginUsed),
          pnl: toNum(p.unrealizedPnl),
          updatedAt: p.updatedAt,
        })),
      )
      .slice(0, 20)
  }, [positionGroups])

  const handleAddAddress = async () => {
    setOpenAddAddr(!openAddAddr)
  }

  return (
    <div className="w-full h-full max-w-full overflow-x-hidden">
      <div className="flex items-center gap-3 p-3">
        <FilterSelect
          options={groupList}
          value={selectedGroupId}
          onValueChange={setSelectedGroupId}
          selectTriggerProps={{ className: 'h-10 w-[200px]' }}
          placeholder={t('smartMoney.supervisory.selectGroup')}
        />

        <Button
          className="mr-3 bg-[#2A283B] text-[13px] text-[#FBFBFB] hover:bg-[#6F3FF5]"
          onClick={() => setOpen(true)}
        >
          <AddrMenageIcon className="w-4 h-4" />
          {t('smartMoney.supervisory.addressManagement')}
        </Button>
      </div>

      {!isReady ? (
        <div className="h-[300px] w-full grid place-items-center">
          <p className="text-center">{t('smartMoney.supervisory.selectGroupToast')}</p>
          <Loading className="size-20" />
        </div>
      ) : (
        <>
          <div className="grid gap-3 w-full h-full" style={{ gridTemplateColumns: 'minmax(0,1fr) 450px' }}>
            {/* 左侧：代币动态 */}
            <div className="min-w-0 flex flex-col gap-3 p-4">
              <h1 className="text-sm font-semibold leading-5 mb-3">{t('smartMoney.supervisory.tokenActivity')}</h1>

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
                    <Loading className="size-20" />
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
                      <div className="mb-3 rounded-lg border border-[#201E27] p-3" key={group.coin}>
                        <TokenCard token={group} assetCtx={assetCtxMap[(group.coin || '')?.toUpperCase()]} />
                        <AddressList data={rows} />
                        <div className="mt-3 text-right">
                          <Link
                            to={`/futures/${group.coin}`}
                            className="inline-flex items-center justify-center h-8 rounded-lg pl-4 pr-5 text-[13px] font-normal text-[#FFF] bg-[#9B2CFC] hover:bg-[#6F3FF5]"
                          >
                            <TradeIcon className="w-4 h-4 mr-2" />
                            {t('smartMoney.supervisory.goToTrade')}
                          </Link>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
                    <EmptyList containerClassName="h-[100px]" />
                    <button
                      className="w-auto h-10 px-4 py-2 bg-[#843BEA] rounded-md inline-flex justify-center items-center"
                      onClick={handleAddAddress}
                    >
                      <div className="text-center justify-center text-white text-sm font-medium font-['Geist'] leading-5">
                        <span>{t('smartMoney.supervisory.addAddress')}</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 右侧地址动态 */}
            <div className="min-w-0 p-3 rounded-lg border border-[#201E27]">
              <h1 className="text-sm font-semibold leading-5 mb-3">{t('smartMoney.supervisory.addressActivity')}</h1>

              {latestPositionsError ? (
                <div className="text-red-400 text-center">
                  <EmptyList emptyText="Error loading positions" />
                </div>
              ) : latestPositionsLoading ? (
                <div className="h-[200px] w-full grid place-items-center">
                  <Loading className="size-14" />
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
                <div className="flex h-[55vh] flex-col items-center justify-center gap-4">
                  <EmptyList containerClassName="h-[100px]" />
                  <button
                    className="w-auto h-10 px-4 py-2 bg-[#843BEA] rounded-md inline-flex justify-center items-center"
                    onClick={handleAddAddress}
                  >
                    <div className="text-center justify-center text-white text-sm font-medium font-['Geist'] leading-5">
                      <span>{t('smartMoney.supervisory.addAddress')}</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <WalletManagerDialog open={open} onOpenChange={setOpen} />
      {openAddAddr && (
        <AddAddressDialog
          open={openAddAddr}
          onOpenChange={setOpenAddAddr}
          onSuccess={async () => {
            try {
              await refetchTokens()
              await refetchLatest()
            } catch (e) {
              console.log("e: ", e)
            }
          }}
        />
      )}
    </div>
  )
}

export default DynamicMonitoringPage
