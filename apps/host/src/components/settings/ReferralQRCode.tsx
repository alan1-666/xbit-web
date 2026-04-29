import { Ref, useEffect, useImperativeHandle, useMemo, useRef } from 'react'
import QRCodeStyling from 'qr-code-styling'

export interface ReferralQRCodeProps {
  ref: Ref<ReferralQRCodeHandle>
  code?: string
}

export interface ReferralQRCodeHandle {
  download: () => void
}

export const ReferralQRCode = (props: ReferralQRCodeProps) => {
  const { code, ref } = props

  const containerRef = useRef<HTMLDivElement>(null)

  const url = useMemo(() => {
    const currentDomain = window.location.origin
    return code ? `${currentDomain}/@${code}` : currentDomain
  }, [code])

  const qrCode = useMemo(() => {
    return new QRCodeStyling({
      width: 250,
      height: 250,
      type: 'svg',
      data: url,
      image: '/images/kairox-logo.svg',
      margin: 10,
      dotsOptions: {
        color: '#4267b2',
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
  }, [url])

  useImperativeHandle(ref, () => ({
    download: () => {
      qrCode
        .download({
          name: 'KairoX',
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
}
