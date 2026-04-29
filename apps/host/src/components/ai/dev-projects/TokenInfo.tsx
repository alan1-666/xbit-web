import React from 'react'
import { formatAddressWallet } from '@/lib/string.ts'
import { useTranslation } from 'react-i18next'
import { CopyButton } from '@components/common/copy-button.tsx'
import { WalletAvatar } from '@components/assets/funding/WalletAvatar.tsx'

interface TokenInfoProps {
  devAddress: string
  totalTokens: number
  totalRugged: number
  totalMigrated: number
}

const TokenInfo: React.FC<TokenInfoProps> = (props) => {
  const { devAddress, totalTokens, totalRugged, totalMigrated } = props
  const { t } = useTranslation()

  return (
    <div className="flex items-center gap-3">
      <WalletAvatar address={devAddress} rounded={false} className="w-10 h-10 rounded-[4px]" />
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="text-[calc(14rem/16)] text-white">{formatAddressWallet(devAddress, 5, 5)}</span>
          <CopyButton icon="/images/icons/ic-copy2.svg" text={devAddress ?? ''} />
          <div className="leading-2.75 bg-no-repeat bg-center h-4 flex items-center justify-center">
            <img src="/images/icons/ic-project-party.svg" alt="" />
            <span className="text-[calc(11rem/16)] text-transparent leading-2.75 px-2 absolute bg-[linear-gradient(177.89deg,#FFEFC1_1.78%,#FFC46B_98.35%)] bg-clip-text">
              {t('detail.devProjects.projectParty')}
            </span>
          </div>
        </div>
        <span className="text-[calc(11rem/16)] text-[#FFFFFFB2] mt-1">
          {t('detail.devProjects.statisticText', {
            total: totalTokens,
            rug: totalRugged,
            migrated: totalMigrated,
          })}
        </span>
      </div>
    </div>
  )
}

export default TokenInfo
