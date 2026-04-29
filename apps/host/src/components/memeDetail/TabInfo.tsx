import { TokenAlert } from '@components/detailInfo/TokenAlert.tsx'
import DetailBanner from '@components/detailBanner'
import DetailToken from '@components/detailToken'
import PairDetail from '@components/pairDetail'
import { TokenDetail } from '@/@generated/gql/graphql-core'
import { cn } from '@/lib/utils.ts'

export interface TabInfoProps {
  tokenData: TokenDetail
  show: boolean
}

/**
 * TabInfo component displays detailed information about a token.
 * Always keeps the token data visible because
 * @param props
 * @constructor
 */
export const TabInfo = (props: TabInfoProps) => {
  const { tokenData, show } = props
  return (
    <div id="tab-info" className={cn(show ? 'block' : 'hidden')}>
      {show && (
        <>
          <TokenAlert tokenData={tokenData} />
          <DetailBanner tokenData={tokenData} />
        </>
      )}
      <DetailToken tokenData={tokenData} />
      {show && <PairDetail tokenData={tokenData} />}
    </div>
  )
}
