import { TransactionType } from '@/@generated/gql/graphql-trading'
import TradeSettingsBottomSheet from '@/components/common/TradeSettingsBottomSheet'
import { IconWarningCircle } from '@/components/icon'
import { SOL_DECIMALS } from '@/hooks/useCreateOrder'
import { useTradeConfig } from '@/hooks/useTradeConfig'
import { TYPE_CHAIN } from '@/lib/blockchain'
import { formatBalanceWallet } from '@/lib/number'
import { useAppSelector } from '@/redux/store'
import { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
type TProps = {
  isPC?: boolean
}
const TransactionSettingsSection: FC<TProps> = (props) => {
  const { isPC = false } = props
  const { t } = useTranslation()
  const [openTradeSettings, setOpenTradeSettings] = useState(false)
  const activeChain = useAppSelector((state) => state.newWallet.activeChain) as TYPE_CHAIN
  const { config, fee } = useTradeConfig({
    transactionType: TransactionType.Buy,
  })
  return (
    <div className="px-[12px] relative w-full">
      <div className="w-full h-10 flex flex-row items-center justify-between text-[11.67px] text-[#FFFFFFCC]">
        <div className="flex flex-row items-center gap-[3.5px]">
          <div className="tracking-[0.29px] leading-[100%]">{t('walletCopy.settings.transactionSettings')}</div>
          <div className="text-[12.83px] tracking-[0.32px] text-[#FFFFFFCC]">{t('walletCopy.settings.global')}</div>
        </div>
        <div className="flex flex-row items-center gap-[3.5px]">
          <div className="tracking-[0.29px]">{t('walletCopy.settings.slippage')}</div>
          <div className="text-[12.83px] tracking-[0.32px] text-[#FFFFFFCC]">
            {/* {get(tradeSettings[activeChain][selectedPresetKey - 1], ['buy', 'slippage'], 0)}% */}
            {`${config?.slippage || '--'}%`}
          </div>
        </div>
        <div className="flex flex-row items-center gap-[2.3px]">
          <div className="tracking-[0.29px]">{t('walletCopy.settings.priorityFee')}</div>
          <div className="text-[12.83px] tracking-[0.32px] text-[#FFFFFFCC]">
            {/* {formatBalanceWallet({
              balance: (() => {
                if (!networkFee || !networkFee.priorityFeePrice) return 0
                const feeType = get(tradeSettings[activeChain][selectedPresetKey - 1], ['buy', 'fee', 'type'], 'high')
                const feeValue = networkFee.priorityFeePrice[feeType as keyof typeof networkFee.priorityFeePrice] ?? 0
                return getFeeSol(feeValue) * priceSol
              })(),
              decimal: 3,
            })} */}
            {formatBalanceWallet({
              balance: fee || '--',
              decimal: SOL_DECIMALS,
            })}
          </div>
        </div>
        <div className="flex flex-row items-center gap-[4.7px]">
          <div className="flex flex-row items-start gap-[2.3px]">
            <div className="tracking-[0.29px]">{t('walletCopy.settings.antiSandwich')}</div>
            <div className="text-[12.83px] tracking-[0.32px] text-[#FFFFFFCC]">
              {!!config?.mevProtect ? t('walletCopy.settings.on') : t('walletCopy.settings.off')}
            </div>
          </div>
          <div className="w-3.5 h-3.5">
            <IconWarningCircle />
          </div>
        </div>
      </div>
      <div className="opacity-1 absolute top-0 right-0 left-0 w-full h-full cursor-pointer z-10">
        <TradeSettingsBottomSheet
          open={openTradeSettings}
          transactionType={TransactionType.Buy}
          setOpen={setOpenTradeSettings}
          hiddenButtonToggle
        />
      </div>
    </div>
  )
}

export default TransactionSettingsSection
