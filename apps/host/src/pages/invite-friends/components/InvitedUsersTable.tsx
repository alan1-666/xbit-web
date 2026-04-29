import { useMemo, useState, useCallback } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@pages/home/data-table';
import { IconSortDown, IconSortUp } from '@/components/icon'
import InviteTypeDrawer from './inviteTypeDrawer'
import { useTranslation } from 'react-i18next'
import { formatAddressWallet } from '@/lib/string';
import { formatNumberWithCommas } from '@/utils/helpers';

// 数据类型定义
export interface InvitedUser {
  id: string;
  userAddress: string;
  date: string;
  transactionType: string;
  transactionAmount: number;
  accumulatedCommission: number;
}

interface InvitedUsersTableProps {
  data: InvitedUser[];
  loading?: boolean;
  className?: string;
  hasNextPage?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: (transactionType: string, page: number, pageSize: number) => void;
  pageSize?: number;
  initialPage?: number;
}
const InvitedUsersTable = ({ 
  data, 
  loading = false, 
  className = '',
  hasNextPage = false,
  isLoadingMore = false,
  onLoadMore,
  pageSize = 20,
  initialPage = 1
}: InvitedUsersTableProps) => {
// const InvitedUsersTable = ({ data, loading = false, className = '', hasNextPage, isLoadingMore, onLoadMore, pageSize, initialPage }: InvitedUsersTableProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [typeValue, setTypeValue] = useState<'ALL' | 'CONTRACT' | 'MEME' | 'SPOT'>('ALL')
  const [currentPage, setCurrentPage] = useState(initialPage);
  const { t } = useTranslation()
  // 处理加载更多
  const handleLoadMore = useCallback(() => {
    if (onLoadMore && hasNextPage && !isLoadingMore && !loading) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      onLoadMore(typeValue as 'ALL' | 'CONTRACT' | 'MEME' | 'SPOT', nextPage, pageSize);
    }
  }, [onLoadMore, hasNextPage, isLoadingMore, loading, currentPage, pageSize, typeValue]);


  // 自定义排序图标组件
  const SortIcon = ({ column, children }: { column: any; children: React.ReactNode }) => {
    const sortState = column.getIsSorted();
    // 根据排序状态确定图标颜色
    const getIconColor = (iconType: 'up' | 'down') => {
      if (sortState === 'asc' && iconType === 'up') {
        return '#00FFB4'; // 升序时上箭头变绿
      }
      if (sortState === 'desc' && iconType === 'down') {
        return '#00FFB4'; // 降序时下箭头变绿
      }
      return '#FFFFFF50'; // 默认颜色
    };
    return (
      <div 
        className="flex items-center gap-1 cursor-pointer select-none"
        onClick={() => {
          if (column.id === 'transactionType') {
            setIsOpen(true)
          } else {
            column.toggleSorting(column.getIsSorted() === 'asc')
          }
        }}
      > 
        <span className="text-[#FFFFFF50] text-[11px]">{children}</span>
        <div className="flex flex-col">
          {}
          {column.id === 'transactionType' ? (
            <img src="/images/icons/icon-filter.svg" alt="" width={10} height={10} />
          ) : (
            <>
              <IconSortUp currentColor={getIconColor('up')} />
              <IconSortDown currentColor={getIconColor('down')} />
            </>
          )}
        </div>
      </div>
    );
  };
  const handleTypeChange = (value: string) => {
    setTypeValue(value as 'ALL' | 'CONTRACT' | 'MEME' | 'SPOT')
    setCurrentPage(1) // 重置页码
    setIsOpen(false)
    // 重新请求接口
    onLoadMore?.(value, 1, pageSize)
  }

  // 定义表格列
  const columns: ColumnDef<InvitedUser>[] = useMemo(() => [
    {
      accessorKey: 'userAddress',
      header: ({ column }) => (
        <SortIcon column={column}>{t('nodeAgent.userAddressDate')}</SortIcon>
      ),
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-white text-[12px]">
            {formatAddressWallet(row.original.userAddress)}
          </span>
          <span className="text-[#FFFFFFB2] text-[12px] mt-1">
            {row.original.date}
          </span>
        </div>
      ),
      sortingFn: (rowA, rowB) => {
        const timeA = new Date(rowA.original.date).getTime();
        const timeB = new Date(rowB.original.date).getTime();
        return timeA - timeB;
      },
    },
    {
      accessorKey: 'transactionType',
      header: ({ column }) => (
        <div className='w-[50px]'>
          <SortIcon column={column}>{t('nodeAgent.type')}</SortIcon>
        </div>
        
      ),
      cell: ({ row }) => (
        <span className="text-white text-[12px]">
          {row.original.transactionType === "MEME" ? t('nodeAgent.tradingOverview.meme') :  t('nodeAgent.tradingOverview.futures')}
        </span>
      ),
    },
    {
      accessorKey: 'transactionAmount',
      header: ({ column }) => (
        <SortIcon column={column}>{t('nodeAgent.transactionAmount')}</SortIcon>
      ),
      cell: ({ row }) => (
        <span className="text-white text-[12px]">
          {formatNumberWithCommas(row.original?.transactionAmount, 6)}
       
        </span>
      ),
    },
    {
      accessorKey: 'accumulatedCommission',
      header: ({ column }) => (
        <div className="flex justify-end">
        <SortIcon column={column}>{t('nodeAgent.accumulatedCommission')}</SortIcon>
      </div>
      ),
      cell: ({ row }) => (
        <span className="text-white text-[12px] flex justify-end">
          {formatNumberWithCommas(row.original?.accumulatedCommission, 6)}
        
        </span>
      ),
    },
  ], []);

  const isFullHeight = className.includes('h-full')
  
  return (
    <div className={`w-full ${className} ${isFullHeight ? 'h-full flex flex-col' : ''}`}>
      <div className={isFullHeight ? 'flex-1 min-h-0 overflow-hidden' : ''}>
        <DataTable
          columns={columns}
          data={data}
          isLoading={loading}
          containerClassName={isFullHeight ? "border-none overflow-auto h-full _hidescrollbar" : "border-none overflow-hidden"}
          tableClassName="w-full"
          tableHeaderClassName="text-[#FFFFFF50] border-none"
          tableHeaderRowClassName="border-none hover:bg-transparent "
          tableHeadClassName="text-left font-medium h-auto pl-0"
          // tableBodyClassName=""
          tableBodyRowClassName="border-none  transition-colors"
          tableCellClassName="h-auto pl-0"
          noDataText={t('Activityrewards.noDataYet')}
          noDataClassName="!top-[120px]"
          // 加载更多相关属性
          onBottomReached={handleLoadMore}
          isShowLoadMore={isLoadingMore && hasNextPage && !loading}
          useScrollWindow={false}
          // isFetchMore={isLoadingMore}
          skeletonComponent={
          <div className="animate-pulse p-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="grid grid-cols-4 gap-4 py-4 border-b border-[#ECECED0A] last:border-b-0">
                <div className="flex flex-col space-y-2">
                  <div className="h-4 bg-gray-700 rounded w-20"></div>
                  {/* <div className="h-3 bg-gray-700 rounded w-16"></div> */}
                </div>
                <div className="h-4 bg-gray-700 rounded w-12"></div>
                <div className="h-4 bg-gray-700 rounded w-16"></div>
                <div className="h-4 bg-gray-700 rounded w-16"></div>
              </div>
            ))}
          </div>
        }
        // initialSorting={[
        //   {
        //     id: 'userAddress', // 默认按时间排序
        //     desc: true
        //   }
        // ]}
        />
      </div>
      <InviteTypeDrawer isOpen={isOpen} onClose={() => setIsOpen(false)}  onChange={(value)=>{handleTypeChange(value)}} value={typeValue}/>
    </div>
  );
};

export default InvitedUsersTable;
