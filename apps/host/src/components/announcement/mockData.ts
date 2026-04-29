export interface AnnouncementSlide {
  id: string
  mediaUrl: string
  mediaType: 'image' | 'video'
  title: string
  description: string
}

export const mockAnnouncements: AnnouncementSlide[] = [
  {
    id: 'announcement-1',
    // Public image from Unsplash
    mediaUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80',
    mediaType: 'image',
    title: '标题标题标题标题标题标题',
    description: '内容内容内容内容内容内容内容内容内容内容内容内容内容',
  },
  {
    id: 'announcement-2',
    // Sample video from W3Schools (public domain)
    mediaUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    mediaType: 'video',
    title: 'Video Demo: Big Buck Bunny',
    description: 'This is a test video to verify video playback with loop and muted settings.',
  },
  {
    id: 'announcement-3',
    // Public image from Unsplash - crypto/trading theme
    mediaUrl: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&q=80',
    mediaType: 'image',
    title: 'Welcome to XBIT',
    description: 'Your gateway to cryptocurrency trading. Start trading with low fees, high security, and 24/7 support.',
  },
]
