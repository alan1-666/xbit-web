import { FundingRecord } from '@components/assets/overview/TabFundingRecords.tsx'
import { ChainIds, FundingType } from '@/types/enums.ts'
import { getBlockchainLogo2 } from '@/utils/helpers.ts'
import LogoWithChain from '@components/common/LogoWithChain.tsx'
import { useMemo } from 'react'
import { getDepositTokenLogo, getUnit } from '@components/assets/overview/funding-records/utils.ts'
import { useTokenInfo } from '@hooks/useTokenInfo.ts'

export interface DepositWithdrawRecordTokenLogoProps {
  record: FundingRecord
}

export const DepositWithdrawRecordTokenLogo = (props: DepositWithdrawRecordTokenLogoProps) => {
  const { record } = props
  const tokenLogo = useMemo(() => {
    return getDepositTokenLogo(record)
  }, [record])

  const chainLogo = useMemo(() => {
    if (record.type === FundingType.DepositFutureExternal) {
      return getBlockchainLogo2(ChainIds.Hyperliquid)
    }
    if (record?.chainId === ChainIds.HyperEVM) {
      return getBlockchainLogo2(ChainIds.Hyperliquid)
    }
    if (record.type === FundingType.DepositPredictExternal) {
      return getBlockchainLogo2(+record.toChainId)
    }
    return getBlockchainLogo2(+record.chainId)
  }, [record])

  const { symbol: tokenSymbol } = useTokenInfo(record.token, Number(record.chainId))

  const name = useMemo(() => {
    if (record.type === FundingType.DepositPredictExternal) {
      return getUnit(record.toToken, record.toChainId, tokenSymbol)
    }
    return getUnit(record.token, record.chainId, tokenSymbol)
  }, [record, tokenSymbol])

  return <LogoWithChain logo={tokenLogo} logoClassName="size-8" chainLogo={chainLogo} name={name} />
}
