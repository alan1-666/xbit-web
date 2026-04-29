"use client"

import { useEffect, useRef } from "react"
import JSConfetti from "js-confetti"

export type ConfettiProps = {
  /** 是否触发爆彩 */
  trigger?: boolean
  /** 是否自动清理？默认为 false */
  autoCleanup?: boolean
  /** confetti 自定义选项 */
  confettiOptions?: Parameters<JSConfetti["addConfetti"]>[0]
}

const Confetti = ({
  trigger = false,
  autoCleanup = true,
  confettiOptions,
}: ConfettiProps) => {
  const confettiRef = useRef<JSConfetti | null>(null)

  useEffect(() => {
    if (!confettiRef.current) {
      confettiRef.current = new JSConfetti()
    }
  }, [])

  useEffect(() => {
    if (trigger && confettiRef.current) {
      confettiRef.current.addConfetti(confettiOptions)
    }
  }, [trigger, confettiOptions])

  return null
}

export default Confetti
