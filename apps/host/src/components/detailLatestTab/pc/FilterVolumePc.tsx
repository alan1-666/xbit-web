import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription, DialogFooter,
  DialogHeader,
  DialogTitle, DialogTrigger,
} from '@components/ui/dialog.tsx'
import { X } from 'lucide-react'
import InputBorderGradient from '@components/orderForm/InputBorderGradient.tsx'
import { Button } from '@components/ui/button.tsx'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import { LastFollowedState, setMaxVolume, setMinVolume } from '@/redux/modules/latestFollowed.slice.ts'

const FilterVolumePc = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { minVolume, maxVolume } = useAppSelector((state: RootState) => state.latestFollowed as LastFollowedState)

  const [open, setOpen] = useState<boolean>(false)
  const [minValue, setMinValue] = useState<string>(minVolume ? `${minVolume}` : '')
  const [maxValue, setMaxValue] = useState<string>(maxVolume ? `${maxVolume}` : '')
  const [errorText, setErrorText] = useState('')

  const handleInputValue = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === '-') e.preventDefault()
  }

  const handleResetClick = () => {
    setMinValue('')
    setMaxValue('')
    setErrorText('')
  }

  const handleConfirmClick = () => {
    setErrorText('')

    const min = minValue !== '' ? Number(minValue) : undefined
    const max = maxValue !== '' ? Number(maxValue) : undefined

    // Validate
    if (min !== undefined && max !== undefined && min > max) {
      setErrorText(t('detail.tokenDetail.errorInputTransactionFilter'))
      return
    }

    dispatch(setMinVolume(min))
    dispatch(setMaxVolume(max))

    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button
          size="xs"
          className="rounded-full bg-transparent p-0"
          onClick={() => setOpen(value => !value)}
        >
          <img
            src={
              Number(minVolume) > 0 || Number(maxVolume) > 0
                ? '/images/icons/icon-filter-solid.svg'
                : '/images/icons/icon-filter.svg'
            }
            className="w-[11px] h-[11px]"
            alt="icon filter"
          />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full bg-[#232329] max-w-[768px] p-4" showDialogPrimitiveClose={false}>
        <DialogHeader>
          <DialogTitle className="mt-1.5">
            <div className="text-[calc(1rem*(22/16))] leading-[1] app-font-regular text-left">
              {t('transaction.quantity')}
            </div>
          </DialogTitle>

          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="size-5" />
          </DialogClose>
        </DialogHeader>

        <DialogDescription className="flex flex-col gap-3">
          <InputBorderGradient
            unit={''}
            placeHolder={t('detail.tokenDetail.minimumVolume')}
            containerClassName="h-[48px] px-[14px] py-[12px] rounded-[8px]"
            innerBgClassName="rounded-[8px] bg-[#141414]"
            inputClassName="placeholder:text-[#FFFFFF5C] placeholder:text-[calc(1rem*(14/16))] text-[calc(1rem*(14/16))] max-w-[100%] flex-1"
            unitClassName="min-w-[auto] text-[calc(1rem*(14/16))] text-[#FFFFFF99] leading-[1]"
            onChange={(value) => setMinValue(value)}
            value={minValue}
            inputProps={{
              type: 'number',
              onKeyDown: handleInputValue,
            }}
          />
          <InputBorderGradient
            unit={''}
            placeHolder={t('detail.tokenDetail.maximumVolumeWithToken', { token: '' })}
            containerClassName="h-[48px] px-[14px] py-[12px] rounded-[8px]"
            innerBgClassName="rounded-[8px] bg-[#141414]"
            inputClassName="placeholder:text-[#FFFFFF5C] placeholder:text-[calc(1rem*(14/16))] text-[calc(1rem*(14/16))] max-w-[100%] flex-1"
            unitClassName="min-w-[auto] text-[calc(1rem*(14/16))] text-[#FFFFFF99] leading-[1]"
            onChange={(value) => setMaxValue(value)}
            value={maxValue}
            inputProps={{
              type: 'number',
              onKeyDown: handleInputValue,
            }}
          />

          {errorText && <div className="text-[11px] leading-[1] text-[#FF353C] px-2">{errorText}</div>}
        </DialogDescription>

        <DialogFooter className="pt-0 border-t-[0.5px] border-t-[#ECECED0A]">
          <div className="flex justify-center items-center flex-row gap-2.5 pt-4 flex-1">
            <Button
              size="lg"
              variant="close"
              className="flex-1 rounded-full h-11"
              onClick={handleResetClick}
            >
              {t('orderForm.buySettings.reset')}
            </Button>

            <Button
              size="lg"
              variant="gradient"
              className="text-[#261236] flex-1 rounded-[50px] h-11"
              onClick={handleConfirmClick}
            >
              {t('chart.buttons.confirm')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default FilterVolumePc
