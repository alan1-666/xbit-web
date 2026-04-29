import { useMemo, useState, useCallback } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@pages/home/data-table';
import { formatAddressWallet } from '@/lib/string';
import { formatNumberWithCommas } from '@/utils/helpers';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

interface RewardsRecordProps {
  type: 'invite' | 'history';
  data: any[];
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
  type, 
  data, 
  loading = false, 
  className = '',
  hasNextPage = false,
  isLoadingMore = false,
  onLoadMore,
  pageSize = 10,
  initialPage = 1
}: RewardsRecordProps) => {
  // 分页状态管理
  const [currentPage, setCurrentPage] = useState(initialPage);
  const { t } = useTranslation()
  // 处理加载更多
  const handleLoadMore = useCallback(() => {
    if (onLoadMore && hasNextPage && !isLoadingMore && !loading) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      onLoadMore(nextPage, pageSize);
    }
  }, [onLoadMore, hasNextPage, isLoadingMore, loading, currentPage, pageSize]);
  
  // 邀请奖励表格列定义 (4列)
  const inviteColumns: ColumnDef<any>[] = useMemo(() => [
    {
      accessorKey: 'address',
      header: () => (
        <div>{t('nodeAgent.address')}</div>
      ),
      cell: ({ row }) => (
        <span className="text-white text-[12px]">
          {formatAddressWallet(row.original.address)}
        </span>
      ),
    },
    {
      accessorKey: 'transactionVolume',
      header: () => (
        <div>{t('nodeAgent.transactionVolume')}</div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center">
          {row.original.chainId === 501424 ? (
          <img src="/images/cryptoDeposit/solana.svg" alt="" className="w-[12] h-[12] rounded-full mr-2" />
          ) : (
          <img src="/images/cryptoDeposit/usdc.svg" alt="" className="size-4 rounded-full mr-2" />
          )}
          <span className="text-white text-[12px]">
            ${formatNumberWithCommas(row.original.transactionVolume, 2)}
            {/* {row.original.transactionVolume.toLocaleString('en-US', { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 2 
            })} */}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'invitedWithdrawal',
      header: () => (
        <div>{t('nodeAgent.inviteReward')}</div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center">
           {row.original.chainId === 501424 ? (
          <img src="/images/cryptoDeposit/solana.svg" alt="" className="w-[12] h-[12] rounded-full mr-2" />
          ) : (
          <img src="/images/cryptoDeposit/usdc.svg" alt="" className="size-4 rounded-full mr-2" />
          )}
          {/* <img src="/images/cryptoDeposit/solana.svg" alt="" className="w-[12] h-[12] rounded-full mr-2" /> */}
          <span className="text-white text-[12px]">
            ${formatNumberWithCommas(row.original.invitedWithdrawal, 2)}
            {/* {row.original.invitedWithdrawal.toLocaleString('en-US', { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 2 
            })} */}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'date',
      header: () => (
        <div className="flex justify-end">
          <div>{t('nodeAgent.date')}</div>
        </div>
      ),
      cell: ({ row }) => (
        <span className="text-white text-[12px] flex justify-end">
          {dayjs(row.original.date).format('MM-DD')}
        </span>
      ),
    },
  ], []);

  // 历史记录表格列定义 (3列)
  const historyColumns: ColumnDef<any>[] = useMemo(() => [
    {
      accessorKey: 'transactionHash',
      header: () => (
        <div >Hash</div>
      ),
      cell: ({ row }) => (
        <span className="text-white text-[12px] underline" onClick={() => {
          window.open(`https://solscan.io/tx/${row.original.transactionHash}`, '_blank')
        }}>
          {formatAddressWallet(row.original.transactionHash)}
        </span>
      ),
    },
    {
      accessorKey: 'amount',
      header: () => (
        <div >{t('nodeAgent.withdrawalReward')}</div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center">
          {row.original.chainId === 501424 ? (
          <img src="/images/cryptoDeposit/solana.svg" alt="" className="w-[12] h-[12] rounded-full mr-2" />
          ) : (
          <img src="/images/cryptoDeposit/usdc.svg" alt="" className="size-4 rounded-full mr-2" />
          )}
          <span className="text-white text-[12px]">
            {formatNumberWithCommas(row.original.amount, 2)}
            {/* {row.original.withdrawalReward.toLocaleString('en-US', { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 2 
            })} */}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'updatedAt',
      header: () => (
        <div className="flex justify-end">
          <div>{t('nodeAgent.date')}</div>
        </div>
      ),
      cell: ({ row }) => (
        <span className="text-white text-[12px] flex justify-end">
          {dayjs(row.original.updatedAt).format('MM-DD')}
          {/* {formatDate(row.original.date)} */}
        </span>
      ),
      // sortingFn: (rowA, rowB) => {
      //   const timeA = new Date(rowA.original.createdAt).getTime();
      //   const timeB = new Date(rowB.original.createdAt).getTime();
      //   return timeA - timeB;
      // },
    },
  ], []);

  // 根据类型选择对应的列定义
  const columns = type === 'invite' ? inviteColumns : historyColumns;

  return (
    <div className={`w-full h-full flex flex-col ${className}`}>
      <style>{`
        .rewards-table-container tbody tr:nth-child(even) {
          background-color: rgba(236, 236, 237, 0.04) !important;
        }
        .rewards-table-container tbody tr:nth-child(odd) {
          background-color: transparent !important;
        }
        .rewards-table-container tbody tr:hover {
          background-color: rgba(236, 236, 237, 0.08) !important;
        }
      `}</style>
      <div className="rewards-table-container flex-1 min-h-0 overflow-hidden">
        <DataTable
          columns={columns}
          data={data}
          isLoading={loading}
          containerClassName="border-none overflow-auto h-full _hidescrollbar"
          useScrollWindow={false}
          tableClassName="w-full"
          tableHeaderClassName="text-[#FFFFFF50] text-[calc(1rem*(12/16))] font-[400]"
          tableHeaderRowClassName="border-none hover:bg-transparent"
          tableHeadClassName="text-left font-medium h-auto px-3"
          tableBodyRowClassName="border-none transition-colors"
          tableCellClassName="h-[48px] px-3 text-[12px]"
          noDataText={t('Activityrewards.noDataYet')}
          noDataClassName="!top-[120px]"
          // 加载更多相关属性
          onBottomReached={handleLoadMore}
          isShowLoadMore={isLoadingMore && hasNextPage && !loading}
          // isFetchMore={isLoadingMore}
          skeletonComponent={
            <div className="animate-pulse p-4">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="grid grid-cols-4 gap-4 py-4 border-b border-[#ECECED0A] last:border-b-0">
                  <div className="h-4 bg-gray-700 rounded w-20"></div>
                  <div className="h-4 bg-gray-700 rounded w-20"></div>
                  <div className="h-4 bg-gray-700 rounded w-20"></div>
                  <div className="h-4 bg-gray-700 rounded w-20"></div>
            
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
