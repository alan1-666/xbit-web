import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

type EmptyFollowingStateProps = {
  text?: string
  linkCTA?: string
  linkText?: string
}

const EmptyFollowingState = ({
  text,
  linkCTA,
  linkText
}: EmptyFollowingStateProps) => {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col items-center justify-center py-10">
      <p className="text-[13px] leading-[1.4] text-center text-white mb-4 max-w-[350px]">
        {text ?? t('emptyFollowing.message.default')}
      </p>
      <Link
        to={linkCTA ?? '/meme/smart-money?walletType=SmartMoney&tab=topTalents'}
        className="purple-btn-gradient !text-white text-[calc(1rem*(14/16))] leading-[1] font-[500] tracking-[calc(1rem*(0.5/16))] p-[13px_12.5px] rounded-[50px]"
      >
        {linkText ?? t('emptyFollowing.cta')}
      </Link>
    </div>
  )
}

export default EmptyFollowingState
