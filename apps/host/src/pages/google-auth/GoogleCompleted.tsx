import HeaderWithBack from '@/components/header/HeaderWithBack'
import { Button } from '@/components/ui/button'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

type Props = {
  status?: 'sucess' | 'error'
}

const GoogleCompleted: FC<Props> = (props) => {
  const { status = 'sucess' } = props
  const { t } = useTranslation()
  const navigate = useNavigate()

  const handleBack = () => {
    navigate(-1)
  }

  return (
    <div className="flex flex-col text-white min-h-[calc(100vh_-_100px)]">
      <HeaderWithBack title={''} onBack={handleBack} className="bg-transparent p-2.5" />
      <div className="px-2.5 flex-1 flex flex-col">
        <div className="main-content flex-1">
          {/* Token list */}
          <div className="flex justify-center pt-15">
            <img src="/images/google-success.png" alt="" />
          </div>
          <div className="flex flex-col items-center justify-center mt-4">
            <h1 className="text-sm text-center font-medium my-4">{t('google.auth.completed.title')}</h1>
            <div className="p-4 border bg-[rgba(236,236,237,0.08)] w-full rounded-lg">
              <p className="text-sm">
                {t('google.auth.completed.msg')}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-auto p-4 flex gap-4 flex-0">
          <Button
            type="button"
            variant={'borderGradient'}
            className={`flex-1 h-11 rounded-full text-white font-medium border border-gray-700`}
            onClick={() => {}}
          >
            {t('google.auth.button.cancel')}
          </Button>
          <Button
            type="button"
            variant={'gradient'}
            className={`flex-1 h-11 rounded-full bg-x-gradient to-teal-500 text-black font-medium border border-gray-700`}
            onClick={() => {}}
          >
            {t('google.auth.button.confirmReset')}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default GoogleCompleted
