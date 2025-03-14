import { create } from 'zustand';
import { VideoData } from '@/types/video';
import { getFYPVideos } from '@/lib/firebaseService';

interface VideoState {
  currentVideoIndex: number;
  videos: VideoData[];
  loading: boolean;
  hasMore: boolean;
  setCurrentVideoIndex: (index: number) => void;
  fetchVideos: () => Promise<void>;
  fetchMoreVideos: () => Promise<void>;
}

// Sample video data for initial load
const initialVideos: VideoData[] = [
  {
    id: '1',
    username: 'user1',
    caption: 'This is a cool video #fyp',
    song: 'Original Sound - user1',
    likes: 1200,
    comments: 56,
    saves: 20,
    shares: 30,
    videoUrl: 'https://i.imgur.com/fz7AGxc.mp4',
    userAvatar: 'https://placehold.co/100x100',
    views: 5600
  },
  {
    id: '2',
    username: 'user2',
    caption: 'Another awesome video #trending',
    song: 'Popular Song - Artist',
    likes: 2500,
    comments: 120,
    saves: 85,
    shares: 45,
    videoUrl: 'https://i.imgur.com/FTBZJPJ.mp4',
    userAvatar: 'https://placehold.co/100x100',
    views: 12000
  },
  {
    id: '3',
    username: 'user3',
    caption: 'Check this out! #viral',
    song: 'Viral Sound - Famous',
    likes: 5600,
    comments: 230,
    saves: 140,
    shares: 90,
    videoUrl: 'https://i.imgur.com/Dhbly0P.mp4',
    userAvatar: 'https://placehold.co/100x100',
    views: 32000
  },
  {
    id: '4',
    username: 'user4',
    caption: "Can't believe this happened! #funny",
    song: 'Funny Audio - Creator',
    likes: 8900,
    comments: 310,
    saves: 200,
    shares: 150,
    videoUrl: 'https://i.imgur.com/GWQZUFh.mp4',
    userAvatar: 'https://placehold.co/100x100',
    views: 48000
  },
  {
    id: '5',
    username: 'user5',
    caption: 'This is amazing! #wow',
    song: 'Amazing - Artist',
    likes: 15000,
    comments: 450,
    saves: 350,
    shares: 280,
    videoUrl: 'https://i.imgur.com/sFPVL8W.mp4',
    userAvatar: 'https://placehold.co/100x100',
    views: 92000
  },
];

export const useVideoStore = create<VideoState>((set, get) => ({
  currentVideoIndex: 0,
  videos: initialVideos,
  loading: false,
  hasMore: true,
  
  setCurrentVideoIndex: (index) => set({ currentVideoIndex: index }),
  
  fetchVideos: async () => {
    set({ loading: true });
    try {
      const videos = await getFYPVideos();
      if (videos.length > 0) {
        set({ videos, loading: false });
      } else {
        // If no videos from Firebase, use initial sample videos
        set({ loading: false });
      }
    } catch (error) {
      console.error('Failed to fetch videos:', error);
      set({ loading: false });
    }
  },
  
  fetchMoreVideos: async () => {
    const { loading, videos, hasMore } = get();
    
    if (loading || !hasMore) return;
    
    set({ loading: true });
    try {
      const moreVideos = await getFYPVideos(5);
      
      if (moreVideos.length > 0) {
        // Filter out duplicates
        const newVideos = moreVideos.filter(
          newVideo => !videos.some(video => video.id === newVideo.id)
        );
        
        if (newVideos.length > 0) {
          set({ videos: [...videos, ...newVideos], loading: false });
        } else {
          set({ hasMore: false, loading: false });
        }
      } else {
        set({ hasMore: false, loading: false });
      }
    } catch (error) {
      console.error('Failed to fetch more videos:', error);
      set({ loading: false });
    }
  }
}));
