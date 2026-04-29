import { useEffect, useMemo, useRef, useState } from 'react'
import { FiStar } from 'react-icons/fi'
import { FavoriteMultiGroupPopover } from './FavoriteMultiGroupPopover'
import { useAddressGroups } from '@/providers/AddressGroupsProvider'
import { useUpdateAddressGroupsForAddress } from '@/hooks/useUpdateAddressGroupsForAddress'
import { useSelector } from 'react-redux'
import { _userInfo } from '@/redux/modules/newAuth.slice'

type Props = {
  addressId: string
  initialFavorited?: boolean
  initialGroupIds?: string[]
  commitMode?: 'debounce' | 'onClose'
  size?: number
}

export function FavoriteGroupsButton({
  addressId,
  initialFavorited = false,
  initialGroupIds = [],
  commitMode = 'debounce',
  size = 16,
}: Props) {
  const userId = useSelector(_userInfo)?.userId

  const [open, setOpen] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)

  const [favoriteGroupIds, setFavoriteGroupIds] = useState<string[]>((initialGroupIds ?? []).map(String))
  const [isFavorited, setIsFavorited] = useState(initialFavorited || (initialGroupIds?.length ?? 0) > 0)

  const { groupList, createAndSelectGroup } = useAddressGroups()
  const { updateAddressGroupsForAddress } = useUpdateAddressGroupsForAddress()

  const debounceTimerRef = useRef<number | null>(null)
  const pendingRef = useRef<string[]>(favoriteGroupIds)
  const lastCommittedRef = useRef<string[]>(favoriteGroupIds)

  const initialKey = useMemo(
    () => (initialGroupIds?.length ? [...initialGroupIds].map(String).sort().join(',') : ''),
    [initialGroupIds],
  )

  useEffect(() => {
    const next = (initialGroupIds ?? []).map(String)
    setFavoriteGroupIds(next)
    setIsFavorited(next.length > 0 || initialFavorited)
    pendingRef.current = next
    lastCommittedRef.current = next
  }, [initialFavorited, initialKey])

  const normalize = (arr: string[]) => Array.from(new Set(arr.map(String)))

  const commit = async (groupIds: string[]) => {
    if (!userId) return
    const normalized = normalize(groupIds)

    try {
      await updateAddressGroupsForAddress({
        addressId,
        userId,
        groupIds: normalized,
      })
      lastCommittedRef.current = normalized
    } catch (e) {
      const rollback = lastCommittedRef.current
      setFavoriteGroupIds(rollback)
      setIsFavorited(rollback.length > 0)
      pendingRef.current = rollback
      console.error(e)
    }
  }

  const scheduleCommit = (next: string[]) => {
    pendingRef.current = normalize(next)
    if (commitMode !== 'debounce') return

    if (debounceTimerRef.current) window.clearTimeout(debounceTimerRef.current)
    debounceTimerRef.current = window.setTimeout(() => commit(pendingRef.current), 800)
  }

  const flushCommit = async () => {
    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }
    await commit(pendingRef.current)
  }

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) window.clearTimeout(debounceTimerRef.current)
    }
  }, [])

  const handleCreate = async (name: string) => {
    const created = await createAndSelectGroup(name, { isDefault: false })
    if (!created?.id) return

    const gid = String(created.id)
    setFavoriteGroupIds((prev) => {
      const next = normalize([...prev, gid])
      setIsFavorited(next.length > 0)
      scheduleCommit(next)
      return next
    })
  }

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-label="收藏"
        onClick={(e) => {
          e.stopPropagation()
          setOpen((v) => !v)
        }}
        className="grid h-6 w-6 place-items-center text-white/60 hover:text-white/90 transition-colors"
      >
        <FiStar
          size={size}
          className={isFavorited ? 'text-[#6D4CFF]' : ''}
          fill={isFavorited ? 'currentColor' : 'none'}
        />
      </button>

      <FavoriteMultiGroupPopover
        open={open}
        anchorEl={btnRef.current}
        groupList={groupList}
        selectedValues={favoriteGroupIds}
        onChange={(next: string[]) => {
          const normalized = normalize(next)
          setFavoriteGroupIds(normalized)
          setIsFavorited(normalized.length > 0)
          scheduleCommit(normalized)
        }}
        onCreate={handleCreate}
        onClose={async () => {
          setOpen(false)
          if (commitMode === 'onClose') await flushCommit()
        }}
        width={400}
      />
    </>
  )
}
