import { useState } from 'react'
import dayjs from 'dayjs'
import EarningsTable from '../components/earnings/EarningsTable'
import { useEarningsEvents } from '../hooks/useEarningsEvents'
import { WEEK_OFFSETS } from '../constants/earnings.constants'

const Earnings = () => {
  const [activeWeekStartDate, setActiveWeekStartDate] = useState<Date | null>(null)

  const formatted = activeWeekStartDate ? dayjs(activeWeekStartDate).format('MMMM YYYY') : dayjs().format('MMMM YYYY')

  const { data, isLoading } = useEarningsEvents({ weekOffsets: WEEK_OFFSETS })

  return (
    <div className="pb-4 xl:pb-8">
      <div className="text-center text-sm font-normal leading-none text-[#908E98]">{formatted}</div>
      <div className="mt-2 text-center text-lg xl:text-2xl font-semibold leading-none text-white">
        Earnings Calendar
      </div>
      <EarningsTable events={data || []} isLoading={isLoading} onActiveWeekChange={setActiveWeekStartDate} />
    </div>
  )
}

export default Earnings
