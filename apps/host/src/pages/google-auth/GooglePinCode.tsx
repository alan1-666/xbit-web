import { Button } from '@/components/ui/button'
import XModal from '@/components/ui/modal'
import { APP_PATH } from '@/lib/constant'
import { userGqlClient } from '@/lib/gql/apollo-client'
import { disable2FA, verify2FA, verifyTOTP } from '@/services/google.service'
import HeaderWithBack from '@components/header/HeaderWithBack'
import { get } from 'lodash-es'
import React, { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'


const GooglePinCode: FC = () => {
  const [verificationCode, setVerificationCode] = useState<string[]>(Array(6).fill(''))
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState(false)
  const navigate = useNavigate()
  const { t } = useTranslation()
  const isVerify = searchParams.get('verify') || '';

  const handleBack = () => {
    navigate(-1)
  }
  const handleCancel = () => {
    navigate(-1)
  }

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return
    const newCode = [...verificationCode]
    newCode[index] = value
    setVerificationCode(newCode)

    // Move to next input if current one is filled
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`)
      nextInput?.focus()
    }
    //if remove will focus on previous input
    else if (!value && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handlePaste = () => {
    //bind paste event to the input
    navigator.clipboard
      .readText()
      .then((txt) => {
        // const txt = '123456789'
        const inputs = txt.slice(0, 6).split('')
        const newCode = [...verificationCode]
        inputs.forEach((digit, index) => {
          if (index < newCode.length) {
            newCode[index] = digit
          }
        })
        setVerificationCode(newCode)
      })
      .catch((err) => {
        console.error('Failed to read clipboard contents: ', err)
      })
  }

  function handleSubmit(e: React.FormEvent) {
    //code validation
    e.preventDefault()
    const code = verificationCode.join('')
    if (code.length < 6) {
      setError(true)
      return
    }
    // Handle the submission of the verification code
    userGqlClient.query({
      query: isVerify.length ? verify2FA : verifyTOTP,
      variables: { code },
    }).then((response) => {
      const result = get(response, isVerify.length  ? 'data.verify2FA' : 'data.verifyTOTP', false);
      if (result) {
        // Navigate to the next step or show success message
        navigate(APP_PATH.MEME_SETTINGS_WHITELIST_GOOGLE_AUTH)
      } else {
        setError(true)
        // Show modal if verification fails
        setShowModal(true)
      }
    }).catch((error) => {
      console.error('Verification error:', error)
      setError(true)
      // Show modal if verification fails
      // setShowModal(true)
    });
  }

  function handleDisable2FA() {
    // Handle disabling 
    const code = verificationCode.join('')
    if (code.length < 6) {
      setError(true)
      return
    }
    userGqlClient.mutate({
      mutation: disable2FA,
      variables: { code }, // Assuming empty code disables 2FA
    }).then(() => {
      navigate(APP_PATH.MEME_SETTINGS_CONNECT_GOOGLE_AUTH)
    }).catch((error) => {
      console.error('Disable 2FA error:', error)
      setShowModal(true)
    })
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#111] bg-[url('/images/walletCopy/bg_setting.png')] bg-cover bg-center text-white">
      <HeaderWithBack title={t('google.auth.title')} onBack={handleBack} className="bg-transparent p-2.5" />
      <div className="bg-transparent p-2.5">
        <div className="flex-1 px-6 pt-8 pb-16 flex flex-col">
          <div className="mb-12">
            <h1 className="text-3xl font-bold mb-4">{t('google.auth.pincode.title')}</h1>
            <p className="text-gray-300">{t('google.auth.pincode.description')}</p>
          </div>

          {/* Verification code inputs */}
          <div className="flex justify-between">
            {verificationCode.map((digit, index) => (
              <div key={index} className="relative">
                <input
                  id={`code-${index}`}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  className="w-12 h-14 bg-transparent border border-gray-600 rounded-2xl text-center text-xl focus:border-blue-500 focus:outline-none"
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between my-10">
            <span className="text-red-500">
              {error && t('google.auth.warning.verifycode')}
            </span>
            <button onClick={handlePaste} className="text-gray-300">
              {t('google.auth.button.paste')}
            </button>
          </div>

          {/* Submit button */}
          <div className="mt-auto">
            <Button
              className="w-full h-11 rounded-full bg-x-gradient-button text-lg font-medium"
              onClick={handleSubmit}
            >
              {t('google.auth.button.binding')}
            </Button>

            <p className="text-center mt-6 text-gray-400">
              {t('google.auth.warning.not_available')}
              <button type='button' className="text-blue-500" onClick={handleDisable2FA}>{t('google.auth.button.reset')}</button>
            </p>
          </div>
        </div>
      </div>
      <XModal.Reject
        showModal={showModal}
        setShowModal={setShowModal}
        description={[t('google.auth.modal.reject.intro1'), t('google.auth.modal.reject.intro2')]}
      />
    </div>
  )
}

export default GooglePinCode
