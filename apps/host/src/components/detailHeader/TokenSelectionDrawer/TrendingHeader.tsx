import { useTranslation } from 'react-i18next'
import { IconHeaderHot } from '../../icon'

/**
 * Header for the trending section
 */
const TrendingHeader = () => {
  const { t } = useTranslation()

  return (
    <h6 className="text-[calc(18rem/16)] leading-[calc(18rem/16)] text-white font-medium mt-3 inline-flex items-center gap-1">
      {t('tokenSelectionDrawer.trending24h')}
      <IconHeaderHot />
    </h6>
  )
}

export default TrendingHeader
