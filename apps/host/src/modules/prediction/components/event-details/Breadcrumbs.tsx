import { Breadcrumb, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { BreadcrumbItem, BreadcrumbList } from '@components/ui/breadcrumb.tsx'
import { Link } from 'react-router-dom'
import { NAVIGATIONS } from '@/lib/navigations.ts'

export interface BreadcrumbsProps {
  page: string
}

export const Breadcrumbs = (props: BreadcrumbsProps) => {
  const { page } = props
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to={NAVIGATIONS.prediction.home()}>Prediction Markets</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{page}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
