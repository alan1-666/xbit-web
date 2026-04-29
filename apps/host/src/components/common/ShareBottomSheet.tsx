import { TokenDetail } from '@/@generated/gql/graphql-future.ts'
import { useResponsive } from '@/hooks/hyperliquid/useResponsive'
import { cn } from '@/lib/utils'
import { Dialog, DialogContent, DialogHeader } from '@components/ui/dialog.tsx'
import { DialogTitle } from '@radix-ui/react-dialog'
import React, { memo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import ShareContent from '../ShareContent'
import { Drawer, DrawerContent, DrawerHeader } from '../ui/drawer'

type Props = {
  open: boolean
  setOpen: (open: boolean) => void
  title: string
  fileName?: string
  text?: string
  url?: string
  children?: React.ReactNode
  isPC?: boolean
  hideSaveButton?: boolean
  classDrawerContent?: string
  classContent?: string
  classNameWrapper?: string
  tokenData?: TokenDetail
  classNameFooter?: string
}

const ShareBottomSheet = memo(
  ({
    open,
    setOpen,
    title,
    fileName,
    text,
    url,
    children,
    isPC,
    classContent,
    hideSaveButton,
    classNameWrapper,
    classDrawerContent,
    classNameFooter,
  }: Props) => {
    const { isDesktop } = useResponsive()
    const { t } = useTranslation()

    const handleClose = useCallback(() => {
      setOpen(false)
    }, [setOpen])

    if (isPC || isDesktop) {
      return (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="px-3" showDialogPrimitiveClose={false}>
            <DialogHeader className="px-3 flex w-full items-center justify-between flex-row">
              <DialogTitle>
                <div className="text-[18px] font-[500] text-white">{title}</div>
              </DialogTitle>
              <img
                src="/images/icons/icon-x.svg"
                className="w-6 h-6 cursor-pointer"
                onClick={handleClose}
                alt="close"
              />
            </DialogHeader>
            <ShareContent
              fileName={fileName}
              text={text}
              url={url}
              hideSaveButton={hideSaveButton}
              classContent={classContent}
              classNameWrapper={classNameWrapper}
              t={t}
              classNameFooter={classNameFooter}
            >
              {children}
            </ShareContent>
          </DialogContent>
        </Dialog>
      )
    }

    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent
          className={cn('w-full max-w-[768px] mx-auto bg-[#232329] max-h-[80vh]', classDrawerContent)}
        >
          <DrawerHeader className="px-3 flex w-full items-center justify-between">
            <DialogTitle>
              <div className="text-[18px] font-[500] text-white">{title}</div>
            </DialogTitle>
            <img src="/images/icons/icon-x.svg" className="w-6 h-6 cursor-pointer" onClick={handleClose} alt="close" />
          </DrawerHeader>
          <ShareContent
            classNameFooter={classNameFooter}
            fileName={fileName}
            text={text}
            url={url}
            hideSaveButton={hideSaveButton}
            classContent={classContent}
            classNameWrapper={classNameWrapper}
            t={t}
          >
            {children}
          </ShareContent>
        </DrawerContent>
      </Drawer>
    )
  },
)

ShareBottomSheet.displayName = 'ShareBottomSheet'

export default ShareBottomSheet
