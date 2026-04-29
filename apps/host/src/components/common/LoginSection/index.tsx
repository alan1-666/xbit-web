import Container from '@components/common/Container.tsx'
import ButtonTelegram from './ButtonTelegram'
import ButtonWallet from './ButtonWallet'
import { useTranslation } from 'react-i18next'

const LoginSection = () => {
  const { t } = useTranslation()

  return (
    <section className="login-section mt-[2rem] mb-[calc(1rem*(22/16))]">
      <Container>
        <h2 className="text-[1rem] font-[400] text-center leading-[1] mb-[calc(1rem*(36/16))]">
          {t('login.tradingPromptTitle')}
        </h2>
        <div className="flex align-middle justify-center gap-[calc(1rem*(12/16))] px-[calc(1rem*(25/16))]">
          <ButtonTelegram />
          <ButtonWallet />
        </div>
      </Container>
    </section>
  )
}

export default LoginSection
