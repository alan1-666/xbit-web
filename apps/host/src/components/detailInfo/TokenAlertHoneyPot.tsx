import { useState } from 'react'
import { TokenDetail } from '@/@generated/gql/graphql-future'
import { ChainIds } from '@/types/enums'
import { useTranslation } from 'react-i18next'

export interface TokenAlertProps {
  tokenData?: TokenDetail
}

export const TokenAlertHoneyPot = (props: TokenAlertProps) => {
  const { t } = useTranslation()
  const { tokenData } = props
  const chainId = tokenData?.chainId

  const isOnlyHoneyPot = !!tokenData?.isHoneypot && tokenData?.isHoneypot && tokenData?.ownershipRenounced
  const isOnlyRenounedTag = !!tokenData?.isHoneypot && !tokenData?.isHoneypot && !tokenData?.ownershipRenounced
  const isBothHoneypotRenounced = !!tokenData?.isHoneypot && tokenData?.isHoneypot && !tokenData?.ownershipRenounced

  const [isShow, setIsShow] = useState(true)

  if (!isShow || (!!chainId && +chainId !== ChainIds.Bsc)) return <></>
  if (!isOnlyHoneyPot && !isOnlyRenounedTag && !isBothHoneypotRenounced) return <></>

  return (
    <div className="bg-[linear-gradient(90deg,#ff273d33_0%,#ff273d14_100%)] flex items-center justify-between px-2.5 py-2 lg:px-3 rounded-[4px]">
      <div className="flex items-center">
        <img src="/images/icons/danger.svg" alt="icon alert" className="w-[14px] h-[14px]" />
        <div className="text-white text-[calc(12rem/16)] ml-2 leading-4 lg:text-[13px] font-[330]">
          {isOnlyHoneyPot && t('detail.tokenDetail.alertHoneyPot')}
          {isOnlyRenounedTag && t('detail.tokenDetail.alertRenouned')}
          {isBothHoneypotRenounced &&
            `${t('detail.tokenDetail.alertRenouned')} ${t('detail.tokenDetail.alertRenouned')}`}
        </div>
      </div>

      <img
        src="/images/icons/icon-x.svg"
        alt="icon close"
        className="w-5 h-5 cursor-pointer"
        onClick={() => setIsShow(false)}
      />
    </div>
  )
}
