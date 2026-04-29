import { TokenDetail } from '@/@generated/gql/graphql-core.ts'
import { CHAIN_EXPLORER_ADDRESS_URLS, CHAIN_EXPLORER_IMAGES } from '@/lib/constant.ts'
import { fShortenNumber } from '@/lib/number.ts'
import { formatAddressWallet } from '@/lib/string.ts'
import { CopyButton } from '@components/common/copy-button.tsx'
import MoneyFormatted from '@components/common/MoneyFormatted.tsx'
import CompareTokenPrice from '@components/pairDetail/CompareTokenPrice.tsx'
import { useOfficialPool } from '@hooks/useTokenPools.ts'
import dayjs from 'dayjs'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

type PairDetailProps = {
  tokenData: TokenDetail
  tokenPrice?: number
}

const calculateTimeAgo = (createdTime: number): string => {
  const now = dayjs()
  const duration = now.unix() - +createdTime / 1000
  if (duration < 60) {
    return `${duration}s`
  }
  if (duration < 3600) {
    return `${Math.floor(duration / 60)}m`
  }
  if (duration < 86400) {
    return `${Math.floor(duration / 3600)}h`
  }
  return `${Math.floor(duration / 86400)}d`
}

const AddressDisplay = ({ address, chainId }: { address: string; chainId: number }) => {
  return (
    <div className="flex items-center gap-1 font-[380]">
      <span>{formatAddressWallet(address, 5, 4)}</span>
      <CopyButton text={address} />
      <a
        href={`${CHAIN_EXPLORER_ADDRESS_URLS[chainId]}/${address}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1"
      >
        <span>EXP</span>
        <img src={CHAIN_EXPLORER_IMAGES[chainId]} alt="" className="size-3.5" />
      </a>
    </div>
  )
}

const formatUsdValue = (value: number | null): string => {
  if (value === null) return '--'
  return value >= 1 ? `$${fShortenNumber(value)}` : '<$1'
}

const PairDetail = ({ tokenData }: PairDetailProps) => {
  const { t } = useTranslation()

  const officialPool = useOfficialPool(tokenData?.address as string, tokenData?.chainId as number)

  const baseTokenValue = useMemo(() => {
    if (!officialPool) return null
    return officialPool.baseTokenLiquidity * tokenData.price
  }, [officialPool])

  const quoteTokenInUsd = useMemo(() => {
    if (!officialPool) return null
    const { quoteTokenPrice, quoteLiquidity } = officialPool
    if (!quoteTokenPrice || !quoteLiquidity) return null
    return Number(quoteTokenPrice) * Number(quoteLiquidity)
  }, [officialPool, tokenData])

  return (
    <>
      <ul className="flex flex-col mx-2.5 text-[calc(1rem*(14/16))] leading-none">
        <li className="flex items-center justify-between border-b border-b-[#1b1b1e] pt-[17px] pb-[16.5px]">
          <span className="font-[330] text-[#908e98]">Pair created</span>
          <div className="font-[380]">
            {officialPool?.createdAt
              ? t('detail.tokenInfo.createdAgo', { time: calculateTimeAgo(dayjs(officialPool?.createdAt).unix() * 1000) })
              : '--'}
          </div>
        </li>
        <li className="flex items-center justify-between border-b border-b-[#1b1b1e] pt-[17px] pb-[16.5px]">
          <span className="font-[330] text-[#908e98]">Pooled {tokenData?.symbol}</span>
          <div className="font-[380]">
            <span>
              {officialPool ? <MoneyFormatted value={officialPool.baseTokenLiquidity} showUnit={false} /> : '--'}
            </span>
            <span className="ml-2">{formatUsdValue(baseTokenValue)}</span>
          </div>
        </li>
        <li className="flex items-center justify-between border-b border-b-[#1b1b1e] pt-[17px] pb-[16.5px]">
          <span className="font-[330] text-[#908e98]">Pooled {officialPool?.quoteSymbol}</span>
          <div className="font-[380]">
            <span>{officialPool ? <MoneyFormatted value={officialPool.quoteLiquidity} showUnit={false} /> : '--'}</span>
            <span className="ml-2">{formatUsdValue(quoteTokenInUsd)}</span>
          </div>
        </li>
        <li className="flex items-center justify-between border-b border-b-[#1b1b1e] pt-[17px] pb-[16.5px]">
          <span className="font-[330] text-[#908e98]">Top pair</span>
          {officialPool ? (
            <AddressDisplay address={officialPool.address} chainId={officialPool.chainId as number} />
          ) : (
            '--'
          )}
        </li>
        <li className="flex items-center justify-between border-b border-b-[#1b1b1e] pt-[17px] pb-[16.5px]">
          <span className="font-[330] text-[#908e98]">{tokenData?.symbol}</span>
          {officialPool ? (
            <AddressDisplay address={officialPool.baseToken} chainId={officialPool.chainId as number} />
          ) : (
            '--'
          )}
        </li>
        <li className="flex items-center justify-between border-b border-b-[#1b1b1e] pt-[17px] pb-[16.5px]">
          <span className="font-[330] text-[#908e98]">{officialPool?.quoteSymbol}</span>
          {officialPool ? (
            <AddressDisplay address={officialPool.quoteToken} chainId={officialPool.chainId as number} />
          ) : (
            '--'
          )}
        </li>
      </ul>

      <CompareTokenPrice tokenDetail={tokenData} />
    </>
  )
}

export default PairDetail
