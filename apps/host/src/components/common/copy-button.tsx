import { HTMLAttributes, useCallback, useRef, useState } from 'react'
import { Check } from 'lucide-react'
import { toast } from 'sonner'
import ClipboardJS from 'clipboard'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils.ts'
import { logEvent2, ACTIONS } from '@services/google-analytics.service'

type CopyBtnProps = {
  text?: string
  containerClassName?: HTMLAttributes<HTMLDivElement>['className']
  colorClassName?: string
  className?: string
  ref?: any
  icon?: string
  externalOnClick?: () => void
  type?: 'tokenAddress' | string
}

export function CopyButton(props: CopyBtnProps) {
  const { t } = useTranslation()
  const { text, ref, containerClassName, colorClassName, className, icon, externalOnClick, type, ...rest } = props
  const [checked, setChecked] = useState(false)
  const buttonRef = useRef(null)

  const copy = useCallback(
    (e: any) => {
      e.stopPropagation() // Stop event bubbling
      e.preventDefault() // Prevent default action (for extra safety)

      //Check working in safari (ios 18)
      if (!navigator.clipboard) {
        const clipboard = new ClipboardJS(buttonRef.current!, {
          text: () => text || '',
        })

        clipboard.on('success', () => {
          onCopySuccess()
        })

        return
      }
      if (text && type === 'tokenAddress') {
        logEvent2(ACTIONS.meme_copy_address, {
          token_address: text,
        })
      }

      navigator.clipboard
        .writeText(text || '')
        .then(() => {
          onCopySuccess()
        })
        .catch((err) => {
          console.warn(err)
        })
    },
    [text, buttonRef],
  )

  const onCopySuccess = () => {
    setChecked(true)
    toast.success(t('toast.copiedSuccess'))
    setTimeout(() => {
      setChecked(false)
    }, 600)
  }

  return (
    <div
      className={cn('cursor-pointer', containerClassName)}
      ref={buttonRef}
      onClick={(e) => {
        e.stopPropagation()
        copy(e)
        externalOnClick?.()
      }}
      {...rest}
    >
      {checked ? (
        <Check className={`w-4 h-4 ${className}`} />
      ) : (
        <img
          src={icon ?? '/images/icons/ic-copy.svg'}
          className={cn('w-4 h-4 min-w-4 cursor-pointer', className)}
          alt=""
        />
      )}
    </div>
  )
}
