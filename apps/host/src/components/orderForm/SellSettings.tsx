import { Button } from '@components/ui/button.tsx'
import React, { ChangeEvent, DetailedHTMLProps, InputHTMLAttributes, useCallback, useRef, useState } from 'react'
import AppDrawer from '@components/common/AppDrawer.tsx'
import { cn } from '@/lib/utils.ts'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { initialStateTradeConfig, tradeConfigActions } from '@/redux/modules/tradeConfigs.slice'
import { useTranslation } from 'react-i18next'

type SellSettingsInputProps = {
  unit: string
  defaultValue: string
  containerClassName?: string
  inputProps?: DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>
}
const CONTROL_KEYS = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'] as const

const SellSettingsInput = ({ unit, defaultValue, containerClassName, inputProps }: SellSettingsInputProps) => {
  const [focus, setFocus] = useState<boolean>(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    if (inputRef?.current) {
      inputRef?.current?.focus()
    }
  }

  // Input validation handler
  const handleOnInput = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    const char = e.key

    // Special case for reload shortcut
    if ((e.ctrlKey || e.metaKey) && char === 'r') {
      console.log('Ctrl+R or Cmd+R pressed!')
      return true
    }

    // Allow control keys
    if (CONTROL_KEYS.includes(char as (typeof CONTROL_KEYS)[number])) {
      return true
    }

    const input = e.currentTarget.value
    const [, decimalPart] = input.split('.')

    // Prevent more than max decimal places
    if (decimalPart && decimalPart.length >= 2) {
      e.preventDefault()
      return false
    }

    // Allow numeric input
    if (char >= '0' && char <= '9') {
      return true
    }

    // Allow first decimal point
    if (char === '.') {
      return input.indexOf('.') === -1
    }

    // Prevent other characters
    e.preventDefault()
    return false
  }, [])

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
        onKeyDown={handleOnInput}
        defaultValue={defaultValue}
      />
      <div className="font-[380] text-[10px] text-[#CCCADB] leading-[1] relative">{unit}</div>
    </div>
  )
}

const SellSettings = () => {
  const [openSellSettings, setOpenSellSettings] = useState<boolean>(false)
  const initConfig = initialStateTradeConfig?.tradeConfigs?.quickSellPercent
  const quickSellPercents =
    useAppSelector((state) => state.tradeConfigs.tradeConfigs.quickSellPercent) ||
    initialStateTradeConfig?.tradeConfigs?.quickSellPercent
  const dispatch = useAppDispatch()
  const { t } = useTranslation()

  const [listPercent, setListPercent] = useState<number[]>(quickSellPercents || initConfig)

  const onChangeInput = (e: ChangeEvent<HTMLInputElement>, idx: number) => {
    // Filter out non-numeric characters (handles IME input like Vietnamese)
    const rawValue = e.target.value
    const filteredValue = rawValue.replace(/[^0-9.]/g, '')
    
    // Ensure only one decimal point
    const parts = filteredValue.split('.')
    const sanitizedValue = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : filteredValue
    
    // Update input value if it was sanitized
    if (rawValue !== sanitizedValue) {
      e.target.value = sanitizedValue
    }
    
    const value = sanitizedValue
    if (value !== '') {
      const percent = parseFloat(value)
      if (!isNaN(percent) && percent >= 0 && percent <= 100) {
        const newList = [...listPercent]
        newList[idx] = percent
        setListPercent(newList)
      }
    }
  }

  const onClickSubmit = () => {
    if (listPercent.some((item) => item < 0 || item > 100)) {
      return
    }
    dispatch(
      tradeConfigActions.updateQuickSellPercent({
        quickSellPercent: listPercent,
      }),
    )
    setOpenSellSettings(false)
  }

  return (
    <>
      <Button
        type="button"
        className="w-full rounded-[12px] bg-[#18171e] shadow-inset-dark flex items-center gap-3 leading-[1] px-[8px] py-[4px] h-[36px] hover-scale"
        onClick={() => setOpenSellSettings(true)}
      >
        <span className="text-[#908e98] leading-none text-[11px]">{t('orderForm.buySettings.custom')}</span>
        <img src="/images/orderForm/icon-custom.svg" className="w-3.5 h-3.5" alt="" />
      </Button>
      <AppDrawer
        open={openSellSettings}
        setOpen={setOpenSellSettings}
        title={`${t('orderForm.form.sell')} (%)`}
        repositionInputs={false}
        isShowBgImg={false}
        drawerContent={
          <>
            <div className="grid grid-cols-3 justify-center gap-x-[8px] gap-y-[10px] max-w-[calc(111px*3+16px)] mx-auto mb-[20px] pt-[12px]">
              {listPercent?.map((percent, idx) => (
                <SellSettingsInput
                  key={idx}
                  unit={'%'}
                  defaultValue={percent.toString()}
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
                    tradeConfigActions.updateQuickSellPercent({
                      quickSellPercent: initConfig,
                    }),
                  )
                  setListPercent(initConfig)
                  setOpenSellSettings(false)
                }}
              >
                <span className="block relative app-font-medium text-[calc(1rem*(16/16))] text-white leading-[1] z-2">
                  {t('orderForm.buySettings.reset')}
                </span>
              </Button>
              <Button
                variant="gradient"
                className="w-[171px] max-w-[171px] h-[44px] app-font-medium text-[calc(1rem*(16/16))] leading-[1] rounded-full hover-scale"
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

export default SellSettings
