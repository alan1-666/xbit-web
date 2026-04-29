import { useEffect, useState } from 'react'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '../ui/drawer'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import { ReactComponent as EditIcon } from '@/components/icon/smart-money/edit.svg'
import { Button } from '../ui/button'
import { toast } from 'sonner'

type AddressNoteProp = {
  isEditable?: boolean
  address: string
  remarkName: string
  open: boolean
  onOpenChange: (open: boolean, remark?: string | null) => void
  maxLength?: number
}

const AddressNote = ({isEditable, address, remarkName, open, onOpenChange, maxLength = 32}: AddressNoteProp) => {
  const { t } = useTranslation()

  const [note, setNote] = useState<string>(remarkName)
  
  const handleSaveNote = async() => {
    onOpenChange(false, note.trim() || '')
  }

  useEffect(() => {
    if (open) {
      if(!isEditable ) {
        toast.error(t('smartMoney.addressDetail.editFail'))
        return 
      }
      setNote(remarkName)
    }
  }, [open, remarkName, isEditable])

  const handleDrawerOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen)
  }

  const handleCancel = () => {
    setNote(remarkName)
    onOpenChange(false)
  }
  return (
    
    <Drawer open={open} onOpenChange={handleDrawerOpenChange}>
      <DrawerTrigger asChild>
        <div
          className={cn(
            `flex-1 flex items-center pr-2 rounded-[6px] text-white 
              text-[calc(1rem*(12/16))] leading-[calc(1rem*(12/16))] cursor-pointer w-full justify-between`,
          )}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <EditIcon className="h-4 w-4" />
        </div>
      </DrawerTrigger>
      <DrawerContent className="w-full bg-[#232329] max-w-[768px] mx-auto">
        <DrawerHeader className="py-5 px-3.5  flex w-full items-center justify-between">
          <DrawerTitle className="flex items-center">
            <div className="text-[calc(1rem*(18/16))] leading-[calc(1rem*(18/16))]">{t("smartMoney.remark")}</div>
          </DrawerTitle>
          <img
            src="/images/icons/icon-x.svg"
            className="w-6 h-6 cursor-pointer"
            onClick={handleCancel}
            alt="close"
          />
        </DrawerHeader>
        <div className="px-3" aria-describedby="address-note-description">
          <div className="flex self-stretch h-12">
            <div className="flex self-stretch w-full h-12 px-3.5 bg-[#2B2B33] rounded-lg items-center">
              <input 
                className="w-full" 
                placeholder={t('smartMoney.inputRemark')} 
                value={note}
                maxLength={maxLength}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>
          <div className="self-stretch w-full py-6 inline-flex flex-col justify-center items-center gap-2.5">
            <div className="w-full grid grid-cols-2 gap-2">
              <Button variant="greyDefault" className="w-full rounded-[50px] h-11" 
                onClick={handleCancel}>
                {t('futuresDetails.common.cancel')}
              </Button>
              <Button
                variant="purpleDefault"
                className="w-full rounded-[50px] h-11 text-white"
                onClick={handleSaveNote}
                disabled={!isEditable}
              >
                {t('futuresDetails.common.confirm')}
              </Button>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default AddressNote
