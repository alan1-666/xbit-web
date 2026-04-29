import { useTranslation } from 'react-i18next'
import { IconHeaderSearch } from '../../icon'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
}

/**
 * Search input component for token selection
 */
const SearchInput = (props: SearchInputProps) => {
  const { value, onChange } = props
  const { t } = useTranslation()

  return (
    <div className="border border-[#FFFFFF14] bg-[#232329] rounded-full py-2.5 px-[15px] inline-flex items-center w-full">
      <IconHeaderSearch className="mr-1.5 text-white" />
      <input
        type="text"
        className="w-full h-full bg-transparent outline-none text-[calc(14rem/16)] text-white placeholder:text-[#FFFFFF80]"
        placeholder={t('tokenSelectionDrawer.searchPlaceholder')}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}

export default SearchInput
