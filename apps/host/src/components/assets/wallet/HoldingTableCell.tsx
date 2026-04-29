import { cn } from "@/lib/utils";
import { get } from "lodash-es";
import { getStyleRiseFall } from "@/lib/format";
import { memo } from "react";
import { useWalletContextFields } from "@/pages/assets/WalletContext";
import MoneyFormatted from "@/components/common/MoneyFormatted";
import TwoValueWithSubColumn from "@/components/detailHolderTab/TwoValueWithSubColumn";

type TProps = {
  row: any
  isUSD: boolean
  priceTokenSOL: number
}

// Memoized cell components that use prices context
export const UnrealizedPnLCell = memo(({ row, isUSD, priceTokenSOL }: TProps) => {
  const { prices } = useWalletContextFields(['prices']);
  const { avgPriceUsd, address, balance, totalBuyAmountUsd } = row.original;
  const _price = get(prices.get, address, 0);
  const unrealizedPnL = avgPriceUsd == 0 ? 0 : (_price - avgPriceUsd) * balance;

  return (
    <div className={`font-medium text-[13px] ${getStyleRiseFall(unrealizedPnL)}`}>
      <TwoValueWithSubColumn
        upperValue={isUSD ? unrealizedPnL : (unrealizedPnL / priceTokenSOL)}
        lowerValue={(unrealizedPnL / totalBuyAmountUsd) * 100}
        upperValueClassName={`app-font-medium text-[13px] leading-[1] ${getStyleRiseFall(unrealizedPnL)}`}
        lowerValueClassName={`text-[330] text-[11px] leading-[1] ${getStyleRiseFall(unrealizedPnL / totalBuyAmountUsd)}`}
        upperUnit={isUSD ? '$' : 'SOL'}
        upperUnitPosition={isUSD ? 'front' : 'back'}
        lowerUnitPosition={'back'}
        lowerUnit={'%'}
        upperMaxDecimal={2}
        lowerMaxDecimal={2}
        isPnL
        roundType='ceil'
        lowerHasSpace={false}
        moneyFormatted={true}
      />
    </div>
  )
});

export const TotalPnLCell = memo(({ row, isUSD, priceTokenSOL }: TProps) => {
  const { prices } = useWalletContextFields(['prices']);
  const { avgPriceUsd, balance, realizedPnL, address, totalBuyAmountUsd } = row.original;
  const _price = get(prices.get, address, 0);
  const _totalPnL = ((_price - avgPriceUsd) * balance) + realizedPnL;

  return (
    <div className={cn("font-medium text-[13px]", getStyleRiseFall(_totalPnL))}>
      <TwoValueWithSubColumn
        upperValue={isUSD ? _totalPnL : _totalPnL / priceTokenSOL}
        lowerValue={(_totalPnL / totalBuyAmountUsd) * 100}
        upperValueClassName={`app-font-medium text-[13px] leading-[1] ${getStyleRiseFall(realizedPnL)}`}
        lowerValueClassName={`text-[330] text-[11px] leading-[1] ${getStyleRiseFall(realizedPnL / totalBuyAmountUsd)}`}
        upperUnit={isUSD ? '$' : 'SOL'}
        upperUnitPosition={isUSD ? 'front' : 'back'}
        lowerUnitPosition={'back'}
        lowerUnit={'%'}
        upperMaxDecimal={2}
        lowerMaxDecimal={2}
        isPnL
        roundType='ceil'
        lowerHasSpace={false}
        moneyFormatted={true}
      />
    </div>
  )
});

export const BalanceCell = memo(({ row, isUSD, priceTokenSOL }: TProps) => {
  const { prices } = useWalletContextFields(['prices']);
  const { address, balance } = row.original;
  const _price = get(prices.get, address, 0);
  const _value = _price * balance

  return (
    <div className="font-medium text-[13px] flex items-center px-2">
      <MoneyFormatted isShort value={`${isUSD ? _value : _value / priceTokenSOL}`} unit={isUSD ? '$' : 'SOL'} defaultValue='0' />
    </div>
  )
});