import { SmartMoneyAction, Token, TransactionType } from '@/@generated/gql/graphql-future.ts'
import { APP_PATH, CHAIN_EXPLORER_TX_URLS } from '@/lib/constant.ts'
import { formatVolume } from '@/lib/format'
import { formatAddressWallet } from '@/lib/string.ts'
import { cn, getPath } from '@/lib/utils.ts'
import { selectShouldShowMaintenanceNotification } from '@/redux/modules/maintenance.slice'
import { RootState, useAppSelector } from '@/redux/store'
import { SmartMoneyFilterType, TimeframeOption } from '@/types/monitoring.ts'
import { convertToChainType, getChainIdFromName } from '@/utils/chain.ts'
import { formatWalletName } from '@/utils/helpers.ts'
import { formatToTimeAgoI18n } from '@/utils/time.ts'
// import ChainCurrencyIcon from '@components/common/ChainCurrencyIcon.tsx'
import { ColumnDef } from '@tanstack/react-table'
import React, {
  createContext,
  MouseEvent,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'

import TransactionTypeText from '@/components/common/TransactionTypeText'
import LogoWithChain from '@components/common/LogoWithChain.tsx'
import { CopyButton } from '@components/common/copy-button.tsx'
import { QuickBuyButton } from '@components/discover/QuickBuyButton.tsx'
import ListActions6HPc from '@components/monitoring/pc/ListActions6hPc.tsx'
import QuantityRealTimeColumn from '@components/monitoring/pc/QuantityRealTimeColumn.tsx'

import TokenDetailDataTable from '@/components/detaiTokenTable/TokenDetailDataTable'
import { loadFirstPageFromStorage, saveFirstPageToStorage } from '@/utils/storage'
import { Loading } from '@components/common/Loading.tsx'
import { TooltipProvider } from '@components/ui/tooltip.tsx'
import { BlankState } from '@components/v2/ui-shared/components/BlankState.tsx'
import { ConnectWalletCTA } from '@components/v2/ui-shared/components/ConnectWalletCTA.tsx'
import { LinkCTA } from '@components/v2/ui-shared/components/LinkCTA.tsx'
import { SimpleTooltip } from '@components/v2/ui-shared/components/SimpleTooltip.tsx'
import { useActiveChain } from '@hooks/useActiveChain.ts'
import { useActiveWallet } from '@hooks/useActiveWallet.ts'
import { useAllFollowingWallets } from '@hooks/useAllFollowingWallets.ts'
import { useSmartMoneyActions } from '@hooks/useSmartMoneyActions.ts'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { WalletAvatar } from '@components/assets/funding/WalletAvatar.tsx'

// Currency unit
export enum CurrencyType {
  sol = 'sol',
  usd = 'usd',
}
interface CurrencyUnitContextValue {
  currencyUnit: CurrencyType
  setCurrencyUnit: (unit: CurrencyType) => void
  toggleCurrencyUnit: () => void
}

const CurrencyUnitContext = createContext<CurrencyUnitContextValue | undefined>(undefined)

export const CurrencyUnitProvider = ({ children }: { children: ReactNode }) => {
  const [currencyUnit, setCurrencyUnit] = useState<CurrencyType>(CurrencyType.sol)

  const toggleCurrencyUnit = () => {
    setCurrencyUnit((prev) => (prev === CurrencyType.sol ? CurrencyType.usd : CurrencyType.sol))
  }

  return (
    <CurrencyUnitContext.Provider value={{ currencyUnit, setCurrencyUnit, toggleCurrencyUnit }}>
      {children}
    </CurrencyUnitContext.Provider>
  )
}

export const useCurrencyUnit = () => {
  const context = useContext(CurrencyUnitContext)
  if (!context) {
    throw new Error('useCurrencyUnit must be used within CurrencyUnitProvider')
  }
  return context
}

// ---- Helpers ----
const mcColorByType = (type?: TransactionType): string => {
  switch (type) {
    case TransactionType.Sell:
    case TransactionType.Remove:
      return 'text-fall'
    case TransactionType.Buy:
    case TransactionType.Add:
      return 'text-rise'
    default:
      return 'text-[#FFF]'
  }
}

const TableRealtimeTxPcContent = () => {
  const { t } = useTranslation()
  const { currencyUnit, toggleCurrencyUnit } = useCurrencyUnit()

  const filter = useAppSelector((state: RootState) => state?.monitoringPc?.realtimeTx?.filter as SmartMoneyFilterType)
  const activeChain = useActiveChain()
  const activeWallet = useActiveWallet()
  const isShowMaintenanceNotification = useAppSelector(selectShouldShowMaintenanceNotification)
  const { allFollowingWallets, normalizedSelectedItems } = useAllFollowingWallets()

  const normalizedFilter = useMemo(() => {
    if (filter.address && filter.address.length > 0) {
      return {
        ...filter,
        address: normalizedSelectedItems,
      }
    }
    return { ...filter, address: allFollowingWallets }
  }, [filter, allFollowingWallets, normalizedSelectedItems])

  const { data, isFetching, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } = useSmartMoneyActions(
    normalizedFilter,
    convertToChainType(activeChain),
    activeWallet,
  )

  const [openDialog, setOpenDialog] = useState<boolean>(false)
  const [token, setToken] = useState<Token | undefined>(undefined)
  const [txCount, setTxCount] = useState<number | undefined>(undefined)

  const handleOpenDialog = (value: boolean) => {
    setOpenDialog(value)
  }

  const handleClickOpenDialog = (_token: Token, totalSMTx: number) => {
    handleOpenDialog(true)
    setToken(_token)
    setTxCount(totalSMTx)
  }

  // Items from all pages
  const items = useMemo(() => {
    const allItems = data?.pages.flatMap((page) => page.items) ?? []

    // Save first page to storage when available
    if (allItems.length && data?.pages[0]) {
      saveFirstPageToStorage('realtimeTx-firstPage', data.pages[0].items)
    }

    return allItems
  }, [data])

  // Load first page from storage on mount
  useEffect(() => {
    const firstPage = loadFirstPageFromStorage<SmartMoneyAction[]>('realtimeTx-firstPage')
    if (!data && firstPage) {
      // Initial data is handled by react-query if needed
    }
  }, [data])

  // Handle bottom reached for infinite scroll
  const handleBottomReached = useCallback(() => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage()
      return true
    }
    return false
  }, [isFetchingNextPage, hasNextPage, fetchNextPage])

  // Ref to track visible rows
  const visibleRowsRef = useRef<SmartMoneyAction[]>([])

  const handleVisibleRowsChange = useCallback((visibleItems: SmartMoneyAction[]) => {
    visibleRowsRef.current = visibleItems
  }, [])

  // Stable columns
  const columns: ColumnDef<SmartMoneyAction>[] = useMemo<ColumnDef<SmartMoneyAction>[]>(() => {
    return [
      {
        accessorKey: 'timestamp',
        header: () => (
          <div className="min-w-20 pl-4 text-[12px] leading-none font-light text-[#FFFFFF80]">
            {t('detail.holderTable.lastActive')}
          </div>
        ),
        cell: ({ row }) => {
          const ts = row.original?.timestamp
          return (
            <div className="app-font-regular pl-2 text-[12px] leading-none text-[#FFFFFF]">
              <SimpleTooltip content={dayjs(ts).format('YYYY/MM/DD HH:mm:ss')}>
                <span>{formatToTimeAgoI18n(ts)}</span>
              </SimpleTooltip>
            </div>
          )
        },
      },
      {
        accessorKey: 'address',
        header: () => (
          <div className="min-w-5 text-[12px] leading-none font-light text-[#FFFFFF80]">
            {t('monitoring.columns.walletAddress')}
          </div>
        ),
        cell: ({ row }) => {
          const tx = row.original
          const logoUrl = tx?.avatar
          const symbol = tx?.alias && tx?.alias !== '' ? formatWalletName(tx?.alias) : formatAddressWallet(tx?.address)
          const address = tx?.address ?? ''
          const handleClick = (event: MouseEvent) => {
            event.preventDefault()
            event.stopPropagation()
            const url = `${APP_PATH.MEME_WALLET}/${address}?referrer=monitoring_tx`
            window.open(url, '_blank')
          }
          return (
            <div className="flex cursor-pointer items-center gap-2" onClick={handleClick}>
              {/*<ChainCurrencyIcon*/}
              {/*  currencyIcon={logoUrl}*/}
              {/*  avatarClassName="flex items-center justify-center w-[36px] h-[36px] rounded-[8px]"*/}
              {/*  avatarImageClassName="w-full h-full absolute w-full"*/}
              {/*  fallbackImageEnable*/}
              {/*  fallbackNFT={address}*/}
              {/*/>*/}
              <WalletAvatar source={logoUrl} address={address} className="w-9 h-9 rounded-[8px]" rounded={false} />
              <div className="app-font-regular text-[calc(1rem*(16/16))] text-[#FFFFFF]">{symbol}</div>
              <CopyButton text={address} />
            </div>
          )
        },
      },
      {
        accessorKey: 'type',
        header: () => (
          <div className="min-w-15 text-[12px] leading-none font-light text-[#FFFFFF80]">
            {t('detail.tokenDetail.type')}
          </div>
        ),
        cell: ({ row }) => (
          <TransactionTypeText type={row.original?.txType} className="app-font-regular text-[14px] leading-none" />
        ),
      },
      {
        accessorKey: 'token',
        header: () => (
          <div className="min-w-5 text-[12px] leading-none font-light text-[#FFFFFF80]">
            {t('walletDetail.activity.token')}
          </div>
        ),
        cell: ({ row }) => {
          const _token = row.original?.token
          const logoUrl = _token?.logo
          const symbol = _token?.symbol ?? '-'
          const address = _token?.address ?? ''
          const tokenAge = formatToTimeAgoI18n(_token?.createdAt)
          const totalSMTx = row.original?.totalSMTx ?? 0

          const navigate = useNavigate()

          const handleClick = (e: React.MouseEvent) => {
            e?.stopPropagation()
            navigate(
              getPath(APP_PATH.MEME_TOKEN_DETAIL, {
                address: address,
                chain: activeChain,
              }),
              { state: { symbol } },
            )
          }

          return (
            <div className="flex items-center gap-2">
              <div onClick={handleClick}>
                <LogoWithChain
                  logo={logoUrl ?? undefined}
                  chainLogo={undefined}
                  name={symbol}
                  logoClassName="w-[36px] h-[36px] cursor-pointer rounded-[8px]"
                  logoContainerClassName="rounded-[8px]"
                  className="rounded-[8px]"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <div
                    className="app-font-regular cursor-pointer text-[calc(1rem*(16/16))] text-[#FFFFFF]"
                    onClick={handleClick}
                  >
                    {symbol}
                  </div>
                  <CopyButton text={address} />
                </div>
                <div
                  onClick={(event) => {
                    event.stopPropagation()
                    event.preventDefault()
                    handleClickOpenDialog(_token, totalSMTx)
                  }}
                  className="flex items-center gap-1.5 text-[14px] leading-none font-light"
                >
                  <span className="text-[#009C46]">{tokenAge}</span>
                  <span className="cursor-pointer text-[#FFFFFF80] underline">
                    {t('detail.tokenDetail.recentTrades', { hours: 6, count: totalSMTx })}
                  </span>
                </div>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: 'quantity',
        header: () => (
          <div className="flex min-w-20 items-center gap-0.5">
            <span className="text-[12px] leading-none font-light text-[#FFFFFF80]">{t('detail.pool.quantity')}</span>
            <button
              type="button"
              className="flex cursor-pointer items-center gap-0.5 rounded px-0.5 py-1 hover:bg-[#232429]"
              onClick={toggleCurrencyUnit}
              aria-label="Toggle currency unit"
            >
              <span className="w-7.5 uppercase">{currencyUnit !== CurrencyType.usd ? activeChain : 'USD'}</span>
              <img src="/images/icons/icon-change-currency.svg" alt="toggle-currency" />
            </button>
          </div>
        ),
        cell: ({ row }) => <QuantityRealTimeColumn item={row.original} />,
      },
      {
        accessorKey: 'marketValue',
        header: () => (
          <div className="min-w-5 text-[12px] leading-none font-light text-[#FFFFFF80]">
            {t('detail.tokenDetail.marketCap')}
          </div>
        ),
        cell: ({ row }) => {
          const item = row.original
          const usdPrice = item?.usdPrice ?? 0
          const totalSupply = item?.token?.totalSupply ?? 0
          const mc = usdPrice * totalSupply
          return (
            <div className={cn(mcColorByType(item?.txType), 'text-[14px]')}>
              {formatVolume(mc, {
                showCurrency: true,
              })}
            </div>
          )
        },
      },
      {
        accessorKey: 'action',
        header: () => <div className="min-w-5" />,
        cell: ({ row }) => {
          const token = row.original?.token
          const address = row.original?.token?.address
          return (
            <QuickBuyButton
              token={{
                ...token,
                token: address ?? '',
                symbol: token?.symbol ?? '',
              }}
              className="h-7"
            />
          )
        },
      },
    ]
  }, [currencyUnit, t, activeChain, toggleCurrencyUnit])

  const blankStateType = useMemo(() => {
    if (!activeWallet.isConnected) return 'notLogin'
    // if (filter && !isEmptyFilter(filter)) return 'noData'
    if (!items?.length && allFollowingWallets?.length) return 'noData'
    return 'noFollowing'
  }, [activeWallet.isConnected, filter, allFollowingWallets])

  const handleMapTimeFrame = (time: TimeframeOption) => {
    const mapping: Record<TimeframeOption, { value: number; lable: string }> = {
      '1m': {
        value: 1,
        lable: t('monitoring.transactions.minute'),
      },
      '5m': {
        value: 5,
        lable: t('monitoring.transactions.minute'),
      },
      '1h': {
        value: 1,
        lable: t('monitoring.transactions.hour'),
      },
      '6h': {
        value: 6,
        lable: t('monitoring.transactions.hour'),
      },
      '24h': {
        value: 24,
        lable: t('monitoring.transactions.hour'),
      },
    }

    return `${mapping[time].value} ${mapping[time].lable}`
  }

  return (
    <TooltipProvider>
      <TokenDetailDataTable
        containerClassName={cn(
          'border-0 select-none',
          isShowMaintenanceNotification ? 'max-h-[calc(100vh-286px)]' : 'max-h-[calc(100vh-254px)]',
        )}
        tableHeaderRowClassName="!border-0 !bg-[#111] whitespace-nowrap"
        tableHeaderClassName="border-0 text-[#FFFFFF80] text-[11px] z-10 leading-3 app-font-medium"
        tableBodyRowClassName="border-0 even:!bg-[#ECECED0A]"
        tableCellClassName="group-hover:!bg-[#27272a] pt-3 pb-4 first:pl-4 last:pr-4 cursor-pointer"
        loading={isLoading}
        columns={columns}
        data={items}
        onBottomReached={handleBottomReached}
        onVisibleItemsChanged={handleVisibleRowsChange}
        onRowClick={(row) => {
          const tx = row.txHash
          const chainId = getChainIdFromName(convertToChainType(activeChain))
          window.open(`${CHAIN_EXPLORER_TX_URLS[chainId]}/${tx}`, '_blank')
        }}
        allowShowEmptyIcon={false}
      />

      {!isLoading && items.length === 0 && (
        <div className="pt-20">
          {blankStateType === 'notLogin' && (
            <BlankState
              text={t('login.notLogined', {
                name: 'KairoX',
              })}
              cta={<ConnectWalletCTA />}
            />
          )}
          {blankStateType === 'noFollowing' && (
            <BlankState
              text={t('following.empty')}
              className="text-sm"
              cta={
                <LinkCTA
                  to={`${APP_PATH.MEME_SMART_MONEY}?walletType=SmartMoney&tab=topTalents`}
                  text={t('emptyFollowing.cta')}
                />
              }
            />
          )}
          {blankStateType === 'noData' && (
            <BlankState
              text={t('monitoring.transactions.noDataWithValue', {
                time: handleMapTimeFrame(filter.timeframe ?? '6h'),
              })}
            />
          )}
        </div>
      )}
      {isFetching && hasNextPage && (
        <div className="h-30 w-full flex justify-center items-start">
          <Loading />
        </div>
      )}

      <ListActions6HPc open={openDialog} setOpen={handleOpenDialog} token={token} txCount={txCount} />
    </TooltipProvider>
  )
}

const TableRealtimeTxPc: React.FC = () => {
  return (
    <CurrencyUnitProvider>
      <TableRealtimeTxPcContent />
    </CurrencyUnitProvider>
  )
}

export default TableRealtimeTxPc
