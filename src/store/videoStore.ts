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

// Sample video data for fallback - guaranteed to work reliably
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
    caption: 'Dancing in the sunset #dance',
    song: 'Summer Vibes - DJ Mix',
    likes: 7800,
    comments: 342,
    saves: 189,
    shares: 78,
    views: 42000,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-portrait-of-a-fashion-woman-with-silver-makeup-39875-large.mp4',
    userAvatar: 'https://randomuser.me/api/portraits/women/32.jpg'
  },
  {
    id: '5',
    username: 'user5',
    caption: 'Beach day! #summer',
    song: 'Beach Sounds - Relaxing',
    likes: 4300,
    comments: 156,
    saves: 87,
    shares: 32,
    views: 23000,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-water-1164-large.mp4',
    userAvatar: 'https://randomuser.me/api/portraits/men/85.jpg'
  }
];

export const useVideoStore = create<VideoState>((set, get) => ({
  currentVideoIndex: 0,
  videos: [], // Start with empty array instead of initialVideos
  loading: true, // Start with loading state
  hasMore: true,
  
  setCurrentVideoIndex: (index) => set({ currentVideoIndex: index }),
  
  fetchVideos: async () => {
    set({ loading: true });
    try {
      console.log("Attempting to fetch videos from Firebase...");
      
      // Try to get videos from Firebase first with longer timeout
      const firebasePromise = getFYPVideos(8);
      
      // Create a timeout promise
      const timeoutPromise = new Promise<VideoData[]>((resolve) => {
        setTimeout(() => {
          console.log("Firebase fetch timed out, falling back to sample videos");
          resolve([]);
        }, 5000); // 5 second timeout
      });
      
      // Race between the Firebase fetch and timeout
      const firebaseVideos = await Promise.race([firebasePromise, timeoutPromise]);
      
      if (firebaseVideos && firebaseVideos.length > 0) {
        // Filter out any videos with missing or invalid videoUrl
        const validVideos = firebaseVideos.filter(video => 
          video.videoUrl && 
          (video.videoUrl.startsWith('http://') || video.videoUrl.startsWith('https://'))
        );
        
        if (validVideos.length > 0) {
          console.log("Successfully loaded Firebase videos:", validVideos.length);
          set({ 
            videos: validVideos, 
            loading: false,
            hasMore: validVideos.length >= 5 // If we got a good number, assume there might be more
          });
          return;
        }
      }
      
      // If we don't get videos from Firebase, show a warning and use sample videos as fallback
      console.warn("No valid videos returned from Firebase, using fallback videos");
      set({ 
        videos: initialVideos,
        loading: false,
        hasMore: initialVideos.length > 5 // Allow for more videos to be loaded
      });
      
    } catch (error) {
      console.error('Failed to fetch videos from Firebase:', error);
      // In case of error, use sample videos as fallback
      console.log("Using fallback videos due to Firebase error");
      set({ 
        videos: initialVideos,
        loading: false,
        hasMore: initialVideos.length > 5
      });
    }
  },
  
  fetchMoreVideos: async () => {
    const { loading, videos, hasMore } = get();
    
    if (loading || !hasMore) return;
    
    set({ loading: true });
    try {
      console.log("Fetching more videos from Firebase...");
      
      // Try to get more videos from Firebase, skip the ones we already have
      const moreFirebaseVideos = await getFYPVideos(videos.length + 3);
      
      if (moreFirebaseVideos && moreFirebaseVideos.length > videos.length) {
        // Filter out videos we already have to avoid duplicates
        const existingIds = new Set(videos.map(v => v.id));
        const newVideos = moreFirebaseVideos.filter(v => !existingIds.has(v.id));
        
        if (newVideos.length > 0) {
          console.log("Loaded additional Firebase videos:", newVideos.length);
          set({ 
            videos: [...videos, ...newVideos], 
            loading: false,
            hasMore: newVideos.length >= 2 // If we got a decent number of new videos, assume there might be more
          });
          return;
        }
      }
      
      // If we don't get more videos from Firebase or got the same ones:
      console.log("No more unique videos available from Firebase");
      set({ hasMore: false, loading: false });
      
    } catch (error) {
      console.error('Failed to fetch more videos:', error);
      set({ loading: false });
    }
  }
}));
