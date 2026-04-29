import React, { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@components/ui/button.tsx'
import { CsvInput } from '@components/monitoring/InputFileCSV.tsx'
import { cn } from '@/lib/utils'
import { isValidEvmAddress, isValidSolAddress } from '@/lib/blockchain'
import { mappingTypeChain } from '@/utils/mappingType.ts'
import { useActiveChain, useActiveChainType } from '@hooks/useActiveChain.ts'
// import dayjs from 'dayjs'
import { futureClient } from '@/lib/gql/apollo-client.ts'
import { importFollowingWallet } from '@services/wallet.service.ts'
import { isArray } from 'lodash-es'
import { FollowingWalletInfo } from '@/@generated/gql/graphql-future.ts'
import eventBus from '@/lib/eventBus.ts'
import { REFETCH_WALLETS_FOLLOWING } from '@const/smartMoney.ts'
import { Dialog, DialogContent } from '@components/ui/dialog.tsx'
import { ChainType } from '@/@generated/gql/graphql-meme2.ts'
// import { UITab } from '@/types/uiTabs.ts'
// import FilterFollowedTabs from '@components/detailTokenTabs/FilterFollowedTabs.tsx'

type ImportExportFollowingWalletProps = {
  open: boolean
  setOpen: (open: boolean) => void
  listFollowing: FollowingWalletInfo[]
}

type Tab = 'import' | 'export'

type ImportFollowingWalletResp = {
  data?: { importFollowingWallet: boolean }
  errors?: Array<{ message: string; extensions?: { code?: string } }>
}

// ---------- helpers ----------
async function csvFileToString(file: File): Promise<string> {
  let text = await file.text()
  // Strip BOM if present
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1)

  // Split into lines, remove empty
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)

  if (lines.length === 0) return ''

  // Detect header row instead of unconditionally dropping first line
  const first = lines[0].toLowerCase().replace(/\s+/g, '')
  const hasHeader = first === 'address,name' || (first.includes('address') && first.includes('name'))

  const dataLines = hasHeader ? lines.slice(1) : lines

  if (dataLines.length === 0) return ''

  // Join as address:name,address:name
  return dataLines
    .map((line) => {
      const [address = '', name = ''] = line.split(',')
      return `${address.trim()}:${name.trim()}`
    })
    .filter((s) => s !== ':') // guard against blank rows
    .join(',')
}

function validateWalletCsvBoolean(input: string, currentChain: ChainType): boolean {
  const trimmed = input?.trim()
  if (!trimmed) return false

  const addressValidator =
    currentChain === ChainType.Solana ? isValidSolAddress : currentChain === ChainType.Bsc ? isValidEvmAddress : null

  if (!addressValidator) return false

  const items = trimmed
    .split(/[,\r\n]+/)
    .map((s) => s.trim())
    .filter(Boolean)

  if (!items.length) return false

  return items.every((piece) => {
    const hasColon = piece.includes(':')

    const [address, name] = hasColon ? piece.split(':', 2).map((s) => s.trim()) : [piece, '']

    if (!addressValidator(address)) return false
    return !(hasColon && !name)
  })
}

type FollowingInput = { address: string; alias?: string }

type ImportInputType = 'input' | 'file'

async function importFollowingWallets(content: string, chain: string): Promise<ImportFollowingWalletResp> {
  const followings: FollowingInput[] = content
    .split(/[,\r\n]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((item) => {
      const [address, alias] = item.includes(':') ? item.split(':').map((s) => s.trim()) : [item.trim(), '']
      return { address: chain === ChainType.Bsc ? address?.toLowerCase() : address, alias }
    })

  const { data, errors } = await futureClient.mutate<
    { importFollowingWallet: boolean },
    { input: { chain: string; followings: FollowingInput[] } }
  >({
    mutation: importFollowingWallet,
    variables: { input: { chain, followings } },
  })

  return { data, errors } as ImportFollowingWalletResp
}

const ImportExportFollowingWalletPopup = ({ open, setOpen, listFollowing }: ImportExportFollowingWalletProps) => {
  const { t } = useTranslation()
  const activeChain = useActiveChain()
  const activeChainType = useActiveChainType()

  const [activeTab, setActiveTab] = useState<Tab>('import')
  const [importedData, setImportedData] = useState<string>('')
  const [isValidData, setIsValidData] = useState<boolean>(true)
  const [loading, setLoading] = useState<boolean>(false)
  const [isFocus, setIsFocus] = useState<boolean>(false)
  const [currentInputType, _] = useState<ImportInputType>('input')
  const [file, setFile] = useState<File | null>(null)

  // const listInputType: UITab[] = [
  //   {
  //     value: 'input',
  //     label: t('followingWallet.input'),
  //   },
  //   {
  //     value: 'file',
  //     label: t('followingWallet.file'),
  //   }
  // ]

  const chainValue = useMemo(() => mappingTypeChain(activeChain), [activeChain])

  const onClose = useCallback(() => setOpen(false), [setOpen])

  const onChangeTab = useCallback((tab: Tab) => setActiveTab(tab), [])

  const onInputChange: React.ChangeEventHandler<HTMLTextAreaElement> = useCallback(
    (e) => {
      const v = e.target.value
      setImportedData(v)
      if (isFocus) setIsValidData(true)
    },
    [isFocus],
  )

  // const handleChangeTab = (tab: string) => {
  //   setCurrentInputType(tab as ImportInputType)
  // }

  const onInputFocus = useCallback(() => {
    setIsFocus(true)
    setIsValidData(true)
  }, [])

  const onPasteFromClipboard = useCallback(async () => {
    try {
      const clipboardText = await navigator.clipboard.readText()
      setImportedData((prev) => {
        if (!prev) return clipboardText
        const needsComma = /[^,\s]$/.test(prev.trim())
        return prev + (needsComma ? ',' : '') + clipboardText
      })
      setIsValidData(true)
    } catch (err) {
      console.error('Failed to read clipboard contents:', err)
      toast.error(t('followingWallet.clipboardReadFailed'))
    }
  }, [t])

  const resetImportState = useCallback(() => {
    setImportedData('')
    setIsValidData(true)
    setIsFocus(false)
  }, [])

  const handleImport = useCallback(async () => {
    let inputString: string = importedData
    if (currentInputType === 'file') {
      inputString = file ? await csvFileToString(file) : ''
    }
    if (!validateWalletCsvBoolean(inputString, chainValue)) {
      setIsValidData(false)
      return
    }
    try {
      setLoading(true)
      const result = await importFollowingWallets(importedData, chainValue)

      if (result?.errors?.length) {
        throw result.errors
      }

      if (result?.data?.importFollowingWallet) {
        eventBus.dispatch(REFETCH_WALLETS_FOLLOWING)
        toast.success(t('followingWallet.importSuccess'))
        onClose()
        resetImportState()
      } else {
        toast.error(t('followingWallet.importError'))
      }
    } catch (error) {
      if (isArray(error)) {
        // array of GraphQLErrors
        const code = error?.[0]?.code
        if (code === 'Following_LimitExceeded') {
          toast.error(t('followingWallet.LimitExceeded'))
        } else toast.error(error.map((e) => e.message).join('; ') || t('followingWallet.importError'))
      } else {
        toast.error(t('followingWallet.importError'))
      }
    } finally {
      setLoading(false)
    }
  }, [importedData, chainValue, t, onClose, resetImportState, currentInputType, file])

  const handleExport = useCallback(() => {
    if (listFollowing.length === 0) {
      setIsValidData(false)
      return
    }

    // const esc = (v: string) => {
    //   const needsQuotes = /[",\r\n]/.test(v);
    //   const val = String(v).replace(/"/g, '""');
    //   return needsQuotes ? `"${val}"` : val;
    // };

    try {
      const addresses = Array.from(new Set(listFollowing))

      // Text for clipboard (address:name, ...)
      const textForClipboard = addresses
        .map((addr) => `${addr?.address}:${addr?.alias && addr?.alias !== '' ? addr?.alias : addr?.address}`)
        .join(',')

      // CSV for download (with header)
      // const csvRows: string[] = ["Address,Name", ...addresses.map(addr => `${esc(addr)},${esc(addr)}`)];
      // const csvContentForDownload = csvRows.join("\r\n");

      // Download CSV
      // const blob = new Blob([csvContentForDownload], { type: "text/csv;charset=utf-8" });
      // const url = URL.createObjectURL(blob);
      // const link = document.createElement("a");
      // link.href = url;
      // link.download = `following_wallets_${dayjs().valueOf()}.csv`;
      // document.body.appendChild(link);
      // link.click();
      // document.body.removeChild(link);
      // URL.revokeObjectURL(url);

      // Copy to clipboard (best-effort)
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(textForClipboard).catch((err) => {
          console.error('Failed to copy data to clipboard:', err)
        })
      }

      onClose()
      toast.success(t('followingWallet.exportSuccess'))
    } catch (error) {
      console.error('Error exporting CSV:', error)
      toast.error(t('followingWallet.exportFailed'))
    }
  }, [listFollowing, onClose, t])

  const isConfirmDisabled = useMemo(() => {
    if (loading) return true
    if (activeTab === 'import') {
      if (currentInputType === 'input') return !importedData || !isValidData
      return !Boolean(file)
    }
    return false
  }, [activeTab, importedData, isValidData, loading, currentInputType, file])

  const onValidFile: (file: File) => Promise<void> | void = async (file: File) => {
    setFile(file)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent showDialogPrimitiveClose={false} className='bg-[#1a1a1d]'>
        <div className="overflow-y-auto no-scrollbar max-h-[calc(80vh-150px)]">
          <div className="bg-[#ECECED0A] rounded-[200px] p-0.5 border-[0.5px] border-[#ECECED0A] flex items-center justify-between">
            <button
              className={cn(
                'flex-1 text-center py-2 rounded-full font-normal text-[16px] text-[#FFFFFF]',
                activeTab === 'import' ? 'purple-btn-gradient' : '',
              )}
              onClick={() => onChangeTab('import')}
            >
              {t('followingWallet.import')}
            </button>
            <button
              className={cn(
                'flex-1 text-center py-2 rounded-full font-normal text-[16px] text-[#FFFFFF]',
                activeTab === 'export' ? 'purple-btn-gradient' : '',
              )}
              onClick={() => onChangeTab('export')}
            >
              {t('followingWallet.export')}
            </button>
          </div>

          {activeTab === 'import' ? (
            <>
              <div className="mt-4 text-white/70 font-normal text-[13px] leading-1.4">
                {t('followingWallet.importNote', { chain: activeChainType })}
              </div>
              <div className="mt-3 text-white/70 font-normal text-[13px] leading-1.4">
                {t('followingWallet.importExample')}
              </div>
              <div className="mt-1 text-white/70 font-normal text-[13px] leading-1.4">
                {t('followingWallet.importExampleWallet1')}
              </div>
              <div className="mt-1 text-white/70 font-normal text-[13px] leading-1.4">
                {t('followingWallet.importExampleWallet2')}
              </div>

              {/*<FilterFollowedTabs*/}
              {/*  containerId={'ImportInputFile'}*/}
              {/*  tabs={listInputType}*/}
              {/*  onTabChange={handleChangeTab}*/}
              {/*  defaultTab={currentInputType}*/}
              {/*  containerClassName='mt-2'*/}
              {/*/>*/}

              {currentInputType === 'input' ? (
                <div
                  className={cn(
                    'rounded-lg mt-3 bg-[#141414] relative',
                    isFocus ? 'border-gradient style2' : 'border border-[#ECECED1F]',
                  )}
                >
                  <textarea
                    className="w-full h-full px-3 py-4 rounded-lg bg-[#141414] text-[14px] text-white focus:outline-none"
                    placeholder={t('followingWallet.inputWalletAddress2', { chain: activeChainType })}
                    rows={5}
                    value={importedData}
                    onChange={onInputChange}
                    onFocus={onInputFocus}
                  />
                  <button
                    onClick={onPasteFromClipboard}
                    className={cn(
                      'absolute bottom-[12px] right-[14px] z-[5]',
                      'bg-[#1c1c1c] px-2 py-0.5 rounded-sm',
                      'text-[12px] leading-[18px] text-[#AB57FF] font-light',
                    )}
                  >
                    {t('walletCopy.settings.paste')}
                  </button>
                </div>
              ) : (
                <CsvInput onValidFile={onValidFile} file={file} setFile={setFile} />
              )}

              {!isValidData && (
                <div className="mt-2 font-normal text-[12px] text-[#FF353C] leading-none">
                  {t('followingWallet.inputWalletAddressError2', { chain: chainValue })}
                </div>
              )}

              <div className="flex items-center justify-between mt-3 gap-3">
                <div className="flex items-center justify-center gap-2 w-1/2">
                  <img src="/images/icons/ic-axiom.svg" alt="icon axiom" />
                  <span className="text-[14px] font-light leading-[18px] text-white/80">
                    {t('followingWallet.supportWalletWithName', { wallet: 'Axiom' })}
                  </span>
                </div>
                <div className="w-[1px] h-5 border-l border-dashed border-l-[#ECECED1F]" />
                <div className="flex items-center justify-center gap-2 w-1/2">
                  <img src="/images/icons/ic-bull.svg" alt="icon bullX" />
                  <span className="text-[14px] font-light leading-[18px] text-white/80">
                    {t('followingWallet.supportWalletWithName', { wallet: 'BullX' })}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="mt-4 py-6 flex flex-col items-center justify-center">
              <div className="font-normal text-[16px] leading-1.4 text-white">
                {t('followingWallet.batchCopyToClipboard')}
              </div>
              <img
                src="/images/export-following-wallet.png"
                alt="export-following-wallet"
                className="mt-4 w-[160px] h-[120px]"
              />
            </div>
          )}
        </div>

        <div className="w-full mt-3 pt-3 border-t border-[#ECECED0A] flex gap-4 items-center">
          <Button variant="borderGradient" className="rounded-full flex-1 h-11" onClick={onClose}>
            {t('button.cancel')}
          </Button>

          <Button
            variant="gradient"
            className="rounded-full flex-1 h-11 text-black"
            onClick={activeTab === 'import' ? handleImport : handleExport}
            isLoading={loading}
            disabled={isConfirmDisabled}
          >
            {activeTab === 'import' ? t('button.confirm') : t('followingWallet.copyToClipboard')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ImportExportFollowingWalletPopup
