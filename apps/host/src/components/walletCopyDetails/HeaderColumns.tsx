import { memo } from 'react'
import VolumeFilterHead, { TVolumeFilterHeadProps } from './VolumeFilterHead'
import { FilterHeadProps, SortHeadProps, XFilterHead, XSortHead } from '../ui/XTableInfiniteScroll'
import { IconWatch } from '../icon'
import capitalize from 'lodash-es/capitalize'
import { useTranslation } from 'react-i18next'
import { SortQuery } from './TabTransfers'

interface HeaderRecentFollowUpProps extends FilterHeadProps, SortHeadProps {
  onTypeDateToggle: () => void
  sortQuery: SortQuery
}
const HeaderRecentFollowUp = memo((props: HeaderRecentFollowUpProps) => {
  const { t } = useTranslation()
  const { sortQuery, onTypeDateToggle, ...tableProps } = props
  return (
    <div className="flex items-center">
      <XFilterHead
        {...tableProps}
        headTitle={capitalize(t('walletCopy.currency'))}
        title={t('walletCopy.currency')}
        titleClassName="capitalize"
        initialFilter={sortQuery.baseAddress}
        useSearch={true}
        isClientFilter={false}
      />
      <span className="text-[11px] mr-[2px]">/</span>
      <XSortHead
        {...tableProps}
        tKey={capitalize(t('walletCopy.date'))}
        initialSort={sortQuery.createdAt}
        isSortClient={false}
      />
      <IconWatch className="!size-[14px] cursor-pointer" onClick={onTypeDateToggle} />
    </div>
  )
})

interface HeaderTypeProps extends Omit<FilterHeadProps, 'items'> {
  sortQuery: SortQuery
}
const HeaderType = memo((props: HeaderTypeProps) => {
  const { t } = useTranslation()
  const { isPC, sortQuery, ...tableProps } = props

  const items = [
    { label: t('walletCopy.filter.all'), value: '' },
    { label: t('walletCopy.buy'), value: 'Buy' },
    { label: t('walletCopy.sell'), value: 'Sell' },
  ]

  return (
    <XFilterHead
      {...tableProps}
      headTitle={t('walletCopy.type.title')}
      {...(!isPC && { title: t('walletCopy.filter.type') })}
      items={items}
      initialFilter={sortQuery.transactionType}
    />
  )
})

interface HeaderVolumeProps extends TVolumeFilterHeadProps {
  sortQuery: SortQuery
}
const HeaderVolume = memo((props: HeaderVolumeProps) => {
  const { sortQuery, ...tableProps } = props
  return <VolumeFilterHead {...tableProps} initialFilter={sortQuery?.volume} />
})

export { HeaderRecentFollowUp, HeaderType, HeaderVolume }
