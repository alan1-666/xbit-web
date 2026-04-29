import OfficialDataAnalysis from './OfficialDataAnalysis'
import OnChainAnalytics from './OnChainAnalytics'
import OnChainTextAnalysis from './OnChainTextAnalysis'
import { TokenDetail } from '@/@generated/gql/graphql-meme2.ts'

export interface AIAnalyticsProps {
  address: string | undefined
  tokenData?: TokenDetail
}

const AIAnalytics = (props: AIAnalyticsProps) => {
  const { address, tokenData } = props
  return (
    <div className="mt-4">
      <div className="px-[10px]">
        <OnChainAnalytics address={address} tokenData={tokenData} />
        <OnChainTextAnalysis tokenAddress={address} />
      </div>
      <OfficialDataAnalysis tokenData={tokenData} />
      {/*<InfluentialFollowers />*/}
    </div>
  )
}

export default AIAnalytics
