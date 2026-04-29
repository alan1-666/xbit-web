import { cn } from '@/lib/utils'
import { Button } from '@components/ui/button.tsx'
import { Drawer, DrawerContent, DrawerTrigger } from '@components/ui/drawer'
import { DrawerHeader } from '@components/ui/drawer.tsx'
import { zodResolver } from '@hookform/resolvers/zod'
import { HeaderContext } from '@tanstack/react-table'
import { useState } from 'react'
import {
  FieldErrors,
  useForm,
  UseFormSetError,
  SubmitHandler,
  UseFormRegister,
  UseFormSetValue,
  UseFormHandleSubmit,
} from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { handleOnInput } from '../copy-trading/wallet-settings'
import { IconFilter, IconFiltered } from '../icon'
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@components/ui/dialog'
import { X } from 'lucide-react'

type TVolumeFilter = {
  minVolume?: number
  maxVolume?: number
}

type TVolumeFilterForm = {
  minVolume?: string
  maxVolume?: string
}

export type TVolumeFilterHeadProps = HeaderContext<any, any> & {
  initialFilter?: TVolumeFilter
  onChangeFilter?: (data: TVolumeFilter) => void
  isPC?: boolean
}

export default function VolumeFilterHead(props: TVolumeFilterHeadProps) {
  const { initialFilter, onChangeFilter: onFilterChange, isPC = false } = props
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    setError,
  } = useForm<TVolumeFilterForm>({
    defaultValues: {
      minVolume: initialFilter?.minVolume?.toString() || '',
      maxVolume: initialFilter?.maxVolume?.toString() || '',
    },
    resolver: zodResolver(
      z
        .object({
          minVolume: z.string().optional(),
          maxVolume: z.string().optional(),
        })
        .refine(
          (data) => {
            const min = data.minVolume ? parseFloat(data.minVolume) : undefined
            const max = data.maxVolume ? parseFloat(data.maxVolume) : undefined
            if (min !== undefined && max !== undefined && !isNaN(min) && !isNaN(max)) {
              return min <= max
            }
            return true
          },
          {
            message: t('walletCopy.filter.warning.minVolume'),
            path: ['minVolume'],
          },
        )
        .refine(
          (data) => {
            const min = data.minVolume ? parseFloat(data.minVolume) : undefined
            const max = data.maxVolume ? parseFloat(data.maxVolume) : undefined
            if (min !== undefined && max !== undefined && !isNaN(min) && !isNaN(max)) {
              return max >= min
            }
            return true
          },
          {
            message: t('walletCopy.filter.warning.maxVolume'),
            path: ['maxVolume'],
          },
        ),
    ),
    mode: 'onChange',
  })

  const handleSubmitFilter: SubmitHandler<TVolumeFilterForm> = (data) => {
    const convertedData: TVolumeFilter = {
      minVolume: data.minVolume ? parseFloat(data.minVolume) : undefined,
      maxVolume: data.maxVolume ? parseFloat(data.maxVolume) : undefined,
    }
    onFilterChange?.(convertedData)
    setOpen(false)
  }

  const handleReset = () => {
    reset({
      minVolume: '',
      maxVolume: '',
    })
    onFilterChange?.({
      minVolume: undefined,
      maxVolume: undefined,
    })
    setOpen(false)
    // setOpen(false)
    // props.column.setFilterValue(undefined)
  }

  const toggle = () => {
    setOpen(!open)
  }

  return isPC ? (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="flex items-center gap-1">
          <span className="leading-[0.75rem]">{t('walletCopy.volume')}</span>
          {initialFilter?.minVolume || initialFilter?.maxVolume ? (
            <IconFiltered className="!size-[14px] fill-white/50" />
          ) : (
            <IconFilter className="!size-[14px]" />
          )}
        </div>
      </DialogTrigger>
      <DialogContent
        className="w-full max-w-[420px] max-h-[80vh] mx-auto p-0 bg-[#212127]"
        showDialogPrimitiveClose={false}
      >
        <DialogHeader className="p-0">
          <DialogTitle className="border-b border-solid border-[#79778C29] min-h-[52px] px-[16px] mb-0">
            <div className="text-[18px] text-[#FCFCFC] app-font-regular text-left w-full h-full flex items-center">
              {t('walletCopy.volume')}
            </div>
          </DialogTitle>

          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="size-5" />
          </DialogClose>
        </DialogHeader>
        <VolumeFilterForm
          handleSubmit={handleSubmit}
          handleSubmitFilter={handleSubmitFilter}
          register={register}
          setValue={setValue}
          setError={setError}
          errors={errors}
          handleReset={handleReset}
          isPC={true}
        />
      </DialogContent>
    </Dialog>
  ) : (
    <Drawer open={open} onOpenChange={toggle}>
      <DrawerTrigger asChild>
        <div className="flex items-center gap-1">
          <span className="leading-[0.75rem]">{t('walletCopy.volume')}</span>
          {initialFilter?.minVolume || initialFilter?.maxVolume ? (
            <IconFiltered className="!size-[14px] fill-white/50" />
          ) : (
            <IconFilter className="!size-[14px]" />
          )}
        </div>
      </DrawerTrigger>
      <DrawerContent className="w-full bg-[#232329] bg-no-repeat bg-cover max-w-[768px] mx-auto">
        <div className="max-h-[80vh] overflow-y-auto no-scrollbar">
          <DrawerHeader className="py-3 px-3.5 flex w-full items-center justify-between">
            <DialogTitle className="text-[calc(18rem/16)] leading-[calc(18rem/16)] app-font-medium mb-0.5 text-[#FFFFFF] flex items-center justify-between w-full">
              {t('walletCopy.filter.volume')}
              <img
                src="/images/icons/icon-x.svg"
                className="w-6 h-6 cursor-pointer"
                onClick={() => setOpen(false)}
                alt=""
              />
            </DialogTitle>
          </DrawerHeader>
          <VolumeFilterForm
            handleSubmit={handleSubmit}
            handleSubmitFilter={handleSubmitFilter}
            register={register}
            setValue={setValue}
            setError={setError}
            errors={errors}
            handleReset={handleReset}
          />
        </div>
      </DrawerContent>
    </Drawer>
  )
}

type TVolumeFilterFormProps = {
  handleSubmit: UseFormHandleSubmit<TVolumeFilterForm, TVolumeFilterForm>
  handleSubmitFilter: SubmitHandler<TVolumeFilterForm>
  register: UseFormRegister<TVolumeFilterForm>
  setValue: UseFormSetValue<TVolumeFilterForm>
  setError: UseFormSetError<TVolumeFilterForm>
  errors: FieldErrors<TVolumeFilterForm>
  handleReset: () => void
  isPC?: boolean
}

const VolumeFilterForm = (props: TVolumeFilterFormProps) => {
  const { handleSubmit, handleSubmitFilter, register, setValue, setError, errors, handleReset, isPC = false } = props
  const { t } = useTranslation()

  return (
    <form onSubmit={handleSubmit(handleSubmitFilter)} className="px-[12px] pb-[12px] space-y-4">
      <div
        className={cn(
          'relative p-[1px]',
          isPC ? 'mb-[20px]' : 'mt-3 h-12 rounded-[8px] overflow-visible bg-x-gradient-active mb-[30px] relative',
        )}
      >
        {isPC && <label className={'text-[14px] text-[#79778C] capitalize'}>{t('walletCopy.filter.minimum')}</label>}
        <input
          className={cn(
            'peer h-full w-full rounded-[8px] px-4 py-2 text-white focus:outline-none no-spin-button text-[calc(1rem*(14/16))] border-solid border-[1px]',
            isPC ? 'bg-[#2B2B33] mt-[10px] h-[44px] border-[#2B2B33] focus:border-[#843BEA]' : 'bg-[#141414]',
          )}
          placeholder={isPC ? '0' : ''}
          onKeyDown={(e) => handleOnInput(e, 6)}
          autoComplete="off"
          {...register('minVolume')}
        />
        {isPC ? (
          <span className="text-[14px] text-[#79778C] absolute top-[55px] -translate-y-1/2 right-4">$</span>
        ) : (
          <label
            className={
              'pointer-events-none absolute -top-3 left-4 text-xs text-impartal bg-[#232329] h-5 py-1.5 px-2 rounded-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:h-3.5 peer-placeholder-shown:text-[calc(14rem/16)] peer-placeholder-shown:p-0 peer-placeholder-shown:leading-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-white peer-focus:-top-3 peer-focus:bg-[#232329] peer-focus:text-xs leading-3 peer-focus:text-impartal peer-focus:h-6 peer-focus:py-1.5 peer-focus:px-2 peer-focus:rounded-sm capitalize'
            }
          >
            {t('walletCopy.filter.minimum')}($)
          </label>
        )}
        <button
          type="button"
          className={cn('absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer block', isPC ? 'hidden' : '')}
          onClick={() => {
            setValue('minVolume', '')
            setError('minVolume', { message: '' })
          }}
        >
          <img src="/images/icons/circle-cancel.svg" alt="" />
        </button>
        {errors.minVolume && (
          <p className="text-red-500 text-xs mt-1 absolute top-full left-0">{errors.minVolume.message}</p>
        )}
      </div>
      <div
        className={cn(
          'relative p-[1px]',
          isPC ? 'mb-[20px]' : 'mt-3 h-12 rounded-[8px] overflow-visible bg-x-gradient-active mb-[30px] relative',
        )}
      >
        {isPC && <label className={'text-[14px] text-[#79778C] capitalize'}>{t('walletCopy.filter.maximum')}</label>}
        <input
          className={cn(
            'peer h-full w-full rounded-[8px] px-4 py-2 text-white focus:outline-none no-spin-button text-[calc(1rem*(14/16))] border-solid border-[1px]',
            isPC ? 'bg-[#2B2B33] mt-[10px] h-[44px] border-[#2B2B33] focus:border-[#843BEA]' : 'bg-[#141414]',
          )}
          placeholder={isPC ? '0' : ''}
          onKeyDown={(e) => handleOnInput(e, 6)}
          {...register('maxVolume')}
          autoComplete="off"
        />
        {isPC ? (
          <span className="text-[14px] text-[#79778C] absolute top-[55px] -translate-y-1/2 right-4">$</span>
        ) : (
          <label
            className="
              pointer-events-none absolute -top-3 left-4 text-xs text-impartal bg-[#232329] h-5 py-1.5 px-2 rounded-sm transition-all
              peer-placeholder-shown:top-4 peer-placeholder-shown:h-3.5 peer-placeholder-shown:text-[calc(14rem/16)] peer-placeholder-shown:p-0 peer-placeholder-shown:leading-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-white
              peer-focus:-top-3 peer-focus:bg-[#232329] peer-focus:text-xs leading-3 peer-focus:text-impartal peer-focus:h-6 peer-focus:py-1.5 peer-focus:px-2 peer-focus:rounded-sm capitalize
              "
          >
            {t('walletCopy.filter.maximum')} ($)
          </label>
        )}
        <button
          type="button"
          className={cn('absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer block', isPC ? 'hidden' : '')}
          onClick={() => {
            setValue('maxVolume', '')
            setError('maxVolume', { message: '' })
          }}
        >
          <img src="/images/icons/circle-cancel.svg" alt="" />
        </button>
        {errors.maxVolume && (
          <p className="text-red-500 text-xs mt-1 absolute top-full left-0">{errors.maxVolume.message}</p>
        )}
      </div>
      <div
        className={cn(
          'flex items-center justify-between gap-2 mt-8',
          isPC ? 'border-t border-solid border-[#79778C29] pt-4 ml-[-16px] mr-[-16px] px-[16px]' : '',
        )}
      >
        <Button
          variant="borderGradient"
          className={cn('rounded-full flex-1', isPC ? 'h-[44px] bg-[#2B2B33] border-[transparent]' : 'bg-[#ECECED1F]')}
          onClick={handleReset}
          type="button"
        >
          {t('walletCopy.filter.reset')}
        </Button>
        <Button
          variant="gradient"
          className={cn(
            'rounded-full flex-1 text-[#141414]',
            errors.minVolume || errors.maxVolume ? 'opacity-50 cursor-not-allowed' : '',
            isPC ? 'h-[44px]' : '',
          )}
          type="submit"
        >
          {t('walletCopy.filter.apply')}
        </Button>
      </div>
    </form>
  )
}
