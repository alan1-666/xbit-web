import { CopyButton } from '@components/common/copy-button.tsx'
import { useTranslation } from 'react-i18next'
import { QRCodeCanvas } from 'qrcode.react'

export interface AddressQRProps {
  title?: string | JSX.Element
  description?: string | JSX.Element
  address?: string
  logo?: string
  showCopyButton?: boolean
}

export const AddressQR = (props: AddressQRProps) => {
  const { title, description, address, logo, showCopyButton = true } = props
  const { t } = useTranslation()
  return (
    <div className="bg-[#2B2B33] rounded-[8px] p-2 flex gap-4">
      <div className="size-[112px] relative">
        <QRCodeCanvas
          value={address || ''}
          size={112}
          level="H"
          marginSize={2}
          imageSettings={{
            src: logo || '',
            height: 30,
            width: 30,
            excavate: true,
            opacity: 0,
          }}
          className="rounded-[6px]"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="size-6 bg-black p-1">
            <img src={logo || ''} alt="logo" className="w-full h-full object-contain" />
          </div>
        </div>
      </div>
      <div className="self-stretch h-[112px] flex-1 flex flex-col">
        <div className="mb-2 text-[#6C6A74] text-[calc(12rem/16)]">{title || t('assets.deposit.address')}</div>
        <div className="text-sm text-white break-all">{address}</div>
        <div className="flex-1 flex justify-between items-end">
          <div>{description}</div>
          <div className="mb-1">
            {showCopyButton ? <CopyButton icon="/images/icons/ic-copy2.svg" text={address} /> : null}
          </div>
        </div>
      </div>
    </div>
  )
}
