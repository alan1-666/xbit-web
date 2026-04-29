import {Ref, useImperativeHandle, useState } from 'react'
import { Sheet, SheetContent } from '@components/ui/sheet.tsx'
import { AiAnalysisForm } from '@components/ai/AiAnalysisForm.tsx'

export interface AiAnalysisSheetHandle {
  open: (tokenAddress?: string) => void
}

export interface AiAnalysisSheetProps {
  ref: Ref<AiAnalysisSheetHandle>
}

export const AiAnalysisSheet = (props: AiAnalysisSheetProps) => {
  const { ref } = props
  const [tokenAddress, setTokenAddress] = useState<string | undefined>(undefined)
  const [open, setOpen] = useState(false)

  useImperativeHandle(ref, () => ({
    open: (tokenAddress?: string) => {
      setTokenAddress(tokenAddress)
      setOpen(true)
    },
  }))

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent onClick={(e) => {
        e.stopPropagation()
        e.preventDefault()
      }}>
        <AiAnalysisForm tokenAddress={tokenAddress} enabled={open && !!tokenAddress} />
      </SheetContent>
    </Sheet>
  )
}
