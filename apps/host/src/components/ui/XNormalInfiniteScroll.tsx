import { cn } from '@/lib/utils';
import { debounce } from 'lodash-es';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { EmptyList } from '../discover/EmptyList';
import { LoadMore } from './loading-spinner';
import { SkeletonList } from './skeleton';


/**
 * XNormalInfiniteScroll is a component that implements infinite scrolling functionality.
 * It renders a list of items and fetches more items when the user scrolls to the bottom.
 * It supports loading states, empty states, and custom rendering for items.  
 */
interface XNormalInfiniteScrollProps<T> {
  data: T[];
  isLoading: boolean;
  fetchMore?: () => void
  hasMore?: boolean
  renderItem: (item: T, index: number) => ReactNode;
  containerClassName?: string;
  emptyComponent?: ReactNode;
  loadingComponent?: ReactNode;
  preloadPage?: number; // Number of pages to preload
  preloadHeight?: number; // Height of the preloaded items
}

function XNormalInfiniteScroll<T>({
  data,
  isLoading = false,
  fetchMore,
  hasMore = true,
  renderItem,
  containerClassName = "h-[calc(100dvh-220px)] pb-[55px]",
  emptyComponent = <EmptyList />,
  loadingComponent = <SkeletonList count={10} classNameItem="h-[97px]" />,
  preloadHeight = 100, // Default to preloading height of 100px
}: XNormalInfiniteScrollProps<T>) {
  const hasMoreRef = useRef(!!hasMore);
  const fetchMoreRef = useRef(fetchMore);
  useEffect(() => { hasMoreRef.current = !!hasMore; }, [hasMore]);
  useEffect(() => { fetchMoreRef.current = fetchMore; }, [fetchMore]);
  useEffect(() => {
    const handleScroll = () => {
      const target = document.documentElement;
      if (target.scrollHeight - target.scrollTop - target.clientHeight < preloadHeight && fetchMoreRef.current && hasMoreRef.current) {
        Promise.resolve(fetchMoreRef.current())
          .finally(() => {
          })
      }
    };
    const debouncedHandleScroll = debounce(handleScroll, 200);
    window.addEventListener('scroll', debouncedHandleScroll as any);
    return () => {
      window.removeEventListener('scroll', debouncedHandleScroll as any);
    };
  }, [preloadHeight]);

  //trigger fetchNextPage preloadPage times on mount data
  // useEffect(() => {
  //   if (data.length > 0 && hasNextPage && !isFetchingNextPage) {
  //     const preloadCount = preloadPage > 0 ? preloadPage : 1;
  //     for (let i = 0; i < preloadCount; i++) {
  //       fetchNextPage();
  //     }
  //   }
  // }, []); 



  if (isLoading) return <>{loadingComponent}</>;

  return (
    <div className={cn("overflow-y-auto", containerClassName)}>
      {data.length === 0 && !isLoading ? (
        emptyComponent
      ) : (
        <>
          {data.map((item, idx) => renderItem(item, idx))}
          <div className="h-[80px] w-full flex justify-center items-center pt-[0px]">
            <LoadMore />
          </div>
        </>
      )}
    </div>
  );
}

export default XNormalInfiniteScroll;
