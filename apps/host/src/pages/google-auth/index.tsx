; <div className="flex-1 h-[1px] border-t border-dashed border-gray-600"></div>
import { TabItem } from '@/components/assets/WaveTabs'
import XModal from '@/components/ui/modal'
import Steps from '@/components/ui/Steps'
import { Tabs } from '@/components/ui/tabs'
import HeaderWithBack from '@components/header/HeaderWithBack'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { GoogleAuthTab1 } from './GoogleAuthTab1'
import GoogleCompleted from './GoogleCompleted'
import GoogleWallet from './GoogleWallet'

const GoogleAuth: React.FC = () => {
  const [showModal, setShowModal] = useState(false)
  const [searchParams] = useSearchParams()
  const tab = parseInt(searchParams.get('tab') || '0')
  const [currentStep, setCurrentStep] = useState<number>(tab)
  const navigate = useNavigate()
  const { t } = useTranslation()

  // const form = useForm<GoogleAuthFormData>({
  //   defaultValues: {
  //     sol: '',
  //     eth: '',
  //     bsc: '',
  //     base: '',
  //     trx: '',
  //   },
  //   resolver: zodResolver(googleAuthSchema),
  //   mode: 'onChange',
  // })
  // const handleSubmit = (data) => {
  //   // onSubmit(data)
  //   console.log('🚀 ~ handleSubmit ~ data:', data)
  // };

  const handleCancel = () => {
    navigate(-1)
  }
  const tabs: TabItem[] = [
    { label: t('assets.futures.positions'), value: 'positions' },
    { label: t('assets.futures.assets'), value: 'assets' },
  ]

  const handleBack = () => {
    navigate(-1)
  }

  const handleNextStep = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1)
    } else {
      // Handle final step logic here
      console.log('Final step reached')
    }
  }

  const renderTabContent = () => {
    switch (currentStep) {
      case 0:
        return <GoogleAuthTab1 onNextStep={handleNextStep} />
      case 1:
        return <GoogleWallet />
      case 2:
        return <GoogleCompleted />
      default:
        return <GoogleCompleted status='error' />
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#111] bg-[url('/images/walletCopy/bg_setting.png')] bg-cover bg-center text-white">
      <HeaderWithBack title={t('google.auth.title')} onBack={handleBack} className="bg-transparent p-2.5" />
      <div className="bg-transparent py-2.5">
        <div className="px-2.5">
          <Steps
            size="small"
            current={currentStep}
            items={[
              {
                title: '',
                description: t('google.auth.steps.step1'),
              },
              {
                title: '',
                description: t('google.auth.steps.step2'),
              },
              {
                title: '',
                description: t('google.auth.steps.step3'),
              },
            ]}
          />
        </div>
        {/* <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
          > */}
        <Tabs
          tabs={tabs}
          activeTabIndex={currentStep}
          onTabChange={(_, index) => setCurrentStep(index)}
        />
        <div className="px-2.5">{renderTabContent()}</div>
        {/* </form>
        </FormProvider> */}
      </div>
      <XModal.Reject
        showModal={showModal}
        setShowModal={setShowModal}
        description={[t('google.auth.modal.reject.intro1'), t('google.auth.modal.reject.intro2')]}
      />
    </div>
  )
}

export default GoogleAuth
