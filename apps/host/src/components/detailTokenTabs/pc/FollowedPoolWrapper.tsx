import {useResponsive} from "@hooks/hyperliquid/useResponsive.ts";
import PcLPChangeTable from "@components/detailPoolTab/pc/PcLPChangeTable.tsx";
import {ChainIds} from "@/types/enums.ts";
import DetailFollowedPoolTab from "@components/detailFollowedPoolTab";

type Props = {
  token?: string
  chainId?: number
  icon?: string
  symbol?: string
}
const FollowedPoolWrapper = (props: Props) => {
  const { token, chainId, icon, symbol } = props
  const { isDesktop } = useResponsive()

  if (isDesktop) return (
    <PcLPChangeTable
      token={token ?? ""}
      chainId={chainId ?? ChainIds.Solana}
      icon={icon}
      symbol={symbol}
      isFollowed
    />
  )
  return (
    <DetailFollowedPoolTab
      token={token ?? ""}
      chainId={chainId ?? ChainIds.Solana}
      icon={icon}
      symbol={symbol}
    />
  );
};

export default FollowedPoolWrapper;
