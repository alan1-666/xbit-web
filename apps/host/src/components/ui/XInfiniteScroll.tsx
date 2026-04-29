import { cn } from '@/lib/utils';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { ReactNode, useCallback, useEffect, useMemo, useRef } from 'react';
import { EmptyList } from '../discover/EmptyList';
import { LoadMore } from '../ui/loading-spinner';
import { SkeletonList } from '../ui/skeleton';

interface XInfiniteScrollProps<T> {
  data: T[];
  isLoading: boolean;
  hasNextPage: boolean | undefined;
  isFetchingNextPage: boolean;
  fetchNextPage: () => Promise<any>;
  renderItem: (item: T, index: number) => ReactNode;
  estimateSize?: number;
  containerClassName?: string;
  emptyComponent?: ReactNode;
  loadingComponent?: ReactNode;
  height?: string;
  overscan?: number;
}

function XInfiniteScroll<T>({
  data,
  isLoading,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  renderItem,
  estimateSize = 105, // Default row height estimate
  containerClassName = "h-[calc(100dvh-220px)] pb-[55px] no-scrollbar break-keep overflow-y-auto",
  emptyComponent = <EmptyList />,
  loadingComponent = <SkeletonList count={10} classNameItem="h-[97px]" />,
  overscan = 50,
}: XInfiniteScrollProps<T>) {
  // Create a reference to the scroll container
  const parentRef = useRef<HTMLDivElement>(null);

  // Virtualizer instance
  const rowVirtualizer = useWindowVirtualizer({
    count: hasNextPage ? data.length + 1 : data.length,
    estimateSize: () => estimateSize,
    overscan,
    isScrollingResetDelay: 50,
    scrollMargin: parentRef.current?.offsetTop ?? 0,
    useAnimationFrameWithResizeObserver: true,
    getItemKey: (index) => `XInfiniteScroll-${index}`,
  });

  const handleOnLoadMore = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    fetchNextPage().catch(error => {
      console.error('Error loading more items:', error);
    });
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const virtualItems = rowVirtualizer.getVirtualItems();
  const lastItem = useMemo(() => {
    return virtualItems[virtualItems.length - 1];
  }, [virtualItems]);

  useEffect(() => {
    const lastItem = virtualItems[virtualItems.length - 1];
    if (!lastItem) return;
    const lastIndex = lastItem.index;
    if (lastIndex >= data.length - 3) {
      handleOnLoadMore();
    }
  }, [virtualItems, data.length, handleOnLoadMore]);

  if (isLoading) {
    return <>{loadingComponent}</>;
  }

  return (
    <div
      ref={parentRef}
      className={cn('h-full pb-5', containerClassName)}
      style={{ contentVisibility: 'auto' }}
    >
      {data.length === 0 ? (
        emptyComponent
      ) : (
        <div
          className="relative w-full"
          style={{ height: `${rowVirtualizer.getTotalSize() + (hasNextPage ? estimateSize : 0)}px` }}
        >
          {virtualItems.map((virtualItem) => {
            const item = data[virtualItem.index];
            return (
              <div
                key={virtualItem.key}
                data-index={virtualItem.index}
                className={cn('absolute top-0 left-0 w-full', `h-[${estimateSize}px]`)}
                style={{
                  transform: `translateY(${virtualItem.start - 74}px)`,
                }}
              >
                {renderItem(item, virtualItem.index)}
              </div>
            );
          })}
          {hasNextPage && (
            <div
              className={cn('absolute top-0 left-0 w-full h-[84px] flex justify-center items-center pt-3 pb-[5px]')}
              style={{
                transform: lastItem ? `translateY(${lastItem.start - rowVirtualizer.options.scrollMargin}px)` : '',
              }}
            >
              <LoadMore />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default XInfiniteScroll;