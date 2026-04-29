type PositionSide = 'buy' | 'sell';

interface TP_SL_ValidationResult {
  isValid: boolean;
  message?: string;
  orderType?: string
}

export function validateTpSlPrices({
  side,
  marketPrice,
  takeProfit,
  stopLoss,
  orderType = 'market'
}: {
  side: PositionSide;
  marketPrice: number;
  takeProfit: string;
  stopLoss: string;
}): TP_SL_ValidationResult {
  const pirceTypeText = orderType === 'market' ? '市价' : '委托价格'
  if (side === 'buy') {
    if (takeProfit !== '' && parseFloat(takeProfit) < marketPrice) {
      return {
        isValid: false,
        message: `止盈价格不能小于${pirceTypeText}，请重新设置`,
      };
    }
    if (stopLoss !== '' && parseFloat(stopLoss) > marketPrice) {
      return {
        isValid: false,
        message: `止损价不能大于${pirceTypeText}，请重新设置`,
      };
    }
  } else if (side === 'sell') {
    if (takeProfit !== '' && parseFloat(takeProfit) > marketPrice) {
      return {
        isValid: false,
        message: `止盈价格不能大于${pirceTypeText}，请重新设置`,
      };
    }
    if (stopLoss !== '' && parseFloat(stopLoss) < marketPrice) {
      return {
        isValid: false,
        message: `止损价不能小于${pirceTypeText}，请重新设置`,
      };
    }
  }

  return { isValid: true };
}
