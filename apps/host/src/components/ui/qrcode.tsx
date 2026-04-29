import { QRCodeCanvas } from 'qrcode.react'

type Props = {
  value: string
  chain?: string
}

const XQRCode = (props: Props) => {
  const { value, chain } = props

  return (
    <div className="bg-[#FFFFFF] rounded-[8px] p-[10px] relative w-[225px] h-[225px]">
      <QRCodeCanvas value={value} size={200} style={{ width: '100%', height: '100%' }} level="H" />
      {chain && (
        <img
          src="/images/solana.webp"
          alt="logo"
          className="absolute top-1/2 left-1/2 w-12 h-12 transform -translate-x-1/2 -translate-y-1/2 bg-black p-1 shadow"
        />
      )}
    </div>
  )
}

export default XQRCode
