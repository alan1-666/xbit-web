import { usePolymarketTwitterPosts } from '@/modules/prediction/hooks/usePolymarketTwitterPosts'
import { TwitterCategory, Post } from '@/@generated/gql/graphql-prediction'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

// Function to extract content and URL from post text
const extractContentAndUrl = (text: string): { content: string; url: string | null } => {
  // Regular expression to match all URLs in the text
  // Matches http/https URLs including t.co links and other common URL patterns
  const urlRegex = /https?:\/\/[^\s]+/g

  // Extract the first URL found (for potential future use)
  const firstUrlMatch = text.match(urlRegex)
  const url = firstUrlMatch ? firstUrlMatch[0] : null

  // Remove all URLs from the text
  const content = text.replace(urlRegex, '').replace('👉', '').trim()

  return { content, url }
}

// Helper function to get category display text
const getCategoryText = (category: string, t: (key: string) => string): string => {
  switch (category) {
    case 'NEW_POLYMARKET':
      return t('prediction.posts.categories.newPolymarket') || 'New Polymarket'
    case 'BREAKING':
      return t('prediction.posts.categories.breaking') || 'Breaking'
    case 'JUST_IN':
      return t('prediction.posts.categories.breaking') || 'Breaking'
    default:
      return t('prediction.posts.categories.newPolymarket') || 'New Polymarket'
  }
}

// Skeleton component for loading state
const TwitterPostSkeleton = () => {
  return (
    <div className="border-[#1e1e1e] border-b border-solid flex flex-col gap-2.5 py-4">
      <Skeleton className="h-[30px] w-[120px] rounded-full" />
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-3 w-20" />
    </div>
  )
}

const TwitterPostSkeletonList = () => {
  return (
    <div className="flex flex-col">
      {Array.from({ length: 6 }).map((_, index) => (
        <TwitterPostSkeleton key={index} />
      ))}
    </div>
  )
}

// Individual Twitter Post Card Component
interface TwitterPostCardProps {
  post: Post
}

const TwitterPostCard = ({ post }: TwitterPostCardProps) => {
  const { t } = useTranslation()
  const { content } = extractContentAndUrl(post.text)

  const handleClick = () => {
    if (post.tweetUrl) {
      window.open(post.tweetUrl, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div
      className={`border-[#1e1e1e] border-b border-solid flex flex-col gap-2.5 rounded-xl px-2 py-4 cursor-pointer hover:bg-[#1a1a1a] transition-colors`}
      onClick={handleClick}
    >
      {/* Category Tag */}
      <div className="bg-[#212127] flex h-7.5 items-center justify-center px-3 py-1.25 rounded-full w-fit">
        <div className="flex flex-col font-medium justify-center leading-tight">
          <p className="text-[#777] text-xs text-center whitespace-nowrap leading-5">
            {getCategoryText(post.category, t)}
          </p>
        </div>
      </div>

      {/* Post Content */}
      <p className="font-semibold leading-6 text-white text-base tracking-[0.15px] whitespace-pre-wrap">{content}</p>

      {post.imageUrl && (
        <div className="w-full h-auto max-h-60 overflow-hidden rounded-lg">
          <img src={post.imageUrl} alt="Post Image" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Posted Date */}
      <div className="font-normal leading-tight">
        <p className="text-[#777] text-xs whitespace-nowrap leading-3">{dayjs(post.postedAt).format('MMM D HH:mm')}</p>
      </div>
    </div>
  )
}

// Main TwitterPostsList Component
export const TwitterPostsList = () => {
  const {
    data: posts,
    isLoading,
    error,
  } = usePolymarketTwitterPosts({
    category: TwitterCategory.All,
    enabled: true,
  })

  if (isLoading) {
    return <TwitterPostSkeletonList />
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <p className="text-[#777] text-sm mb-4">Failed to load Twitter posts</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    )
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <p className="text-[#777] text-sm">No Twitter posts available</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {posts.map((post) => (
        <TwitterPostCard key={post.tweetId} post={post} />
      ))}
    </div>
  )
}
