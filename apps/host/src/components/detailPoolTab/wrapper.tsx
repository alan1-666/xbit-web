import {useResponsive} from "@hooks/hyperliquid/useResponsive.ts";
import DetailPoolTabPc from "@components/detailPoolTab/pc";
import DetailPoolTab from "@components/detailPoolTab/index.tsx";
import {getLaunchpad} from "@/utils/helpers.ts";

type Props = {
  dexes: string[]
  token?: string
  chainId?: number
  icon?: string
  symbol?: string
  liquidity?: number
}

const PollTransactionWrapper = (props: Props) => {
  const {isDesktop} = useResponsive()
  const { token, chainId, icon, symbol, liquidity, dexes} = props
  const isLauchpad = Boolean(getLaunchpad(dexes))

  if (isDesktop) return (
    <DetailPoolTabPc
      chainId={chainId}
      icon={icon}
      symbol={symbol}
      token={token}
      liquidity={liquidity}
      isLaunchpad={isLauchpad}
    />
  )
  return (
    <DetailPoolTab
      chainId={chainId}
      icon={icon}
      symbol={symbol}
      token={token}
    />
  )
};

export default PollTransactionWrapper
