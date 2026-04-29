import { useRef } from 'react'
import { toast } from 'sonner'

/**
 * Type for the showToastMessengerLink props
 */
type showToastMessengerLinkProps = {
  title: string
  msg?: string
  link?: string
  onClick?: () => void
}
/**
 * Custom hook to manage toasts based on isPending state
 */
const useCustomToast = () => {
  // Reference to store the ID of the current toast
  const toastIdRef = useRef<string | number | null>(null)

  /**
   * Displays the toast
   * @param title The title of the toast
   * @param handleClose The function to handle when closing the toast
   * @returns the ID of the toast
   */
  const showToast = (title: string, handleClose?: () => void) => {
    // Cancel current toast if any
    if (toastIdRef.current) {
      toast.dismiss(toastIdRef.current)
    }

    // Create new toast and save ID
    const newToastId = toast.custom(
      (t) => (
        <div className="bg-[#27272A] border border-[#3E2761] text-white rounded-xl overflow-hidden max-w-lg w-full mx-auto">
          <div className="p-4 flex items-center justify-between md:gap-14">
            <div className="text-sm flex gap-1 ">{title}</div>

            <div
              className="cursor-pointer"
              onClick={() => {
                toast.dismiss(t)
                if (handleClose) handleClose()
              }}
            >
              {/* <img src="/images/icons/icon-x.svg" className="w-6 h-6 cursor-pointer" alt="" /> */}
            </div>
          </div>
        </div>
      ),
      {
        duration: 1500,
        position: 'top-center',
        style: {
          backgroundColor: 'transparent',
        },
        onDismiss: () => {
          toastIdRef.current = null
          if (handleClose) handleClose()
        },
      },
    )

    toastIdRef.current = newToastId
    return newToastId
  }

  /**
   * Displays a custom toast notification with a title, message, and an optional link or click handler.
   *
   * @param {Object} params - The parameters for the toast notification.
   * @param {string} params.title - The title of the toast notification.
   * @param {string} params.msg - The message displayed in the toast notification.
   * @param {string} [params.link] - An optional URL to open when the notification is clicked.
   * @param {() => void} [params.onClick] - An optional callback function to execute when the notification is clicked.
   *
   * @returns {void}
   *
   * @example
   * showToastMessengerLink({
   *   title: "New Message",
   *   msg: "Click here to view",
   *   link: "https://example.com",
   *   onClick: () => console.log("Toast clicked"),
   * });
   */
  const showToastMessengerLink = ({ title, msg, link, onClick }: showToastMessengerLinkProps) => {
    toast.custom(
      (t) => (
        <div className=" text-white rounded-xl overflow-hidden shadow-lg max-w-lg w-full mx-auto">
          <div className="p-4 flex items-center justify-between md:gap-14">
            <div className="text-sm">{title}</div>

            <div
              className="cusor-pointer"
              onClick={() => {
                if (link) {
                  window.open(link, '_blank')
                }
                if (onClick) onClick()
                toast.dismiss(t)
              }}
            >
              <span className="text-white text-sm cursor-pointer">{msg}</span>
              <span className="text-white ml-2 font-medium cursor-pointer">›</span>
            </div>
          </div>
        </div>
      ),
      {
        duration: 1500,
      },
    )
  }

  /**
   * Show successful toast
   * @param title Title of toast
   * @param handleClose Function to handle when closing toast
   * @returns ID of toast
   */
  const showSuccessToast = (title: string, handleClose?: () => void) => {
    if (toastIdRef.current) {
      toast.dismiss(toastIdRef.current)
    }

    const newToastId = toast.custom(
      (t) => (
        <div className="text-white rounded-xl overflow-hidden max-w-lg w-full mx-auto">
          <div className="p-4 flex items-center justify-between md:gap-14">
            <div className="text-sm flex gap-1">
              <img src="/images/icons/success-icon.svg" alt="" className="cursor-pointer" /> {title}
            </div>

            <div
              className="cursor-pointer"
              onClick={() => {
                toast.dismiss(t)
                if (handleClose) handleClose()
              }}
            >
              {/* <img src="/images/icons/icon-x.svg" className="w-6 h-6 cursor-pointer" alt="" /> */}
            </div>
          </div>
        </div>
      ),
      {
        duration: 1500,
        position: 'top-center',
        style: {
          backgroundColor: 'transparent',
        },
        onDismiss: () => {
          toastIdRef.current = null
          if (handleClose) handleClose()
        },
      },
    )

    toastIdRef.current = newToastId
    return newToastId
  }

  /**
   * Cancel current toast
   */
  const dismissToast = () => {
    if (toastIdRef.current) {
      toast.dismiss(toastIdRef.current)
      toastIdRef.current = null
    }
  }

  return {
    showToast,
    showSuccessToast,
    showToastMessengerLink,
    dismissToast,
    toastId: toastIdRef.current,
  }
}

export default useCustomToast
