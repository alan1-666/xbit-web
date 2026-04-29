import { SmartMoneyAction } from '@/@generated/gql/graphql-future.ts'
import { ChainType } from '@/@generated/gql/graphql-meme2.ts'
import { formatAmount, formatVolume } from '@/lib/format'
import { IconSolana } from '@components/icon/IconSolana.tsx'
import { CurrencyType, useCurrencyUnit } from '@components/monitoring/pc/TableRealtimeTxPC.tsx'
import { useActiveChainType } from '@hooks/useActiveChain.ts'

type QuantityRealTimeColumnProps = {
  item: SmartMoneyAction
}

export const handleRenderChainIcon = (activeChainType: ChainType) => {
  switch (activeChainType) {
    case ChainType.Bsc:
      return <img src="/images/icons/ic-bsc.png" alt="icon bsc" className="w-3 h-3" />
    case ChainType.Mon:
      return <img src="/images/icons/chains/ic-monad.svg" alt="icon monad" className="w-3 h-3" />
    default:
      return <IconSolana />
  }
}

const QuantityRealTimeColumn = ({ item }: QuantityRealTimeColumnProps) => {
  const usdValue = Number(item?.usdAmount)
  const solValue = Number(item?.nativeAmount)
  const activeChainType = useActiveChainType()
  const { currencyUnit } = useCurrencyUnit()

  return (
    <div className="flex items-center justify-start gap-1 min-w-[80px]">
      {currencyUnit === CurrencyType.sol ? handleRenderChainIcon(activeChainType) : null}

      {currencyUnit === CurrencyType.sol
        ? formatAmount(solValue)
        : formatVolume(usdValue, {
            showCurrency: true,
          })}
    </div>
  )
}

export default QuantityRealTimeColumn
