import { Button } from '@/components/ui/button'
import XQRCode from '@/components/ui/qrcode'
import { APP_PATH } from '@/lib/constant'
import { userGqlClient } from '@/lib/gql/apollo-client'
import { setupNew2FA, userIsGoogleAuthenticatorEnabled } from '@/services/google.service'
import { isAndroid, isIOS } from '@/utils/os'
import { useQuery } from '@apollo/client'
import { get } from 'lodash-es'
import { AlertTriangle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Fragment } from 'react/jsx-runtime'

type Props = {
  onNextStep: () => void
}

export function GoogleAuthTab1(props: Props) {
  const { onNextStep } = props
  const { t } = useTranslation()
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false)
  useEffect(() => {
    //check userIsGoogleAuthenticatorEnabled
    function checkUserIsGoogleAuthenticatorEnabled() {
      userGqlClient.query({
        query: userIsGoogleAuthenticatorEnabled,
      }).then((res) => {
        const isEnabled = get(res, 'data.userSettings.googleAuthenticator.isEnabled', false);
        if (isEnabled) {
          // If Google Authenticator is already enabled, navigate to the next step
          navigate({
            pathname: APP_PATH.MEME_SETTINGS_VERIFY_GOOGLE_AUTH,
            search: '?callback=',
          });
        }
      }).catch((error) => {
        console.error('Error checking Google Authenticator status:', error);
        // Optionally, handle the error (e.g., show a notification)
      });
    };
    checkUserIsGoogleAuthenticatorEnabled()
  }, []);
  const { loading, data } = useQuery(setupNew2FA, {
    client: userGqlClient
  })
  const { uri, secretCode } = get(data, 'setupNew2FA', { uri: '', secretCode: '' })

  const handleCopy = () => {
    navigator.clipboard.writeText(secretCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    if (isIOS()) {
      // For iOS, open the link in a new tab
      window.open('https://apps.apple.com/us/app/google-authenticator/id388497605', '_blank');
    }
    else if (isAndroid()) {
      window.open('https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2', '_blank');

    } else {
      window.open('https://support.google.com/accounts/answer/1066447?hl=en&co=GENIE.Platform%3DAndroid', '_blank');
    }
  }
  return (
    <Fragment>
      {/* Main content */}
      <div className=" mt-8 p-6 rounded-lg bg-gradient-to-br from-[#0a0a0f] via-[#00ffff1a] to-[#0a0a0f] shadow-lg overflow-hidden border-gradient">
        <p className="text-center font-normal font-size">{t('google.auth.descriptionQR')}</p>

        {/* QR Code */}
        <div className="flex justify-center my-6">
          <div className="bg-white p-4 rounded-lg">
            {
              loading ? <div className="w-[225px] aspect-square bg-gray-200 animate-pulse rounded-lg"></div> :
                <XQRCode value={uri} />
            }
          </div>
        </div>

        {/* Secret key */}
        <div className="mb-2 text-sm text-gray-400">{t('google.auth.decode')}</div>
        <div className="flex items-center mb-6">
          <div className="flex-1 bg-gray-800 rounded-lg px-4 py-2 text-lg relative flex h-[44px] ">
            <span className='max-w-[90%] overflow-hidden block text-sm leading-6'>{secretCode}</span>
            <button onClick={handleCopy} className="absolute leading-6 right-0 px-4 text-teal-400 hover:text-teal-300 capitalize">
              {copied ? t('google.auth.button.copied') : t('google.auth.button.copy')}
            </button>
            <span className='flex-1 overflow-hidden block text-sm leading-6 flex items-center overflow-x-auto overflow-y-hidden'>{secretCode}</span>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-red-900/30 border border-red-800 rounded-lg p-4 flex items-center text-sm">
          <AlertTriangle className="text-red-500 mr-2 flex-shrink-0 mt-1" size={18} />
          <p className="text-red-200">{t('google.auth.warning.note')}</p>
        </div>
      </div>

      {/* Bottom buttons */}
      <div className="mt-auto py-4 flex gap-4">
        <Button
          type="button"
          className="flex-1 h-11 rounded-full bg-x-gradient to-teal-500 text-white font-medium"
          onClick={handleDownload}
        >
          {t('google.auth.button.download')}
        </Button>
        <Button
          type="button"
          className="flex-1 h-11 rounded-full text-white font-medium"
          onClick={() => navigate({
            pathname: APP_PATH.MEME_SETTINGS_VERIFY_GOOGLE_AUTH,
            search: `?verify=1&callback=${APP_PATH.MEME_SETTINGS_WHITELIST_GOOGLE_AUTH}`
          })}
          variant={'borderGradient'}
        >
          {t('google.auth.button.nextStep')}
        </Button>
      </div>
    </Fragment>
  )
}
