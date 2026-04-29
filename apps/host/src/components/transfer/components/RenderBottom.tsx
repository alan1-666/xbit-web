import React, { Dispatch, SetStateAction } from 'react'
import { Token } from '../types/ExchangeMeta'
import Text from '@/components/common/Text'
import { IconWalletBalance } from '@/components/icon'
import { useTranslation } from 'react-i18next'
import { formatNumberWithCommas } from '@/utils/helpers'

const RenderBottom = ({
  setOpenSelectWalletDrawer,
  displayedAddress,
  selectedToken,
  showAddress,
  walletName,
  walletIndex,
  isContractAccount,
  displayedBalance,
  disabled,

  onMaxClick,
}: {
  onMaxClick: () => void
  walletIndex: number
  walletName?: string | undefined
  showAddress: boolean
  selectedToken: Token | null
  displayedAddress: string
  isContractAccount: boolean | undefined
  displayedBalance: string
  disabled: boolean
  setOpenSelectWalletDrawer: Dispatch<SetStateAction<boolean>>
}) => {
  const { t } = useTranslation()
  return (
    <div>
      <div className="flex flex-row justify-between pt-[10px]">
        <div className="inline-flex items-center gap-1">
          {showAddress ? (
            selectedToken?.chainName?.toLowerCase() === 'solana' ? (
              <button className="inline-flex items-center gap-1" onClick={() => setOpenSelectWalletDrawer(true)}>
                <Text text={`${walletName}` + walletIndex} fontSize={12} fontWeight="medium" className="" />
                <span className="text-[11px] text-[#FFFFFFB2]">{displayedAddress}</span>
                <img src="/images/cryptoDeposit/arrow-down.svg" alt="" className="w-[10px] h-[10px]" />
              </button>
            ) : (
              <span className="text-[12px] text-[#FFFFFFB2]">{displayedAddress}</span>
            )
          ) : (
            ''
          )}
        </div>
        <div className="inline-flex items-center gap-1">
          <IconWalletBalance />

          <Text
            text={`${isContractAccount ? t('assets.transfers.withdrawableBalance') : t('assets.transfers.balance')}:`}
            fontSize={13}
            fontWeight="light"
            color="#FFFFFFCC"
            className=""
          />
          <span className="text-[13px] text-[#FFFFFFB2]">
            {formatNumberWithCommas(
              displayedBalance ? displayedBalance.toString() : '0',
              selectedToken?.symbol === 'USDC' ? 4 : 5,
            )}
          </span>
          {!disabled && (
            <button
              className="text-[#AB57FF] ml-2 text-[13px] "
              onClick={onMaxClick}
              disabled={Number(displayedBalance) === 0 ? true : false}
            >
              {t('assets.transfers.max')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default RenderBottom
