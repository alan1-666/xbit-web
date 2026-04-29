import React, { createContext, useContext, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import Text from '@/components/common/Text'
import { CircleCheck, CircleX, Info } from 'lucide-react'

interface ToastData {
  id: string
  type: 'success' | 'error' | 'warning' | 'info' | 'default'
  title: string
  description?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastContextType {
  showToast: (toast: Omit<ToastData, 'id'>) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

const ToastItem: React.FC<{
  toast: ToastData
  index: number
  total: number
  onClose: (id: string) => void
}> = ({ toast, index, onClose }) => {
  const [isVisible, setIsVisible] = useState(true)

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => {
      onClose(toast.id)
    }, 250)
  }

  const getTypeStyles = () => {
    switch (toast.type) {
      default:
        return '!bg-[#212127]'
    }
  }

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CircleCheck className="size-5" />
      case 'error':
        return <CircleX className="size-5" />
      case 'warning':
        return <CircleX className="size-5" />
      case 'info':
        return <Info className="size-5" />
      default:
        return null
    }
  }

  const getStackStyles = () => {
    const baseOffset = 16 // Spacing between toasts
    // const scaleStep = 0.05 // Reduce scale for each back toast
    const opacityStep = 0.15 // Reduce opacity for each back toast

    const translateY = index * baseOffset
    // const scale = 1 - index * scaleStep
    const opacity = 1 - index * opacityStep
    const zIndex = 9999 - index

    return {
      // transform: `translateX(-50%) translateY(${translateY}px) scale(${scale})`,
      marginTop: `${translateY}px`,
      opacity: Math.max(opacity, 0.4), // Minimum opacity
      zIndex,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    }
  }

  return (
    <div
      className={cn(
        'fixed left-1/2 top-4 transform -translate-x-1/2 min-w-[300px] max-w-[620px] p-4 rounded-lg shadow-xl w-[90vw] ',
        'transition-all duration-300 ease-out',
        getTypeStyles(),
        isVisible ? 'animate-in fade-in slide-in-from-top-4' : 'animate-out fade-out slide-out-to-top-4',
      )}
      style={{
        ...getStackStyles(),
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        fontWeight: 500,
        lineHeight: 1.5,
        color: 'inherit',
      }}
    >
      <div className="flex items-start justify-center gap-3">
        <div className="mt-0.5">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <Text text={toast.title} fontSize={12} fontWeight="medium" className="mt-0.5" />
          {toast.description && <div className="text-gray-500 text-sm mt-1 leading-5">{toast.description}</div>}
        </div>

        <div className="flex items-center gap-2 ml-4">
          {toast.action && (
            <button
              onClick={toast.action.onClick}
              className="text-sm font-medium text-gray-900 hover:text-gray-700 border border-gray-300 rounded px-2 py-1 hover:bg-gray-50 transition-colors"
            >
              {toast.action.label}
            </button>
          )}
          {/* Keep toasts consistent and don’t remove buttons */}

          {/* <button
            onClick={handleClose}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 p-1 rounded transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button> */}
        </div>
      </div>
    </div>
  )
}

// Toast Container
const ToastContainer: React.FC<{
  toasts: ToastData[]
  onRemove: (id: string) => void
}> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null

  return createPortal(
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      {toasts.map((toast, index) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} index={index} total={toasts.length} onClose={onRemove} />
        </div>
      ))}
    </div>,
    document.body,
  )
}

// Toast Provider
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const showToast = useCallback((toastData: Omit<ToastData, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    const newToast: ToastData = {
      ...toastData,
      id,
      duration: toastData.duration || 1500,
    }

    setToasts((prev) => [newToast, ...prev])

    // Auto remove
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}
