interface NavigationHeaderProps {
  /** 页面标题 */
  title: string
  /** 返回按钮点击事件 */
  onBack?: () => void
  /** 关闭按钮点击事件 */
  onClose?: () => void
  /** 是否显示返回按钮，默认 true */
  showBack?: boolean
  /** 是否显示菜单按钮（三个点），默认 true */
  showMenu?: boolean
  /** 是否显示关闭按钮，默认 true */
  showClose?: boolean
  containerClassName?: string
}

/**
 * 通用导航头部组件
 *
 * @example
 * ```tsx
 * // 完整功能
 * <NavigationHeader
 *   title="邀请好友"
 *   onBack={() => navigate(-1)}
 *   onClose={() => setIsOpen(false)}
 * />
 *
 * // 只显示标题和关闭
 * <NavigationHeader
 *   title="设置"
 *   onClose={() => setIsOpen(false)}
 *   showBack={false}
 *   showMenu={false}
 * />
 * ```
 */

const NavigationHeader = ({
  title,
  onBack,
  onClose,
  showBack = true,
  showMenu = true,
  showClose = true,
  containerClassName,
}: NavigationHeaderProps) => {
  return (
    <div className={`flex items-center justify-between  pt-[10px] pb-[10px]  bg-[#121212] ${containerClassName}`}>
      {/* 左侧返回按钮 */}
      {showBack && onBack && (
        <div onClick={onBack}>
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="16" viewBox="0 0 10 16" fill="none">
            <path d="M9.25 1L2.25 7.87719L9.25 15" stroke="white" strokeWidth="2" />
          </svg>
        </div>
      )}

      {/* 中间标题 */}
      <div className="flex-1 flex items-center justify-center">
        <h1 className="text-white text-[17px]">{title}</h1>
      </div>

      {/* 右侧操作按钮 */}
      {showClose && onClose && (
        <div
          className="flex items-center justify-center absolute right-[10px] w-[50px] h-[32px]  bg-[#ECECED1F] rounded-[16px]"
          onClick={onClose}
        >
          {/* <div>
            <svg xmlns="http://www.w3.org/2000/svg" width="19" height="7" viewBox="0 0 19 7" fill="none">
            <path  d="M4.5 3.5C4.5 4.6044 3.6044 5.5 2.5 5.5C1.3956 5.5 0.5 4.6044 0.5 3.5C0.5 2.3952 1.3956 1.5 2.5 1.5C3.6044 1.5 4.5 2.3952 4.5 3.5ZM9.75 0C11.5447 0 13 1.4547 13 3.25C13 5.04465 11.5447 6.5 9.75 6.5C7.95535 6.5 6.5 5.04465 6.5 3.25C6.5 1.4547 7.95535 0 9.75 0ZM17 1.5C18.1044 1.5 19 2.3952 19 3.5C19 4.6044 18.1044 5.5 17 5.5C15.8956 5.5 15 4.6044 15 3.5C15 2.3952 15.8956 1.5 17 1.5Z" fill="white"/>
          </svg>
        </div>
        <div className="ml-[10px] mr-[10px]">
          <svg xmlns="http://www.w3.org/2000/svg" width="1" height="19" viewBox="0 0 1 19" fill="none">
            <path opacity="0.2" d="M0.5 0.5H1.00413V19H0.5V0.5Z" fill="white"/>
          </svg>
        </div> */}
          <div className="cursor-pointer">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>
      )}
    </div>
  )
}

export default NavigationHeader
