import TokenItem from './TokenItem'
import { Token } from './types'
import { Skeleton } from '@components/ui/skeleton.tsx'

/**
 * Props for the token list component
 */
interface TokenListProps {
  tokens: Token[]
  onSelect: (token: Token) => void
  loading: boolean
}

const TokenListSkeleton = () => {
  return (
    <div className="flex flex-col gap-2 mt-4 text-sm font-[350] overflow-y-auto flex-1 no-scrollbar">
      {Array.from({ length: 10 }).map((_, index) => (
        <div key={index} className="py-3 border-b">
          <Skeleton className="w-full h-11" />
        </div>
      ))}
    </div>
  )
}

/**
 * Component for displaying a list of tokens
 */
const TokenList = ({ tokens, onSelect, loading }: TokenListProps) => {
  if (loading) return <TokenListSkeleton />
  return (
    <div className="flex flex-col gap-2 mt-4 text-sm font-[350] overflow-y-auto flex-1 no-scrollbar">
      {tokens.map((token) => (
        <TokenItem key={token.id} token={token} onSelect={onSelect} />
      ))}
    </div>
  )
}

export default TokenList
