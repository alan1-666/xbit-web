import {
  setData,
  setMaxVolume,
  setMinVolume,
  setNativeAmountFrom,
  setNativeAmountTo,
  setPage,
  TokenDetailState,
} from '@/redux/modules/tokenDetail.slice.ts'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import InputBorderGradient from '@components/orderForm/InputBorderGradient.tsx'
import { Button } from '@components/ui/button.tsx'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@components/ui/drawer.tsx'
import { Loader2, X } from 'lucide-react'
import React, { Ref, useEffect, useImperativeHandle, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { CustomizeInput } from '../discover/filter/CustomizeInput'
import { formatValueInput } from '@/utils/helpers'

export type FilterVolumeHandle = {
  open: () => void
}

type FilterVolumeProps = {
  token: string
  isPC?: boolean
  ref?: Ref<FilterVolumeHandle>
}

const FilterVolume = ({ token, ref, isPC }: FilterVolumeProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const selectedChain = useAppSelector((state) => state.newWallet.activeChain)

  const { minVolume, maxVolume, nativeAmountTo, nativeAmountFrom } = useAppSelector(
    (state: RootState) => state.tokenDetail as TokenDetailState,
  )

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [minValue, setMinValue] = useState('')
  const [maxValue, setMaxValue] = useState('')
  const [errorText, setErrorText] = useState('')

  const [maxValueSol, setMaxValueSol] = useState<number | undefined | string>('')
  const [minValueSol, setMinValueSol] = useState<number | undefined | string>('')

  useEffect(() => {
    setMinValue(minVolume > 0 ? String(minVolume) : '')
    setMaxValue(maxVolume > 0 ? String(maxVolume) : '')
    setMaxValueSol(nativeAmountTo <= 0 ? undefined : nativeAmountTo)
    setMinValueSol(nativeAmountFrom <= 0 ? undefined : nativeAmountFrom)
  }, [open, minVolume, maxVolume, nativeAmountTo, nativeAmountFrom])

  useEffect(() => {
    setErrorText('')
  }, [minValue, maxValue, minValueSol, maxValueSol])

  useImperativeHandle(ref, () => ({
    open: () => setOpen(true),
  }))

  const handleInputValue = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === '-') e.preventDefault()
  }

  const handleConfirmClick = () => {
    setErrorText('')

    const min = minValue !== '' ? Number(minValue) : undefined
    const max = maxValue !== '' ? Number(maxValue) : undefined
    const minSol = minValueSol !== '' && minValueSol !== undefined ? Number(minValueSol) : undefined
    const maxSol = maxValueSol !== '' && maxValueSol !== undefined ? Number(maxValueSol) : undefined

    // Validate
    if (
      (min !== undefined && max !== undefined && min > max) ||
      (minSol !== undefined && maxSol !== undefined && minSol > maxSol)
    ) {
      setErrorText(t('detail.tokenDetail.errorInputTransactionFilter'))
      return
    }

    setLoading(true)

    const hasMin = minValue !== ''
    const hasMax = maxValue !== ''

    dispatch(setMinVolume(Number(minValue || -1)))
    dispatch(setMaxVolume(Number(maxValue || -1)))
    dispatch(setNativeAmountTo(Number(maxValueSol || -1)))
    dispatch(setNativeAmountFrom(Number(minValueSol || -1)))

    if (hasMin || hasMax) {
      dispatch(setPage(1))
      dispatch(setData([]))
    }

    setLoading(false)
    setOpen(false)
  }

  useEffect(() => {
    setErrorText('')
  }, [minValue, maxValue, minValueSol, maxValueSol])

  const handleResetClick = () => {
    setMinValue('')
    setMaxValue('')
    setMaxValueSol('')
    setMinValueSol('')
    setErrorText('')
  }

  return (
    <>
      <Button size="xs" className="rounded-full bg-transparent p-0" onClick={() => setOpen(true)}>
        <img src="/images/icons/icon-filter.svg" className="w-[11px] h-[11px]" alt="icon filter" />
      </Button>

      {isPC ? (
        <Dialog open={open} onOpenChange={setOpen}>
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
                unit={token}
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
                unit={token}
                placeHolder={t('detail.tokenDetail.maximumVolumeWithToken', { token })}
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
                  disabled={loading}
                  variant="close"
                  className="flex-1 rounded-full h-11"
                  onClick={handleResetClick}
                >
                  {t('orderForm.buySettings.reset')}
                </Button>

                <Button
                  size="lg"
                  disabled={loading}
                  variant="gradient"
                  className="text-[#261236] flex-1 rounded-[50px] h-11"
                  onClick={handleConfirmClick}
                >
                  {loading && <Loader2 className="animate-spin w-4 h-4 mr-1" />}
                  {t('chart.buttons.confirm')}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={open} onOpenChange={setOpen} repositionInputs={false}>
          <DrawerContent className="w-full bg-[#212127] max-w-[768px] max-h-[80vh] mx-auto">
            <DrawerHeader>
              <DrawerTitle className="mt-1.5">
                <div className="text-[cal c(1rem*(22/16))] leading-[1] app-font-regular text-left">
                  {t('detail.tokenDetail.FilterbyQuantity')}
                </div>
              </DrawerTitle>

              <DrawerClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                <X className="size-5" />
              </DrawerClose>
            </DrawerHeader>

            <DrawerDescription className="flex flex-col mt-3">
              <div className="text-sm font-[330] text-white p-3 pt-0">{token}</div>

              <div className="flex justify-between items-center gap-2 px-3">
                <div className="flex-1">
                  <CustomizeInput
                    value={!minValue ? undefined : Number(minValue)}
                    label={t('filter.minimum')}
                    suffix={token}
                    labelClass="-translate-y-3.5"
                    containerClass="h-[48px] border-[0.5px] border-[#444455] bg-[#2B2B33]"
                    focusStyle="border-[#C8A7FD] bg-[#212127]"
                    classNameInput="pt-1"
                    onValueChange={(e) => {
                      setMinValue(formatValueInput(String(e)))
                    }}
                  />
                </div>
                <div className="text-[#605E68] text-xs app-font-light">{t('filter.toValue')}</div>
                <div className="flex-1">
                  <CustomizeInput
                    value={!maxValue ? undefined : Number(maxValue)}
                    label={t('filter.maximum')}
                    suffix={token}
                    labelClass="-translate-y-3.5"
                    containerClass="h-[48px] border-[0.5px] border-[#444455] bg-[#2B2B33]"
                    focusStyle="border-[#C8A7FD] bg-[#212127]"
                    classNameInput="pt-1"
                    onValueChange={(e) => {
                      setMaxValue(formatValueInput(String(e)))
                    }}
                  />
                </div>
              </div>

              <div className="text-sm font-[330] text-white p-3 pt-[20px]">{selectedChain?.toLocaleUpperCase()}</div>

              <div className="flex justify-between items-center gap-2 px-3">
                <div className="flex-1">
                  <CustomizeInput
                    value={minValueSol as number}
                    label={t('filter.minimum')}
                    suffix={selectedChain?.toLocaleUpperCase()}
                    labelClass="-translate-y-3.5"
                    containerClass="h-[48px] border-[0.5px] border-[#444455] bg-[#2B2B33]"
                    focusStyle="border-[#C8A7FD] bg-[#212127]"
                    classNameInput="pt-1"
                    onValueChange={(e) => {
                      setMinValueSol(formatValueInput(String(e)))
                    }}
                  />
                </div>
                <div className="text-[#605E68] text-xs app-font-light">{t('filter.toValue')}</div>
                <div className="flex-1">
                  <CustomizeInput
                    value={maxValueSol as number}
                    label={t('filter.maximum')}
                    suffix={selectedChain?.toLocaleUpperCase()}
                    labelClass="-translate-y-3.5"
                    containerClass="h-[48px] border-[0.5px] border-[#444455] bg-[#2B2B33]"
                    focusStyle="border-[#C8A7FD] bg-[#212127]"
                    classNameInput="pt-1"
                    onValueChange={(e) => {
                      setMaxValueSol(formatValueInput(String(e)))
                    }}
                  />
                </div>
              </div>
            </DrawerDescription>

            <DrawerFooter className="pt-0 mt-3 border-t-[0.5px] border-t-[#ECECED0A]">
              {errorText && errorText !== '' && (
                <div className={'pt-4 text-[11px] leading-[1] text-[#FF353C]'}>{errorText}</div>
              )}
              <div className="flex justify-center items-center flex-row gap-2.5 pt-4 ">
                <Button
                  size="lg"
                  disabled={loading}
                  variant="close"
                  className="flex-1 rounded-full h-11"
                  onClick={handleResetClick}
                >
                  {t('orderForm.buySettings.reset')}
                </Button>

                <Button
                  size="lg"
                  disabled={loading}
                  variant="gradient"
                  className="text-[#261236] flex-1 rounded-[50px] h-11"
                  onClick={handleConfirmClick}
                >
                  {loading && <Loader2 className="animate-spin w-4 h-4 mr-1" />}
                  {t('chart.buttons.confirm')}
                </Button>
              </div>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}
    </>
  )
}

export default FilterVolume
