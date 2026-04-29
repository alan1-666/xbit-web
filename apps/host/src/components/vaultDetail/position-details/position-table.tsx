import Tag from '@/components/common/Tag'
import Text from '@/components/common/Text'
import { IconSortDown, IconSortUp } from '@/components/icon'
import { DataTable } from '@pages/home/data-table.tsx'
import { ColumnDef } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'

const PositionsTable = () => {
  const { t } = useTranslation()

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: '币种',
      header: () => (
        <div className="flex items-center">
          <div>{t('币种')}</div>
          <div className="flex items-center cursor-pointer justify-center">
            <div className="flex flex-col ml-1">
              <IconSortUp currentColor={'#FFFFFF'} />
              <IconSortDown currentColor={'#FFFFFF80'} />
            </div>
          </div>
        </div>
      ),
      cell: () => {
        return (
          <div className="flex items-center gap-[5px]">
            <Text text="BOME" fontSize={13} fontWeight="semibold" color="#56FFCD" />
            <Text text="30x" fontSize={13} fontWeight="regular" color="#56FFCD" />
            <Tag label="多" color="#00FFB4" containerClassName="rounded-[4px] px-1 py-0.75" />
          </div>
        )
      },
    },
    {
      accessorKey: '数量',
      header: () => (
        <div className="flex items-center">
          <div>{t('数量')}</div>
          <div className="flex items-center cursor-pointer justify-center">
            <div className="flex flex-col ml-1">
              <IconSortUp currentColor={'#FFFFFF'} />
              <IconSortDown currentColor={'#FFFFFF80'} />
            </div>
          </div>
        </div>
      ),
      cell: () => {
        return (
          <div className="flex items-center gap-[5px]">
            <Text text="24.41261" fontSize={13} fontWeight="regular" color="#56FFCD" />
            <Text text="BTC" fontSize={13} fontWeight="regular" color="#56FFCD" />
          </div>
        )
      },
    },
    {
      accessorKey: '仓位价值',
      header: () => (
        <div className="flex items-center">
          <div>{t('仓位价值')}</div>
          <div className="flex items-center cursor-pointer justify-center">
            <div className="flex flex-col ml-1">
              <IconSortUp currentColor={'#FFFFFF'} />
              <IconSortDown currentColor={'#FFFFFF80'} />
            </div>
          </div>
        </div>
      ),
      cell: () => {
        return (
          <div className="flex items-center gap-[5px]">
            <Text text="$216,878.51" fontSize={13} fontWeight="regular" />
          </div>
        )
      },
    },
    {
      accessorKey: '开仓价格',
      header: () => (
        <div className="flex items-center">
          <div>{t('开仓价格')}</div>
          <div className="flex items-center cursor-pointer justify-center">
            <div className="flex flex-col ml-1">
              <IconSortUp currentColor={'#FFFFFF'} />
              <IconSortDown currentColor={'#FFFFFF80'} />
            </div>
          </div>
        </div>
      ),
      cell: () => {
        return (
          <div className="flex items-center gap-[5px]">
            <Text text="0.00124" fontSize={13} fontWeight="regular" />
          </div>
        )
      },
    },
    {
      accessorKey: '盈亏金额(盈亏比)',
      header: () => (
        <div className="flex items-center">
          <div>{t('盈亏金额(盈亏比)')}</div>
          <div className="flex items-center cursor-pointer justify-center">
            <div className="flex flex-col ml-1">
              <IconSortUp currentColor={'#FFFFFF'} />
              <IconSortDown currentColor={'#FFFFFF80'} />
            </div>
          </div>
        </div>
      ),
      cell: () => {
        return (
          <div className="flex items-center gap-[5px]">
            <Text text="+$81,230.98 (+117.4%)" fontSize={13} fontWeight="regular" color="#56FFCD" />
          </div>
        )
      },
    },
    {
      accessorKey: '标记价格',
      header: () => (
        <div className="flex items-center">
          <div>{t('标记价格')}</div>
          <div className="flex items-center cursor-pointer justify-center">
            <div className="flex flex-col ml-1">
              <IconSortUp currentColor={'#FFFFFF'} />
              <IconSortDown currentColor={'#FFFFFF80'} />
            </div>
          </div>
        </div>
      ),
      cell: () => {
        return (
          <div className="flex items-center gap-[5px]">
            <Text text="88351" fontSize={13} fontWeight="regular"/>
          </div>
        )
      },
    },
    {
      accessorKey: '保证金',
      header: () => (
        <div className="flex items-center">
          <div>{t('保证金')}</div>
          <div className="flex items-center cursor-pointer justify-center">
            <div className="flex flex-col ml-1">
              <IconSortUp currentColor={'#FFFFFF'} />
              <IconSortDown currentColor={'#FFFFFF80'} />
            </div>
          </div>
        </div>
      ),
      cell: () => {
        return (
          <div className="flex items-center gap-[5px]">
            <Text text="$71,895.95" fontSize={13} fontWeight="regular"/>
          </div>
        )
      },
    },
    {
      accessorKey: '资金费',
      header: () => (
        <div className="flex items-center">
          <div>{t('资金费')}</div>
          <div className="flex items-center cursor-pointer justify-center">
            <div className="flex flex-col ml-1">
              <IconSortUp currentColor={'#FFFFFF'} />
              <IconSortDown currentColor={'#FFFFFF80'} />
            </div>
          </div>
        </div>
      ),
      cell: () => {
        return (
          <div className="flex items-center gap-[5px]">
            <Text text="$11.90" fontSize={13} fontWeight="regular" color="#56FFCD"/>
          </div>
        )
      },
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={[1,2,3,4,5,6,7,8,9,10]}
      isStickyHeader
      stickyBg="rgb(23,24,27)"
      containerClassName="max-h-[400px]"
      tableHeaderRowClassName="text-[calc(1rem*(11/16))] text-[#FFFFFF80] whitespace-nowrap !border-b-0 bg-[#202625]"
      tableHeadClassName="app-font-light px-2 py-1 items-center justify-center pb-0"
      tableBodyClassName="max-h-[300px]"
      tableBodyRowClassName="group whitespace-nowrap !border-[#ECECED14]"
      tableCellClassName="group-hover:!bg-[#27272a] cursor-pointer py-3"
    />
  )
}

export default PositionsTable
