import { Control, useController, useWatch } from 'react-hook-form'
import { FilterFormData } from '@components/discover/filter/FilterFormData.ts'
import { useTranslation } from 'react-i18next'
import { useActiveChain } from "@hooks/useActiveChain.ts";
import { useMemo } from "react";

export interface DexSelectorProps {
  dexOptions: {
    value: string
    label: string
    icon: string
  }[]
  control: Control<FilterFormData>
}

const Selected = () => {
  return (
    <svg
      width="16"
      height="11"
      viewBox="0 0 16 11"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute top-0 right-0"
    >
      <path
        d="M13.0078 0.125C14.6645 0.12523 16.0078 1.46829 16.0078 3.125V8.98047C16.0078 9.38637 15.9254 9.77287 15.7793 10.126C15.0747 8.98523 13.8133 8.22461 12.374 8.22461H9.20703C7.75426 8.22458 6.41538 7.43701 5.70996 6.16699L3.49707 2.18262C2.79162 0.91269 1.45273 0.125 0 0.125H13.0078Z"
        fill="#6A2AE0"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.68848 3.78268L10.3227 5.73155L12.9375 2.20508"
        fill="#6A2AE0"
      />
      <path
        d="M8.68848 3.78268L10.3227 5.73155L12.9375 2.20508"
        stroke="white"
        style={{ stroke: 'white', strokeOpacity: 1 }}
      />
    </svg>
  )
}

export const Unselected = () => {
  return (
    <svg
      width="16"
      height="10"
      viewBox="0 0 16 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute top-0 right-0"
    >
      <mask id="mask0_24075_1711287" maskUnits="userSpaceOnUse" x="0" y="0" width="16" height="10">
        <rect width="16" height="10" fill="#D9D9D9" />
      </mask>
      <g mask="url(#mask0_24075_1711287)">
        <path
          d="M13.0078 0C14.6645 0.000230276 16.0078 1.34329 16.0078 3V8.85547C16.0078 9.26137 15.9254 9.64787 15.7793 10.001C15.0747 8.86023 13.8133 8.09961 12.374 8.09961H9.20703C7.75426 8.09958 6.41538 7.31201 5.70996 6.04199L3.49707 2.05762C2.79162 0.78769 1.45273 0 0 0H13.0078Z"
          fill="#878787"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8.68848 3.65768L10.3227 5.60655L12.9375 2.08008"
          fill="#878787"
        />
        <path d="M8.68848 3.65768L10.3227 5.60655L12.9375 2.08008" stroke="white" strokeOpacity="0.5" />
      </g>
    </svg>
  )
}

const useSelectedDexList = (control: Control<FilterFormData>): string[] | undefined => {
  const activeChain = useActiveChain()
  return useWatch({ control, name: `${activeChain}DexList` })
}

export const DexSelector = (props: DexSelectorProps) => {
  const { control, dexOptions } = props
  const activeChain = useActiveChain()
  const selectedDexList = useSelectedDexList(control)
  const { t } = useTranslation()

  const {
    field: { onChange },
  } = useController({ control, name: `${activeChain}DexList` })

  const isAllSelected = useMemo(() => {
    if (!selectedDexList) return true // no selection means all selected
    if (selectedDexList.length === 0) return false
    return selectedDexList.length === dexOptions.length
  }, [selectedDexList, dexOptions])

  const handelSelectDex = (value: string) => {
    if (value === 'All') {
      if (isAllSelected) {
        onChange([])
      } else {
        onChange(undefined)
      }
    } else {
      if (isAllSelected || !selectedDexList) {
        const allValues = dexOptions.map(opt => opt.value)
        const newList = allValues.filter(item => item !== value)
        onChange(newList)
        return
      }

      if (selectedDexList.includes(value)) {
        const newList = selectedDexList.filter((item) => item !== value)
        onChange(newList.length === 0 ? [] : newList)
      } else {
        const newList = [...selectedDexList, value]
        if (newList.length === dexOptions.length) {
          onChange(undefined)
        } else {
          onChange(newList)
        }
      }
    }
  }

  return (
    <div className="mb-3 w-full overflow-x-auto no-scrollbar">
      <div className="flex max-w-full flex-wrap items-center gap-1.5">
        <div
          key="All"
          className={`relative flex items-center gap-1 pl-1.5 pr-3 py-[5px] rounded-sm font-regular text-[14px] leading-[16px] cursor-pointer ${
            isAllSelected
              ? 'bg-gradient-to-tr-47 style2 text-white'
              : 'border-1 border-[#ECECED14] text-white/50'
          }`}
          onClick={() => handelSelectDex('All')}
        >
          {isAllSelected ? <Selected /> : <Unselected />}
          <img
            src="/images/icons/global.svg"
            alt="All"
            className={`w-5 h-5 ${isAllSelected ? 'opacity-100' : 'opacity-60'}`}
          />
          <span>{t('constant.all')}</span>
        </div>
        {dexOptions.map((option) => (
          <div
            key={option.value}
            className={`relative flex items-center gap-1 pl-1.5 pr-3 py-[5px] rounded-sm font-regular text-[14px] leading-[16px] cursor-pointer ${
              isAllSelected || selectedDexList?.includes(option.value)
                ? 'bg-gradient-to-tr-47 style2 text-white'
                : 'border-1 border-[#ECECED14] text-white/50'
            }`}
            onClick={() => handelSelectDex(option.value)}
          >
            {isAllSelected || selectedDexList?.includes(option.value) ? <Selected /> : <Unselected />}
            <img
              src={option.icon}
              alt={option.label}
              className={`w-5 h-5 rounded-full ${
                isAllSelected || selectedDexList?.includes(option.value) ? 'opacity-100' : 'opacity-60'
              }`}
            />
            <span>{option.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
} 