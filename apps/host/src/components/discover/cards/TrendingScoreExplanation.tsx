import { TokenStatisticDto } from '@/@generated/gql/graphql-core.ts'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip.tsx'
import { MouseEvent, ReactNode } from 'react'
import { MemeDto } from '@/@generated/gql/graphql-future.ts'


const DebugTableHead = (props: { children: ReactNode }) => {
  return <thead className="bg-[#ECECED14]">{props.children}</thead>
}

const DebugTableRow = (props: { children: ReactNode }) => {
  return <tr className="border-b border-[#ECECED14] divide-x">{props.children}</tr>
}

const DebugTableCell = (props: { children: ReactNode }) => {
  return <td className="text-[calc(1rem*(10/16))] leading-4 text-[#FFFFFFCC] px-2 py-1">{props.children}</td>
}

export const TrendingScoreExplanation = (props: { token: TokenStatisticDto | MemeDto }) => {
  const token = props.token
  const debug = token.debug
  const debugData = debug ? debug.debugData : null
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          className="cursor-pointer"
          onClick={(event: MouseEvent) => {
            event.stopPropagation()
            event.preventDefault()
          }}
        >
          <img
            src="/images/icons/info.svg"
            alt="info"
            className="w-4 h-4"
            onMouseDown={(event: MouseEvent) => {
              event.preventDefault()
            }}
          />
        </TooltipTrigger>
        <TooltipContent
          onClick={(event: MouseEvent) => {
            event.stopPropagation()
          }}
          className="bg-[linear-gradient(90deg,#A53EFF66_20%,#00F7A566_100%)] p-[1px] rounded-[4px] max-h-[40vh] overflow-y-auto no-scrollbar"
          collisionBoundary={document.getElementById('main-content') as HTMLElement}
        >
          <p className="bg-[#141414] px-2 py-3 rounded-[4px] max-w-[786px]">
            <span className="font-medium italic">
              Final Score = Base Score × Security Boost × Age Boost × Age Penalty × Liquidity Penalty × Volume
              Multiplier × Transaction Multiplier
            </span>
            <br />
            <br />
            <table className="w-full border p-2 border-collapse">
              <DebugTableHead>
                <tr>
                  <th className="text-left text-[calc(1rem*(10/16))] leading-4 text-[#FFFFFF80] px-2 w-1/2">Name</th>
                  <th className="text-left text-[calc(1rem*(10/16))] leading-4 text-[#FFFFFF80] px-2">Value</th>
                </tr>
              </DebugTableHead>
              <tbody>
              <DebugTableRow>
                <DebugTableCell>Final Score</DebugTableCell>
                <DebugTableCell>{debugData?.finalScore ?? '--'}</DebugTableCell>
              </DebugTableRow>
              <DebugTableRow>
                <DebugTableCell>Base Score</DebugTableCell>
                <DebugTableCell>{debugData?.normalizedBase ?? '--'}</DebugTableCell>
              </DebugTableRow>
              <DebugTableRow>
                <DebugTableCell>Security Boost</DebugTableCell>
                <DebugTableCell>{debugData?.securityBoost ?? '--'}</DebugTableCell>
              </DebugTableRow>
              <DebugTableRow>
                <DebugTableCell>Age Boost</DebugTableCell>
                <DebugTableCell>{debugData?.ageBoost ?? '--'}</DebugTableCell>
              </DebugTableRow>
              <DebugTableRow>
                <DebugTableCell>Age Penalty</DebugTableCell>
                <DebugTableCell>{debugData?.agePenalty ?? '--'}</DebugTableCell>
              </DebugTableRow>
              <DebugTableRow>
                <DebugTableCell>Liquidity Penalty</DebugTableCell>
                <DebugTableCell>{debugData?.liquidityPenalty ?? '--'}</DebugTableCell>
              </DebugTableRow>
              <DebugTableRow>
                <DebugTableCell>Volume Multiplier</DebugTableCell>
                <DebugTableCell>{debugData?.volumeMultiplier ?? '--'}</DebugTableCell>
              </DebugTableRow>
              <DebugTableRow>
                <DebugTableCell>Transaction Multiplier</DebugTableCell>
                <DebugTableCell>{debugData?.transactionMultiplier ?? '--'}</DebugTableCell>
              </DebugTableRow>
              </tbody>
            </table>
            <p className="pt-3 pb-1 break-all">
              *Base score = WeightTx × capZ(zTx) + WeightVol × capZ(zVol) + WeightPrice × capZ(zPrice) + WeightHolder ×
              capZ(zHolder) + WeightLiq × capZ(zLiq) + 4.0
            </p>
            <table className="w-full border p-2 border-collapse">
              <DebugTableHead>
                <tr>
                  <th className="text-left text-[calc(1rem*(10/16))] leading-4 text-[#FFFFFF80] px-2 w-1/8">Factor</th>
                  <th className="text-left text-[calc(1rem*(10/16))] leading-4 text-[#FFFFFF80] px-2 w-1/8">Value</th>
                  <th className="text-left text-[calc(1rem*(10/16))] leading-4 text-[#FFFFFF80] px-2 w-1/8">Weight</th>
                  <th className="text-left text-[calc(1rem*(10/16))] leading-4 text-[#FFFFFF80] px-2 w-1/8">zScore</th>
                  <th className="text-left text-[calc(1rem*(10/16))] leading-4 text-[#FFFFFF80] px-2 w-1/8">capZ</th>
                  <th className="text-left text-[calc(1rem*(10/16))] leading-4 text-[#FFFFFF80] px-2 w-3/8">Note</th>
                </tr>
              </DebugTableHead>
              <tbody>
              <DebugTableRow>
                <DebugTableCell>TxCount</DebugTableCell>
                <DebugTableCell>{debugData?.txCount ?? '--'}</DebugTableCell>
                <DebugTableCell>0.15</DebugTableCell>
                <DebugTableCell>{debugData?.zTx}</DebugTableCell>
                <DebugTableCell>{debugData?.cappedZTx}</DebugTableCell>
                <DebugTableCell>
                  <p>Total buy and sell transactions</p>
                  <p>mean: {debugData?.avgTx ?? '--'}</p>
                  <p>standard_deviation: {debugData?.sdTx ?? '--'}</p>
                </DebugTableCell>
              </DebugTableRow>
              <DebugTableRow>
                <DebugTableCell>VolUsd</DebugTableCell>
                <DebugTableCell>{debugData?.volUsd}</DebugTableCell>
                <DebugTableCell>0.3</DebugTableCell>
                <DebugTableCell>{debugData?.zVol}</DebugTableCell>
                <DebugTableCell>{debugData?.cappedZVol}</DebugTableCell>
                <DebugTableCell>
                  Total volume in USD
                  <p>mean: {debugData?.avgVol ?? '--'}</p>
                  <p>standard_deviation: {debugData?.sdVol ?? '--'}</p>
                </DebugTableCell>
              </DebugTableRow>
              <DebugTableRow>
                <DebugTableCell>PriceChange</DebugTableCell>
                <DebugTableCell>{debugData?.priceChange}</DebugTableCell>
                <DebugTableCell>0.25</DebugTableCell>
                <DebugTableCell>{debugData?.zPrice}</DebugTableCell>
                <DebugTableCell>{debugData?.cappedZPrice}</DebugTableCell>
                <DebugTableCell>
                  (close_price - open_price) / open_price × 100
                  <p>mean: {debugData?.avgPriceChange ?? '--'}</p>
                  <p>standard_deviation: {debugData?.sdPriceChange ?? '--'}</p>
                </DebugTableCell>
              </DebugTableRow>
              <DebugTableRow>
                <DebugTableCell>HolderGrowthPercentage</DebugTableCell>
                <DebugTableCell>{debugData?.holderGrowthPercentage}</DebugTableCell>
                <DebugTableCell>0.15</DebugTableCell>
                <DebugTableCell>{debugData?.zHolder}</DebugTableCell>
                <DebugTableCell>{debugData?.cappedZHolder}</DebugTableCell>
                <DebugTableCell>
                  (current_holders - old_holders) / old_holders
                  <p>mean: {debugData?.avgHg ?? '--'}</p>
                  <p>standard_deviation: {debugData?.sdHg ?? '--'}</p>
                </DebugTableCell>
              </DebugTableRow>
              <DebugTableRow>
                <DebugTableCell>LiqMCPercentage</DebugTableCell>
                <DebugTableCell>{debugData?.liqMCPercentage}</DebugTableCell>
                <DebugTableCell>0.2</DebugTableCell>
                <DebugTableCell>{debugData?.zLiq}</DebugTableCell>
                <DebugTableCell>{debugData?.cappedZLiq}</DebugTableCell>
                <DebugTableCell>
                  Ratio of liquidity / marketcap
                  <p>mean: {debugData?.avgLq ?? '--'}</p>
                  <p>standard_deviation: {debugData?.sdLq ?? '--'}</p>
                </DebugTableCell>
              </DebugTableRow>
              </tbody>
            </table>
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
