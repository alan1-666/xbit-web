import Text from '@/components/common/Text'
import { useTranslation } from 'react-i18next'

interface IPTranferStatus {
  type: 'pending' | 'sussces' | 'error'
}

const TranferStatus = ({ type }: IPTranferStatus) => {
  const { t } = useTranslation()
  return (
    <div className="mx-auto flex space-x-2 items-center">
      {type === 'pending' && (
        <>
          <span>
            <img src="/images/loading-spint.png" className="size-[17.5px] animate-spin" alt="load more" />
          </span>
          <Text text={t('assets.transfers.swapPath')} fontSize={16} fontWeight="light" />
          <Text text={`${t('assets.transfers.estimatedTime')} 180s`} fontSize={13} fontWeight="light" color="#FFFFFF80" />
        </>
      )}
      {type === 'sussces' && (
        <>
          <span>
            <img src={'/images/icons/icon-success-2.svg'} alt="icon error" className="size-[17px]" />
          </span>
          <Text text={t('assets.transfers.swapSuccess')} fontSize={16} fontWeight="light" color="#00FFB4" />
        </>
      )}
      {type === 'error' && (
        <>
          <span>
            <img src={'/images/icons/icon-error.svg'} alt="icon error" className="size-[17px]" />
          </span>
          <Text text={t('assets.transfers.swapFailed')} fontSize={16} fontWeight="light" color="#E14650" />
        </>
      )}
    </div>
  )
}

export default TranferStatus
