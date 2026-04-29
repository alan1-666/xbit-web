import { CellContext } from '@tanstack/react-table'
import { get } from 'lodash-es'
import { useTranslation } from 'react-i18next'
import { useMemo } from 'react'

/**
 * Logic for displaying Copy type:
 * - If order is Buy, check buy_type field:
 *   - buy_type = MaxAmount: show "Max Buy"
 *   - buy_type = FixedAmount: show "Fixed Buy"
 * - If order is Sell, check sell_type field:
 *   - sell_type = Auto: show "Auto Sell"
 *   - sell_type = NoCopy: show "No Copy"
 *   - sell_type = SingleTPSL: show "CustomTPSL Single" (with "Single" in blue)
 *   - sell_type = MultiTPSL: show "CustomTPSL Batch" (with "Batch" in yellow)
 */
export default function CopyTypeCell(props: CellContext<any, any>) {
  const { t, i18n } = useTranslation()
  const isZhOrHk = i18n.language === 'zh' || i18n.language === 'hk'

  const row = props.row.original
  const transactionType = String(row.type || row.transactionType || '').toLowerCase()
  const isBuy = transactionType === 'buy'

  const text = useMemo(() => {
    const copyConfigSnapshot = get(row, 'copyConfigSnapshot', {})
    if (isBuy) {
      const buyType = get(copyConfigSnapshot, 'buy_type', '').toString()

      if (buyType === 'MaxAmount') {
        return t('walletCopy.buyType.MaxAmount')
      }

      if (buyType === 'FixedAmount') {
        return t('walletCopy.buyType.FixedAmount')
      }

      return '--'
    } else {
      const sellType = get(copyConfigSnapshot, 'sell_type', '').toString()

      if (sellType === 'Auto') {
        return t('walletCopy.sellType.Auto')
      }

      if (sellType === 'NoCopy') {
        return t('walletCopy.sellType.NoCopy')
      }

      if (sellType === 'SingleTPSL') {
        return (
          <>
            {t('walletCopy.sellType.SingleTPSL')}
            {isZhOrHk ? '·' : <>&nbsp;</>}
            <span className="text-[#00FFF6]">{t('walletCopy.single')}</span>
          </>
        )
      }

      if (sellType === 'MultiTPSL') {
        return (
          <>
            {t('walletCopy.sellType.MultiTPSL')}
            {isZhOrHk ? '·' : <>&nbsp;</>}
            <span className="text-[#EA963A]">{t('walletCopy.batch')}</span>
          </>
        )
      }

      return '--'
    }
  }, [isBuy, row, t])

  return <div className="flex items-center min-w-34 pr-1">{text}</div>
}
