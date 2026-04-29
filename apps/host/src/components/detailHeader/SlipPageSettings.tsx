import GradientBordered from '@components/common/GradientBordered.tsx'
import { cn } from '@/lib/utils.ts'
import InputBorderGradient from '@components/orderForm/InputBorderGradient.tsx'
import { OrderSettingOption } from '@components/detailHeader/OrderSetting.tsx'
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@components/ui/tooltip'
import { UseFormReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

type SlipPageSettingsProps = {
  methods: UseFormReturn<any>
}

const SlipPageSettings = ({ methods }: SlipPageSettingsProps) => {
  const {
    setValue,
    register,
    formState: { errors },
    watch,
    trigger,
  } = methods
  const slippage = watch('slippage')
  const { t } = useTranslation()

  const slipPageSettings: OrderSettingOption[] = [
    {
      value: '',
      content: t("orderForm.form.automatic"),
    },
    {
      value: '10',
      content: '10%',
    },
    {
      value: '15',
      content: '15%',
    },
    {
      value: '50',
      content: '50%',
    },
  ]

  return (
    <div className="mb-[20px]">
      <div className="flex items-center gap-[6px] leading-[1] mb-[12px]">
        <div className="text-[calc(1rem*(18/16))] text-white">{t("orderForm.orderSetting.slipPoint")}</div>
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger type="button">
              <img src="/images/orderSetting/icon-info.svg" className="w-[16px] min-w-[16px]" alt="" />
            </TooltipTrigger>
            <TooltipContent className="max-w-[360px]">
              <p className="text-xs leading-none">
                {t("orderForm.orderSetting.slipPointTooltip")}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="flex items-center gap-[8px] mb-[12px]">
        {slipPageSettings.map((option) => (
          <GradientBordered
            key={option.value}
            containerClassName={cn(
              'cursor-pointer flex-1 text-center h-[34px] rounded-[6.67px] text-[calc(1rem*(14/16))] text-white leading-[1] p-[0.5px] hover-scale',
              slippage !== option.value && '!bg-[#ECECED14] !bg-none',
            )}
            innerBgClassName={cn(
              'p-[8px] rounded-[6.5px] !bg-[transparent]',
              slippage === option.value && '!bg-[rgba(36,36,36,0.7)] text-[#00FFB4]',
            )}
            onClick={() => setValue('slippage', option.value)}
          >
            {option.content}
          </GradientBordered>
        ))}
      </div>
      <InputBorderGradient
        unit="%"
        placeHolder={t("orderForm.orderSetting.slipPointPlaceholder")}
        containerClassName="h-[48px] px-[14px] py-[12px] rounded-[8px]"
        innerBgClassName="rounded-[8px]"
        inputClassName="placeholder:text-[#FFFFFF5C] placeholder:text-[calc(1rem*(14/16))] text-[calc(1rem*(14/16))] max-w-[100%] flex-1"
        unitClassName="min-w-[auto] text-[calc(1rem*(14/16))] text-[#FFFFFF99] leading-[1]"
        inputProps={{
          type: 'number',
          // min: 1,
          // max: 50,
          ...register('slippage', {
            onChange: () => trigger('slippage'),
          }),
          onMouseLeave: () => trigger('slippage'),
        }}
      />
      {errors.slippage && errors.slippage.message &&  <span className="text-xs leading-none text-red-500 mt-1">
        {(errors as any)?.slippage?.message}
      </span>}
    </div>
  )
}

export default SlipPageSettings
