import Text from '@/components/common/Text'
import { IconSortDown, IconSortUp } from '@/components/icon'
import { DataTable } from '@/pages/home/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'

const HistoricalTransactionTable = () => {
  const { t } = useTranslation()

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: '时间',
      header: () => (
        <div className="flex items-center">
          <div>{t('时间')}</div>
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
            <Text text="2024/08/0812:12" fontSize={13} fontWeight="regular" />
            <img src="/images/vaultDetail/share-one.png" alt="" className="cursor-pointer" />
          </div>
        )
      },
    },
    {
      accessorKey: '操作',
      header: () => (
        <div className="flex items-center">
          <div>{t('操作')}</div>
          <div className="flex items-center cursor-pointer justify-center">
            <div className="flex flex-col ml-1">
              <IconSortUp currentColor={'#FFFFFF'} />
              <IconSortDown currentColor={'#FFFFFF80'} />
            </div>
          </div>
        </div>
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-[5px]">
            <Text text="存款" fontSize={13} fontWeight="regular" />
            <img
              src={`/images/vaultDetail/${row.original % 3 === 0 ? 'up.png' : 'down.png'}`}
              alt=""
              className="cursor-pointer"
            />
          </div>
        )
      },
    },
    {
      accessorKey: '金额',
      header: () => (
        <div className="flex items-center">
          <div>{t('金额')}</div>
          <div className="flex items-center cursor-pointer justify-center">
            <div className="flex flex-col ml-1">
              <IconSortUp currentColor={'#FFFFFF'} />
              <IconSortDown currentColor={'#FFFFFF80'} />
            </div>
          </div>
        </div>
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-[5px]">
            <Text
              text="+$82,728.34"
              fontSize={13}
              fontWeight="regular"
              color={row.original % 3 === 0 ? '#AB57FF' : '#00FFB4'}
            />
          </div>
        )
      },
    },
    {
      accessorKey: '费用',
      header: () => (
        <div className="flex items-center">
          <div>{t('费用')}</div>
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
            <Text text="$0.00" fontSize={13} fontWeight="regular" />
          </div>
        )
      },
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
      isStickyHeader
      stickyBg="rgb(23,24,27)"
      containerClassName="max-h-[400px]"
      tableClassName=""
      tableHeaderRowClassName="text-[calc(1rem*(11/16))] text-[#FFFFFF80] whitespace-nowrap !border-b-0 bg-[#202625]"
      tableHeadClassName="app-font-light px-2 py-1 items-center justify-center pb-0"
      tableBodyClassName="max-h-[300px]"
      tableBodyRowClassName="group whitespace-nowrap !border-[#ECECED14]"
      tableCellClassName="group-hover:!bg-[#27272a] cursor-pointer py-3"
    />
  )
}

export default HistoricalTransactionTable
