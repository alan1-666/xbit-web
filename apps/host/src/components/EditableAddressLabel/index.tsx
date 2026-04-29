import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { shortAddr } from '@/utils/address'
import { ReactComponent as EditIcon } from '@/components/icon/smart-money/edit.svg'
import { ReactComponent as CopyIcon } from '@/components/icon/smart-money/copy.svg'
import { useResponsive } from '@/hooks/useResponsive'
import AddressNote from './AddressNote'
import { toast } from 'sonner'

type Props = {
  address: string
  remarkName?: string | null

  /** 是否允许编辑 */
  editable?: boolean

  /** 保存 */
  onSave: (nextRemarkName: string) => Promise<any>

  /** 复制 */
  onCopy?: () => void

  className?: string
  textClassName?: string

  /** 仅影响展示的最大宽度 */
  textMaxWidthClassName?: string

  /** 输入最大长度 */
  maxLength?: number

  /** 输入框宽度 */
  inputWidthClassName?: string

  needToast?: boolean
}

export const EditableAddressLabel: React.FC<Props> = ({
  address,
  remarkName,
  editable = true,
  onSave,
  onCopy,
  className,
  textClassName,
  textMaxWidthClassName = 'max-w-[250px]', // 防止撑爆 header / table
  maxLength = 32, 
  inputWidthClassName = 'w-[250px]',
  needToast,
}) => {
  const { isDesktop } = useResponsive()

  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(remarkName ?? '')
  const [saving, setSaving] = useState(false)
  const [noteOpen, setNoteOpen] = useState(false);
  const { t } = useTranslation()
  useEffect(() => {
    if (!editing) setValue(remarkName ?? '')
  }, [remarkName, editing])

  const [displayText, setDisplayText] = useState<string>('')
  const addrText = remarkName && remarkName.trim() ? remarkName : address

  useEffect(() => {
    setDisplayText(remarkName && remarkName.trim() ? remarkName : shortAddr(address))
  }, [remarkName, address])

  const showTooltip = !editing && !!addrText?.trim()

  const cancel = () => {
    setEditing(false)
    setValue(remarkName ?? '')
  }

  const save = async () => {
    if (!editable) return
    const next = value.trim()

    setSaving(true)
    try {
      await onSave(next)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  const handleOpenChange = async(open: boolean, remark?: string | null) => {
    setNoteOpen(open)
    if (!open && remark !== undefined) {
      setDisplayText(remark && remark.trim() ? remark : shortAddr(address))
      if (remark !== remarkName) {
        try {
          setSaving(true)
          await onSave(remark)
        } finally {
          setSaving(false)
        }
      }
    }
  }

  return (
    <div className={cn('flex min-w-0 items-center', !isDesktop ? 'gap-1' : 'gap-2', className)}>
      {!editing ? (
        <TooltipProvider delayDuration={150}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className={cn(
                'min-w-0 overflow-hidden text-ellipsis whitespace-nowrap',
                textMaxWidthClassName ?? 'max-w-[220px]',
                'text-white hover:cursor-pointer hover:text-[#FAFAFA]',
                textClassName,
              )}
              onClick={(e) => {
                e.stopPropagation()
                onCopy?.()
              }}
            >
              {displayText}
            </span>
          </TooltipTrigger>

          {showTooltip && (
            <TooltipContent
              side="top"
              align="start"
            >
              {addrText}
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
      ) : (
        <input
          autoFocus
          value={value}
          maxLength={maxLength}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            e.stopPropagation()
            if (e.key === 'Enter') save()
            if (e.key === 'Escape') cancel()
          }}
          className={cn(
            'h-8 rounded-md px-2',
            inputWidthClassName,
            'border border-[#2A2A2F] bg-[#0E0E11]',
            'text-sm text-white outline-none',
          )}
          placeholder={t('smartMoney.addressDetail.remark')}
          disabled={saving}
        />
      )}

      {/* copy */}
      {isDesktop && onCopy && (
        <button
          type="button"
          className="shrink-0 text-white/40 hover:text-white"
          onClick={onCopy}
          disabled={saving}
          title={t('button.copy')}
        >
          <CopyIcon className="h-4 w-4" />
        </button>
      )}

      {/* edit/save */}
      {isDesktop && editable && (
        <button
          type="button"
          className="shrink-0 text-white/40 hover:text-white disabled:opacity-50"
          onClick={(e) => {
            e.stopPropagation()
            editing ? save() : setEditing(true)
            needToast ? toast.error(t('smartMoney.addressDetail.editFail')) : null
          }}
          disabled={saving}
          title={editing ? t('button.save') : t('google.auth.whitelist.edit')}
        >
          {editing ? <Check className="h-4 w-4" /> : <EditIcon className="h-4 w-4" />}
        </button>
      )}

      {!isDesktop && onCopy && (
        <button
          type="button"
          className="shrink-0 text-white/40 hover:text-white ml-2 mr-1"
          onClick={onCopy}
          disabled={saving}
          title={t('button.copy')}
        >
          <CopyIcon className="h-4 w-4" />
        </button>)
      }
      {!isDesktop && 
        <AddressNote 
          isEditable={!needToast}
          remarkName={remarkName || ''} 
          address={address} 
          open={noteOpen} 
          onOpenChange={ handleOpenChange} 
        />
      }
    </div>
  )
}
