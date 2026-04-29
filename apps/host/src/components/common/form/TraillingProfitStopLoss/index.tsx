import InputUnit from '@components/currentOrdersList/ModifyOrder/InputUnit.tsx'
import SliderGradient from '@components/orderForm/SliderGradient.tsx'
import { useTranslation } from 'react-i18next'
import { ChangeEvent, HTMLProps, useState } from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@components/ui/accordion.tsx'

type TrailingProfitStopLossFormProps = {
  title?: string
  inputFields?: Array<{
    unit: string
    label: string
    containerClassName?: string
    inputProps?: HTMLProps<HTMLInputElement>
  }>
  sliderValue?: number[]
  onSliderValueChange?: (value: number[]) => void
  infoIconSrc?: string
  infoText?: string
  chevronIconSrc?: string
  activatePriceLabel?: string
  containerClassName?: string
  triggerPriceValue: string
  onChangeTriggerValue: (e: ChangeEvent<HTMLInputElement>) => void
}

const TrailingProfitStopLossForm = ({
  title,
  inputFields = [],
  sliderValue: initialSliderValue = [50],
  onSliderValueChange,
  infoIconSrc = '/images/orderSetting/icon-info.svg',
  infoText,
  chevronIconSrc = '/images/tokenDetail/icon-chevron-up.svg',
  activatePriceLabel,
  containerClassName = '',
  triggerPriceValue,
  onChangeTriggerValue,
}: TrailingProfitStopLossFormProps) => {
  const { t } = useTranslation()
  const [sliderValue, setSliderValue] = useState<number[]>(initialSliderValue)

  const handleSliderChange = (value: number[]) => {
    setSliderValue(value)
    onSliderValueChange?.(value)
  }

  return (
    <div className={`mx-3 rounded-[10px] ${containerClassName}`}>
      <div className="flex flex-col gap-3 mb-8">
        {inputFields.map((field, index) => (
          <div className="flex items-center gap-2">
            <div className="w-1/4 text-[15px] font-[330] leading-none text-white">{field.label}</div>
            <InputUnit
              key={index}
              type="number"
              unit={field.unit}
              label={field.label}
              containerClassName={`${field.containerClassName} flex-1`}
              inputProps={field.inputProps}
            />
          </div>
        ))}
      </div>
      <SliderGradient sliderValue={sliderValue} onSliderValueChange={handleSliderChange} />
      <Accordion
        type="single"
        collapsible
        defaultValue="open"
        // onValueChange={(open: string) => onOpenPriceUsd(open)}
      >
        <AccordionItem value="open" className="border-none">
          <AccordionTrigger className="mt-[12px]">
            <span className="text-[12px] font-[330] leading-none text-[#cccadb]">
              {infoText || t('detail.myPositions.activeStopLoss')}
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <InputUnit
              unit="USDT"
              type="number"
              inputProps={{
                value: triggerPriceValue,
                onChange: onChangeTriggerValue,
              }}
              containerClassName="mt-3 app-font-regular h-9 py-1 bg-[#2b2b33]"
              // inputWrapperClassName="py-0 gap-0 [&>div]:leading-3"
              unitClassName="text-[calc(1rem*(12/16))]"
              className="text-[calc(1rem*(12/16))]"
              label={activatePriceLabel || t('detail.myPositions.activatePrice')}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

export default TrailingProfitStopLossForm
