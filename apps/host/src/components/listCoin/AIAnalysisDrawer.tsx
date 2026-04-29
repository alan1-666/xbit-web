import { Drawer, DrawerContent, DrawerHeader, DrawerTrigger } from '@components/ui/drawer.tsx'
import AiIcon from '@components/common/Card/AiIcon.tsx'
import { MouseEvent, Ref, useImperativeHandle, useState } from 'react'
import { DialogTitle } from '@components/ui/dialog.tsx'
import { AiAnalysisForm } from '@components/ai/AiAnalysisForm.tsx'

export type AIAnalysisDrawerHandle = {
  open: (tokenAddress?: string) => void
}

export type AIAnalysisDrawerProps = {
  includeTrigger?: boolean
  ref?: Ref<AIAnalysisDrawerHandle>
  address?: string
}

export default function AIAnalysisDrawer(props: AIAnalysisDrawerProps) {
  const { includeTrigger = true, ref, address } = props
  const [tokenAddress, setTokenAddress] = useState<string | undefined>(address)
  const [open, setOpen] = useState(false)

  useImperativeHandle(ref, () => {
    return {
      open: (tokenAddress?: string) => {
        setTokenAddress(tokenAddress)
        setOpen(true)
      },
    }
  })

  const preventClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    event.preventDefault()
    setOpen(true)
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      {includeTrigger && (
        <DrawerTrigger asChild>
          <button className="cursor-pointer" onClick={preventClick}>
            <AiIcon />
          </button>
        </DrawerTrigger>
      )}
      <DrawerContent className="w-full bg-[#232329] max-w-[768px] mx-auto" onClick={(e) => e.stopPropagation()}>
        <DrawerHeader className="py-3 px-3.5 flex w-full items-center justify-between">
          <DialogTitle></DialogTitle>
          <img
            src="/images/icons/icon-x.svg"
            className="w-6 h-6 cursor-pointer"
            onClick={() => setOpen(false)}
            alt=""
          />
        </DrawerHeader>
        <div className="px-3 pb-6 flex flex-col h-[80vh]" onClick={(event) => event.stopPropagation()}>
          <AiAnalysisForm tokenAddress={tokenAddress} enabled={open && !!tokenAddress} className="h-full" />
        </div>
      </DrawerContent>
    </Drawer>
  )
}
