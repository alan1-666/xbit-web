import { formatAmount, formatBalance } from '@/lib/format'
import { cn } from '@/lib/utils.ts'
import { FundingType, TransferStatus } from '@/types/enums.ts'
import { getLinkExplorer, relayExplorer } from '@/utils/helpers'
import { getTokenSymbol } from '@/utils/token.ts'
import { FundingRecord, transactionTypeLabelKeys } from '@components/assets/overview/TabFundingRecords.tsx'
import { CopyButton } from '@components/common/copy-button.tsx'
import LogoWithChain from '@components/common/LogoWithChain.tsx'
import { formatAddressWallet } from '@/lib/string.ts'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import { useMemo } from 'react'
import {
  getDepositChainLogo,
  getTokenLogo,
  getUnit,
  isDepositRecord,
} from '@components/assets/overview/funding-records/utils.ts'
import { useTokenInfo } from '@hooks/useTokenInfo.ts'
import { ToAccountBadge } from '@components/assets/overview/funding-records/ToAccountBadge.tsx'

type Props = {
  record: FundingRecord
  recordUpdated: FundingRecord | null
  isDesktop: boolean
  tokenLogo: string
  tokenSymbol: string | undefined
  fallbackPrice: number | null
  priceMqtt: number | null
  networkFee: number
  isFuturesWithdrawal: boolean
  chainFeeMap: Record<number, string>
  networkMap: Record<number, string>
  networkLogo: (chainId: number) => string
  walletName: (walletAddress: string, chainId: number | string) => string
}

const DepositWithdrawDetails = ({
  record,
  recordUpdated,
  isDesktop,
  tokenSymbol,
  fallbackPrice,
  priceMqtt,
  networkFee,
  isFuturesWithdrawal,
  chainFeeMap,
  networkMap,
  networkLogo,
  walletName,
}: Props) => {
  const { t } = useTranslation()

  const { logo: logoUrl } = useTokenInfo(record.token, Number(record.chainId))

  const tokenLogo = useMemo(() => {
    if (record.type === FundingType.DepositFutureExternal) {
      return '/images/icons/chains/ic-usdc.svg'
    }
    if (record.type === FundingType.DepositPredictExternal) {
      return getTokenLogo(record.toChainId, record.toToken || '', logoUrl)
    }
    return getTokenLogo(record.chainId, record.token, logoUrl)
  }, [record, logoUrl])

  const symbol = useMemo(() => {
    if (tokenSymbol) return tokenSymbol
    if (record.type === FundingType.DepositPredictExternal) {
      return getUnit(record.toToken, +record.toChainId)
    }
    return '--'
  }, [tokenSymbol, record])

  const amount = useMemo(() => {
    if (record.type === FundingType.DepositFutureExternal || record.type === FundingType.DepositPredictExternal) {
      return record.toAmount ?? record.amount
    }
    return record.amount
  }, [record])

  const unit = useMemo(() => {
    if (record.type === FundingType.DepositFutureExternal) {
      return 'USDC'
    }
    if (record.type === FundingType.DepositPredictExternal) {
      return getTokenSymbol(+record.toChainId, record.toToken, tokenSymbol) || '--'
    }
    return getTokenSymbol(+record.chainId, record.token, tokenSymbol) || '--'
  }, [record])

  const chainLogo = useMemo(() => {
    return getDepositChainLogo(record)
  }, [record])

  return (
    <div>
      <div className="mt-3 flex flex-col items-center mb-4">
        <LogoWithChain
          logo={tokenLogo}
          logoClassName="size-12 rounded-full"
          chainLogo={chainLogo}
          chainContainerClassName="size-4 bottom-0 right-0"
          name={symbol}
        />
        <div className="text-center mt-3">
          <span className="text-[24px] font-[380] leading-none text-white">
            {isDepositRecord(record.type as FundingType) ? '+' : '-'}
            {formatAmount(amount, {
              unit: unit || '--',
            })}
          </span>
          <div className="mt-2 text-[16px] text-white/70 leading-none">
            {record.type === FundingType.DepositFutureExternal ? (
              <>
                ≈{' '}
                {formatBalance(record.toAmountUsd ?? recordUpdated?.toAmountUsd, {
                  roundMode: 'floor',
                  showCurrency: true,
                })}
              </>
            ) : record?.amountUsd ? (
              <>≈ {formatBalance(record.amountUsd, { roundMode: 'floor', showCurrency: true })}</>
            ) : fallbackPrice ? (
              <>
                ≈
                {formatBalance(+(record.amount ?? 0) * +fallbackPrice, {
                  roundMode: 'floor',
                  showCurrency: true,
                })}
              </>
            ) : priceMqtt ? (
              <>≈{formatBalance(+(record.amount ?? 0) * +priceMqtt, { roundMode: 'floor', showCurrency: true })}</>
            ) : (
              '--'
            )}
          </div>
        </div>
      </div>

      <div
        className={cn(
          'border border-[#ECECED14] bg-[#1414145C] py-2 px-4 rounded-[8px]',
          isDesktop ? 'border-none bg-[#212127]' : '',
        )}
      >
        <div className="mt-2.5">
          <div className="text-[calc(13rem/16)] leading-4.5 text-[#FFFFFFB2]">
            {t('assets.overview.fundingHistory.senderAddress')}
          </div>
          <div className="mt-1.5 flex items-start justify-between gap-2">
            <div className="text-[calc(13rem/16)] font-[380] wrap-anywhere leading-[1.3]">{record.from}</div>
            <CopyButton text={record.from} />
          </div>

          {record.type === FundingType.WithdrawFutureExternal && (
            <div className={cn('mt-3 flex items-center gap-1.5', isDesktop ? 'mt-1.5' : '')}>
              <div className=" inline-block">
                <div className="bg-[#ECECED0F] text-white/70 px-2 py-1 rounded-sm text-[11px] font-[330] flex items-center gap-[4.5px]">
                  <img src="/images/icons/active-dot.svg" alt="active-dot" className="size-1" />
                  <span>{t('assets.transfers.contractAccount')}</span>
                </div>
              </div>
            </div>
          )}

          {record.type === FundingType.WithdrawPredictExternal && (
            <div className={cn('mt-3 flex items-center gap-1.5', isDesktop ? 'mt-1.5' : '')}>
              <div className=" inline-block">
                <div className="bg-[#ECECED0F] text-white/70 px-2 py-1 rounded-sm text-[11px] font-[330] flex items-center gap-[4.5px]">
                  <img src="/images/icons/active-dot.svg" alt="active-dot" className="size-1" />
                  <span>{t('assets.transfers.predictionAccount')}</span>
                </div>
              </div>
            </div>
          )}

          {record.type === FundingType.Withdraw && (
            <div className={cn('mt-3 flex items-center gap-1.5', isDesktop ? 'mt-1.5' : '')}>
              <div className=" inline-block">
                <div className="bg-[#ECECED0F] text-white/70 px-2 py-1 rounded-sm text-[11px] font-[330] flex items-center gap-[4.5px]">
                  <img src="/images/icons/active-dot.svg" alt="active-dot" className="size-1" />
                  <span>{t('assets.fundingAccount')}</span>
                </div>
              </div>
              <span className="bg-[#ECECED0F] text-white/70 px-2 py-1 rounded-sm text-[11px] font-[330]">
                {walletName(record.from, +record.chainId)}
              </span>
            </div>
          )}
        </div>

        <div className={cn('mt-2.5', isDesktop ? 'mt-4' : '')}>
          <div className="text-[calc(13rem/16)] text-[#FFFFFFB2]">
            {t('assets.overview.fundingHistory.receiverAddress')}
          </div>
          <div className="mt-1.5 flex items-start justify-between gap-2">
            <div className="text-[calc(13rem/16)] font-[380] wrap-anywhere leading-[1.3]">{record.to}</div>
            <CopyButton text={record.to} />
          </div>
          {isDepositRecord(record.type as FundingType) && (
            <div className={cn('mt-3 flex items-center gap-1.5', isDesktop ? 'mt-1.5' : '')}>
              <ToAccountBadge record={record} />
              {record.type === FundingType.Deposit && (
                <span className="bg-[#ECECED0F] text-white/70 px-2 py-1 rounded-sm text-[11px] font-[330]">
                  {walletName(record.to, +record.chainId)}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="w-full">
          <div className="flex items-center justify-between py-3">
            <div className="text-[calc(13rem/16)] text-[#FFFFFFB2]">{t('assets.overview.fundingHistory.date')}</div>
            <div className="text-white text-[calc(14rem/16)] font-[380]">
              {record?.timestamp
                ? dayjs(record.timestamp * 1000).format('YYYY/MM/DD HH:mm:ss')
                : dayjs(record?.createdAt).format('YYYY/MM/DD HH:mm:ss')}
            </div>
          </div>
          <div className="flex items-center justify-between py-3">
            <div className="text-[calc(13rem/16)] text-[#FFFFFFB2]">{t('assets.overview.fundingHistory.type')}</div>
            <div className="text-white text-[calc(14rem/16)] font-[380]">
              {t(transactionTypeLabelKeys[record.type as keyof typeof transactionTypeLabelKeys])}
            </div>
          </div>
          <div className="flex items-center justify-between py-3">
            <div className="text-[calc(13rem/16)] text-[#FFFFFFB2]">
              {isDepositRecord(record.type as FundingType)
                ? t('assets.overview.fundingHistory.fromNetwork')
                : t('assets.overview.fundingHistory.toNetwork')}
            </div>
            <div className="text-white text-[calc(14rem/16)] font-[380] flex items-center gap-1">
              <img
                src={networkLogo(
                  record.type === FundingType.WithdrawFutureExternal ||
                    record.type === FundingType.DepositFutureExternal
                    ? +record.toChainId
                    : +record.chainId,
                )}
                alt=""
                className="size-3 rounded-full"
              />
              <span>
                {networkMap[
                  record.type === FundingType.WithdrawFutureExternal ||
                  record.type === FundingType.DepositFutureExternal
                    ? +record.toChainId
                    : +record.chainId
                ] || ''}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between py-3">
            <div className="text-[calc(13rem/16)] text-[#FFFFFFB2]">
              {isFuturesWithdrawal ? t('assets.withdrawal.fee') : t('assets.overview.fundingHistory.networkFee')}
            </div>
            <div className="text-white text-[calc(14rem/16)] font-[380]">
              {}
              {recordUpdated?.status === TransferStatus.Success ? (
                <>
                  {formatAmount(networkFee, {
                    roundMode: 'ceil',
                    unit: isFuturesWithdrawal ? 'USDC' : chainFeeMap[+record.chainId] || '--',
                  })}
                </>
              ) : (
                '--'
              )}
            </div>
          </div>
          <div className="flex items-center justify-between py-3">
            <div className="text-[calc(13rem/16)] text-[#FFFFFFB2]">
              {t('assets.overview.fundingHistory.transactionHash')}
            </div>
            <div className="text-white text-[calc(14rem/16)] flex items-center">
              {recordUpdated?.txHash &&
              (recordUpdated?.status === TransferStatus.Success || recordUpdated?.status === TransferStatus.Failed) ? (
                <>
                  <a
                    href={
                      record?.memo
                        ? relayExplorer(record.memo)
                        : getLinkExplorer(
                            record.type === FundingType.DepositFutureExternal ||
                              recordUpdated?.type === FundingType.WithdrawFutureExternal
                              ? (recordUpdated?.toChainId ?? record.toChainId)
                              : +(recordUpdated?.chainId ?? record?.chainId),
                            record.type === FundingType.DepositFutureExternal ||
                              recordUpdated?.type === FundingType.WithdrawFutureExternal
                              ? (recordUpdated?.toTxHash ?? recordUpdated?.txHash ?? '')
                              : (recordUpdated?.txHash ?? ''),
                          )
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    {formatAddressWallet(
                      record?.memo
                        ? record?.memo
                        : record.type === FundingType.DepositFutureExternal ||
                            recordUpdated?.type === FundingType.WithdrawFutureExternal
                          ? (recordUpdated?.toTxHash ?? recordUpdated?.txHash ?? '')
                          : (recordUpdated?.txHash ?? ''),
                    )}
                  </a>
                  <CopyButton
                    text={
                      record.type === FundingType.DepositFutureExternal ||
                      recordUpdated?.type === FundingType.WithdrawFutureExternal
                        ? (recordUpdated?.toTxHash ?? recordUpdated?.txHash ?? '')
                        : (recordUpdated?.txHash ?? '')
                    }
                    className="ml-2"
                  />
                </>
              ) : (
                '--'
              )}
            </div>
          </div>
          <div className="flex items-center justify-between py-3">
            <div className="text-[calc(13rem/16)] text-[#FFFFFFB2]">
              {t('assets.overview.fundingHistory.blockNumber')}
            </div>
            <div className="text-white text-[calc(14rem/16)] font-[380]">
              {recordUpdated?.blockNumber !== 0 &&
              (recordUpdated?.status === TransferStatus.Success || recordUpdated?.status === TransferStatus.Failed)
                ? (recordUpdated?.toBlockNumber ?? recordUpdated?.blockNumber)
                : '--'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DepositWithdrawDetails
