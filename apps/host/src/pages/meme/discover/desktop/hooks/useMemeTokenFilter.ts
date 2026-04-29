import {useAppDispatch, useAppSelector} from "@/redux/store";
import {FilterFormData} from "@components/discover/filter/FilterFormData.ts";
import {homeActions} from "@/redux/modules/home.slice.ts";
import {useCallback} from "react";

export const useMemeTokenFilter = (filterKey: string) => {
  const dispatch = useAppDispatch()
  const currentFilter = useAppSelector(state => state.home.filters[filterKey] as FilterFormData)
  const onFiltersChanged = useCallback((filter: FilterFormData) => {
    dispatch(homeActions.setFilters({ key: filterKey, filter }))
  }, [dispatch, filterKey])
  const onResetFilter = useCallback(() => {
    dispatch(homeActions.resetFilter(filterKey))
  }, [dispatch, filterKey])
  return { currentFilter, onFiltersChanged, onResetFilter }
}
