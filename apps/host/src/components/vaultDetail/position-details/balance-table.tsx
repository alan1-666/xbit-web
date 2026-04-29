import Text from '@/components/common/Text'
import { IconSortDown, IconSortUp } from '@/components/icon'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { DataTable } from '@/pages/home/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'

const BalanceTable = () => {
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
            <Avatar className="w-auto h-auto">
              <AvatarImage
                className={cn('w-[20px] min-w-[20px] aspect-square rounded-full')}
                src={
                  'https://s3-alpha-sig.figma.com/img/f439/046b/f451d84a9d1f71f2a3e9a28f7bd874a0?Expires=1746403200&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=aK~MufHJ-smNlNPs~4QdOlTx0ID0-6~nAu6ScVliwhzJz0Tj7p3v-7ecgiXthnmnm0OMTgRuQG~CoDvFQLdpmjRDJeKYgDaoxEui~pFMZ13zPaIoxPKRqp5pzDRdlZo4m3wC2qBYpvC6Gz75hsqnxCieOyJcFrxQWRTLnbc8f~hH6vHNCzt0tix~R3~m35MOqpqozMY0hqcWjV0lyWMRY5gXQ3FH3y1H1r2G~J~3TQEEc3IcHt6pJMpwnor3qtymSU~wb9FzjjKKikHExJtWVZGuEawYoyQoubpfr5n3fk8uSHUiA9RgEVsx9QDhWIOShX1CW1vK8d4nN6NSYlK7pA__'
                }
                alt=""
              />
              <AvatarFallback
                className={cn(
                  'w-[26px] min-w-[26px] aspect-square rounded-full text-[calc(14rem/16)] bg-[#111111] flex items-center justify-center capitalize select-none',
                )}
              >
                US
              </AvatarFallback>
            </Avatar>
            <Text text="USDC" fontSize={13} fontWeight="medium" />
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
            <Text text="256,878.51" fontSize={13} fontWeight="regular" />
            <Text text="USDC" fontSize={13} fontWeight="regular" />
          </div>
        )
      },
    },
    {
      accessorKey: '可用余额',
      header: () => (
        <div className="flex items-center">
          <div>{t('可用余额')}</div>
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
            <Text text="256,878.51" fontSize={13} fontWeight="regular" />
            <Text text="USDC" fontSize={13} fontWeight="regular" />
          </div>
        )
      },
    },
    {
      accessorKey: 'UDSC价值',
      header: () => (
        <div className="flex items-center">
          <div>{t('UDSC价值')}</div>
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
            <Text text="$982,728.34" fontSize={13} fontWeight="regular" />
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

export default BalanceTable
