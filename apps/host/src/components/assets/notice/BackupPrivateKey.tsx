import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog.tsx'
import { Button } from '@components/ui/button.tsx'
import { useResponsive } from '@hooks/useResponsive.ts'
import { useActiveWallet } from '@hooks/useActiveWallet.ts'
import useCheckUserDeprecatedAsset from '@hooks/useCheckUserDeprecatedAsset.ts'
import { useAppSelector } from '@/redux/store'
import { cn } from '@/lib/utils.ts'
import eventBus from '@/lib/eventBus.ts'
import { BACK_UP_MNEMONIC_STORAGE_KEY, NOTICE_DEPRECATED_STORAGE_KEY, OPEN_BACKUP_MODAL } from '@const/configs.ts'
import { ChainType, UserEmbeddedWalletDto } from '@/@generated/gql/graphql-user.ts'
import ExportPrivateKey from '@components/auth/ManagementWallets/ExportPrivateKey.tsx'

dayjs.extend(utc)
dayjs.extend(timezone)

const RESET_HOUR = 2 // 2:00 AM
const TZ = dayjs.tz.guess()

const safeGetLS = (key: string): string | null => {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

const safeSetLS = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value)
  } catch (err) {
    console.error(err)
  }
}

const getLastShownAt = (): dayjs.Dayjs | null => {
  const raw = safeGetLS(NOTICE_DEPRECATED_STORAGE_KEY)
  if (!raw) return null
  const d = dayjs(raw)
  return d.isValid() ? d : null
}

const setLastShownAt = (now: dayjs.Dayjs) => {
  safeSetLS(NOTICE_DEPRECATED_STORAGE_KEY, now.toISOString())
}

const getCycleStart = (now: dayjs.Dayjs) => {
  const z = now.tz(TZ)
  const startToday = z.startOf('day').add(RESET_HOUR, 'hour')
  return z.isBefore(startToday) ? startToday.subtract(1, 'day') : startToday
}

const shouldShowOncePerCycle = (now: dayjs.Dayjs) => {
  const lastShown = getLastShownAt()
  if (!lastShown) return true
  return lastShown.isBefore(getCycleStart(now))
}

const selectEvmWallets = (list?: UserEmbeddedWalletDto[]) => (list ?? []).filter((w) => w.chain === ChainType.Evm)

const toStrictBool = (v: unknown) => v === true || v === 'true'

const BackupPrivateKey = () => {
  const { t } = useTranslation()
  const { isDesktop } = useResponsive()
  const activeWallet = useActiveWallet()
  const [open, setOpen] = useState(false)

  const { data, isLoading } = useCheckUserDeprecatedAsset()
  const listWalletsByChain = useAppSelector((s) => s.newWallet.listWalletsByChain)

  const exportWallet = useMemo(() => selectEvmWallets(listWalletsByChain)[0], [listWalletsByChain])

  const { deprecated, confirmedBackup, assets = [] } = data?.checkUserDeprecatedAsset ?? {}

  const isDeprecated = toStrictBool(deprecated)
  const isConfirmed = toStrictBool(confirmedBackup)

  const totalBalance = useMemo(() => {
    return assets.reduce((sum: number, item: { balanceUsd?: number }) => sum + Number(item?.balanceUsd ?? 0), 0)
  }, [assets])

  const isSmallBalance = totalBalance < 1

  const openBackUpModal = useCallback(() => {
    setOpen(false)
    eventBus.dispatch(OPEN_BACKUP_MODAL)
  }, [])

  const isConnected = Boolean(activeWallet?.isConnected)

  useEffect(() => {
    setOpen(false)
  }, [activeWallet?.walletAddress])

  useEffect(() => {
    if (!isConnected || isLoading) return
    if (!isDeprecated) return
    if (isConfirmed) return
    if (isSmallBalance) return

    const isBackedUp = safeGetLS(BACK_UP_MNEMONIC_STORAGE_KEY) === 'true'
    if (isBackedUp) return

    const now = dayjs()
    if (!shouldShowOncePerCycle(now)) return

    setOpen(true)
    setLastShownAt(now)
  }, [isConnected, isLoading, isDeprecated, isConfirmed, isSmallBalance])

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className={cn('p-6', isDesktop ? 'w-100' : 'w-80')}
          showDialogPrimitiveClose={false}
          onInteractOutside={(event) => event.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-[16px] font-semibold text-white leading-none">
              {t('notice.importantNoti')}
            </DialogTitle>

            <DialogDescription className="mt-2.5 text-[14px] font-semibold text-white leading-[1.6] text-left">
              <span className="block">{t('notice.deprecatedAssetNoti1')}</span>
              <span className="block">{t('notice.deprecatedAssetNoti2')}</span>
            </DialogDescription>

            <DialogFooter className="block">
              <div className="flex items-center gap-3 mt-4.5">
                <Button
                  className="text-[16px] leading-none text-white flex-1 rounded-[24.5px] h-11 bg-[#2B2B33] border-0 font-normal"
                  onClick={() => setOpen(false)}
                >
                  {t('button.cancel')}
                </Button>

                <Button
                  variant="gradient"
                  className="text-[16px] leading-none text-white flex-1 rounded-[24.5px] h-11 font-semibold"
                  onClick={openBackUpModal}
                >
                  {t('notice.backUp')}
                </Button>
              </div>
            </DialogFooter>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <ExportPrivateKey wallet={exportWallet} type="hidden" />
    </>
  )
}

export default BackupPrivateKey
