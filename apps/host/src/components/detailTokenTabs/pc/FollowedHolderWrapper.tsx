import { TokenDetail } from '@/@generated/gql/graphql-meme2.ts'
import { TokenDetailState } from '@/redux/modules/tokenDetail.slice.ts'
import { RootState, useAppSelector } from '@/redux/store'
import DetailFollowedHolderTab from '@components/detailFollowedHolderTab'
import HoldersTablePc from '@components/detailHolderTab/pc/HoldersTablePc.tsx'
import { useResponsive } from '@hooks/hyperliquid/useResponsive.ts'

type Props = {
  tokenData?: TokenDetail
}

const FollowedHolderWrapper = (props: Props) => {
  const { tokenData } = props
  const { isDesktop } = useResponsive()
  const { price: ohlcPrice } = useAppSelector((state: RootState) => state.tokenDetail as TokenDetailState)

  if (isDesktop) {
    return <HoldersTablePc tokenData={tokenData} isFollowed />
  }

  return (
    <DetailFollowedHolderTab fallbackPrice={ohlcPrice} circulatingSupply={tokenData?.circulatingSupply} />
  )
}

export default FollowedHolderWrapper
