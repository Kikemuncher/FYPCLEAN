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

// Sample video data for initial load with reliable video sources
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
    views: 5600,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-mother-with-her-little-daughter-decorating-a-christmas-tree-39745-large.mp4',
    userAvatar: 'https://randomuser.me/api/portraits/women/81.jpg'
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
    views: 12000,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-mother-with-her-little-daughter-eating-a-marshmallow-in-nature-39764-large.mp4',
    userAvatar: 'https://randomuser.me/api/portraits/men/32.jpg'
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
    views: 32000,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-1232-large.mp4',
    userAvatar: 'https://randomuser.me/api/portraits/women/65.jpg'
  },
  {
    id: '4',
    username: 'user4',
    caption: "Cannot believe this happened! #funny",
    song: 'Funny Audio - Creator',
    likes: 8900,
    comments: 310,
    saves: 200,
    shares: 150,
    views: 48000,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-taking-photos-from-different-angles-of-a-model-34421-large.mp4',
    userAvatar: 'https://randomuser.me/api/portraits/men/44.jpg'
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
    views: 92000,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-womans-feet-splashing-in-the-pool-1261-large.mp4',
    userAvatar: 'https://randomuser.me/api/portraits/women/33.jpg'
  }
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
      console.log("Attempting to fetch videos from Firebase...");
      // Try Firebase first but handle gracefully if it fails
      try {
        const videos = await getFYPVideos();
        if (videos && videos.length > 0) {
          console.log("Got videos from Firebase:", videos.length);
          set({ videos, loading: false });
          return;
        }
      } catch (error) {
        console.error("Firebase fetch failed, using sample videos:", error);
      }
      
      // If Firebase fails or returns no videos, use sample videos
      console.log("Using sample videos instead");
      set({ loading: false }); // Keep initialVideos
      
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
      // For simplicity, we'll just add more sample videos
      // In a real app, you'd fetch from Firebase with pagination
      
      // Create new sample videos based on the existing ones but with different IDs
      const moreVideos = initialVideos.map((video, index) => ({
        ...video,
        id: `more-${index + 1}`,
        username: `${video.username}_more`,
        caption: `${video.caption} #more`,
      }));
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (videos.length < 10) {
        // Only add more if we don't have too many already
        set({ 
          videos: [...videos, ...moreVideos.slice(0, 2)], 
          loading: false,
          hasMore: videos.length < 8 // Stop after a reasonable amount
        });
      } else {
        set({ hasMore: false, loading: false });
      }
    } catch (error) {
      console.error('Failed to fetch more videos:', error);
      set({ loading: false });
    }
  }
}));
