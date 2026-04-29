import { memo, Ref, useEffect, useImperativeHandle, useMemo, useRef } from 'react'
import QRCodeStyling from 'qr-code-styling'

export interface CustomerServiceQRCodeHandle {
  download: () => void
}

export interface CustomerServiceQRCodeProps {
  ref: Ref<CustomerServiceQRCodeHandle>
  url: string
}

export const CustomerServiceQRCode = memo((props: CustomerServiceQRCodeProps) => {
  const { ref, url } = props
  const containerRef = useRef<HTMLDivElement>(null)

  const qrCode = useMemo(() => {
    return new QRCodeStyling({
      width: 200,
      height: 200,
      type: 'svg',
      data: url,
      image: '/images/telegram-logo-cs.svg',
      margin: 0,
      dotsOptions: {
        color: '#5A8B50',
        type: 'extra-rounded',
      },
      backgroundOptions: {
        color: '#fff',
      },
      imageOptions: {
        crossOrigin: 'anonymous',
        margin: 6,
      },
      cornersSquareOptions: {
        type: 'extra-rounded',
      },
    })
  }, [])

  useImperativeHandle(ref, () => ({
    download: () => {
      qrCode
        .download({
          name: 'Xbit Customer Service QR Code',
          extension: 'png',
        })
        .then()
    },
  }))

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    qrCode.append(container)
    return () => {
      container.innerHTML = ''
    }
  }, [containerRef.current, qrCode])

  return <div className="rounded-[7px] overflow-clip" ref={containerRef} />
})
