import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronLeft } from 'lucide-react'
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { useAddressGroups } from '@/providers/AddressGroupsProvider'
import { toast } from 'sonner'
import { ReactComponent as ManageIcon } from '@/components/icon/supervisory/manager.svg'
import { ReactComponent as EditAddressIcon } from '@/components/icon/supervisory/edit_address.svg'
import { ReactComponent as DeleteAddressIcon } from '@/components/icon/supervisory/del_address.svg'
import { ReactComponent as MoveAddressIcon } from '@/components/icon/supervisory/move_address.svg'
import { useDeleteAddressGroup } from '@/hooks/useDeleteAddressGroup'
import { useBatchUpdateAddressGroups } from '@/hooks/useBatchUpdateAddressGroups'
import { useUpdateFlowGroupOrder } from '@/hooks/useUpdateFlowGroupOrder'

import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  useSensor,
  TouchSensor,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useResponsive } from '@/hooks/useResponsive'

type GroupItem = { label: string; value: string; isDefault: boolean }

const SortableRow = ({
  g,
  isDefault,
  isEditing,
  editingName,
  setEditingName,
  onCommitEdit,
  onStartEdit,
  onDelete,
  onCancelEdit,
}: {
  g: GroupItem
  isDefault: boolean
  isEditing: boolean
  editingName: string
  setEditingName: (v: string) => void
  onCommitEdit: (g: GroupItem) => void
  onStartEdit: (g: GroupItem) => void
  onDelete: (id: string) => void
  onCancelEdit: () => void
}) => {
  const { t } = useTranslation()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: g.value })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'h-9 p-2 rounded-lg flex items-center justify-between',
        'bg-[rgba(255,255,255,0.06)] border border-white/5',
        isDragging && 'ring-1 ring-white/20',
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* 拖拽把手：只让这里可拖拽，避免点击输入框也触发拖拽 */}
        <button
          type="button"
          className="cursor-grab active:cursor-grabbing p-1 -ml-1 rounded hover:bg-white/5"
          {...attributes}
          {...listeners}
          aria-label="Drag handle"
        >
          <MoveAddressIcon className="h-4 w-4 shrink-0" />
        </button>

        {!isEditing ? (
          <span className="truncate">{g.label}</span>
        ) : (
          <input
            autoFocus
            value={editingName}
            onChange={(e) => setEditingName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onCommitEdit(g)
              if (e.key === 'Escape') onCancelEdit()
            }}
            className={cn(
              'h-10 w-[320px] px-3 rounded-lg',
              'bg-[#0E0E11] border border-[#2A2A2F]',
              'text-sm text-white outline-none',
            )}
          />
        )}
      </div>

      {!isDefault &&
        <div className="flex items-center text-[#FAFAFA]">
        {/* edit */}
        <button
          type="button"
          className="p-2 rounded-lg hover:bg-white/5"
          onClick={() => (isEditing ? onCommitEdit(g) : onStartEdit(g))}
          title={isEditing ? t('button.save') : t('google.auth.whitelist.edit')}
        >
          <EditAddressIcon className="h-4 w-4" />
        </button>

        {/* delete */}
        <button
          type="button"
          className="p-2 rounded-lg hover:bg-white/5 hover:text-red-400"
          onClick={() => onDelete(g.value)}
          title={t('universal.detele')}
        >
          <DeleteAddressIcon className="h-4 w-4" />
        </button>
      </div>}
    </div>
  )
}

type GroupManageDialogProp = {
  show?: boolean
  onBack?: () => void
}

export const GroupManageDialog = ({ show = false, onBack }: GroupManageDialogProp) => {
  const { isDesktop } = useResponsive()

  const [open, setOpen] = useState(show)
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  const { t } = useTranslation()

  const { groupList, refresh, loading, createAndSelectGroup } = useAddressGroups()
  const { deleteAddressGroup } = useDeleteAddressGroup()
  const { batchUpdateAddressGroups } = useBatchUpdateAddressGroups()

  const { updateFlowGroupOrder } = useUpdateFlowGroupOrder()

  // 本地列表
  const [localList, setLocalList] = useState<GroupItem[]>([])
  useEffect(() => setLocalList(groupList), [groupList])

  // ============ dnd-kit sensors ============
  const sensors = useSensors(
    isDesktop
      ? useSensor(PointerSensor, {
          activationConstraint: { distance: 6 },
        })
      : useSensor(TouchSensor, {
          activationConstraint: {
            delay: 200,
            tolerance: 5,
          },
        }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  // ============ 800ms debounce sync ============
  const lastSyncedKeyRef = useRef<string>('') // 防止重复同步相同顺序
  const lastStableListRef = useRef<GroupItem[]>([]) // 用于失败回滚
  const syncTimerRef = React.useRef<number | null>(null)
  const pendingListRef = React.useRef<GroupItem[] | null>(null) // 记录最新待同步顺序
  const syncingRef = React.useRef(false)

  // 当 provider 的 groupList 更新（refresh 后）才是稳定态
  useEffect(() => {
    
    setLocalList(groupList)
    lastStableListRef.current = groupList
    lastSyncedKeyRef.current = buildOrderKey(groupList)
  }, [groupList])

  useEffect(() => {
    return () => {
      if (syncTimerRef.current) window.clearTimeout(syncTimerRef.current)
    }
  }, [])

  const buildOrderKey = (list: GroupItem[]) => list.map((x) => x.value).join('|')

  const syncOrderToServer = async (list: GroupItem[]) => {
    const key = buildOrderKey(list)
    if (!key || key === lastSyncedKeyRef.current) return
    if (syncingRef.current) return

    const array = list.map((g, index) => ({ groupId: g.value, order: index }))

    syncingRef.current = true
    try {
      // res 就是 AddressGroupResponse[]
      const res = await updateFlowGroupOrder(array)

      const ok = Array.isArray(res) && res.length > 0
      if (!ok) throw new Error('updateFlowGroupOrder empty response')

      lastSyncedKeyRef.current = key
      pendingListRef.current = null

      // 用接口返回 order 作为最终顺序（以服务端为准）
      const returned = res
        .slice()
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((x) => ({
          value: x.id,
          label: x.name,
          isDefault: !!x.isDefault,
        }))

      setLocalList(returned)
      lastStableListRef.current = returned

      toast.success(t('smartMoney.addressManage.groupOrderSynced'))
      await refresh?.()
    } catch (e) {
      console.error(e)
      toast.error(t('smartMoney.addressManage.groupOrderSyncFailed'))

      setLocalList(lastStableListRef.current)

      pendingListRef.current = null
      await refresh?.()
    } finally {
      syncingRef.current = false
    }
  }

  const scheduleSyncOrder = (nextList: GroupItem[]) => {
    pendingListRef.current = nextList // 永远保留最新排序

    if (syncTimerRef.current) window.clearTimeout(syncTimerRef.current)
    syncTimerRef.current = window.setTimeout(() => {
      const pending = pendingListRef.current
      if (pending) syncOrderToServer(pending)
    }, 800)
  }

  const flushSyncOrder = () => {
    if (syncTimerRef.current) {
      window.clearTimeout(syncTimerRef.current)
      syncTimerRef.current = null
    }
    const pending = pendingListRef.current
    if (pending) syncOrderToServer(pending)
  }

  // ============ Drag End（只在松手触发） ============
  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return
    if (active.id === over.id) return

    setLocalList((prev) => {
      const oldIndex = prev.findIndex((x) => x.value === active.id)
      const newIndex = prev.findIndex((x) => x.value === over.id)
      if (oldIndex < 0 || newIndex < 0) return prev

      const next = arrayMove(prev, oldIndex, newIndex)

      // 只在松手后触发 debounce
      scheduleSyncOrder(next)

      return next
    })
  }

  // 关闭时如果还有 pending 的排序，立即同步一次
  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      flushSyncOrder()
    }
    setOpen(nextOpen)
  }

  const onCreate = async () => {
    const name = newName.trim()
    if (!name) return
    try {
      await createAndSelectGroup(name, { isDefault: false })
      setNewName('')
      await refresh()
      toast.success(t('smartMoney.addressManage.createSuccess'))
    } catch (e) {
      console.error(e)
      toast.error(t('smartMoney.addressManage.createFailed'))
    }
  }

  const onDelete = async (id: string) => {
    try {
      const res = await deleteAddressGroup(id)
      if (res.data?.deleteAddressGroup) {
        toast.success(t('smartMoney.addressManage.deleteGroupSuccess'))
        await refresh?.()
      } else {
        toast.error(t('smartMoney.addressManage.deleteGroupFailed'))
      }
    } catch (error) {
      toast.error('smartMoney.addressManage.deleteGroupFailed')
    }
  }

  const startEdit = (g: GroupItem) => {
    setEditingId(g.value)
    setEditingName(g.label)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingName('')
  }

  const commitEdit = async (g: GroupItem) => {
    if (!editingId || editingId !== g.value) return

    const name = editingName.trim()
    if (!name) return toast.error(t('smartMoney.addressManage.groupNameEmpty'))

    const prevList = localList

    setLocalList((prev) => prev.map((x) => (x.value === g.value ? { ...x, label: name } : x)))
    setEditingId(null)

    try {
      await batchUpdateAddressGroups({
        input: {
          groups: [
            {
              id: g.value,
              name,
            },
          ],
        },
      })
      toast.success(t('smartMoney.addressManage.updated'))
      await refresh()
    } catch (e) {
      console.error(e)
      toast.error(t('smartMoney.addressManage.updateFailed'))
      setLocalList(prevList)
      setEditingId(g.value)
      await refresh()
    }
  }

  const ids = useMemo(() => localList.map((x) => x.value), [localList])

  const renderDesktop = () => {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <button className="flex items-center gap-1 text-xs text-[#FAFAFA] hover:text-white">
            <ManageIcon className="w-3.5 h-3.5" />
            {t('smartMoney.supervisory.manage')}
          </button>
        </DialogTrigger>

        <DialogContent
          overlayClassName="bg-black/70"
          showDialogPrimitiveClose={false}
          className={cn(
            'bg-[#1A1A1D] border border-[#2A2A2F] text-white',
            'p-6 rounded-2xl max-w-[488px] shadow-xl',
            'max-h-[70vh] overflow-hidden pb-5',
          )}
        >
          {/* header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg hover:bg-white/5" onClick={() => handleOpenChange(false)} type="button">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <DialogTitle>{t('smartMoney.supervisory.manageAddresses')}</DialogTitle>
            </div>

            <button className="p-2 rounded-lg hover:bg-white/5" onClick={() => handleOpenChange(false)} type="button">
              <span className="text-2xl leading-none">×</span>
            </button>
          </div>

          {/* create row */}
          <div className="mt-6 flex gap-4">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={t('smartMoney.supervisory.groupNamePlaceholder') || ''}
              className={cn(
                'flex-1 h-10.5 px-4 rounded-xl',
                'bg-[#0E0E11] border border-[#2A2A2F]',
                'text-sm text-white placeholder:text-white/30 outline-none',
                'focus:border-white/20',
              )}
            />
            <button
              disabled={loading}
              onClick={onCreate}
              type="button"
              className={cn(
                'h-10 w-25 px-4 rounded-lg',
                'bg-[#7C3AED] text-white font-medium',
                'hover:bg-[#8B5CF6] disabled:opacity-60 disabled:hover:bg-[#7C3AED]',
              )}
            >
              {t('smartMoney.supervisory.create')}
            </button>
          </div>

          {/* list scroll container */}
          <div className="overflow-auto max-h-[50vh] pr-1 ">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <SortableContext items={ids} strategy={verticalListSortingStrategy}>
                <div className="space-y-3 pb-5">
                  {localList.map((g) => {
                    const isEditing = editingId === g.value
                    return (
                      <SortableRow
                        key={g.value}
                        g={g}
                        isDefault={g.isDefault}
                        isEditing={isEditing}
                        editingName={editingName}
                        setEditingName={setEditingName}
                        onCommitEdit={commitEdit}
                        onStartEdit={startEdit}
                        onCancelEdit={cancelEdit}
                        onDelete={onDelete}
                      />
                    )
                  })}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const renderMobile = () => {
    return open &&
      <div className="fixed inset-0 z-50 py-4 px-3 bg-[#0A0A0A] max-w-[768px] mx-auto flex flex-col">
        <div className="w-full h-11 relative flex items-center overflow-hidden">
          <div className="absolute flex h-full items-center">
            <button className="p-2 rounded-lg hover:bg-white/5" onClick={() => onBack?.()} type="button">
              <ChevronLeft className="h-5 w-5" />
            </button>
          </div>

          {/* Center title */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-base font-medium">{t('smartMoney.supervisory.manageAddresses')}</span>
          </div>
        </div>

        <div className="w-full flex-1 flex flex-col overflow-hidden">
          <div className="self-stretch flex flex-col justify-start items-start border-b border-[#79779029]">
            <div className="self-stretch px-3 inline-flex justify-start items-center gap-2.5">
              <div className="justify-start text-base font-medium font-['PingFang_SC'] leading-4">{t('smartMoney.supervisory.manageAddresses')}</div>
            </div>
            <div className="self-stretch px-3 pt-4 pb-6 flex flex-col justify-center items-center gap-4">
              <div className="self-stretch px-4 py-2.5 bg-[#18181B] rounded-md border border-[#27272A] inline-flex justify-start items-center">
                <div className="flex-1 justify-center text-sm font-normal font-['Geist'] leading-5">
                  <input 
                    placeholder={t('smartMoney.supervisory.groupNamePlaceholder') || ''}
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
              <button
                type="button"
                className="self-stretch px-4 py-2.5 bg-[#843BEA] rounded-[40px] inline-flex justify-center items-center"
                disabled={loading}
                onClick={onCreate}
              >
                <div className="text-center justify-center text-white text-sm font-medium font-['Geist'] leading-5">
                  {t('smartMoney.supervisory.create')}
                </div>
              </button>
            </div>
          </div>

          <div className="flex-1 w-full mt-6 pr-1 overflow-auto">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <SortableContext items={ids} strategy={verticalListSortingStrategy}>
                <div className="w-full space-y-3 pb-5">
                  {localList.map((g) => {
                    const isEditing = editingId === g.value
                    return (
                      <SortableRow
                        key={g.value}
                        isDefault={g.isDefault}
                        g={g}
                        isEditing={isEditing}
                        editingName={editingName}
                        setEditingName={setEditingName}
                        onCommitEdit={commitEdit}
                        onStartEdit={startEdit}
                        onCancelEdit={cancelEdit}
                        onDelete={onDelete}
                      />
                    )
                  })}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </div>
      </div>
    
  }

  return isDesktop ? renderDesktop() : renderMobile()
}
