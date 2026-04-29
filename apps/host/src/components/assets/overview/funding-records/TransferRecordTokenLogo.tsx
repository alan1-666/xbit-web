import { FundingRecord } from '@components/assets/overview/TabFundingRecords.tsx'
import LogoWithChain from '@components/common/LogoWithChain.tsx'
import { ChainIds } from '@/types/enums.ts'
import { getBlockchainLogo2 } from '@/utils/helpers.ts'
import { useAppSelector } from '@/redux/store'
import { selectTokenByAddress } from '@/redux/modules/tokens.slice.ts'
import { useMemo } from 'react'
import { getTokenLogoByAddress, getUnit } from '@components/assets/overview/funding-records/utils.ts'

export interface TransferRecordTokenLogoProps {
  record: FundingRecord
}
export const TransferRecordTokenLogos = (props: TransferRecordTokenLogoProps) => {
  const { record } = props
  const tokenData = useAppSelector(selectTokenByAddress(record.token))

  const fromTokenLogo = useMemo(() => {
    return tokenData?.logo ?? getTokenLogoByAddress(+record.chainId, record.token) ?? '/images/icons/chains/ic-usdc.svg'
  }, [record, tokenData?.logo])

  const toTokenLogo = useMemo(() => {
    if (tokenData?.logo) return tokenData.logo
    return getTokenLogoByAddress(+record.toChainId, record.toToken) ?? '/images/icons/chains/ic-usdc.svg'
  }, [record, tokenData?.logo])

  const fromChainLogo = useMemo(() => {
    if (record?.chainId === ChainIds.HyperEVM) {
      return getBlockchainLogo2(ChainIds.Hyperliquid)
    }
    return getBlockchainLogo2(+record.chainId)
  }, [record.chainId])

  const toChainLogo = useMemo(() => {
    if (record.toChainId === ChainIds.HyperEVM) {
      return getBlockchainLogo2(ChainIds.Hyperliquid)
    }
    return getBlockchainLogo2(+record.toChainId)
  }, [record.toChainId, record.chainId])

  return (
    <div className="relative">
      <LogoWithChain
        logo={toTokenLogo}
        className="ml-4.5"
        logoClassName="size-8"
        name={getUnit(record.toToken, record.toChainId)}
        chainLogo={toChainLogo}
      />
      <LogoWithChain
        logo={fromTokenLogo}
        className="absolute left-0 top-0"
        logoClassName="size-8"
        chainLogo={fromChainLogo}
        name={getUnit(record.token, record.chainId)}
      />
    </div>
  )
}
