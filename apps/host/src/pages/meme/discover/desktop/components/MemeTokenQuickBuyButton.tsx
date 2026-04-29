import { MemeTokenWithFormatted } from '@/types/token.ts'
import { QuickBuyButton } from '@components/discover/QuickBuyButton.tsx'
import { MigratingStatus } from '@pages/meme/discover/desktop/components/MigratingStatus.tsx'

export interface MemeTokenQuickBuyButtonProps {
  token: MemeTokenWithFormatted
  allowMigratingState?: boolean
}

export const MemeTokenQuickBuyButton = (props: MemeTokenQuickBuyButtonProps) => {
  const { token, allowMigratingState = false } = props

  if (token.internalMarketProgress >= 100 && allowMigratingState) {
    return <MigratingStatus token={token} />
  }

  return (
    <div>
      <QuickBuyButton
        token={{
          ...token,
          decimals: token.decimals ? Number(token.decimals) : 0,
        }}
        className="bg-impartal shadow-none h-[30px]"
        showUnit={true}
      />
    </div>
  )
}
