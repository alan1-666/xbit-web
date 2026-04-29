import {useResponsive} from "@hooks/hyperliquid/useResponsive.ts";
import DetailLatestTabPc from "@components/detailLatestTab/pc";
import DetailLatestTab from "@components/detailLatestTab/index.tsx";

const LatestWrapper = () => {
  const { isDesktop } = useResponsive()

  if (isDesktop) return <DetailLatestTabPc />

  return <DetailLatestTab />
}

export default LatestWrapper
