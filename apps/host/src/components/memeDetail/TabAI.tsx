import AIAnalytics from '@components/aiAnalytics'
import { TokenDetail } from '@/@generated/gql/graphql-meme2.ts'

export interface TabAIProps {
  show: boolean
  address: string | undefined
  tokenData?: TokenDetail
}

export const TabAI = (props: TabAIProps) => {
  const { show, address, tokenData } = props
  if (!show) return null
  return (
    <div id="tab-ai">
      <AIAnalytics address={address} tokenData={tokenData} />
    </div>
  )
}
