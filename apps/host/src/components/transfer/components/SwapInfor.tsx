import { FundingRecord } from '@/components/assets/overview/TabFundingRecords'
import { networkMap } from '@/lib/blockchain.ts'
import { CopyButton } from '@/components/common/copy-button'
import { NATIVE_TOKENS } from '@/lib/constant.ts'
import { formatAmount } from '@/lib/format'
import { formatAddressWallet } from '@/lib/string'
import { cn } from '@/lib/utils'
import { ChainIds, FundingType, TransferStatus } from '@/types/enums.ts'
import { getLinkExplorer, relayExplorer } from '@/utils/helpers'
import { USDC_ADDRESS_ARBITRUM } from '@components/transfer/constants.ts'
import dayjs from 'dayjs'
import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface SwapStatusProps {
  record: FundingRecord
  recordUpdated?: FundingRecord | null
}

const nativeTokenSupported = [
  {
    token: 'SOL',
    name: 'Solana',
    symbol: 'SOL',
    tokenAddress: 'So11111111111111111111111111111111111111111',
    chainId: ChainIds.Solana,
  },
  {
    token: 'USDC',
    name: 'Arbitrum USDC',
    symbol: NATIVE_TOKENS.arb.USDC.symbol,
    tokenAddress: USDC_ADDRESS_ARBITRUM,
    chainId: ChainIds.Arbitrum,
  },
  {
    token: 'ETH',
    name: 'Arbitrum Ethereum',
    symbol: NATIVE_TOKENS.arb.ETH.symbol,
    tokenAddress: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
    chainId: ChainIds.Arbitrum,
  },
  {
    token: 'ETH',
    name: 'Ethereum',
    symbol: NATIVE_TOKENS.eth.ETH.symbol,
    tokenAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    chainId: ChainIds.Ethereum,
  },
  {
    token: 'ETH',
    name: 'ETH',
    symbol: NATIVE_TOKENS.eth.ETH.symbol,
    tokenAddress: '0x0000000000000000000000000000000000000000',
    chainId: ChainIds.Ethereum,
  },
  {
    token: 'BNB',
    name: 'BNB',
    symbol: NATIVE_TOKENS.bsc.BNB.symbol,
    tokenAddress: '0x0000000000000000000000000000000000000000',
    chainId: ChainIds.Bsc,
  },
  {
    token: 'MON',
    name: 'Monad',
    symbol: NATIVE_TOKENS.mon.MON.symbol,
    tokenAddress: '0x0000000000000000000000000000000000000000',
  }
]

const SwapInfor: React.FC<SwapStatusProps> = ({ record, recordUpdated }) => {
  const { t } = useTranslation()
  const [feeUnit, setFeeUnit] = useState<string>('')
  const [crossChainFeeUnit, setCrossChainFeeUnit] = useState<string>('')

  useEffect(() => {
    if (record.chainId === ChainIds.Solana) {
      setFeeUnit('SOL')
    } else if (record.chainId === ChainIds.HyperEVM && record.toChainId === ChainIds.Arbitrum) {
      setFeeUnit('USDC')
    } else if (record.chainId === ChainIds.Arbitrum && record.toChainId === ChainIds.HyperEVM) {
      setFeeUnit('ETH')
    } else if (record.chainId === ChainIds.Bsc) {
      setFeeUnit('BNB')
    } else if (record.chainId === ChainIds.Mon) {
      setFeeUnit('MON')
    } else {
      setFeeUnit('ETH')
    }
  }, [record.chainId, record.toChainId])

  const tokenSymbol = (address: string, chainId?: number | string) => {
    if (chainId && (chainId == ChainIds.Bsc || chainId == ChainIds.Ethereum || chainId == ChainIds.Mon)) {
      return (
        nativeTokenSupported.find(
          (token) => token.tokenAddress.toLowerCase() === address.toLowerCase() && token.chainId == chainId,
        )?.symbol || ''
      )
    }
    return (
      nativeTokenSupported.find((token) => token.tokenAddress.toLowerCase() === address.toLowerCase())?.symbol || ''
    )
  }

  useEffect(() => {
    if (record?.crossChainFeeUnit) {
      setCrossChainFeeUnit(record.crossChainFeeUnit)
    } else if (record.toChainId === ChainIds.Solana) {
      setCrossChainFeeUnit('SOL')
    } else if (
      record.toChainId === ChainIds.Arbitrum ||
      record.toChainId === ChainIds.HyperEVM ||
      record.toChainId === ChainIds.Ethereum
    ) {
      setCrossChainFeeUnit('ETH')
    } else {
      setCrossChainFeeUnit('ETH')
    }
  }, [record.toChainId, record.crossChainFeeUnit])

  const mapType = (type: string) => {
    switch (type) {
      case FundingType.DepositFuture:
      case FundingType.WithdrawFuture:
        return 'Transfer '
      default:
        return type
    }
  }

  const txTime = useMemo(() => {
    if (!record.createdAt || !record.timestamp) return '--'
    const startTime = dayjs(record.createdAt).unix()
    const endTime = record.timestamp

    const diffTime = startTime - endTime
    if (diffTime < 0) return '0s'
    if (diffTime <= 60) {
      return `${diffTime}s`
    } else if (diffTime < 3600) {
      return `${Math.floor(diffTime / 60)}m`
    } else {
      return `${Math.floor(diffTime / 3600)}h`
    }
  }, [record.createdAt, record.timestamp])

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between py-3">
        <div className="text-[calc(13rem/16)] text-[#FFFFFFB2]">{t('assets.transfers.createTs')}</div>
        <div className="text-white text-[calc(14rem/16)] font-[380]">
          {dayjs(record.createdAt).format('YYYY/MM/DD HH:mm:ss')}
        </div>
      </div>
      {record.status === TransferStatus.Success && (
        <div className="flex items-center justify-between py-3">
          <div className="text-[calc(13rem/16)] text-[#FFFFFFB2]">{t('assets.transfers.txTime')}</div>
          <div className="text-white text-[calc(14rem/16)] font-[380]">{txTime}</div>
        </div>
      )}
      <div className="flex items-center justify-between py-3">
        <div className="text-[calc(13rem/16)] text-[#FFFFFFB2]">{t('assets.transfers.swapType')}</div>
        <div className="text-white text-[calc(14rem/16)] font-[380]">{mapType(record.type)}</div>
      </div>
      {record?.route && (
        <div className="flex items-center justify-between py-3">
          <div className="text-[calc(13rem/16)] text-[#FFFFFFB2]">{t('assets.transfers.swapPath')}</div>
          <div className="text-white text-[calc(14rem/16)] font-[380] flex items-center gap-2">
            <span>{record?.route ? record?.route : 'Relay'}</span>
            <img
              src={record.route === 'Rango' ? '/images/icons/rango-icon.svg' : '/images/cryptoDeposit/relay-icon.png'}
              className="size-[20px]"
              alt="icon replay"
            />
          </div>
        </div>
      )}
      {record.fee && (
        <div className="flex items-center justify-between py-3">
          <div className="text-[calc(13rem/16)] text-[#FFFFFFB2]">
            {networkMap[+record.chainId]} {t('assets.transfers.netFee')}
          </div>
          <div className="text-white text-[calc(14rem/16)] font-[380]">
            {formatAmount(record.fee, {
              roundMode: 'ceil',
              unit: feeUnit,
            })}
          </div>
        </div>
      )}
      {record?.crossChainFee && (
        <div className="flex items-center justify-between py-3">
          <div className="text-[calc(13rem/16)] text-[#FFFFFFB2]">
            {record?.route ? record?.route : 'Relay'} {t('assets.transfers.crossChainFee')}
          </div>
          <div className="text-white text-[calc(14rem/16)] font-[380]">
            {formatAmount(record.crossChainFee, {
              roundMode: 'ceil',
              unit: crossChainFeeUnit,
            })}
          </div>
        </div>
      )}
      {record?.type === FundingType.Swap && record?.depositAddress ? (
        <>
          <div className="flex items-center justify-between py-3">
            <div>
              <div className="text-[calc(13rem/16)] text-[#FFFFFFB2]">
                {t('assets.transfers.txHash')}{' '}
                <span
                  className={cn(
                    'px-1.5 py-0.5 rounded-[4px] text-[12px] font-[330]',
                    record?.status === TransferStatus.Success
                      ? 'bg-[#00FFB41A] text-[#00FFB4]'
                      : record?.status === TransferStatus.Failed
                        ? 'bg-[#E146501A] text-[#E14650]'
                        : 'bg-[#E146501A] text-white',
                  )}
                >
                  {t(`assets.transfers.${record?.status}`)}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[calc(12rem/16)] text-white">
                <span>({tokenSymbol(record.token, record.chainId)}</span>
                <img src="/images/icons/arrow-right2.svg" className="size-[16px]" alt="icon arrow right" />
                <span>{tokenSymbol(record.toToken, record.toChainId)})</span>
              </div>
            </div>
            <div className="text-white text-[calc(14rem/16)] flex items-center">
              {record?.txHash ? (
                <>
                  <a
                    href={
                      record?.memo
                        ? relayExplorer(record.memo)
                        : getLinkExplorer(
                            record.chainId === ChainIds.HyperEVM ? ChainIds.Arbitrum : +record.chainId,
                            record?.txHash,
                          )
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    {formatAddressWallet(record?.memo ?? record?.txHash)}
                  </a>
                  <CopyButton text={record?.memo ?? record?.txHash} className="ml-2" />
                </>
              ) : recordUpdated && recordUpdated?.txHash ? (
                <>
                  <a
                    href={
                      recordUpdated?.memo
                        ? relayExplorer(recordUpdated.memo)
                        : getLinkExplorer(
                            recordUpdated.chainId === ChainIds.HyperEVM ? ChainIds.Arbitrum : +recordUpdated.chainId,
                            recordUpdated?.txHash,
                          )
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    {formatAddressWallet(recordUpdated?.memo ?? recordUpdated?.txHash)}
                  </a>
                  <CopyButton text={recordUpdated?.memo ?? recordUpdated?.txHash} className="ml-2" />
                </>
              ) : (
                '--'
              )}
            </div>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <div className="text-[calc(13rem/16)] text-[#FFFFFFB2]">
                {t('assets.transfers.txHash')}{' '}
                <span
                  className={cn(
                    'px-1.5 py-0.5 rounded-[4px] text-[12px] font-[330]',
                    record?.status === TransferStatus.Success && record?.depositStatus === TransferStatus.Success
                      ? 'bg-[#00FFB41A] text-[#00FFB4]'
                      : record?.status === TransferStatus.Failed || record?.depositStatus === TransferStatus.Failed
                        ? 'bg-[#E146501A] text-[#E14650]'
                        : 'bg-[#E146501A] text-white',
                  )}
                >
                  {t(`assets.transfers.${record?.depositStatus}`)}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[calc(12rem/16)] text-white">
                <span>({tokenSymbol(record.toToken, record.toChainId)}</span>
                <img src="/images/icons/arrow-right2.svg" className="size-[16px]" alt="icon arrow right" />
                <span>
                  {record.depositChainId === ChainIds.HyperEVM
                    ? t('assets.transfers.contractAccount')
                    : t('assets.transfers.memeAccount')}
                  )
                </span>
              </div>
            </div>
            <div className="text-white text-[calc(14rem/16)] flex items-center">
              {record?.depositTxHash ? (
                <>
                  <a
                    href={
                      record?.memo
                        ? relayExplorer(record.memo)
                        : getLinkExplorer(
                            record?.depositChainId === ChainIds.HyperEVM ? ChainIds.Arbitrum : +record.depositChainId,
                            record?.depositTxHash,
                          )
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    {formatAddressWallet(record?.memo ?? record?.depositTxHash)}
                  </a>
                  <CopyButton text={record?.memo ?? record?.depositTxHash} className="ml-2" />
                </>
              ) : recordUpdated && recordUpdated?.depositTxHash ? (
                <>
                  <a
                    href={
                      recordUpdated?.memo
                        ? relayExplorer(recordUpdated.memo)
                        : getLinkExplorer(
                            recordUpdated?.depositChainId === ChainIds.HyperEVM
                              ? ChainIds.Arbitrum
                              : +recordUpdated.depositChainId,
                            recordUpdated?.depositTxHash,
                          )
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    {formatAddressWallet(recordUpdated?.memo ?? recordUpdated?.depositTxHash)}
                  </a>
                  <CopyButton text={recordUpdated?.memo ?? recordUpdated?.depositTxHash} className="ml-2" />
                </>
              ) : (
                '--'
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between py-3">
            <div className="text-[calc(13rem/16)] text-[#FFFFFFB2]">{t('assets.transfers.txHash')}</div>
            <div className="text-white text-[calc(14rem/16)] flex items-center">
              {record?.txHash ? (
                <>
                  <a
                    href={
                      record?.memo
                        ? relayExplorer(record.memo)
                        : getLinkExplorer(
                            record.chainId === ChainIds.HyperEVM ? ChainIds.Hyperliquid : +record.chainId,
                            record?.txHash,
                          )
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    {formatAddressWallet(record?.memo ?? record?.txHash)}
                  </a>
                  <CopyButton text={record?.memo ?? record?.txHash} className="ml-2" />
                </>
              ) : recordUpdated && recordUpdated?.txHash ? (
                <>
                  <a
                    href={
                      recordUpdated?.memo
                        ? relayExplorer(recordUpdated.memo)
                        : getLinkExplorer(
                            recordUpdated.chainId === ChainIds.HyperEVM ? ChainIds.Hyperliquid : +recordUpdated.chainId,
                            recordUpdated?.txHash,
                          )
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    {formatAddressWallet(recordUpdated?.memo ?? recordUpdated?.txHash)}
                  </a>
                  <CopyButton text={recordUpdated?.memo ?? recordUpdated?.txHash} className="ml-2" />
                </>
              ) : (
                '--'
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default SwapInfor
