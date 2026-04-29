import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command'
import { useTxDetail } from '@/hooks/useTxDetail'
import { SOL_ADDRESS } from '@/lib/blockchain.ts'
import { APP_PATH } from '@/lib/constant.ts'
import { formatAddressWallet } from '@/lib/string.ts'
import { cn } from '@/lib/utils.ts'
import { selectShouldShowMaintenanceNotification } from '@/redux/modules/maintenance.slice'
import { useAppSelector } from '@/redux/store'
import { ChainIds, FundingType, TransferStatus, TransferType } from '@/types/enums.ts'
import { getBlockchainLogo2 } from '@/utils/helpers.ts'
import CountdownTimer from '@components/assets/overview/CountdownTimer.tsx'
import { FundingRecord } from '@components/assets/overview/TabFundingRecords.tsx'
import LogoWithChain from '@components/common/LogoWithChain.tsx'
import MoneyFormatted from '@components/common/MoneyFormatted.tsx'
import { IconChevronRight } from '@components/icon'
import { IconDeposit } from '@components/icon/stroke/IconDeposit.tsx'
import { IconSwap } from '@components/icon/stroke/IconSwap.tsx'
import { IconWithdraw } from '@components/icon/stroke/IconWithdraw.tsx'
import { USDC_ADDRESS_HYPERLIQUID } from '@components/transfer/constants.ts'
import { LoadingSpinnerGradient } from '@components/ui/loading-spinner.tsx'
import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover.tsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select.tsx'
import { useFundingRecords } from '@pages/assets/overview/hooks/useFundingRecords.ts'
import { ColumnDefWithMeta, DataTable, DataTableHandle } from '@pages/meme/discover/desktop/components/DataTable.tsx'
import dayjs from 'dayjs'
import { Check, ChevronDown } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { getTokenSymbol } from '@/utils/token.ts'
import { useTokenInfo } from '@/hooks/useTokenInfo'
import {
  getDepositChainLogo,
  getDepositTokenLogo,
  getDepositTokenName,
  getTokenLogoByAddress,
  getUnit,
  isDepositRecord,
  isTransferRecord,
  isWithdrawRecord,
} from '@components/assets/overview/funding-records/utils.ts'
import { useSelector } from 'react-redux'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { useFeatureIsOn } from '@growthbook/growthbook-react'
import { formatAmount } from '@/lib/format'

const TypeIcon = (props: { type: FundingType }) => {
  const { type } = props
  if (type === FundingType.Withdraw || type === FundingType.WithdrawPredictExternal) {
    return <IconWithdraw />
  }
  if (type === FundingType.WithdrawFutureExternal) {
    return <IconWithdraw />
  }
  if (
    type === FundingType.Deposit ||
    type === FundingType.DepositFutureExternal ||
    type === FundingType.DepositPredictExternal
  ) {
    return <IconDeposit />
  }
  if (type === FundingType.Swap) {
    return <IconSwap />
  }
  if (type === FundingType.WithdrawFuture) {
    return <IconSwap />
  }
  if (type === FundingType.DepositFuture) {
    return <IconSwap />
  }
  return null
}

const TypeLabel = (props: { type: FundingType }) => {
  const { type } = props
  const { t } = useTranslation()
  if (type === FundingType.Withdraw || type === FundingType.WithdrawPredictExternal) {
    return t('assets.overview.withdrawal')
  }
  if (type === FundingType.WithdrawFutureExternal) {
    return t('assets.overview.withdrawal')
  }
  if (
    type === FundingType.Deposit ||
    type === FundingType.DepositFutureExternal ||
    type === FundingType.DepositPredictExternal
  ) {
    return t('assets.overview.deposit')
  }
  if (type === FundingType.Swap) {
    return t('assets.overview.transfer')
  }
  if (type === FundingType.WithdrawFuture) {
    return t('assets.overview.transfer')
  }
  if (type === FundingType.DepositFuture) {
    return t('assets.overview.transfer')
  }
  return ''
}

const TypeSubLabel = (props: { record: FundingRecord }) => {
  const { record } = props
  const { t } = useTranslation()
  if (record.type === FundingType.Withdraw || record.type === FundingType.WithdrawPredictExternal) {
    return `${t('assets.transfers.to')}: ${formatAddressWallet(record.from)}`
  }

  if (record.type === FundingType.WithdrawFutureExternal) {
    return `${t('assets.transfers.to')}: ${formatAddressWallet(record.from)}`
  }

  if (
    record.type === FundingType.Deposit ||
    record.type === FundingType.DepositFutureExternal ||
    record.type === FundingType.DepositPredictExternal
  ) {
    return `${t('assets.transfers.from')}: ${formatAddressWallet(record.from)}`
  }
  if (record.type === FundingType.Swap) {
    if (record.depositChainId === ChainIds.HyperEVM) {
      return `${t('assets.transfers.memeAccount')} ${t('assets.transfers.to')} ${t('assets.transfers.contractAccount')}`
    }
    return `${t('assets.transfers.memeAccount')}`
  }
  if (record.type === FundingType.WithdrawFuture) {
    return `${t('assets.transfers.contractAccount')} ${t('assets.transfers.to')} ${t('assets.transfers.memeAccount')}`
  }
  if (record.type === FundingType.DepositFuture) {
    return `${t('assets.transfers.memeAccount')} ${t('assets.transfers.to')} ${t('assets.transfers.contractAccount')}`
  }
  return ''
}

const StatusIcon = (props: { record: FundingRecord }) => {
  const { record } = props
  if (record.depositStatus && record.depositStatus !== TransferStatus.Success) {
    // Handle deposit status first
    if (record.depositStatus === TransferStatus.Failed) {
      return <img src="/images/icons/transfer-fail.svg" alt="Failed" className="w-[16px] h-[16px]" />
    }
    return <LoadingSpinnerGradient size={16} />
  }

  if (record.status === TransferStatus.Success) {
    return <img src="/images/icons/transfer-success.svg" alt="Success" className="w-[16px] h-[16px]" />
  } else if (record.status === TransferStatus.Failed) {
    return <img src="/images/icons/transfer-fail.svg" alt="Failed" className="w-[16px] h-[16px]" />
  } else {
    return <img src="/images/icons/ic-loading.svg" alt="Failed" className="size-4 animate-spin" />
  }
}

const TypeCell = (props: { record: FundingRecord }) => {
  const { record } = props
  return (
    <div className="flex items-center gap-3 py-5">
      <TypeIcon type={record.type as FundingType} />
      <div>
        <div className="text-[#FBFBFB] flex items-center gap-1">
          <TypeLabel type={record.type as FundingType} />
          <div className="flex gap-2 items-center">
            <StatusIcon record={record} />
            {(record.type === FundingType.WithdrawFuture || record.type === FundingType.WithdrawFutureExternal) &&
              (record.status === TransferStatus.Pending || record.status === TransferStatus.Processing) && (
                <CountdownTimer createdAt={record.createdAt} estimationTime={record.estimationTime || null} />
              )}
          </div>
        </div>
        <div className="text-[calc(14rem/16)] text-[#79778C] mt-1">
          <TypeSubLabel record={record} />
        </div>
      </div>
    </div>
  )
}

const BNB_ADDRESS = '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'
const NATIVE_ADDRESS = '0x0000000000000000000000000000000000000000'
const POLYGON_USDC_ADDRESS = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'

const TokenCell = (props: { record: FundingRecord }) => {
  const { record } = props
  const { logo: logoUrl, symbol: tokenSymbol } = useTokenInfo(record.token, Number(record.chainId))

  if (isDepositRecord(record.type as FundingType) || isWithdrawRecord(record.type as FundingType)) {
    return (
      <div className="flex items-center gap-3 py-5">
        <LogoWithChain
          logo={getDepositTokenLogo(record, logoUrl)}
          logoClassName="size-8"
          chainLogo={getDepositChainLogo(record)}
          name={record.token}
        />
        <div>{getDepositTokenName(record, tokenSymbol)}</div>
      </div>
    )
  }
  if (isTransferRecord(record.type as FundingType)) {
    const toTokenLogo = getTokenLogoByAddress(
      record.toChainId ? +record.toChainId : ChainIds.Solana,
      record.toToken ? record.toToken : undefined,
    )
    const tokenLogo = getTokenLogoByAddress(
      record.chainId ? +record.chainId : ChainIds.Solana,
      record.token ? record.token : undefined,
    )
    return (
      <div className="flex items-center gap-3 py-5">
        <div className="relative">
          <LogoWithChain
            logo={toTokenLogo}
            className="ml-4.5"
            logoClassName="size-8"
            name={record.toToken}
            chainLogo={
              record.toChainId === ChainIds.HyperEVM
                ? getBlockchainLogo2(ChainIds.Arbitrum)
                : getBlockchainLogo2(+record.toChainId)
            }
          />
          <LogoWithChain
            logo={tokenLogo}
            className="absolute left-0 top-0"
            logoClassName="size-8"
            chainLogo={
              record?.chainId === ChainIds.HyperEVM
                ? getBlockchainLogo2(ChainIds.Arbitrum)
                : getBlockchainLogo2(+record.chainId)
            }
            name={getUnit(record.token, record.chainId)}
          />
        </div>
        <div>
          {getUnit(record.token, record.chainId)} → {getUnit(record.toToken, record.toChainId)}
        </div>
      </div>
    )
  }
}

const AmountCell = (props: { record: FundingRecord }) => {
  const { record } = props
  const { symbol: tokenSymbol } = useTokenInfo(record.token, Number(record.chainId))
  if (
    record.type === FundingType.Withdraw ||
    record.type === FundingType.Deposit ||
    record.type === FundingType.DepositPredictExternal ||
    record.type === FundingType.WithdrawPredictExternal ||
    record.type === FundingType.WithdrawFutureExternal ||
    record.type === FundingType.DepositFutureExternal
  ) {
    return (
      <div className="font-[450] text-[#FBFBFB]">
        {record.type === FundingType.Deposit ||
          record.type === FundingType.DepositFutureExternal ||
          record.type === FundingType.DepositPredictExternal
          ? '+'
          : '-'}
        {/* <MoneyFormatted
          value={
            record.type === FundingType.DepositFutureExternal || record.type === FundingType.DepositPredictExternal
              ? record.toAmount
              : record.amount
          }
          unit={
            record.type === FundingType.DepositFutureExternal || record.type === FundingType.DepositPredictExternal
              ? 'USDC'
              : getTokenSymbol(+record.chainId, record.token, tokenSymbol)
          }
        /> */}
        {formatAmount(
          record.type === FundingType.DepositFutureExternal || record.type === FundingType.DepositPredictExternal
            ? (record.toAmount ?? record.amount)
            : record.amount,
          {
            unit:
              record.type === FundingType.DepositFutureExternal || record.type === FundingType.DepositPredictExternal
                ? 'USDC'
                : getTokenSymbol(+record.chainId, record.token, tokenSymbol),
          },
        )}
      </div>
    )
  }
  if (
    record.type === FundingType.Swap ||
    record.type === FundingType.DepositFuture ||
    record.type === FundingType.WithdrawFuture
  ) {
    let toAmount = record?.depositAmount ? record?.depositAmount : record.toAmount
    if (record.token === record.toToken && !toAmount) {
      toAmount = Number(record.amount) - Number(record.fee)
    }
    return (
      <div>
        <div
          className={`text-[14px] font-[330 ${record.status === TransferStatus.Success ? 'text-[#79778C]' : 'text-[#79778C]'
            }`}
        >
          {record.status !== TransferStatus.Failed && '-'}
          {/* <MoneyFormatted value={record.amount} unit={getUnit(record?.token, record.chainId)} /> */}
          {formatAmount(record.amount, {
            unit: getTokenSymbol(+record.chainId, record.token, tokenSymbol),
          })}
        </div>
        <div
          className={`mt-1.5 font-[450] ${record.status === TransferStatus.Success ? 'text-[#FBFBFB]' : 'text-[#79778C]'}`}
        >
          {record.status !== TransferStatus.Failed && '+'}
          {/* <MoneyFormatted value={toAmount} unit={getUnit(record?.toToken, record.toChainId)} /> */}
          {formatAmount(toAmount, {
            unit: getTokenSymbol(+record.toChainId, record.toToken, tokenSymbol),
          })}
        </div>
      </div>
    )
  }
}

const columns: ColumnDefWithMeta<FundingRecord>[] = [
  {
    id: 'type',
    meta: {
      style: { flex: 1 },
    },
    header: () => <Trans i18nKey="assets.transfers.swapType" />,
    cell: ({ row }) => {
      return <TypeCell record={row.original} />
    },
  },
  {
    id: 'token',
    meta: {
      style: { flex: 1 },
    },
    header: () => <Trans i18nKey="assets.transfers.token" />,
    cell: ({ row }) => {
      return <TokenCell record={row.original} />
    },
  },
  {
    id: 'amount',
    meta: {
      style: { flex: 1 },
    },
    header: () => <Trans i18nKey="assets.withdrawal.amountPC" />,
    cell: ({ row }) => {
      return <AmountCell record={row.original} />
    },
  },
  {
    id: 'createdAt',
    header: () => (
      <div className="w-full text-right">
        <Trans i18nKey="detail.tokenDetail.time" />
      </div>
    ),
    size: 200,
    cell: ({ row }) => {
      return (
        <div className="text-[#79778C] text-right w-full">
          {dayjs(row.original.createdAt).format('YYYY-MM-DD HH:mm:ss')}
        </div>
      )
    },
  },
]

const TokenSelect = (props: {
  options: { value: string; label: string; chainId?: number; address?: string }[]
  value: string
  onValueChange: (value: string) => void
}) => {
  const { options, value, onValueChange } = props
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const selectedOption = useMemo(() => {
    return options.find((option) => option.value === value) || options[0]
  }, [value, options])

  const handleChange = (val: string) => {
    onValueChange(val)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <div className="w-48 text-[#908E98] flex h-9 items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1">
          {selectedOption.chainId ? (
            <div className="flex items-center gap-2">
              <LogoWithChain
                logo={getTokenLogoByAddress(
                  selectedOption.chainId ? +selectedOption.chainId : ChainIds.Solana,
                  selectedOption.address ? selectedOption.address : undefined,
                )}
                logoClassName="size-6 min-w-none"
                chainLogo={getBlockchainLogo2(selectedOption.chainId ? +selectedOption.chainId : ChainIds.Solana)}
                chainContainerClassName="size-2.5 min-w-none"
                name={selectedOption.label}
              />
              {selectedOption.label}
            </div>
          ) : (
            selectedOption.label
          )}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="p-0 bg-[#212127] w-45" align="start">
        <Command
          className="bg-[#212127]"
          filter={(value, search) => {
            if (value === 'all') return 0
            const option = options.find((opt) => opt.value === value)
            if (!option) return 0
            if (option.label.toLowerCase().includes(search.toLowerCase())) return 1
            return 0
          }}
          autoFocus={false}
        >
          {/* <div className="p-1">
            <div className="rounded-full border border-[#79778C29] h-9">
              <CommandInput
                className="h-9 border-none text-[calc(14rem/16)]"
                wrapperClassName="border-none"
                placeholder={t('history.searchToken')}
                value={input}
                onValueChange={(text) => setInput(text)}
              />
            </div>
          </div> */}
          <CommandList>
            <CommandEmpty>{t('history.nodata')}</CommandEmpty>
            <CommandGroup className="pt-0">
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  className={cn(
                    'cursor-pointer h-9 relative',
                    value === option.value ? 'text-[#FBFBFB] bg-[#2B2B33]' : 'bg-transparent text-[#79778C]',
                  )}
                  value={option.value}
                  onSelect={() => handleChange(option.value)}
                >
                  {option.chainId ? (
                    <div className="flex items-center gap-2">
                      <LogoWithChain
                        logo={getTokenLogoByAddress(
                          option.chainId ? +option.chainId : ChainIds.Solana,
                          option.address ? option.address : undefined,
                        )}
                        logoClassName="size-6 min-w-none"
                        chainLogo={getBlockchainLogo2(option.chainId ? +option.chainId : ChainIds.Solana)}
                        chainContainerClassName="size-2.5 min-w-none"
                        name={option.label}
                      />
                      {option.label}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <LogoWithChain
                        logo="/images/icons/ic-wallet-circle.svg?v=2"
                        logoClassName="size-6s"
                        name="All Tokens"
                      />
                      {option.label}
                    </div>
                  )}
                  {value === option.value && (
                    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
                      <Check className="h-4 w-4" />
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export const FundingRecords = () => {
  const [type, setType] = useState('all')
  const [asset, setAsset] = useState('all')
  const { openTxDetail } = useTxDetail()
  const { records, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useFundingRecords({ type, asset })
  const { t } = useTranslation()
  const navigate = useNavigate()
  const ref = useRef<DataTableHandle>(null)
  const isShowMaintenanceNotification = useAppSelector(selectShouldShowMaintenanceNotification)
  const activeWallet = useSelector(_activeWallet)
  const isPredictionEnabled = useFeatureIsOn('enable_prediction')

  const loadMore = () => {
    if (isLoading || isFetchingNextPage || !hasNextPage) return
    fetchNextPage().then()
  }

  useEffect(() => {
    ref.current?.scrollToTop()
  }, [type, asset])

  const backToOverview = () => {
    navigate(APP_PATH.ASSETS + '?page=overview')
  }

  useEffect(() => {
    if (!activeWallet?.isConnected) {
      backToOverview()
    }
  }, [activeWallet?.isConnected])

  const allTokenOptions = useMemo(() => {
    return [
      { value: 'all', label: t('assets.overview.allAssets') },
      { value: 'BNB', label: 'BNB ' + t('assets.funding.meme'), chainId: ChainIds.Bsc, address: BNB_ADDRESS },
      { value: 'MON', label: 'MON ' + t('assets.funding.meme'), chainId: ChainIds.Mon, address: NATIVE_ADDRESS },
      { value: 'SOL', label: 'SOL ' + t('assets.funding.meme'), chainId: ChainIds.Solana, address: SOL_ADDRESS },
      {
        value: 'USDC',
        label: 'USDC ' + t('assets.futures.futures'),
        chainId: ChainIds.Hyperliquid,
        address: USDC_ADDRESS_HYPERLIQUID,
      },
      {
        value: 'USDC-POLYGON',
        label: 'USDC Prediction',
        chainId: ChainIds.Polygon,
        address: POLYGON_USDC_ADDRESS.toLowerCase(),
        disabled: !isPredictionEnabled,
      },
    ].filter((option) => !option.disabled)
  }, [t, isPredictionEnabled])

  const allTypeOptions = useMemo(() => {
    return [
      { value: 'all', label: t('assets.overview.allTypes') },
      { value: TransferType.Deposit, label: t('assets.overview.deposit') },
      { value: TransferType.Withdraw, label: t('assets.overview.withdrawal') },
      { value: 'TRANSFER', label: t('assets.transfer') },
      { value: TransferType.Other, label: t('assets.transfers.others') },
    ]
  }, [t])

  return (
    <div className="px-4">
      <div className="flex items-baseline my-3">
        <div className="text-[14px] text-[#79778C] mr-1 cursor-pointer" onClick={backToOverview}>
          {t('assets.overview.title')}
        </div>
        <IconChevronRight className="mr-2" />
        <div className="text-[14px] text-[#FBFBFB]">{t('assets.overview.tabFundingRecords')}</div>
      </div>
      <div className="border border-[#79778C29] bg-[#141418] py-4 rounded-[12px]">
        <div className="text-[#FBFBFB] text-[20px] font-[330] px-4">{t('assets.overview.tabFundingRecords')}</div>
        <div className="flex items-center gap-3 p-4">
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-[136px] text-[#908E98]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#212127] [&>div]:h-9 [&>data[state=uncheck]]:text-[#79778C]">
              {allTypeOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="h-9 data-[state=checked]:text-[#FBFBFB] data-[state=unchecked]:text-[#79778C]"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <TokenSelect options={allTokenOptions} value={asset} onValueChange={setAsset} />
        </div>
        <DataTable
          ref={ref}
          data={records}
          columns={columns}
          rowHeight={76}
          headerClassName="bg-[#212127] sticky top-0 z-[5]"
          headerRowClassName="px-4"
          headerCellClassName="first:pl-0 last:pr-0"
          cellClassName="first:pl-0 last:pr-0"
          rowClassName="px-4 !last:border-b-0"
          isLoading={isLoading}
          onLoadMore={loadMore}
          className={cn(
            'overflow-y-auto no-scrollbar',
            isShowMaintenanceNotification ? 'max-h-[calc(100vh-282px)]' : 'max-h-[calc(100vh-250px)] ',
          )}
          hasNextPage={hasNextPage}
          onRowClick={(row) => openTxDetail(row)}
        />
      </div>
    </div>
  )
}
