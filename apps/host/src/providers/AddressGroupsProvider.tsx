import React, { createContext, useCallback, useContext, useMemo, useRef, useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useListAddressGroups } from '@/hooks/useListAddressGroups'
import { useCreateAddressGroup } from '@/hooks/useCreateAddressGroup'
import { useTranslation } from 'react-i18next'

export type GroupOption = { label: string; value: string, isDefault: boolean }

type GuardOptions = {
  /** 是否弹 toast（默认 false） */
  toast?: boolean
  /**
   * 用于“一个页面/场景只提示一次”
   * 建议传页面名：'pageName'
   */
  onceKey?: string
}

type GuardResult = { ok: true; reason: 'ok' } | { ok: false; reason: 'loading' | 'empty' | 'unselected' }

type Ctx = {
  groupList: GroupOption[]
  loading: boolean
  error: any
  /** 分组列表是否已完成首次请求（不再处于 loading 且 data/error 已落地） */
  isReady: boolean

  // 单选场景
  selectedGroupId: string
  setSelectedGroupId: (id: string) => void

  // 乐观追加（仅用于“更快看到”，最终以 refresh 为准）
  addLocalGroup: (g: GroupOption) => void
  refresh: () => Promise<void>

  createAndSelectGroup: (name: string, extra?: { isDefault?: boolean }) => Promise<{ id: string; name: string } | null>

  /**
   * - 由业务页面决定是否 toast
   * - 不会在 loading 阶段 toast（避免“没等数据回来就弹”）
   * - groupList.length===0 优先提示“暂无分组...”
   * - 有分组但未选中提示“请先选择...”
   * - 通过 onceKey 控制每页只提示一次
   */
  guardGroupSelection: (opts?: GuardOptions) => GuardResult
}

const AddressGroupsContext = createContext<Ctx | null>(null)

export const AddressGroupsProvider = ({ children }: { userId?: string; children: React.ReactNode }) => {
  const { t } = useTranslation()
  const { data, loading, error, refetch } = useListAddressGroups()
  const { createAddressGroup } = useCreateAddressGroup()

  const [selectedGroupId, _setSelectedGroupId] = useState<string>('')

  const [localAdded, setLocalAdded] = useState<GroupOption[]>([])
  
  const addLocalGroup = useCallback((g: GroupOption) => {
    setLocalAdded((prev) => {
      const idx = prev.findIndex((x) => x.value === g.value)
      if (idx >= 0) {
        const next = prev.slice()
        next[idx] = { ...next[idx], label: g.label }
        return next
      }
      return [...prev, g]
    })
  }, [])

  // 是否完成“首次请求落地”
  const readyRef = useRef(false)
  const isReady = useMemo(() => readyRef.current, [loading, data, error])
  useEffect(() => {
    // 一旦 loading 结束，不管成功/失败，都算首次请求落地
    if (!loading) {
      readyRef.current = true
    }
  }, [loading])

  // 远端映射 -> label/value
  const remoteList: GroupOption[] = useMemo(() => {
    return (data ?? []).map((it: any) => ({
      label: it.name ?? it.label ?? '-',
      value: String(it.id ?? it.value),
      isDefault: it.isDefault
    }))
  }, [data])

  // groupList：最终以 refetch 后为准；但合并 localAdded 让 UI 更快
  const groupList = useMemo(() => {
    const map = new Map<string, GroupOption>()
    for (const g of localAdded) map.set(g.value, g)
    for (const g of remoteList) map.set(g.value, g)
    return Array.from(map.values())
  }, [remoteList, localAdded])

  useEffect(() => {
    if (remoteList.length === 0) return
  
    setLocalAdded((prev) => {
      if (prev.length === 0) return prev
      const remoteIdSet = new Set(remoteList.map((x) => x.value))
      const next = prev.filter((x) => !remoteIdSet.has(x.value))
      return next.length === prev.length ? prev : next
    })
  }, [remoteList])
  

  // 默认选中第一项（当 selectedGroupId 为空时）
  useEffect(() => {
    if (!selectedGroupId && groupList.length > 0) {
      _setSelectedGroupId(groupList[0].value)
    }
  }, [groupList, selectedGroupId])

  const setSelectedGroupId = useCallback((id: string) => {
    _setSelectedGroupId(id)
  }, [])

  const refresh = useCallback(async () => {
    await refetch?.()
  }, [refetch])

  const createAndSelectGroup = useCallback(
    async (name: string, extra?: { isDefault?: boolean }) => {
      const trimmed = name.trim()
      if (!trimmed) return null

      const created = await createAddressGroup({
        name: trimmed,
        isDefault: extra?.isDefault ?? false,
      })
      if (!created?.id) return null

      _setSelectedGroupId(String(created.id))
      // refresh 前乐观追加（让 UI 更快出现）
      addLocalGroup({ label: created.name, value: String(created.id), isDefault: created.isDefault })

      await refresh()

      return { id: String(created.id), name: created.name }
    },
    [createAddressGroup, addLocalGroup, refresh],
  )

  /**
   * toast “只提示一次”的记忆集合（按 onceKey）
   * - 不提供 onceKey：每次调用都可能提示
   */
  const warnedOnceKeySetRef = useRef<Set<string>>(new Set())

  const guardGroupSelection = useCallback(
    (opts?: GuardOptions): GuardResult => {
      const shouldToast = opts?.toast ?? false
      const onceKey = (opts?.onceKey ?? '').trim()

      // 没等接口回来，不提示
      if (!readyRef.current || loading) return { ok: false, reason: 'loading' }

      const dedupeKey = onceKey ? `AddressGroupsGuard:${onceKey}` : ''
      const canToast = shouldToast && (!dedupeKey || !warnedOnceKeySetRef.current.has(dedupeKey))

      // 1) 分组为空优先提示
      if (groupList.length === 0) {
        if (canToast) {
          if (dedupeKey) warnedOnceKeySetRef.current.add(dedupeKey)
          toast.info(t('smartMoney.noGroup'), { id: dedupeKey || undefined })
        }
        return { ok: false, reason: 'empty' }
      }

      // 2) 有分组但未选中
      if (!selectedGroupId) {
        if (canToast) {
          if (dedupeKey) warnedOnceKeySetRef.current.add(dedupeKey)
          toast.info(t('smartMoney.selectGroupFirst'), { id: dedupeKey || undefined })
        }
        return { ok: false, reason: 'unselected' }
      }

      return { ok: true, reason: 'ok' }
    },
    [groupList.length, selectedGroupId, loading],
  )

  const value = useMemo<Ctx>(
    () => ({
      groupList,
      loading,
      error,
      isReady: readyRef.current && !loading,

      selectedGroupId,
      setSelectedGroupId,

      addLocalGroup,
      refresh,
      createAndSelectGroup,

      guardGroupSelection,
    }),
    [
      groupList,
      loading,
      error,
      selectedGroupId,
      setSelectedGroupId,
      addLocalGroup,
      refresh,
      createAndSelectGroup,
      guardGroupSelection,
    ],
  )

  return <AddressGroupsContext.Provider value={value}>{children}</AddressGroupsContext.Provider>
}

export const useAddressGroups = () => {
  const ctx = useContext(AddressGroupsContext)
  if (!ctx) throw new Error('useAddressGroups must be used within AddressGroupsProvider')
  return ctx
}
