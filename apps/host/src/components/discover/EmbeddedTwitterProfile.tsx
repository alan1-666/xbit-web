export interface EmbeddedTwitterProfileProps {
  twitterUrl: string
}

export const EmbeddedTwitterProfile = (props: EmbeddedTwitterProfileProps) => {
  const { twitterUrl } = props
  const isProfile = !twitterUrl.includes('/status/')
  if (!isProfile) return <div>Twitter (X)</div>
  const username = twitterUrl.split('x.com/')[1].replace('/', '')
  return (
    <div className="w-80 p-0 h-auto border-none bg-transparent overflow-hidden">
      <div data-theme="dark" className="max-h-[50vh] overflow-y-auto no-scrollbar">
        {username}
      </div>
    </div>
  )
}
