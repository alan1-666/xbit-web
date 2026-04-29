import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'

const RedPacketDialog = () => {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // 检查是否是移动端
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    if (!isMobile) return

    // 获取今天的日期标识（UTC 时间）
    const getTodayKey = () => {
      const now = new Date()
      const utcDate = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
      )
      return `redpacket_dialog_closed_${utcDate.getTime()}`
    }

    const todayKey = getTodayKey()
    const isClosed = localStorage.getItem(todayKey)

    // 如果今天还没有关闭过，则显示弹窗
    if (!isClosed) {
      setIsOpen(true)
    }
  }, [])

  const handleClose = () => {
    const getTodayKey = () => {
      const now = new Date()
      const utcDate = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
      )
      return `redpacket_dialog_closed_${utcDate.getTime()}`
    }

    const todayKey = getTodayKey()
    localStorage.setItem(todayKey, 'true')
    setIsOpen(false)
  }

  const handleImageClick = () => {
    // 点击主图跳转到红包页面
    navigate('/redpacket')
    handleClose()
  }

  if (!isOpen) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center"
      onClick={handleClose}
    >
      {/* 蒙层 */}
      <div className="absolute inset-0 bg-black/80" />

      {/* 弹窗内容 */}
      <div
        className="relative w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 背景图 */}
        <img
          src="/images/redpacket/bg-bg-h5.png"
          alt="background"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="relative mx-auto w-[375px] max-w-[80vw]">

          {/* 主图 - 可点击区域 */}
          <div
            className="relative cursor-pointer"
            onClick={handleImageClick}
          >
            <img
              src="/images/redpacket/home-toast.webp"
              alt="red packet"
              className="w-full relative left-[20px]"
            />
          </div>

          {/* 关闭按钮 */}
          <div className="flex justify-center">
            <img
              src="/images/redpacket/close-btn.png"
              alt="close"
              className="w-12 cursor-pointer"
              onClick={handleClose}
            />
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default RedPacketDialog
