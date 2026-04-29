import { Button } from '@components/ui/button.tsx'
import { ChangeEvent, DetailedHTMLProps, InputHTMLAttributes, useEffect, useRef, useState } from 'react'
import AppDrawer from '@components/common/AppDrawer.tsx'
import { cn } from '@/lib/utils.ts'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import {
  initialStateTradeConfig,
  tradeConfigActions,
  tradeConfigChainSelected,
} from '@/redux/modules/tradeConfigs.slice'
import { useTranslation } from 'react-i18next'
import { getNativeTokenByActiveChain, MIN_BALANCE_FORM_BUY } from '@/lib/blockchain'
import { onKeyDownValidateInput } from '@/pages/detail/orderForm/useOrderForm'
import { toast } from 'sonner'

type BuySettingsInputProps = {
  unit: string
  defaultValue: string
  containerClassName?: string
  inputProps?: DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>
}

const BuySettingsInput = ({ unit, defaultValue, containerClassName, inputProps }: BuySettingsInputProps) => {
  const [focus, setFocus] = useState<boolean>(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    if (inputRef?.current) {
      inputRef?.current?.focus()
    }
  }

  return (
    <div
      className={cn(
        'rounded-md bg-[#2B2B33] p-[12px] flex items-center gap-[10px] relative w-full max-w-[111px] h-[38px] border-[0.5px] border-[#444455]',
        containerClassName,
        focus && 'border-[#C8A7FD]',
      )}
      onClick={handleClick}
    >
      <div className={cn('absolute inset-[1px] rounded-md pointer-events-none', focus && 'bg-[#212127]')} />
      <input
        type="text"
        className="bg-none border-none outline-none font-[380] text-[14px] text-white flex-1 leading-[1] relative w-[60%] caret-[#C8A7FD]"
        ref={inputRef}
        {...inputProps}
        onFocus={() => setFocus(true)}
        onBlur={() => {
          setFocus(false)
        }}
        onKeyDown={(e) => onKeyDownValidateInput(e, 9)}
        defaultValue={defaultValue}
      />
      <div className="font-[380] text-[10px] text-[#CCCADB] leading-[1] relative">{unit}</div>
    </div>
  )
}

const BuySettings = () => {
  const [openBuySettings, setOpenBuySettings] = useState<boolean>(false)
  const activeChain = useAppSelector((state) => state.newWallet.activeChain)
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const initConfig = initialStateTradeConfig?.tradeConfigs?.[activeChain]?.quickAmount
  const configs = useAppSelector(tradeConfigChainSelected(activeChain))?.quickAmount
  const dispatch = useAppDispatch()
  const { t } = useTranslation()

  const [listAmount, setListAmount] = useState<number[]>(initConfig)

  useEffect(() => {
    if (openBuySettings) {
      setListAmount(configs)
    }
  }, [openBuySettings])

  const onChangeInput = (e: ChangeEvent<HTMLInputElement>, idx: number) => {
    // Filter out non-numeric characters (handles IME input like Vietnamese)
    const rawValue = e.target.value
    const filteredValue = rawValue.replace(/[^0-9.]/g, '')
    
    // Ensure only one decimal point
    const parts = filteredValue.split('.')
    let sanitizedValue = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : filteredValue
    
    // Limit integer part to max 18 digits
    const [integerPart, decimalPart] = sanitizedValue.split('.')
    if (integerPart && integerPart.length > 18) {
      sanitizedValue = integerPart.slice(0, 18) + (decimalPart !== undefined ? '.' + decimalPart : '')
    }
    
    // Update input value if it was sanitized
    if (rawValue !== sanitizedValue) {
      e.target.value = sanitizedValue
    }
    
    const value = sanitizedValue
    if (value !== '') {
      setListAmount((prevVals) => {
        const updatedNumbers = [...prevVals]
        updatedNumbers[idx] = +value
        return updatedNumbers
      })
    }
  }

  const onClickSubmit = () => {
    const isValid = listAmount.every((item: number) => {
      if (item < MIN_BALANCE_FORM_BUY) {
        toast.error(
          t('orderForm.errors.minimumOrderQuantity', {
            balance: MIN_BALANCE_FORM_BUY,
            chain: getNativeTokenByActiveChain(activeChain),
          }),
        )
        return false
      }
      return true
    })

    if (!isValid) {
      return
    }
    
    dispatch(
      tradeConfigActions.updateQuickAmount({
        chain: activeChain,
        quickAmount: listAmount,
      }),
    )
    setOpenBuySettings(false)
  }

  return (
    <>
      <Button
        type="button"
        className="w-full rounded-[12px] bg-[#18171e] shadow-inset-dark flex items-center gap-3 leading-[1] px-[8px] py-[4px] h-[36px] hover-scale"
        onClick={() => setOpenBuySettings(true)}
      >
        <span className="text-[#908e98] leading-none text-[11px]">{t('orderForm.buySettings.custom')}</span>
        <img src="/images/orderForm/icon-custom.svg" className="w-3.5 h-3.5" alt="" />
      </Button>
      <AppDrawer
        open={openBuySettings}
        setOpen={setOpenBuySettings}
        title={`${t('orderForm.buySettings.buyAmount')} (${getNativeTokenByActiveChain(activeChain)})`}
        repositionInputs={false}
        isShowBgImg={false}
        drawerContent={
          <>
            <div className="grid grid-cols-3 justify-center gap-x-[8px] gap-y-[10px] max-w-[calc(111px*3+16px)] mx-auto mb-[20px] pt-[12px]">
              {listAmount?.map((amount, idx) => (
                <BuySettingsInput
                  key={idx}
                  unit={getNativeTokenByActiveChain(activeChain)}
                  defaultValue={amount.toString()}
                  inputProps={{
                    onChange: (e) => onChangeInput(e, idx),
                  }}
                />
              ))}
            </div>
            <div className="flex items-center gap-[8px] py-[16px] justify-center">
              <Button
                variant="close"
                className="rounded-full relative w-[171px] h-[44px] hover-scale"
                onClick={() => {
                  dispatch(
                    tradeConfigActions.updateQuickAmount({
                      chain: activeChain,
                      quickAmount: initConfig,
                    }),
                  )
                  setListAmount(initConfig)
                  setOpenBuySettings(false)
                }}
              >
                <span className="block relative font-[450] text-[16px] text-white leading-[1] z-2">
                  {t('orderForm.buySettings.reset')}
                </span>
              </Button>
              <Button
                variant="gradient"
                className="w-[171px] max-w-[171px] h-[44px] font-[450] text-[16px] leading-[1] rounded-full hover-scale"
                onClick={onClickSubmit}
              >
                {t('orderForm.buySettings.confirm')}
              </Button>
            </div>
          </>
        }
      />
    </>
  )
}

export default BuySettings
