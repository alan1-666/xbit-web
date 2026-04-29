import { TransactionType } from '@/@generated/gql/graphql-trading'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { cn } from '@/lib/utils'
import { TradeSetting, updateTradeSettings } from '@/redux/modules/tradeSettings.slice'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { ChangeEvent, Dispatch, SetStateAction, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import TooltipWithInfo from '../TooltipWithInfo'
import { ErrorTradeSettingProps } from '.'

const isValidUrl = (url: string) => {
  try {
    const parsedUrl = new URL(url)
    return ['http:', 'https:'].includes(parsedUrl.protocol)
  } catch (e) {
    return false
  }
}

const RpcCustomInput = ({
  isForm = false,
  presetSelected,
  sideSelected,
  tradeSettingsByChain,
  setTradeSettingsByChain,
  isError,
  setIsError,
}: {
  isForm?: boolean
  presetSelected: TradeSetting
  sideSelected: TransactionType
  tradeSettingsByChain: TradeSetting[]
  setTradeSettingsByChain: Dispatch<SetStateAction<TradeSetting[]>>
  isError?: ErrorTradeSettingProps
  setIsError?: Dispatch<SetStateAction<ErrorTradeSettingProps>>
}) => {
  const { t } = useTranslation()
  const [rpcInput, setRpcInput] = useState<string>('')
  const [error, setError] = useState(false)
  const dispatch = useAppDispatch()
  const activeChain = useAppSelector((state) => state.newWallet.activeChain)

  useEffect(() => {
    if (presetSelected && sideSelected) {
      setRpcInput(presetSelected?.[sideSelected]?.customRPC || '')
    }
  }, [presetSelected, sideSelected])

  const handleOnChangeValue = (e: ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value
    setRpcInput(newValue)
    if (!isValidUrl(newValue) && !!newValue) {
      setError(true)
      return
    }
    setError(false)
    handleMevProtectToggle(newValue)
  }

  const handleMevProtectToggle = (value: string) => {
    const updatedSettings = tradeSettingsByChain.map((item) => {
      if (item.key === presetSelected.key) {
        return {
          ...item,
          [sideSelected]: {
            ...item[sideSelected],
            customRPC: value,
          },
        }
      }
      return item
    })
    setTradeSettingsByChain(updatedSettings)

    if (isForm) {
      dispatch(
        updateTradeSettings({
          chain: activeChain,
          settings: updatedSettings,
        }),
      )
    }
  }

  useEffect(() => {
    if (setIsError && isError) {
      setIsError({
        ...isError,
        isRpcError: error,
      })
    }
  }, [error])

  const handleBlur = (e: ChangeEvent<HTMLInputElement>) => {
    const rawValue = e?.target?.value
    if (error) {
      setRpcInput('')
      handleMevProtectToggle('')
      setError(false)
      return
    }
  }

  if (isForm) {
    return (
      <div className="flex items-center gap-1 mt-2.5">
        <p className="font-[400] text-[12px] text-[#605e68] w-24">{t('tradeSettings.customRPC')}</p>
        <InputGroup className="h-7.5 flex-1">
          <InputGroupInput
            name="rpc"
            className={cn('w-full outline-none placeholder:text-[#6C6A74] text-sm', {
              // 'text-[#EA963A]': !!error,
            })}
            placeholder={'https://x.......xx.com'}
            onBlur={(e) => handleBlur(e)}
            value={rpcInput}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleOnChangeValue(e)}
          />
          {error && (
            <InputGroupAddon align="inline-end">
              <TooltipWithInfo tooltipKey={t('tradeSettings.error.customRPC')} isWarning={true} />
            </InputGroupAddon>
          )}
        </InputGroup>
      </div>
    )
  }

  return (
    <div className="mt-5">
      <p className="text-[14px] leading-none font-[300] mb-3">{t('tradeSettings.customRPC')}</p>
      <InputGroup className="h-7.5 flex-1">
        <InputGroupInput
          name="rpc"
          className={cn('w-full outline-none placeholder:text-[#6C6A74] text-sm', {
            // 'text-[#EA963A]': !!error,
          })}
          placeholder={'https://x.......xx.com'}
          value={rpcInput}
          onChange={(e: ChangeEvent<HTMLInputElement>) => handleOnChangeValue(e)}
        />
      </InputGroup>
      {error && (
        <div className={cn('mt-2 text-[14px] text-[#EA3B4F] font-[350] leading-[1.3]')}>
          {t('tradeSettings.error.customRPC')}
        </div>
      )}
    </div>
  )
}

export default RpcCustomInput
