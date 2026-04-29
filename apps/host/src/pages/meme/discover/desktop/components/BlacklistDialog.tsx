import { Dialog, DialogContent, DialogHeader, DialogTrigger } from '@components/ui/dialog.tsx'
import { cn } from '@/lib/utils.ts'
import { useTranslation } from 'react-i18next'
import { DialogTitle } from '@radix-ui/react-dialog'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select.tsx'
import { Input } from '@components/ui/input.tsx'
import { Button } from '@components/ui/button.tsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs.tsx'
import { useCallback, useMemo, useState, MouseEvent } from 'react'
import { CopyButton } from '@components/common/copy-button.tsx'
import { IconTrash } from '@components/icon/IconTrash.tsx'
import { SimpleTooltip } from '@components/v2/ui-shared/components/SimpleTooltip.tsx'
import { TooltipProvider } from '@components/ui/tooltip.tsx'
import { toast } from 'sonner'
import { DeleteAllBlacklist } from '@pages/meme/discover/desktop/components/DeleteAllBlacklist.tsx'
import { ImportBlacklistDialog } from '@pages/meme/discover/desktop/components/ImportBlacklistDialog.tsx'
import { useAllBacklistAddresses } from '@pages/meme/discover/desktop/hooks/useBlacklistAddress.ts'
import {
  useRemoveBlacklistDevsMutation,
  useRemoveBlacklistTokensMutation,
} from '@pages/meme/discover/desktop/hooks/useRemoveBlacklistAddressesMutation.ts'
import { isValidSolAddress } from '@/lib/blockchain.ts'
import { useActiveWallet } from '@hooks/useActiveWallet.ts'
import { IconBlacklist } from '@components/icon/stroke/IconBlacklist.tsx'
import { formatAddressWallet } from '@/lib/string'

interface BlacklistAddressesProps {
  addresses: string[]
  onRemove: (address: string) => void
}

const BlacklistAddresses = (props: BlacklistAddressesProps) => {
  const { addresses, onRemove } = props
  const { t } = useTranslation()
  return (
    <div className="min-h-[240px] max-h-[400px] overflow-y-auto pr-1">
      {addresses.map((address) => (
        <div key={address} className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center py-3 gap-2">
            <div className="flex-1 text-white text-[calc(12rem/16)] leading-3 font-[330]">{address}</div>
            <CopyButton icon="/images/icons/ic-copy2.svg" className="self-center ml-2" text={address} />
          </div>
          <TooltipProvider>
            <SimpleTooltip content={t('listCoin.blacklist.delete')}>
              <IconTrash className="text-[#9B9B9B] cursor-pointer" onClick={() => onRemove(address)} />
            </SimpleTooltip>
          </TooltipProvider>
        </div>
      ))}
    </div>
  )
}

export const BlacklistDialog = () => {
  const { t } = useTranslation()

  const [inputValue, setInputValue] = useState('')
  const [selectedType, setSelectedType] = useState('token')
  const [selectedTab, setSelectedTab] = useState('token')

  const activeWallet = useActiveWallet()

  const {
    blacklistTokens: blacklistTokensData,
    blacklistDevs: blacklistDevData,
    addTokens,
    addDevs,
    removeDevs,
    removeTokens,
    removeAll,
  } = useAllBacklistAddresses()

  const blacklistTokens = useMemo(() => blacklistTokensData.map((item) => item.address), [blacklistTokensData])
  const blacklistDev = useMemo(() => blacklistDevData.map((item) => item.address), [blacklistDevData])

  const removeTokensFromBlacklist = useRemoveBlacklistTokensMutation()
  const removeDevsFromBlacklist = useRemoveBlacklistDevsMutation()

  const totalAddress = blacklistTokens.length + blacklistDev.length

  const removeBlacklistTokens = useCallback((tokens: string[]) => {
    removeTokensFromBlacklist.mutate(tokens)
    removeTokens(tokens)
    if (tokens.length === 1) {
      toast.success(t('listCoin.blacklist.removedFromBlacklist', { address: formatAddressWallet(tokens[0]) }))
      return
    }
    toast.success(t('listCoin.blacklist.deleteSuccess'))
  }, [])

  const removeBlacklistDevs = useCallback((devs: string[]) => {
    removeDevsFromBlacklist.mutate(devs)
    removeDevs(devs)
    if (devs.length === 1) {
      toast.success(t('listCoin.blacklist.removedFromBlacklist', { address: formatAddressWallet(devs[0]) }))
      return
    }
    toast.success(t('listCoin.blacklist.deleteSuccess'))
  }, [])

  const handleOnRemoveBlacklistToken = (address: string) => {
    removeBlacklistTokens([address])
  }

  const handleOnRemoveBlacklistDev = (address: string) => {
    removeBlacklistDevs([address])
  }

  const handleOnAddBlacklistToken = (address: string) => {
    // Check if address already in the list
    if (blacklistTokens.includes(address)) {
      toast.error(t('listCoin.blacklist.addressExists'))
      return
    }
    addTokens([address])
  }

  const handleOnAddBlacklistDev = (address: string) => {
    if (blacklistDev.includes(address)) {
      toast.error(t('listCoin.blacklist.addressExists'))
      return
    }
    addDevs([address])
  }

  const handleOnAdd = () => {
    if (!inputValue) return
    const address = inputValue.trim()
    if (!isValidSolAddress(address)) {
      return toast.error(t('listCoin.blacklist.invalidAddressMessage'))
    }
    if (selectedType === 'token') {
      if (blacklistTokens.includes(address)) {
        toast.error(t('listCoin.blacklist.addressExists'))
        return
      }
      handleOnAddBlacklistToken(address)
    } else {
      if (blacklistDev.includes(address)) {
        toast.error(t('listCoin.blacklist.addressExists'))
        return
      }
      handleOnAddBlacklistDev(address)
    }
    setInputValue('')
  }

  const handleDeleteAll = () => {
    removeAll()
    toast.success(t('listCoin.blacklist.deleteSuccess'))
  }

  const handleOnImport = (type: 'token' | 'dev', addresses: string[]) => {
    if (type === 'token') {
      const uniqueAddresses = Array.from(new Set(addresses))
      const tokens = uniqueAddresses.filter((addr) => !blacklistTokens.includes(addr))
      if (tokens.length === 0) {
        toast.error(t('listCoin.blacklist.allAddressExists'))
        return
      }
      addTokens(tokens)
    } else if (type === 'dev') {
      const uniqueAddresses = Array.from(new Set(addresses))
      const devs = uniqueAddresses.filter((addr) => !blacklistDev.includes(addr))
      if (devs.length === 0) {
        toast.error(t('listCoin.blacklist.allAddressExists'))
        return
      }
      addDevs(devs)
    }
  }

  const handleOnExport = () => {
    type ExportedItem = {
      time: number
      type: 'ca' | 'dev'
      value: string
    }

    const data: Record<string, ExportedItem> = {}
    blacklistTokens.forEach((addr) => {
      const key = 'ca-' + addr
      data[key] = {
        time: Date.now(),
        type: 'ca',
        value: addr,
      }
    })
    blacklistDev.forEach((addr) => {
      const key = 'dev-' + addr
      data[key] = {
        time: Date.now(),
        type: 'dev',
        value: addr,
      }
    })

    // Write to clipboard
    navigator.clipboard.writeText(JSON.stringify(data, null, 2)).then()
    toast.success(t('listCoin.blacklist.exportSuccess'))
  }

  const handleClick = (event: MouseEvent) => {
    if (!activeWallet.isConnected) {
      toast.error(t('appSettings.loginRequired'))
      event.preventDefault()
      return
    }
  }

  return (
    <Dialog>
      <DialogTrigger onClick={handleClick}>
        <div
          className={cn(
            'flex items-center gap-1 text-[calc(14rem/16)] px-2 py-1 rounded-full cursor-pointer text-[#908E98]',
          )}
        >
          <IconBlacklist />
          <span className="break-keep">
            {t('listCoin.blacklist.title')}
            {totalAddress > 0 ? `(${totalAddress})` : ''}
          </span>
        </div>
      </DialogTrigger>
      <DialogContent className="bg-[#232329] border-none max-w-2xl">
        <DialogHeader className="border-b border-[#ECECED0A] pb-3">
          <DialogTitle>{t('listCoin.blacklist.title')}</DialogTitle>
        </DialogHeader>
        <div>
          <div className="flex items-center gap-1.5 mb-3">
            <Select defaultValue="token" value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[150px] border-[#79778C29] bg-[#79778C29] h-11 text-[calc(14rem/16)] leading-3.5 font-[330] box-border text-white/80">
                <SelectValue placeholder="" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="token">{t('listCoin.blacklist.token')}</SelectItem>
                  <SelectItem value="dev">{t('listCoin.blacklist.dev')}</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Input
              className="flex-1 bg-[#79778C29] border-[#79778C29] h-11 font-[330]"
              placeholder={t('listCoin.blacklist.inputPlaceholder')}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <Button className="bg-transparent text-white pr-0 pl-0 h-11 font-[380]" onClick={handleOnAdd}>
              {t('listCoin.blacklist.add')}
            </Button>
          </div>

          <Tabs defaultValue="token" className="w-full" value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="bg-transparent">
              <TabsTrigger
                value="token"
                className="rounded-[6px] font-[330] data-[state=active]:font-[450] data-[state=active]:bg-[#3E2761] data-[state=active]:text-[#C8A7FD] text-white/50"
              >
                {t('listCoin.blacklist.token')}
              </TabsTrigger>
              <TabsTrigger
                value="dev"
                className="rounded-[6px] font-[330] data-[state=active]:font-[450] data-[state=active]:bg-[#3E2761] data-[state=active]:text-[#C8A7FD] text-white/50"
              >
                {t('listCoin.blacklist.dev')}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="token">
              <BlacklistAddresses addresses={blacklistTokens} onRemove={handleOnRemoveBlacklistToken} />
            </TabsContent>
            <TabsContent value="dev">
              <BlacklistAddresses addresses={blacklistDev} onRemove={handleOnRemoveBlacklistDev} />
            </TabsContent>
          </Tabs>
        </div>
        <div className="flex items-center gap-2 border-t border-[#ECECED14] pt-3.5">
          <div className="flex-1 text-[#FFFFFFB2] text-[calc(16rem/16)] font-[320]">
            <span className="text-white font-[380]">{totalAddress}</span>
            {t('listCoin.blacklist.recordCountSuffix')}
          </div>
          <DeleteAllBlacklist onDeleteAll={handleDeleteAll} />
          <ImportBlacklistDialog onImport={handleOnImport} />
          <Button
            variant="ghost"
            className="text-white rounded-[6px] px-5 h-9 bg-[#2B2B33] hover:bg-[#ECECED1F] border border-[#504D5D]"
            onClick={handleOnExport}
          >
            {t('listCoin.blacklist.export')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
