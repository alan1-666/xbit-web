import Tag from '@/components/common/Tag'
import Text from '@/components/common/Text'
import { IconSortDown, IconSortUp } from '@/components/icon'
import { DataTable } from '@/pages/home/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'

const FundingHistory = () => {
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
            <Text text={'2024/08/0812:12'} fontSize={13} fontWeight="regular" />
          </div>
        )
      },
    },
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
            <Text text="BTC" fontSize={13} fontWeight="medium" />
            <Text text="30X" fontSize={13} fontWeight="medium" color="#00FFB4" />
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
            <Text text="24.41261 BTC" fontSize={13} fontWeight="regular" color={'#00FFB4'} />
          </div>
        )
      },
    },
    {
      accessorKey: '支付',
      header: () => (
        <div className="flex items-center">
          <div>{t('支付')}</div>
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
            <Text text="+$23.34" fontSize={13} fontWeight="regular" color="#00FFB4" />
          </div>
        )
      },
    },
    {
      accessorKey: '利率',
      header: () => (
        <div className="flex items-center">
          <div>{t('利率')}</div>
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
            <Text text="0.0290%" fontSize={13} fontWeight="regular" />
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

export default FundingHistory
