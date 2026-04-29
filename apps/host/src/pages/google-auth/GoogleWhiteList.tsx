import HeaderWithBack from '@/components/header/HeaderWithBack'
import { useChain } from '@/hooks/useChain'
import { APP_PATH } from '@/lib/constant'
import { walletClient } from '@/lib/gql/apollo-client'
import { addWalletWhitelist, getWalletWhitelist } from '@/services/google.service'
import { ChainIds } from '@/types/enums'
import { getNameFromChainId } from '@/utils/chain'
import { useMutation } from '@apollo/client'
import { zodResolver } from '@hookform/resolvers/zod'
import { get, upperCase } from 'lodash-es'
import { FC, useEffect, useState } from 'react'
import { useForm, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { GoogleAuthFormData, googleAuthSchema } from './schema'

const cryptoTokens = [
  {
    id: 'sol',
    name: 'Solana',
    icon: (
      <div className="w-6 h-6 rounded-full flex items-center justify-center overflow-hidden">
        <img src="/images/icons/ic-solana.png" alt="Base" className="w-full" />
      </div>
    ),
  },
  {
    id: 'eth',
    name: 'Ethereum',
    icon: (
      <div className="w-6 h-6 rounded-full flex items-center justify-center overflow-hidden">
        <img src="/images/icons/ic-ethereum.png" alt="Base" className="w-full" />
      </div>
    ),
  },
  {
    id: 'bsc',
    name: 'Bsc',
    icon: (
      <div className="w-6 h-6 rounded-full flex items-center justify-center overflow-hidden">
        <img src="/images/icons/ic-bsc.png" alt="Base" className="w-full" />
      </div>
    ),
  },
  {
    id: 'base',
    name: 'Base',
    icon: (
      <div className="w-6 h-6 rounded-full flex items-center justify-center overflow-hidden">
        <img src="/images/icons/ic-base.png" alt="Base" className="w-full" />
      </div>
    ),
  },
  {
    id: 'trx',
    name: 'TRX',
    icon: (
      <div className="w-6 h-6 rounded-full flex items-center justify-center overflow-hidden">
        <img src="/images/icons/ic-trx.png" alt="Base" className="w-6 h-6" />
      </div>
    ),
  },
]

export const WhitelistInput = ({ id, isEdit = false, value = '', showEdit = false }: { id: string, isEdit: boolean, value?: string, showEdit?: boolean }) => {
  const { t } = useTranslation()
  const navigate = useNavigate();
  const currentChain = useChain(id as keyof typeof ChainIds)
  const { register, formState: { errors } } = isEdit
    ? useFormContext<GoogleAuthFormData>()
    : { register: () => ({}), formState: { errors: {} as Partial<Record<keyof GoogleAuthFormData, any>> } }
  function handleAddClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    navigate({
      pathname: APP_PATH.MEME_SETTINGS_CONNECT_GOOGLE_AUTH,
      search: `?tab=1`,
    }, {
      state: {
        name: currentChain.name,
      },
      replace: true,
    })
  }
  return (
    <div key={id} className="bg-gradient-to-r from-gray-800 via-gray-800 to-gray-700 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full flex items-center justify-center overflow-hidden">
            <img src={currentChain.logo} alt={currentChain.name} className="w-full" />
          </div>
          <span className="font-bold text-[14px] uppercase">{currentChain.shortName}</span>
        </div>
        {
          showEdit ?
            <button type='button' className="flex items-center gap-1 text-gray-400" onClick={handleAddClick}>
              <img src="/images/tokenDetail/icon-edit.webp" alt="Edit" className="w-4 h-4" />
              <span className="text-sm">{t('google.auth.whitelist.edit')}</span>
            </button> : null
        }
      </div>
      {isEdit ?
        <div>
          <input
            type="text"
            defaultValue={value}
            {...register(currentChain.name as keyof GoogleAuthFormData)}
            className="w-full bg-gray-900 rounded-lg py-3 px-3 border border-gray-700"
            placeholder={t('google.auth.whitelist.notset')}
          />
          { errors && errors[currentChain.name as keyof GoogleAuthFormData] && (
            <p className="text-red-500 text-right text-sm mt-2">
              {t(errors[currentChain.name as keyof GoogleAuthFormData]?.message, { coin: upperCase(currentChain.name) })}
            </p>
          )}
        </div>
        : <span className='block break-words text-sm bg-black rounded-xl px-3 py-4'>{value}</span>}

    </div>
  )
}

const GoogleWhiteList: FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [whitelist, setWhitelist] = useState<string[]>([]);
  const [mutation] = useMutation(addWalletWhitelist, {
    client: walletClient
  })
  useEffect(() => {
    async function fetchWhitelist() {
      try {
        const { data } = await walletClient.query({
          query: getWalletWhitelist,
        })
        const whitelist = get(data, 'getWalletWhitelist.whitelist', []);
        const _items: string[] = [];
        whitelist.forEach((item: { chainId: ChainIds, walletAddress: string }) => {
          const chainKey = getNameFromChainId(item.chainId);
          setValue(chainKey as keyof GoogleAuthFormData, item.walletAddress);
          _items.push(chainKey);
        });
        setWhitelist(_items);
        // Process the fetched whitelist data as needed
      } catch (error) {
        console.error('Error fetching whitelist:', error)
      }
    }
    fetchWhitelist()
  }, [])
  // const {
  //   register,
  //   control,
  //   setError,
  //   clearErrors,
  //   formState: { errors },
  // } = useFormContext<GoogleAuthFormData>()
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
  const { register, formState: { errors }, setValue } = form

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
            google2FA: ''
          },
        },
      })
      // onNextStep()
    } catch (error) {
      console.error('Error adding wallet whitelist:', error)
    }
  };

  const handleBack = () => {
    navigate(-1)
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#111] bg-[url('/images/walletCopy/bg_setting.png')] bg-cover bg-center text-white">
      <HeaderWithBack title={t('google.auth.button.averagePageviews')} onBack={handleBack} className="bg-transparent p-2.5" />
      <div className="flex flex-col text-white px-2.5">
        {/* Warning box */}
        <div className="bg-gray-800 rounded-xl p-4 my-6 border border-gray-700">
          <p className="text-orange-400 text-sm leading-relaxed">{t('google.auth.safety.intro')}</p>
        </div>

        {/* Token list */}
        {/* <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4"> */}
        <div className="space-y-4">
          {cryptoTokens.map((token) => {
            if (!whitelist.includes(token.name)) {
              return (
                <WhitelistInput key={token.id} id={token.name} isEdit={false} showEdit value={t('google.auth.whitelist.notset')} />
              )
            }
          })}
        </div>
        {/* <div className="mt-auto p-4 flex gap-4">
              <Button
                type="submit"
                disabled={Object.keys(errors).length > 0}
                className={`flex-1 h-11 rounded-full ${Object.keys(errors).length > 0 ? 'bg-[rgba(236, 236, 237, 0.12)]' : 'bg-x-gradient'} to-teal-500 text-white font-medium border border-gray-700`}
              // onClick={() => onNextStep()}
              >
                {t('google.auth.button.save')}
              </Button>
            </div> */}
        {/* </form>
        </FormProvider> */}
      </div>
    </div>
  )
}

export default GoogleWhiteList
