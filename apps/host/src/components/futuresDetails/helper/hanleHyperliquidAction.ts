import { privateKeyToAccount } from 'viem/accounts';
import { Configs } from '@/const/configs';
import { signStandardL1Action } from '@/components/futuresDetails/hooks/signing';
import { handleHyperliquidOrderError } from '@/components/futuresDetails/helper/handleHyperliquidOrderError';
import { AppDispatch } from '@/redux/store';
import { symbolDexClient } from '@/lib/gql/apollo-client'
import { GET_CLOID, SUMBIT_HYPERLIQUID_ORDER } from '@/services/symbol.dex.service'
import { tConst } from '@/utils/helpers.ts'
import { toast } from 'sonner'
import { isHyperOrderSuccess } from '@/components/futuresDetails/trade/tools'


type HyperliquidActionResult = 'success' | 'fail' | null

type ReportOrderType = "limit" | "market" | "tp_market" | "sl_market" | string;
type ReportOperationType = "open order" | "cancel order";
type ReportOrderStatus = "filled" | "resting" | "cancel";
type ReportGrouping = "na" | "normalTpsl" | "positionTpsl";
type ReportSide = "buy" | "sell";

type ReportOrderData = Partial<{
  baseCoin: string;
  side: ReportSide;
  price: string;
  size: string;
  orderType: ReportOrderType;
  operation: ReportOperationType;
  orderStatus: ReportOrderStatus;
  cloid: string;
  avgPx: string;
  totalSz: string;
  grouping: ReportGrouping;
  created: string;
  walletAddress: string;
}> & {
  oid: string;
};
interface hanleHyperliquidActionProps {
  agentPrivateKey: string
  action: any,
  dispatch: AppDispatch | null,
  showError: boolean,
  walletAddress?: string
  allMeta: any
  showRateLimit?: boolean
}

function getReortOrderType(t: any) {
  if (t?.limit?.tif === 'FrontendMarket') return 'market'
  if (t?.limit?.tif === 'Gtc') return 'limit'
  if (t?.trigger?.tpsl === 'tp') return 'tp_market'
  if (t?.trigger?.tpsl === 'sl') return 'sl_market'
  return 'market'
}

export async function hanleHyperliquidAction(
  {
    agentPrivateKey,
    action,
    dispatch,
    showError = true,
    walletAddress,
    allMeta,
    showRateLimit = true
  }: hanleHyperliquidActionProps
): Promise<HyperliquidActionResult> {
  const nonce = Date.now();


  let cloids: string[] = []

  if (action.type === 'order') {
    try {
      const res: any = await symbolDexClient.query({
        query: GET_CLOID,
        variables: {
          input: {
            count: action.orders.length
          }
        },
      })
      cloids = res?.data?.generateCloid?.cloids
      action.orders = action.orders.map((item: any, index: number) => {
        item.c = cloids[index]
        return item
      })
      if (!cloids || !cloids.length) {
        toast.error(tConst('invite.failedToGenerateCloid'))
        return 'fail'
      }
    } catch (error) {
      toast.error(tConst('invite.failedToGenerateCloid'))
      return 'fail'
    }
  }


  const wallet = privateKeyToAccount(agentPrivateKey);
  const signature = await signStandardL1Action(action, wallet, null, nonce);


  const response = await fetch(`${Configs.getHyperliquidConfig().apiUrl}/exchange`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: action,
      nonce,
      signature,
      vaultAddress: null,
    }),
  });

  if (response?.status === 429 && showRateLimit) {
    toast.error(
      tConst('futuresDetails.common.rateLimitExceeded') ||
      'Too many requests. Please try again later.'
    );
    return 'fail';
  }

  const result = await response.json();
  const isSuccess = isHyperOrderSuccess(result)

  if (isSuccess.ok) {
    let reportOrderData: ReportOrderData

    try {
      if (action.type === 'order') {
        const filled = result.response.data.statuses[0]?.filled
        const resting = result.response.data.statuses[0]?.resting

        reportOrderData = action.orders.map((item: any, index: number) => {
          const orderType = getReortOrderType(item.t)
          let orderStatus
          if (orderType === 'sl_market' || orderType === 'tp_market') {
            orderStatus = 'resting'
          } else {
            orderStatus = filled?.oid ? "filled" : "resting"
          }
          return {
            baseCoin: allMeta[item.a]?.name,
            side: item.b ? 'buy' : 'sell',
            price: item.p,
            size: item.s,
            orderType: orderType,
            operation: "openOrder",
            orderStatus: orderStatus,
            oid: filled?.oid || resting?.oid || "",
            cloid: cloids[index],
            avgPx: filled?.avgPx || resting?.avgPx || "",
            totalSz: filled?.totalSz || resting?.totalSz || "",
            grouping: action.grouping,
            created: nonce,
            walletAddress: walletAddress

          }
        })
      }
      if (action.type === 'cancel') {
        reportOrderData = action.cancels.map((item: any) => {
          return {
            baseCoin: allMeta[item.a]?.name,
            operation: "cancelOrder",
            orderStatus: "cancel",
            oid: item.o,
            created: nonce,
            walletAddress: walletAddress

          }
        })
      }

      console.log('reportOrderData', reportOrderData!)

      if (action.type === 'order' || action.type === 'cancel') {
        Promise.resolve().then(async () => {
          try {
            await symbolDexClient.mutate({
              mutation: SUMBIT_HYPERLIQUID_ORDER,
              variables: {
                input: reportOrderData! || [],
              }
            })
          } catch (err) {
            console.error("reportOrderData submit failed", err)
          }
        })
      }



    } catch (error) {

    }

  }

  if (showError && dispatch) {
    if (result.status === 'err') {
      handleHyperliquidOrderError(result.response, dispatch);
      return 'fail';
    }

    return 'success';
  }
  return result

}

/*  let a = {
    baseCoin: "BTC",
    side: "buy", // buy | sell,
    price: "100343.2",
    size: "0.0003",
    orderType: "limit", // "limit | market | tp_market" | "sl_market"  后面可能有个其他类型
    operation: "open order", // openOrder | cancelOrder,
    orderStatus: "filled", // filled ｜ resting ｜ cancel // 实际订单状态应该拿交易成交为准
    oid: "1232", 
    cloid: "1232", // 可为空， 只有open order才有这个
    avgPx: "100343.2", //  可为空， 只有open order并且有成交才有这个
    totalSz: "0.0003", // //  可为空， 只有open order并且有成交才有这个
    grouping: "na", //  "na" | "normalTpsl" | "positionTpsl"
    created: string;
    walletAddress: string;
  }
 */