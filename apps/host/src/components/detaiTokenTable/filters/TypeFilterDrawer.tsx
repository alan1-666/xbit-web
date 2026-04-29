import { Ref, useImperativeHandle, useState } from 'react'
import AppDrawer from '@components/common/AppDrawer.tsx'
import { EventType } from '@/@generated/gql/graphql-meme2.ts'
import { IconCheckedCircle } from '@components/icon/IconCheckedCircle.tsx'
import { useTranslation } from 'react-i18next'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { selectFromTokenDetailState, setEventType } from '@/redux/modules/tokenDetail.slice.ts'

export interface TypeFilterDrawerHandle {
  open: () => void
}

export interface TypeFilterDrawerProps {
  ref: Ref<TypeFilterDrawerHandle>
}

const types: (EventType | 'all')[] = [
  'all',
  EventType.Buy,
  EventType.Sell,
  EventType.Add,
  EventType.Remove,
  EventType.Burnt,
]

const i18nKeys: Record<EventType | 'all', string> = {
  all: 'detail.tabs.all',
  [EventType.Buy]: 'detail.tabs.payOrder',
  [EventType.Sell]: 'detail.tabs.sellOrder',
  [EventType.Add]: 'detail.tokenDetail.addLiquidity',
  [EventType.Remove]: 'detail.tokenDetail.removeLiquidity',
  [EventType.Burnt]: 'detail.tokenDetail.burn',
}

export const TypeFilterDrawer = (props: TypeFilterDrawerProps) => {
  const { ref } = props
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()
  const eventType = useAppSelector(selectFromTokenDetailState('eventType'))
  const dispatch = useAppDispatch()
  useImperativeHandle(ref, () => ({
    open: () => setOpen(true),
  }))

  const handleSelectType = (type: EventType | 'all') => {
    dispatch(setEventType(type === 'all' ? undefined : type))
    setOpen(false)
  }

  return (
    <AppDrawer
      open={open}
      setOpen={setOpen}
      title={<div className="text-[calc(16rem/16)] font-medium">{t('detail.tokenDetail.finalType')}</div>}
      drawerContent={
        <div className="space-y-2.5">
          {types.map((type) => (
            <div
              key={type}
              className="h-[62px] flex items-center justify-between cursor-pointer bg-[#2B2B33] rounded-[10px] px-4"
              onClick={() => handleSelectType(type)}
            >
              <span className="text-[calc(15rem/16)] text-white">{t(i18nKeys[type])}</span>
              {eventType === type || (type === 'all' && !eventType) ? (
                <IconCheckedCircle className="w-5 h-5 text-primary-500" />
              ) : (
                <></>
              )}
            </div>
          ))}
        </div>
      }
    />
  )
}
