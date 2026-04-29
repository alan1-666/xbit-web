import { Button } from '@/components/ui/button'
import { APP_PATH } from '@/lib/constant'
import { walletClient } from '@/lib/gql/apollo-client'
import { cn } from '@/lib/utils'
import { addWalletWhitelist, getWalletWhitelist } from '@/services/google.service'
import { ChainIds } from '@/types/enums'
import { useMutation, useQuery } from '@apollo/client'
import { zodResolver } from '@hookform/resolvers/zod'
import { get } from 'lodash-es'
import { FC, useMemo } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { WhitelistInput } from './GoogleWhiteList'
import { GoogleAuthFormData, googleAuthSchema } from './schema'
import { toast } from 'sonner'

type Props = {
  status?: 'sucess' | 'error'
}

const GoogleWalletEmpty: FC = () => {
  const { t } = useTranslation()
  return (
    <div className="main-content flex-1">
      {/* Token list */}
      <div className="flex justify-center pt-15">
        <img src="/images/logo-google-auth.svg" alt="" />
      </div>
      <div className="flex flex-col items-center justify-center mt-4">
        <h1 className="text-sm text-center font-medium my-4 flex">
          <img src="/images/icons/icon-check.svg?v=2" alt="" className='mr-2' />
          {t('google.auth.completed.bindingTitle')}
        </h1>
        <div className="p-4 border bg-[rgba(236,236,237,0.08)] w-full rounded-lg">
          <p className="text-sm text-center">
            {t('google.auth.completed.bindingIntro')}
          </p>
        </div>
      </div>
    </div>
  )
};

const GoogleWallet: FC<Props> = (props) => {
  const { status = 'sucess' } = props
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { state } = useLocation()
  const wallet = get(state, 'name', false);
  const form = useForm<GoogleAuthFormData>({
    defaultValues: {
      Solana: '',
      Ethereum: '',
      Bsc: '',
      Base: '',
      TRX: '',
    },
    resolver: zodResolver(googleAuthSchema),
    mode: 'onChange',
  })
  const [mutation] = useMutation(addWalletWhitelist, {
    client: walletClient
  })

  const handleBack = () => {
    navigate(-1)
  }

  const { data } = useQuery(getWalletWhitelist, {
    client: walletClient,
  })

  const whitelist = useMemo(() => {
    return get(data, 'getWalletWhitelist.whitelist', [])
  }, [data])

  function buildData(data: GoogleAuthFormData) {
    const _result: { chainId: ChainIds, walletAddress: string }[] = [];
    for (const key in data) {
      if (data[key as keyof GoogleAuthFormData].length) {
        _result.push({
          chainId: ChainIds[key as keyof typeof ChainIds],
          walletAddress: data[key as keyof GoogleAuthFormData],
        })
      }
    }
    return _result
  }

  const handleSubmit = async (data: any) => {
    // onSubmit(data)
    try {
      const response = await mutation({
        variables: {
          input: {
            wallets: buildData(data),
            google2FA: '123'
          },
        },
      })
      const callback = searchParams.get('callback');
      if (callback) {
        navigate(callback)
      } else {
        setSearchParams((prev) => {
          prev.set('tab', '2')
          return prev;
        })
      }
      // onNextStep()
    } catch (error) {
      console.error('Error adding wallet whitelist:', error)
    }
  };


  return (
    <div className="flex flex-col text-white min-h-[calc(100vh_-_200px)]">
      <div className={cn(['bg-gray-800 rounded-xl p-4 my-6 border border-gray-700', whitelist.length || wallet ? 'block' : 'hidden'])}>
        <p className="text-orange-400 text-sm leading-relaxed">{t('google.auth.safety.warning')}</p>
      </div>
      <div className="flex-1 flex flex-col">
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="">
            {
              whitelist.length ? (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    {whitelist.map((item: any, index: number) => <WhitelistInput key={index} id={item.chainId} isEdit={false} value={item.walletAddress} />
                    )}
                  </div>
                  {
                    wallet ? (
                      <WhitelistInput id={wallet} isEdit={true} value={''} />
                    ) : null
                  }
                </div>
              ) : wallet ?
                <WhitelistInput id={wallet} isEdit={true} value={''} />
                : <GoogleWalletEmpty />
            }
            {
              wallet ? (
                <div className="mt-auto p-4 flex gap-4 flex-0">
                  <Button
                    type="submit"
                    variant={'gradient'}
                    className={`flex-1 h-11 rounded-full bg-x-gradient to-teal-500 text-black font-medium border border-gray-700 capitalize`}
                  >
                    {t('google.auth.button.saveAverage')}
                  </Button>
                </div>
              ) : (
                <div className="mt-auto p-4 flex gap-4 flex-0">
                  <Button
                    type="button"
                    variant={'borderGradient'}
                    className={`flex-1 h-11 rounded-full text-white font-medium border border-gray-700 capitalize`}
                    onClick={() => navigate(-1)}
                  >
                    {t('google.auth.button.cancelAverage')}
                  </Button>
                  <Button
                    type="button"
                    variant={'gradient'}
                    className={`flex-1 h-11 rounded-full bg-x-gradient to-teal-500 text-black font-medium border border-gray-700 capitalizes`}
                    onClick={() => navigate(APP_PATH.MEME_SETTINGS_WHITELIST_GOOGLE_AUTH)}
                  >
                    {t('google.auth.button.averagePageviews')}
                  </Button>
                </div>
              )
            }
          </form>
        </FormProvider>
      </div>
    </div>
  )
}

export default GoogleWallet
