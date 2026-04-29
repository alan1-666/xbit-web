import {FilterTimeOption} from "@components/common/FilterTime";
import {clsx} from "clsx";
import {Control, useController, useWatch} from "react-hook-form";
import {FilterFormData} from "@components/listCoin/filter/FilterField.tsx";
import { useTranslation } from 'react-i18next'

const periods: FilterTimeOption[] = [
  {value: '1', unit: 'm'},
  {value: '5', unit: 'm'},
  {value: '1', unit: 'h'},
  {value: '6', unit: 'h'},
  {value: '24', unit: 'h'},
]

export interface TimePeriodFilterProps {
  control: Control<FilterFormData>
}

export default function TimePeriodFilter(props: TimePeriodFilterProps) {
  const {control} = props;
  const { t } = useTranslation()
  const selectedPeriod = useWatch({control, name: 'period'})
  const controller = useController({control, name: 'period'});

  return (
    <div className="mb-4">
      <div className="text-[calc(1rem*(13/16))] text-[#FFFFFFCC] mb-3">
        {t('chart.period.title')}
      </div>
      <div className="flex bg-[#ECECED0A] rounded-sm">
        {periods.map((period) => (
          <button
            key={`${period.value}-${period.unit}`}
            className={clsx(
              'flex-1 py-1.5 text-xs cursor-pointer transition duration-500',
              selectedPeriod?.value === period.value && selectedPeriod?.unit === period.unit ? 'rounded-[3px] bg-[#ECECED1F] text-white' : 'text-[#FFFFFFB2]'
            )}
            onClick={() => controller.field.onChange(period)}
          >
            {period.value}{period.unit}
          </button>
        ))}
      </div>
    </div>
  )
}
