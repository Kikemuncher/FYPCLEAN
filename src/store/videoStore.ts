// src/store/videoStore.ts
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

// Sample videos that are guaranteed to work
const sampleVideos: VideoData[] = [
  {
    id: 'sample-1',
    username: 'mixkit_user',
    caption: 'Christmas decorations with family',
    song: 'Holiday Vibes',
    likes: 45600,
    comments: 1230,
    saves: 5670,
    shares: 910,
    views: 123000,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-mother-with-her-little-daughter-decorating-a-christmas-tree-39745-large.mp4',
    userAvatar: 'https://randomuser.me/api/portraits/women/44.jpg'
  },
  {
    id: 'sample-2',
    username: 'nature_lover',
    caption: 'Nature day with marshmallows 🌿',
    song: 'Nature Sounds',
    likes: 34500,
    comments: 980,
    saves: 6540,
    shares: 210,
    views: 87600,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-mother-with-her-little-daughter-eating-a-marshmallow-in-nature-39764-large.mp4',
    userAvatar: 'https://randomuser.me/api/portraits/women/65.jpg'
  },
  {
    id: 'sample-3',
    username: 'neon_vibes',
    caption: 'Neon lights at night ✨',
    song: 'Neon Dreams',
    likes: 78900,
    comments: 2340,
    saves: 7890,
    shares: 430,
    views: 234000,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-1232-large.mp4',
    userAvatar: 'https://randomuser.me/api/portraits/women/22.jpg'
  },
  {
    id: 'sample-4',
    username: 'fashion_photo',
    caption: 'Fashion shoot BTS 📸',
    song: 'Studio Vibes',
    likes: 23400,
    comments: 870,
    saves: 5430,
    shares: 320,
    views: 98700,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-taking-photos-from-different-angles-of-a-model-34421-large.mp4',
    userAvatar: 'https://randomuser.me/api/portraits/men/32.jpg'
  },
  {
    id: 'sample-5',
    username: 'pool_vibes',
    caption: 'Pool day 💦 #summer',
    song: 'Summer Splash',
    likes: 67800,
    comments: 1540,
    saves: 8760,
    shares: 540,
    views: 345000,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-womans-feet-splashing-in-the-pool-1261-large.mp4',
    userAvatar: 'https://randomuser.me/api/portraits/women/29.jpg'
  }
];

export const useVideoStore = create<VideoState>((set, get) => ({
  currentVideoIndex: 0,
  videos: sampleVideos, // Start with sample videos
  loading: false,
  hasMore: true,
  
  setCurrentVideoIndex: (index) => set({ currentVideoIndex: index }),
  
  // Simple function that just returns the sample videos
  fetchVideos: async () => {
    set({ loading: true });
    
    // Simulate a network request
    setTimeout(() => {
      set({ 
        videos: sampleVideos, 
        loading: false,
        hasMore: true
      });
    }, 500);
  },
  
  // Get more sample videos
  fetchMoreVideos: async () => {
    const { loading, videos, hasMore } = get();
    
    if (loading || !hasMore) return;
    
    set({ loading: true });
    
    // Create more variations of the sample videos
    const moreVideos = sampleVideos.map((video, index) => ({
      ...video,
      id: `more-${Date.now()}-${index}`,
      caption: `${video.caption} #trending`,
    }));
    
    // Simulate a network request
    setTimeout(() => {
      set({ 
        videos: [...videos, ...moreVideos.slice(0, 3)],
        loading: false,
        hasMore: videos.length < 15
      });
    }, 700);
  }
}));
