import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTrigger } from '@components/ui/dialog.tsx'
import { useTranslation } from 'react-i18next'
import { Button } from '@components/ui/button'
import { DialogTitle } from '@radix-ui/react-dialog'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select.tsx'
import { useMemo, useState } from 'react'
import { Textarea } from '@components/ui/textarea'
import { isValidSolAddress } from '@/lib/blockchain.ts'

export interface ImportBlacklistDialogProps {
  onImport?: (type: 'token' | 'dev', addresses: string[]) => void
}

export const ImportBlacklistDialog = (props: ImportBlacklistDialogProps) => {
  const { onImport } = props
  const { t } = useTranslation()
  const [selectedType, setSelectedType] = useState('token')
  const [inputValue, setInputValue] = useState('')
  const [open, setOpen] = useState(false)

  const addresses = useMemo(() => {
    return inputValue
      .split(',')
      .map((addr) => addr.trim())
      .filter((addr) => addr)
  }, [inputValue])

  const isValid = useMemo(() => {
    if (!addresses || addresses.length === 0) return false
    // Simple validation for Solana address length
    return addresses.every((addr) => isValidSolAddress(addr))
  }, [addresses])

  const handleOnImport = () => {
    if (onImport && isValid) {
      onImport(selectedType as 'token' | 'dev', addresses)
    }
    setInputValue('')
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button variant="ghost" className="text-black rounded-[6px] px-5 h-9 bg-[#FBFBFB] hover:bg-[#ECECED1F]">
          {t('listCoin.blacklist.import')}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#232329] border-none max-w-2xl">
        <DialogHeader className="border-b border-[#ECECED0A] pb-3">
          <DialogTitle>{t('listCoin.blacklist.importTitle')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Select defaultValue="token" value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-full border-[#79778C29] bg-[#2B2B33] h-11 text-[calc(14rem/16)] leading-3.5 font-[330] box-border text-white/80">
              <SelectValue placeholder="" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="token">{t('listCoin.blacklist.importToken')}</SelectItem>
                <SelectItem value="dev">{t('listCoin.blacklist.importDev')}</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Textarea
            className="bg-[#2B2B33] border border-[#79778C29] h-40 resize-none text-[calc(14rem/16)] font-[330] placeholder:text-white/36"
            placeholder={t('listCoin.blacklist.importPlaceholder')}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <p className="text-[#908E98] text-[calc(14rem/16)] font-[330]">{t('listCoin.blacklist.importFormatNote')}</p>
        </div>
        <DialogFooter className="pt-3.5">
          <Button
            disabled={!isValid}
            className="text-white rounded-full w-full px-5 h-9 bg-impartal"
            onClick={handleOnImport}
          >
            {t('listCoin.blacklist.import')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
