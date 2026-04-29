import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAddressGroups } from '@/providers/AddressGroupsProvider'
import { toast } from 'sonner'
import { getErrorMessage } from '@/utils/smart-money'
import { useTranslation } from 'react-i18next'

type Props = {
  className?: string
  onCreated?: (createdId: string) => void
}

export function CreateGroupInline({ className, onCreated }: Props) {
  const { t } = useTranslation()
  const [name, setName] = React.useState('')
  const { createAndSelectGroup, refresh, loading } = useAddressGroups()

  const onCreate = async () => {
    const v = name.trim()
    if (!v) return
    try {
      const created = await createAndSelectGroup(v)
      setName('')
      await refresh()
      toast.success(t('smartMoney.addressManage.createSuccess'))
    } catch (err) {
      toast.error(getErrorMessage(err) || t('smartMoney.addressManage.createFailed'))
    }
  }

  return (
    <div className={cn('p-3 border-t border-white/10', className)}>
      <div className="flex items-center gap-3">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('smartMoney.supervisory.groupNamePlaceholder')}
          className="
            h-11 flex-1
            bg-[#0E0E11] border border-[#2A2A2F]
            text-white placeholder:text-white/30
            focus-visible:ring-0 focus-visible:ring-offset-0
          "
        />
        <Button
          type="button"
          disabled={loading || !name.trim()}
          onClick={onCreate}
          className="
            h-11 px-6 rounded-lg
            bg-[#7C3AED] hover:bg-[#8B5CF6]
            text-white disabled:opacity-60
          "
        >
          {t('smartMoney.supervisory.create')}
        </Button>
      </div>
    </div>
  )
}
