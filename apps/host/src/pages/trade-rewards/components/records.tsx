import { useMemo, useState, useCallback } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@pages/home/data-table';
import { useTranslation } from 'react-i18next';
import { formatAddressWallet } from '@/lib/string';
import dayjs from 'dayjs';

// 历史记录数据类型  
export interface HistoryRecord {
  id: string;
  transactionHash: string;
  amount: number;
  createdAt: string;
  chainId: number;
}

interface RewardsRecordProps {
  data: HistoryRecord[];
  loading?: boolean;
  className?: string;
  // 分页相关
  hasNextPage?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: (page: number, pageSize: number) => void;
  // 分页配置
  pageSize?: number;
  initialPage?: number;
}

const rewardsRecord = ({ 
  data, 
  loading = false, 
  className = '',
  hasNextPage = false,
  isLoadingMore = false,
  onLoadMore,
  pageSize = 10,
  initialPage = 1
}: RewardsRecordProps) => {
  const { t } = useTranslation()
  
  // 分页状态管理
  const [currentPage, setCurrentPage] = useState(initialPage);
  
  // 处理加载更多
  const handleLoadMore = useCallback(() => {
    if (onLoadMore && hasNextPage && !isLoadingMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      onLoadMore(nextPage, pageSize);
    }
  }, [onLoadMore, hasNextPage, isLoadingMore, currentPage, pageSize]);


  // 历史记录表格列定义 (3列)
  const Columns: ColumnDef<HistoryRecord>[] = useMemo(() => [
    {
      accessorKey: 'transactionHash',
      header: () => (
        <div>Hash</div>
      ),
      cell: ({ row }) => (
        <span className="text-white text-[12px] underline" 
          onClick={() => {
            if(row.original.chainId === 501424){
              window.open(`https://solscan.io/tx/${row.original?.transactionHash}`, '_blank')
            }else{
              window.open(`https://arbiscan.io/tx/${row.original?.transactionHash}`, '_blank')
            }
          }}
        >
          {formatAddressWallet(row.original?.transactionHash)}
        </span>
      ),
    },
    {
      accessorKey: 'amount',
      header: () => (
        <div>{t('Activityrewards.ClaimReward')}</div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center">
          {row.original.chainId === 501424 ? (
            <img src="/images/cryptoDeposit/solana.svg" alt="" className="w-[12] h-[12] rounded-full mr-2" />
          ) : (
            <img src="/images/cryptoDeposit/usdc.svg" alt="" className="size-4 rounded-full mr-2" />
          )}
          <span className="text-white text-[12px]">
            {row.original.amount}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: () => (
        <div className="flex justify-end">
          <div>{t('Activityrewards.data')}</div>
        </div>
      ),
      cell: ({ row }) => (
        <span className="text-white text-[12px] flex justify-end">
          {/* 显示年月日 时间 8-25 10:00:00 */}
          {dayjs(row.original.createdAt).format('MM-DD HH:mm:ss')}
        </span>
      ),
      // sortingFn: (rowA, rowB) => {
      //   const timeA = new Date(rowA.original.date).getTime();
      //   const timeB = new Date(rowB.original.date).getTime();
      //   return timeA - timeB;
      // },
    },
  ], []);
  return (
    <div className={`w-full ${className}`}>
      <style>{`
        .rewards-table-container tbody tr:nth-child(even) {
          background-color: #18181B !important;
        }
        .rewards-table-container tbody tr:nth-child(odd) {
          background-color: transparent !important;
        }
        .rewards-table-container tbody tr:hover {
          background-color: rgba(236, 236, 237, 0.08) !important;
        }
      `}</style>
      <div className="rewards-table-container">
        <DataTable
          columns={Columns}
          data={data}
          isLoading={loading}
          containerClassName="border-none overflow-hidden"
          tableClassName="w-full"
          tableHeaderClassName="text-[#FFFFFF50] text-[calc(1rem*(12/16))] font-[400] border-b border-[#79778C16]"
          tableHeaderRowClassName="border-none hover:bg-transparent"
          tableHeadClassName="text-left font-medium h-auto p-3"
          tableBodyRowClassName="border-none transition-colors"
          tableCellClassName="h-[48px] px-3 text-[12px]"
          noDataText={t('Activityrewards.noDataYet')}
          noDataClassName="!top-[150px]"
          // 加载更多相关属性
          onBottomReached={handleLoadMore}
          isShowLoadMore={isLoadingMore && hasNextPage && !loading}
          skeletonComponent={
            <div className="animate-pulse">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="grid grid-cols-3 gap-5 py-4 border-b border-[#ECECED0A] last:border-b-0">
                  <div className="h-4 bg-gray-700 rounded w-20"></div>
                  <div className="h-4 bg-gray-700 rounded w-16"></div>
                  <div className="h-4 bg-gray-700 rounded w-16"></div>
                </div>
              ))}
            </div>
          }
        />
      </div>
    </div>
  );
};

export default rewardsRecord;
