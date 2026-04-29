import { Loading } from '@components/common/Loading.tsx'

export interface LoadingIndicatorProps {
  className?: string
}

export const LoadingIndicator = (props: LoadingIndicatorProps) => {
  const { className } = props
  return <Loading className={className} />
}
