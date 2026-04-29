import Text from '@/components/common/Text'
import { IconSortUp, IconSortDown } from '@/components/icon'
import { formatAddressWallet } from '@/lib/string'
import { DataTable } from '@/pages/home/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'

const InvestorTable = () => {
  const { t } = useTranslation()

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: '投资者',
      header: () => (
        <div className="flex items-center">
          <div>{t('投资者')}</div>
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
            <Text text={formatAddressWallet('9466qfaskdjdhskhdkaRmdfep', 6, 6)} fontSize={13} fontWeight="regular" />
          </div>
        )
      },
    },
    {
      accessorKey: '最新余额',
      header: () => (
        <div className="flex items-center">
          <div>{t('最新余额')}</div>
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
      accessorKey: '未实现盈亏',
      header: () => (
        <div className="flex items-center">
          <div>{t('未实现盈亏')}</div>
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
            <Text
              text="+$23.34"
              fontSize={13}
              fontWeight="regular"
              color={ '#00FFB4'}
            />
          </div>
        )
      },
    },
    {
      accessorKey: '总盈亏',
      header: () => (
        <div className="flex items-center">
          <div>{t('总盈亏')}</div>
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
            <Text text="+$687.12" fontSize={13} fontWeight="regular" color="#00FFB4" />
          </div>
        )
      },
    },
    {
      accessorKey: '存款天数',
      header: () => (
        <div className="flex items-center">
          <div>{t('存款天数')}</div>
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
            <Text text="100" fontSize={13} fontWeight="regular" />
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

export default InvestorTable
