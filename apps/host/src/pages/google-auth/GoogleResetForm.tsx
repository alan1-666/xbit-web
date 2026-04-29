import { Button } from '@/components/ui/button'
import HeaderWithBack from '@components/header/HeaderWithBack'
import { Copy, Plus } from 'lucide-react'
import { FC, useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { GoogleAuthResetFormData } from './schema'
import UploadComponent from '@/components/ui/Upload/UploadComponent'
interface UploadFile {
  uid: string
  name: string
  status: 'uploading' | 'done' | 'error'
  url?: string
  percent?: number
  response?: any
  error?: any
  originFileObj?: File
}
const GoogleResetForm: FC = () => {
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { register, handleSubmit } = useForm<GoogleAuthResetFormData>({
    defaultValues: {
      tgAccount: '',
      telegramUserId: '',
      email: '',
      verificationCode: '',
      walletAddress: '',
      screenShots: '',
    },
  })

  // Example custom request function
  const customRequest = ({ file, onSuccess }: { file: File; onSuccess: (res: any) => void }) => {
    // Simulate a successful upload after 2 seconds
    setTimeout(() => {
      onSuccess('ok')
    }, 2000)

    // Return upload cancellation if needed
    return {
      abort() {
        console.log('Upload aborted')
      },
    }
  }

  const handlePreview = (file: UploadFile) => {
    if (file.url) {
      window.open(file.url)
    }
  }

  const handleSendVerificationCode = () => {
    // Logic to send verification code
    alert('Verification code sent')
  }

  const onSubmit: SubmitHandler<GoogleAuthResetFormData> = (data) => {
    console.log(data)
  }

  const handleBack = () => {
    navigate(-1)
  }

  return (
    <div className="flex flex-col text-white min-h-[calc(100vh_-_100px)]">
      <HeaderWithBack title={t('google.auth.title')} onBack={handleBack} className="bg-transparent p-2.5" />
      <div className="px-2.5 flex-1 flex flex-col">
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 pt-4 pb-8 space-y-6">
          {/* Warning box */}
          <div className="bg-gray-800 rounded-xl p-4">
            <p className="text-orange-400 text-sm leading-relaxed">{t('google.auth.reset.intro')}</p>
          </div>

          {/* Section 1 */}
          <div className="space-y-2">
            <label className="block text-sm">
              <span className="font-medium">1. {t('google.auth.reset.form.label1')} </span>
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder={t('google.auth.reset.form.placeholder1')}
              {...register('tgAccount')}
              className="w-full bg-gray-800 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Section 2 */}
          <div className="space-y-2">
            <label className="block text-sm">
              <span className="font-medium">2. {t('google.auth.reset.form.label2')}</span>
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder={t('google.auth.reset.form.placeholder2')}
              {...register('telegramUserId')}
              className="w-full bg-gray-800 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center text-gray-400">
                <span>/userid</span>
                <button className="ml-1">
                  <Copy size={16} />
                </button>
              </div>
              <a href="#" className="text-blue-400">
                {t('google.auth.reset.form.offlineTelegram')}
              </a>
            </div>
          </div>

          {/* Section 3 */}
          <div className="space-y-2">
            <label className="block text-sm">
              <span className="font-medium">3. {t('google.auth.reset.form.label3')} </span>
              <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              placeholder={t('google.auth.reset.form.placeholder3')}
              {...register('email')}
              className="w-full bg-gray-800 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <div className="flex gap-3 mt-3">
              <input
                type="text"
                placeholder={t('google.auth.reset.form.placeholder4')}
                {...register('verificationCode')}
                className="flex-1 bg-gray-800 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <Button
                type="button"
                onClick={handleSendVerificationCode}
                className="bg-x-gradient-button rounded-lg px-4 py-6"
              >
                {t('google.auth.reset.form.sendVerify')}
              </Button>
            </div>
          </div>

          {/* Section 4 */}
          <div className="space-y-2">
            <label className="block text-sm">
              <span className="font-medium">4. {t('google.auth.reset.form.label4')} </span>
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder={t('google.auth.reset.form.placeholder5')}
              {...register('walletAddress')}
              className="w-full bg-gray-800 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <p className="text-gray-500 text-xs mt-2">{t('google.auth.reset.form.exampleWallet')}</p>
          </div>

          {/* Section 5 */}
          <div className="space-y-2">
            <label className="block text-sm">
              <span className="font-medium">5. {t('google.auth.reset.form.label5')}</span>
              <span className="text-red-500">*</span>
            </label>
            <p className="text-gray-500 text-xs">{t('google.auth.reset.form.supportWallet')}</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {/* <button type="button" className="w-20 h-20 bg-gray-800 rounded-lg flex items-center justify-center">
                <Plus size={24} className="text-gray-400" />
              </button> */}
              <UploadComponent
                multiple
                listType="picture-card"
                onChange={setFileList}
                customRequest={customRequest}
                onPreview={handlePreview}
                accept="image/*"
              />
            </div>
          </div>
          {/* Submit button */}
          <div className="pt-6">
            <Button
              type="submit"
              className="w-full h-14 bg-gray-700 hover:bg-gray-600 rounded-full text-lg font-medium"
            >
              {t('google.auth.reset.form.submit')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default GoogleResetForm
