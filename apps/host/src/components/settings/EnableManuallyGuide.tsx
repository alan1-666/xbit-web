import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

export const EnableManuallyGuide = (props: { id: number | string }) => {
  const { id } = props
  const { t } = useTranslation()
  const handleClose = () => {
    toast.dismiss(id)
  }
  return (
    <div className="w-full mx-auto rounded-[8px]">
      <div className="p-4 bg-[#27272A] rounded-[8px] text-[calc(14rem/16)] flex gap-2">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clipPath="url(#clip0_24295_522923)">
            <path
              d="M7.99967 14.6663C9.84061 14.6663 11.5073 13.9201 12.7137 12.7137C13.9201 11.5073 14.6663 9.84061 14.6663 7.99967C14.6663 6.15874 13.9201 4.49207 12.7137 3.28563C11.5073 2.0792 9.84061 1.33301 7.99967 1.33301C6.15874 1.33301 4.49207 2.0792 3.28563 3.28563C2.0792 4.49207 1.33301 6.15874 1.33301 7.99967C1.33301 9.84061 2.0792 11.5073 3.28563 12.7137C4.49207 13.9201 6.15874 14.6663 7.99967 14.6663Z"
              fill="#00FFF6"
              stroke="#00FFF6"
              strokeWidth="1.33333"
              strokeLinejoin="round"
            />
            <path d="M8 4L8 8" stroke="#141414" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="8" cy="11" r="0.5" fill="#141414" stroke="#141414" />
          </g>
          <defs>
            <clipPath id="clip0_24295_522923">
              <rect width="16" height="16" fill="white" />
            </clipPath>
          </defs>
        </svg>
        <div className="flex-1 leading-4">{t('appSettings.notifications.guideManual')}</div>
        <button onClick={handleClose} className="size-4">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M3.33398 3.33301L12.6667 12.6657"
              stroke="#878787"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M3.33331 12.6657L12.666 3.33301"
              stroke="#878787"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
