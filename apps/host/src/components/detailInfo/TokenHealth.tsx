import { TokenDetail } from '@/@generated/gql/graphql-future'
import { useMemo } from 'react'

type TokenHealthProps = {
  tokenData: TokenDetail
}

const TokenHealth = ({ tokenData }: TokenHealthProps) => {
  const { healthScore, totalScore } = useMemo(() => {
    const health = tokenData?.health
    if (!health)
      return {
        healthScore: 0,
        totalScore: 0,
      }

    const chainId = tokenData?.chainId ? Number(tokenData.chainId) : undefined
    const isSolana = chainId === 501424

    let healthScore = 0
    const totalScore = 4

    if (isSolana) {
      if (health.notMint) healthScore++
      if (health.noBlackListWhiteListFunction) healthScore++
      if (health.burnt) healthScore++
      if (health.top10 && Number(health.top10) * 100 < 20) healthScore++
    } else {
      if (health.canSell) healthScore++
      healthScore++
      if (health.verifiedSourceCode) healthScore++
      healthScore++
    }

    return { healthScore, totalScore }
  }, [tokenData])

  return (
    <>
      <div className="flex items-center gap-[2px]">
        <img src="/images/tokenDetail/icon-shield.svg" className="w-[12px] min-w-[12px]" alt="" />
        <div className="font-[330] text-[12px] text-[#00FFF6] leading-[12px] relative top-[-1px]">
          ({healthScore}/{totalScore})
        </div>
      </div>
    </>
  )
}

export default TokenHealth
