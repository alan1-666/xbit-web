import { useResponsive } from '@hooks/hyperliquid/useResponsive.ts'
import DetailHolderPc from '@components/detailHolderTab/pc'
import DetailHolderTab from '@components/detailHolderTab/index.tsx'
import { TokenDetail } from '@/@generated/gql/graphql-core.ts'
import { TokenDetail as TokenDetailMeme2 } from '@/@generated/gql/graphql-future.ts'

type Props = {
  tokenData: TokenDetail | TokenDetailMeme2
}

const DetailHolderWrapper = ({ tokenData }: Props) => {
  const { isDesktop } = useResponsive()

  if (isDesktop) return <DetailHolderPc tokenData={tokenData as TokenDetail} />

  return <DetailHolderTab circulatingSupply={tokenData?.circulatingSupply} />
}

export default DetailHolderWrapper
