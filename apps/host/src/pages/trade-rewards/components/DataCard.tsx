import { useTranslation } from "react-i18next"
// import { formatNumber } from "@/utils/c"

export const DataCard = ({ tradeData }: { tradeData: any }) => {
  const { t } = useTranslation()
  
  const data = [
    {
      title: t('Activityrewards.totalVolume'),
      value: tradeData.totalVolume,
      unit: '$',
      type:'volume'
    },
    {
      title: t('Activityrewards.activeDays'),
      value: tradeData.activeDays,
      unit: t('Activityrewards.day'),
      type:'active'
    },
    {
        title: t('Activityrewards.totalCommission'),
        value: tradeData.totalCommission,
        unit: '$',
        type:'commission'
    },
  ]

  return (
    <div className="relative overflow-hidden border-t border-[#2323290F] pt-2 mt-3">
      <div className="relative z-10 flex justify-between items-center">
        {/* Total Volume */}
        {data.map((item, index) => (
            // relative after:content-[''] after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:w-[1px] after:h-[24px] after:bg-[#2323290F] after:z-10 last:after:hidden
          <div className="text-center w-[33.33%]" key={index}>
            <div className="text-[#141414] text-[16px] font-bold">
              {item.type === 'active' ?  `${item.value} ${item.unit}` : `${item.unit} ${item.value}`}
            </div>
            <div className="text-[#14141450] text-[12px] mt-1">
              {item.title}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}