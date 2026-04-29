import { TokenTopBarCard, TopBarToken } from '@components/v2/desktop/TokenTopBarCard.tsx'

export interface TopBarTokensListProps {
  tokens: TopBarToken[]
  onRemove?: (token: TopBarToken) => void
  showRemove?: boolean
}

export const TopBarTokensList = (props: TopBarTokensListProps) => {
  const { tokens = [], onRemove, showRemove = false } = props
  return (
    <div className="min-w-fit h-full flex gap-5 items-center">
      {tokens.map((token) => (
        <TokenTopBarCard key={token.address} token={token} onRemove={onRemove} showRemoveIcon={showRemove} />
      ))}
    </div>
  )
}
