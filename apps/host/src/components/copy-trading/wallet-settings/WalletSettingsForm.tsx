import {
  ConfigBuyType,
  ConfigPlatform,
  ConfigSellType,
  CopyTradeConfig,
  CreateCopyTradeConfigInput,
} from '@/@generated/gql/graphql-trading'
import { Skeleton } from '@/components/ui/skeleton'
import { tradingClient } from '@/lib/gql/apollo-client'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import {
  createCopyTradeConfig,
  getCopyTradeConfigById,
  listCopyTradeConfig,
  updateCopyTradeConfig,
} from '@/services/copytrade.service'
import { totalListKeysInArray } from '@/utils/array'
import { saveFirstPageToStorage } from '@/utils/storage'
import { useQuery } from '@apollo/client'
import { zodResolver } from '@hookform/resolvers/zod'
import { get } from 'lodash-es'
import { FC, useEffect, useMemo, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import ActionButtons from './ActionButtons'
import AdvancedSettingsSection from './AdvancedSettingsSection'
import BuySettingsSection from './BuySettingsSection'
import { CopyTradeContextProvider, useCopyTradeContextFields } from './CopyTradeContext'
import FollowAddressSection from './FollowAddressSection'
import { WalletSettingsFormData, getWalletSettingsSchema } from './schema'
import SellSettingsSection from './SellSettingsSection'
import { cn } from '@/lib/utils'
import { TradeSettingsConfirm } from '@/components/common/TradeSettingsBottomSheet'
import { useActiveChainId } from '@/hooks/useActiveChain'
import { ChainIds } from '@/types/enums'

interface WalletSettingsFormProps {
  initialValues?: Partial<WalletSettingsFormData>
  onCancel: () => void
  isPC?: boolean
  onSuccess?: () => void
  /**
   * currentId: is id of copy trade config for edit
   */
  currentId?: string
  /**
   * leaderAddress: is address of leader, if has will show form with initial value has leaderAddress
   */
  leaderAddress?: string
}

// if listKeys contains empty string, set it to 0
const listKeysRemoveEmpty = [
  'minMarketCap',
  'maxMarketCap',
  'minLiquidity',
  'maxLiquidity',
  'minAmount',
  'maxAmount',
  'minCreationTimeInt',
  'maxCreationTimeInt',
  // 'minBurnLiquidity',
]
const listKeysRemoveEmptyNull = ['maxPurchasePerToken', 'minCreationTimeInt', 'maxCreationTimeInt']

const WalletSettingsFormSkeleton = () => {
  return (
    <div className="p-2.5">
      <Skeleton className="w-full h-[70px] mb-[10px]" />
      <Skeleton className="w-full h-[160px] mb-[10px]" />
      <Skeleton className="w-full h-[350px] mb-[5px]" />
    </div>
  )
}

const WalletSettingsForm: FC<WalletSettingsFormProps> = (props) => {
  const { initialValues, onCancel, isPC = false, onSuccess, currentId = '', leaderAddress = '' } = props
  const { pcMode } = useCopyTradeContextFields(['pcMode'])
  useEffect(() => {
    pcMode.set(isPC)
  }, [isPC])
  const activeWallet = useSelector(_activeWallet)
  const [loading, setLoading] = useState(true)
  const { t } = useTranslation()
  const navigate = useNavigate()
  const idParam = useParams().id
  const id = useMemo(() => currentId || idParam, [currentId, idParam])
  const activeChainId = useActiveChainId() ?? ChainIds.Solana

  const defaultValues: WalletSettingsFormData = {
    leaderAddress,
    buyType: ConfigBuyType.MaxAmount,
    configAmount: '',
    sellType: ConfigSellType.Auto,
    customSellType: ConfigSellType.SingleTpsl,
    tp: '',
    sl: '',
    trailingSl: false,
    minMarketCap: '',
    maxMarketCap: '',
    minLiquidity: '',
    maxLiquidity: '',
    minAmount: '',
    maxAmount: '',
    minCreationTimeInt: '',
    maxCreationTimeInt: '',
    minBurnLiquidity: '',
    maxPurchasePerToken: '',
    platform: [ConfigPlatform.Moonshot, ConfigPlatform.Pump, ConfigPlatform.Raydium, ConfigPlatform.Others],
    tpslConfig: [
      {
        value: 100,
        sellRate: 50,
      },
      {
        value: 300,
        sellRate: 100,
      },
      {
        value: -50,
        sellRate: 100,
      },
    ],
    ...initialValues,
  }
  const schema = useMemo(() => getWalletSettingsSchema(activeChainId), [activeChainId])

  const methods = useForm<WalletSettingsFormData>({
    defaultValues,
    resolver: zodResolver(schema),
    mode: 'onChange',
  })

  const { data: dataCopyTradeConfig } = useQuery(getCopyTradeConfigById, {
    variables: {
      input: {
        id: id,
      },
    },
    skip: !id,
    client: tradingClient,
    onCompleted: () => {
      setLoading(false)
    },
  })

  useEffect(() => {
    if (id && dataCopyTradeConfig) {
      const config = dataCopyTradeConfig?.getCopyTradeConfig as CopyTradeConfig
      const configMapped = Object.fromEntries(
        Object.entries(config).map(([key, value]) => [key, value === '0' ? '' : value]),
      )
      const configReset = Object.assign(defaultValues, {
        ...configMapped,
        sl: !!configMapped?.sl ? parseFloat(`${configMapped?.sl}`) * 100 : '',
        tp: !!configMapped?.tp ? parseFloat(`${configMapped?.tp}`) * 100 : '',
        customSellType: [ConfigSellType.MultiTpsl, ConfigSellType.SingleTpsl].includes(config?.sellType)
          ? configMapped?.sellType
          : ConfigSellType.MultiTpsl,
        sellType: [ConfigSellType.MultiTpsl, ConfigSellType.SingleTpsl].includes(config?.sellType)
          ? 'custom'
          : configMapped?.sellType,
        maxPurchasePerToken: configMapped?.maxPurchasePerToken ?? '',
        minBurnLiquidity: !!configMapped?.minBurnLiquidity
          ? (parseFloat(`${configMapped?.minBurnLiquidity}`) * 100).toFixed(0)
          : '',
        ...(!!config?.minMarketCap && {
          minMarketCap: +configMapped.minMarketCap / 1000 == 0 ? '' : +configMapped.minMarketCap / 1000,
        }),
        ...(!!config?.maxMarketCap && {
          maxMarketCap: +configMapped.maxMarketCap / 1000 == 0 ? '' : +configMapped.maxMarketCap / 1000,
        }),
        ...(!!config?.minLiquidity && {
          minLiquidity: +configMapped.minLiquidity / 1000 == 0 ? '' : +configMapped.minLiquidity / 1000,
        }),
        ...(!!config?.maxLiquidity && {
          maxLiquidity: +configMapped.maxLiquidity / 1000 == 0 ? '' : +configMapped.maxLiquidity / 1000,
        }),
        ...(!!config.tpslConfig && {
          tpslConfig: config.tpslConfig.map((item) => ({
            value: parseFloat(`${item.value}`) * 100,
            sellRate: parseFloat(`${item.sellRate}`) * 100,
          })),
        }),
      })
      methods.reset(configReset)
    } else {
      setLoading(false)
    }
    listKeysRemoveEmpty.forEach((key) => {
      if (methods.getValues(key as keyof WalletSettingsFormData) == 0) {
        methods.setValue(key as keyof WalletSettingsFormData, '')
      }
    })
  }, [id, dataCopyTradeConfig])

  const handleSubmit = methods.handleSubmit(async (data) => {
    // submitBlacklistAddress(data.blacklistTokens?.[data.blacklistTokens.length - 1]?.address || '')
    let param: CreateCopyTradeConfigInput = {} as CreateCopyTradeConfigInput
    const { tpslConfig, ...dataWithoutTpslConfig } = data
    param = {
      ...dataWithoutTpslConfig,
      sellType: data.sellType === 'custom' ? data.customSellType : data.sellType,
      walletAddress: activeWallet?.walletAddress,
      chainId: activeWallet?.chainId?.toString(),
      configAmount: data.configAmount || '0',
      minMarketCap: !!data.minMarketCap ? +data.minMarketCap * 1000 : '',
      maxMarketCap: !!data.maxMarketCap ? +data.maxMarketCap * 1000 : '',
      minLiquidity: !!data.minLiquidity ? +data.minLiquidity * 1000 : '',
      maxLiquidity: !!data.maxLiquidity ? +data.maxLiquidity * 1000 : '',
      minCreationTimeInt: data.minCreationTimeInt ? +data.minCreationTimeInt : undefined,
      maxCreationTimeInt: data.maxCreationTimeInt ? +data.maxCreationTimeInt : undefined,
      maxPurchasePerToken: data.maxPurchasePerToken ? +data.maxPurchasePerToken : null,
      // minBurnLiquidity: !!data.minBurnLiquidity ? parseFloat(`${data.minBurnLiquidity}`) / 100 : '',
      sl: !!data.sl ? parseFloat(`${data.sl}`) / 100 : '',
      tp: !!data.tp ? parseFloat(`${data.tp}`) / 100 : '',
      ...(!!data.tpslConfig && {
        tpslConfig: data.tpslConfig.map((item) => ({
          value: parseFloat(`${item.value || 0}`) / 100,
          sellRate: parseFloat(`${item.sellRate || 0}`) / 100,
        })),
      }),
    }

    if (!!data.minBurnLiquidity) {
      const minBurn =
        typeof data.minBurnLiquidity === 'string' ? parseInt(data.minBurnLiquidity) : data.minBurnLiquidity
      if (minBurn > 0) {
        param.minBurnLiquidity = minBurn / 100
        param.maxBurnLiquidity = 1
      } else {
        delete param.minBurnLiquidity
      }
    } else if (!!id) {
      param.minBurnLiquidity = 0
    } else {
      delete param.minBurnLiquidity
    }

    // const paramCleaned = Object.fromEntries(Object.entries(param).filter(([_, value]) => value !== ''))
    const paramCleaned = Object.fromEntries(
      Object.entries(param)
        .map(([key, value]) => {
          if (listKeysRemoveEmpty.includes(key) && value === '') {
            return [key, 0]
          }
          if (listKeysRemoveEmptyNull.includes(key) && value === '') {
            return [key, null]
          }
          return [key, value]
        })
        .filter(([_, value]) => value !== ''),
    )
    delete paramCleaned.customSellType
    delete paramCleaned.blacklistTokens
    if (paramCleaned.sellType !== ConfigSellType.SingleTpsl) {
      delete paramCleaned.trailingSl
    }
    if (!!id) modifyCopyTradeConfig(paramCleaned)
    else createTradeConfig(paramCleaned)
  })

  // Function to create or modify the copy trade configuration
  async function refetchCopyTradeConfig() {
    const { data } = await tradingClient.query({
      query: listCopyTradeConfig,
      variables: {
        input: {
          page: 1,
          size: 20,
          chainId: activeWallet?.chainId,
        },
      },
    })
    const _rawData = get(data, 'listCopyTradeConfig.items', [])
    const _result: any = []
    if (_rawData.length > 0) {
      //calculate statistics
      _rawData.forEach((item: any) => {
        const statistics = get(item, 'statistic.copyTradeTokenHoldingStatistics', [])
        const resultStatistics = totalListKeysInArray(statistics, [
          'totalProfitInUsd',
          'totalBuyInUsd',
          'buyCostInUsd',
          'totalSellInUsd',
          'totalBuy',
          'totalSell',
        ])
        _result.push({
          ...item,
          resultStatistics,
        })
      })

      // Save to store
      saveFirstPageToStorage('smartMoneyList.walletCopyTrade', _result)
    }
  }

  const createTradeConfig = async (params: any) => {
    try {
      await tradingClient
        .mutate({
          mutation: createCopyTradeConfig,
          variables: {
            input: params,
          },
        })
        .then(async (res) => {
          if (res) {
            toast.success(t('toast.copyTradeCreated'))
            // refetchCopyTradeConfig()
            await refetchCopyTradeConfig()
            // Call onSuccess callback to notify parent component
            if (onSuccess) {
              onSuccess()
            }
            if (isPC) {
              onCancel()
            } else {
              navigate(-1)
            }
          }
        })
    } catch (error: any) {
      // toast.error(t('walletCopy.settings.error.createConfig'),{
      //   position: 'bottom-center'
      // })
      const errorCode = error?.[0]?.code
      const errorMessage = error?.[0]?.message
      toast.error(errorCode ? t(errorCode) : errorMessage, {
        duration: 2000,
      })
      console.warn(error)
    }
  }

  const modifyCopyTradeConfig = async (params: any) => {
    const param = params
    // delete param.walletAddress
    delete param.chainId
    delete param.walletAddress
    delete param.leaderAddress
    if (param.sellType === ConfigSellType.SingleTpsl) {
      delete param.tpslConfig
    }
    if (param.sellType === ConfigSellType.MultiTpsl) {
      delete param.tp
      delete param.sl
    }
    try {
      await tradingClient
        .mutate({
          mutation: updateCopyTradeConfig,
          variables: {
            input: {
              ...params,
              id: id,
            },
          },
        })
        .then((res) => {
          if (res) {
            toast.success(t('toast.saveSuccess'))
            if (isPC) {
              onCancel()
            } else {
              navigate(-1)
            }
          }
        })
    } catch (error: any) {
      toast.error(error?.[0]?.message)
      console.warn(error)
      throw error
    }
  }

  return loading ? (
    <WalletSettingsFormSkeleton />
  ) : (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit} className={cn('flex flex-col flex-1', isPC ? 'h-full' : '')}>
        <div
          className={cn(
            'px-[12px] pb-[10px] flex-1 overflow-x-hidden overflow-y-auto no-scrollbar',
            isPC ? 'max-h-[calc(100vh-125px)]' : 'max-h-[calc(100vh-165px)]',
          )}
        >
          <FollowAddressSection isEdit={!!id} />
          <BuySettingsSection />
          <SellSettingsSection />
          <AdvancedSettingsSection />
          {isPC ? <TradeSettingsConfirm /> : null}
        </div>
        <ActionButtons onCancel={onCancel} />
      </form>
    </FormProvider>
  )
}

const WalletSettingsFormContainer: FC<WalletSettingsFormProps> = (props) => {
  return (
    <CopyTradeContextProvider>
      <WalletSettingsForm {...props} />
    </CopyTradeContextProvider>
  )
}

export default WalletSettingsFormContainer
