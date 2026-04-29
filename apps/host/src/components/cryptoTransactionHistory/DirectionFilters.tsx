import { cn } from '@/lib/utils'
import { Dispatch, SetStateAction } from 'react'
import { useTranslation } from 'react-i18next'
import DrawerCheckSelect from '../common/DrawerCheckSelect'
import { modeOptions, ModeOptionsEmun } from './type'

interface IPDirectionFilters {
  directionFilter: ModeOptionsEmun
  setDrectionFilter: Dispatch<SetStateAction<ModeOptionsEmun>>
}

const DirectionFilters = ({ setDrectionFilter, directionFilter }: IPDirectionFilters) => {
  const { t } = useTranslation()

  const handleModeChange = (mode: string) => {
    console.log(mode)

    setDrectionFilter(mode as ModeOptionsEmun)
  }

  return (
    <DrawerCheckSelect
      childrenTrigger={
        <div
          className={cn(
            `flex items-center py-1.5 cursor-pointer text-[calc(1rem*(13/16))] leading-[calc(1rem*(13/16))] text-[#FFFFFF] justify-center`,
          )}
        >
          {modeOptions.find((item) => item.value === directionFilter)?.label}
          <img className="ml-1" src="/images/icons/icon-chevron-down.svg" alt="icon arrow down" />
        </div>
      }
      options={modeOptions}
      value={directionFilter}
      onChange={handleModeChange}
    />
  )
}

export default DirectionFilters
