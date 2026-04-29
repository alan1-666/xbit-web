import { LanguageCode } from '@/redux/modules/errorMessages.slice'
import { useAppSelector } from '@/redux/store'
import { getErrorMessage } from '@/utils/helpers'

const useGetErrorMsg = () => {
  const { getErrorMessages } = useAppSelector((state) => state.errorMessages)
  const params = new URLSearchParams(window.location.search)
  const langUrl = params.get('lang')
  const lang =
    langUrl || localStorage.getItem('i18nextLng')?.substring(0, 2) || navigator.language?.substring(0, 2) || 'en'

  const handleGetErrorMessage = (errorCode: string) => {
    // console.log(
    //   getErrorMessage(errorMessages, errorCode, lang as LanguageCode),
    //   'this is getErrorMessage(errorMessages, errorCode, lang as LanguageCode)',
    // )
    return getErrorMessage(getErrorMessages, errorCode, lang as LanguageCode)
  }

  return { handleGetErrorMessage }
}

export default useGetErrorMsg
