import { APP_PATH } from '@/lib/constant.ts'
import { routerActions } from '@/redux/modules/router.slice.ts'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '@/redux/store'

export const BrandArea = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const onBrandClick = () => {
    navigate(APP_PATH.FUTURES)
    dispatch(routerActions.setHeaderTab('crypto'))
  }
  return (
    <>
      <div className="hidden flex-shrink-0 cursor-pointer items-center gap-2 xl:flex" onClick={onBrandClick}>
        <img src="/images/xbit-logo.svg?v=2" alt="logo" className="block cursor-pointer h-9 w-10" />
        <img
          src="/images/logo-xbit-text.svg"
          alt="logo"
          className="mt-1 cursor-pointer h-5.5"
        />
      </div>

      <div className="block flex-shrink-0 cursor-pointer items-center gap-2 xl:hidden" onClick={onBrandClick}>
        <img src="/images/xbit-logo.svg?v=2" alt="logo" className="block h-6 w-7 cursor-pointer xl:hidden" />
      </div>
    </>
  )
}
