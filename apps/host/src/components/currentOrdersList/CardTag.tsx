import { useTranslation } from 'react-i18next'

type CardTagType = 'limitBuy' | 'limitSell' | 'movingStopLossSell'

const colorByType: Record<CardTagType, string> = {
  limitBuy: '#00CE89',
  limitSell: '#AB57FF',
  movingStopLossSell: '#00FFF6',
}

interface CardTagProps {
  type?: CardTagType
}

/**
 * CardTag component displays a styled tag indicating transaction type
 * Available types: 'limitBuy', 'limitSell', 'entry', 'close'
 * @param {CardTagType} type - The type of tag to display
 */
const CardTag: React.FC<CardTagProps> = ({ type }) => {
  const { t } = useTranslation()
  if (!type) {
    return <></>
  }

  return (
    <span
      className="inline-flex items-center leading-[1] text-[calc(1rem*(12/16))] px-[6px] py-[4px] rounded-[2px] border-[1px] font-[400]"
      style={{
        borderColor: colorByType[type],
        color: colorByType[type],
      }}
    >
      {t(`cardTag.${type}`)}
    </span>
  )
}

export default CardTag
