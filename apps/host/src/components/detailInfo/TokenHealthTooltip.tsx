import { TokenDetail } from '@/@generated/gql/graphql-meme2.ts'
import { useMemo, useState } from 'react'
import ContractMonitoring from '@components/detailInfo/contractMonitoring/index.tsx'

type TokenHealthTooltipProps = {
  tokenData: TokenDetail
}

const TokenHealthTooltip = ({ tokenData }: TokenHealthTooltipProps) => {
  const [openContractMonitoring, setOpenContractMonitoring] = useState<boolean>(false)

  const isLoading = !tokenData || !tokenData.health

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
      <div
        className={`flex items-center flex-col gap-1.5 ${
          isLoading ? 'animate-pulse bg-[#ECECED14] cursor-default' : 'cursor-pointer'
        }`}
        onClick={isLoading ? undefined : () => setOpenContractMonitoring(true)}
      >
        <img src="/images/tokenDetail/icon_new_shield_v2.svg" className="w-[17px] min-w-[17px] h-[18px]" alt="" />
        <div className="text-[calc(1rem*(11/16))] text-[#00CE89] leading-[1]">
          {isLoading ? (
            <div className="w-[30px] h-[14px] bg-[#ECECED33] rounded animate-pulse"></div>
          ) : (
            `(${healthScore}/${totalScore})`
          )}
        </div>
      </div>
      <ContractMonitoring
        open={openContractMonitoring}
        setOpen={setOpenContractMonitoring}
        showTrigger={false}
        tokenData={tokenData}
      />
    </>
  )
}

export default TokenHealthTooltip
