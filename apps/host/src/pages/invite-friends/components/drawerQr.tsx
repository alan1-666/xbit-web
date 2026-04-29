import BottomSheet from '@/components/common/BottomSheet'
import Text from '@/components/common/Text'
import { QRCodeCanvas } from 'qrcode.react'
import { useTranslation } from 'react-i18next'

type Props = {
  open: boolean
  valueQR: string
  setOpen: (open: boolean) => void
}

const DrawerQr = ({ open, valueQR, setOpen }: Props) => {
  const { t } = useTranslation()

  return (
    <BottomSheet open={open} setOpen={setOpen} title={''} hiddenBgImg classNameDrawerHeader='py-[12px]'>
      <div className="mx-auto pb-10">
        <Text text={t('inviteFriends.scanQrCode')} fontSize={18} fontWeight="light" className="mb-[8px]" />
        <Text text={t('inviteFriends.scanQrCodeDescription')} fontSize={15} fontWeight="light" color="#FFFFFFB2" />
        <QRCodeCanvas
          value={valueQR || ''}
          size={248}
          marginSize={2}
          imageSettings={{
            src: '/images/xbit-logo-rounded.svg',
            height: 35,
            width: 35,
            excavate: true,
          }}
          className="rounded-[10px] mx-auto mt-[20px]"
        />
      </div>
      {/* <slot>
        <div className="mt-6 flex flex-col gap-3"></div>
      </slot> */}
    </BottomSheet>
  )
}

export default DrawerQr
