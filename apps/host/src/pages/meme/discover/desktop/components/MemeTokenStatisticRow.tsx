import { TokenStatisticRow } from '@pages/meme/discover/desktop/components/TokenStatisticRow2.tsx'

export interface MemeTokenStatisticRowProps {
  devHold: number | null | undefined
  top10Holder: number
  sniperHoldPct: number | null | undefined
  insider: number | null | undefined
  bundlerHoldingPercent: number
  token: string
  creator: string | undefined
  chainId: number
  totalSupply: number
}

export const MemeTokenStatisticRow = (props: MemeTokenStatisticRowProps) => {
  const { devHold, top10Holder, sniperHoldPct, insider, bundlerHoldingPercent, token, creator, chainId, totalSupply } =
    props
  return (
    <TokenStatisticRow
      devHold={devHold ?? 0}
      top10={top10Holder}
      sniper={sniperHoldPct ?? 0}
      insider={insider ?? 0}
      bundler={bundlerHoldingPercent ?? 0}
      address={token}
      creator={creator}
      chainId={chainId}
      totalSupply={totalSupply}
      classNames={{
        devHold: 'data-[state=warning]:text-[#FF353C] data-[state=normal]:text-[#3895A3]',
      }}
    />
  )
}
