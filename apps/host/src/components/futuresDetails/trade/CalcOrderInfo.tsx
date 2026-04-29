import { UITab } from '@/types/uiTabs.ts'
import { cn } from '@/lib/utils'

interface CalcOrderInfoProps {
  calcList: UITab[]
  containerClassName?: string
  itemClassName?: string
}


const CalcOrderInfo = ({calcList, containerClassName, itemClassName}: CalcOrderInfoProps) => {
  return (
    
    <div className={
      cn('mb-2', containerClassName)
    }>
      {calcList.map((item, key) => {
        return (
          <p key={key} className={cn('flex items-center justify-between py-1.5', itemClassName)}>
            <span className='text-[calc(1rem*(11/16))] xl:text-[13px] xl:text-[#908E98] leading-[1] text-[#FFFFFFB2]'>{item.label}</span>
            <span className='text-[calc(1rem*(12/16))] xl:text-[13px] xl:text-[#FCFCFC] leading-[1] text-[#FFFFFF]'>{item.value}</span>
					</p>
        )
      })}
    </div>
  )
}

export default CalcOrderInfo