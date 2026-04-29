import { TokenDetail as TokenDetailMeme1 } from '@/@generated/gql/graphql-core.ts'
import { TokenDetail } from '@/@generated/gql/graphql-meme2.ts'
import ChartHoldersPc from '@components/detailHolderTab/pc/HolderChartPc.tsx'
import FilterTagsPc from '@components/detailHolderTab/pc/FilterTagsPc.tsx'
import Top100StatisticsHoldersPc from '@components/detailHolderTab/pc/Top100StatisticsHoldersPc.tsx'
import HoldersTablePc from '@components/detailHolderTab/pc/HoldersTablePc.tsx'

type Props = {
  tokenData: TokenDetailMeme1
}

const DetailHolderPc = ({ tokenData }: Props) => {
  return (
    <div className="px-0 pt-2">
      <ChartHoldersPc />
      <FilterTagsPc token={tokenData?.address || ''} />
      <Top100StatisticsHoldersPc token={tokenData?.address ?? ''} />
      <HoldersTablePc tokenData={tokenData as TokenDetail} />
    </div>
  )
}

export default DetailHolderPc
