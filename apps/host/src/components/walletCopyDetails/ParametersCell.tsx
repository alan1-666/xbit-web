import { get } from "lodash-es";
import { useTranslation } from "react-i18next";

interface OrderItem {
  [key: string]: any;
}

export interface ParametersCellProps {
  tp: string | undefined
  sl: string | undefined
  type: 'buy' | 'sell'
  row: OrderItem
}

export default function ParametersCell(props: ParametersCellProps) {
  const { tp, sl, type = 'buy', row } = props
  const { t } = useTranslation()

  function getParameters(_type: 'buy' | 'sell') {
    const copyConfigSnapshot = get(row, 'copyConfigSnapshot', {})

    if (_type === 'buy') {
      return '--'
    }

    if (_type === 'sell') {
      const sellType = get(copyConfigSnapshot, 'sell_type', '')
      
      // Normalize to handle both 'Auto' and 'auto' cases
      const normalizedSellType = String(sellType)

      switch (normalizedSellType) {
        case 'SingleTPSL': {
          // Get tp and sl from snapshot (fallback to copyConfig if snapshot not available)
          const snapshotTp = get(copyConfigSnapshot, 'tp', null)
          const snapshotSl = get(copyConfigSnapshot, 'sl', null)
          const singleTp = snapshotTp !== null ? snapshotTp : get(copyConfigSnapshot, 'tp', tp || '')
          const singleSl = snapshotSl !== null ? snapshotSl : get(copyConfigSnapshot, 'sl', sl || '')
          return tpSlTemplate(singleTp, singleSl)
        }
        
        case 'MultiTPSL': {
          // Get copyConfigSnapshot from snapshot
          const multiTPSLTriggered = get(copyConfigSnapshot, 'multi_tpsl_triggered', null)
          
          if (Array.isArray(multiTPSLTriggered)) {
            const value = parseFloat(multiTPSLTriggered.at(-1)?.value || 0)
            const sellRate = parseFloat(multiTPSLTriggered.at(-1)?.sell_rate || 0)
            
            return tpSrTemplate(value, sellRate)
          }
          
          return '--'
        }
        
        default:
          return '--'
      }
    }

    return '--'
  }
  
  function tpSlTemplate(tp: string | number, sl: string | number) {
    const tpValue = parseFloat(String(tp || '0')) * 100
    const slValue = parseFloat(String(sl || '0')) * 100
    
    return (
      <>
        <div className="p-1 bg-[#00FFB41A] text-[#00CE89] rounded-sm break-keep w-max">
          {t('walletCopy.takeProfit')} {tpValue}%
        </div>
        <div className="p-1 bg-[#FF2C4D1A] text-[#BE4561] rounded-sm break-keep w-max">
          {t('walletCopy.stopLoss')} {slValue}%
        </div>
      </>
    )
  }
  
  function tpSrTemplate(value: number, sellRate: number) {
    const valuePercent = Math.abs(value) * 100
    const sellRatePercent = sellRate * 100
    
    // If value < 0, show SL (remove minus sign)
    // If value > 0, show TP
    const isStopLoss = value < 0
    
    return (
      <>
        {isStopLoss ? (
          <div className="p-1 bg-[#FF2C4D1A] text-[#BE4561] rounded-sm break-keep w-max">
            {t('walletCopy.stopLoss')} {valuePercent}%
          </div>
        ) : (
          <div className="p-1 bg-[#00FFB41A] text-[#00CE89] rounded-sm break-keep w-max">
            {t('walletCopy.takeProfit')} {valuePercent}%
          </div>
        )}
      <div className="p-1 bg-[#FF2C4D1A] text-[#BE4561] rounded-sm break-keep w-max">
          {t('walletCopy.sellRate')} {sellRatePercent}%
        </div>
      </>
    )
  }
  
  return (
    <div className="flex items-center gap-1">{getParameters(String(type).toLocaleLowerCase() as 'buy' | 'sell')}</div>
  )
}
