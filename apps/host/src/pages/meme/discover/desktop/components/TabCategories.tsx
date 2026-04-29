import { CategoriesBar } from './CategoriesBar'
import { useEffect, useState } from 'react'
import { CategoryTokensList } from '@pages/meme/discover/desktop/components/CategoryTokensList.tsx'
import { AllCategoriesList } from './AllCategoriesList'
import { useSearchParams } from 'react-router-dom'
import {TAB_CLASSIFICATION} from "@components/discover/DiscoverTabs.tsx";

const getDefaultTab = () => {
  const params = new URLSearchParams(window.location.search)
  const category = params.get('category')
  return category || 'all'
}

export const TabCategories = () => {
  const [activeTab, setActiveTab] = useState(getDefaultTab())
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    if (activeTab === 'all') {
      searchParams.set('category', '')
      searchParams.set('page', TAB_CLASSIFICATION)
      setSearchParams(searchParams, { replace: true })
    } else {
      searchParams.set('category', activeTab)
      searchParams.set('page', TAB_CLASSIFICATION)
      setSearchParams(searchParams, { replace: true })
    }
  }, [activeTab])

  return (
    <div className="px-4 py-2">
      <CategoriesBar activeTab={activeTab} onChangeTab={setActiveTab} />
      {activeTab === 'all' ? (
        <AllCategoriesList onRowClick={(category) => setActiveTab(category.categoryId)} />
      ) : (
        <CategoryTokensList categoryId={activeTab} />
      )}
    </div>
  )
}
