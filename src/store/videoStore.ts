import { create } from 'zustand';
import { VideoData } from '@/types/video';

interface VideoState {
  currentVideoIndex: number;
  videos: VideoData[];
  loading: boolean;
  hasMore: boolean;
  setCurrentVideoIndex: (index: number) => void;
  fetchVideos: () => Promise<void>;
  fetchMoreVideos: () => Promise<void>;
}

// Guaranteed working videos
const workingVideos: VideoData[] = [
  {
    id: '1',
    username: 'mixkit_user',
    caption: 'Decorating the Christmas tree with my daughter #family',
    song: 'Christmas Joy - Holiday Mix',
    likes: 45689,
    comments: 1234,
    saves: 5678,
    shares: 910,
    views: 123456,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-mother-with-her-little-daughter-decorating-a-christmas-tree-39745-large.mp4',
    userAvatar: 'https://randomuser.me/api/portraits/women/44.jpg'
  },
  {
    id: '2',
    username: 'nature_moments',
    caption: 'Beautiful day in nature with marshmallows 🌿',
    song: 'Nature Sounds - Relaxing Mix',
    likes: 34567,
    comments: 987,
    saves: 6543,
    shares: 210,
    views: 87654,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-mother-with-her-little-daughter-eating-a-marshmallow-in-nature-39764-large.mp4',
    userAvatar: 'https://randomuser.me/api/portraits/women/65.jpg'
  },
  {
    id: '3',
    username: 'neon_vibes',
    caption: 'Neon aesthetic at night ✨ #neon',
    song: 'Neon Dreams - Synthwave',
    likes: 78901,
    comments: 2345,
    saves: 7890,
    shares: 432,
    views: 234567,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-1232-large.mp4',
    userAvatar: 'https://randomuser.me/api/portraits/women/22.jpg'
  },
  {
    id: '4',
    username: 'fashion_fotog',
    caption: 'Behind the scenes at our photoshoot 📸 #fashion',
    song: 'Camera Click - Studio Vibes',
    likes: 23456,
    comments: 876,
    saves: 5432,
    shares: 321,
    views: 98765,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-taking-photos-from-different-angles-of-a-model-34421-large.mp4',
    userAvatar: 'https://randomuser.me/api/portraits/men/32.jpg'
  },
  {
    id: '5',
    username: 'pool_days',
    caption: 'Pool day vibes 💦 #summer',
    song: 'Summer Splash - Pool Mix',
    likes: 67890,
    comments: 1543,
    saves: 8765,
    shares: 543,
    views: 345678,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-womans-feet-splashing-in-the-pool-1261-large.mp4',
    userAvatar: 'https://randomuser.me/api/portraits/women/29.jpg'
  }
];

export const useVideoStore = create<VideoState>((set, get) => ({
  currentVideoIndex: 0,
  videos: workingVideos,
  loading: false,
  hasMore: true,
  
  setCurrentVideoIndex: (index) => set({ currentVideoIndex: index }),
  
  fetchVideos: async () => {
    set({ loading: true });
    
    // Simply use working videos
    setTimeout(() => {
      set({ 
        videos: workingVideos, 
        loading: false,
        hasMore: true
      });
    }, 300);
  },
  
  fetchMoreVideos: async () => {
    const { loading, videos, hasMore } = get();
    
    if (loading || !hasMore) return;
    
    set({ loading: true });
    
    // Add more videos
    const moreVideos = workingVideos.map((video, index) => ({
      ...video,
      id: `more-${Date.now()}-${index}`,
      caption: `${video.caption} #viral`,
    }));
    
    setTimeout(() => {
      set({ 
        videos: [...videos, ...moreVideos.slice(0, 3)],
        loading: false,
        hasMore: videos.length < 12
      });
    }, 700);
  }
}));
