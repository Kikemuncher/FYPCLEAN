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

export const useVideoStore = create<VideoState>((set, get) => ({
  currentVideoIndex: 0,
  videos: [], // Start with empty array
  loading: true, // Start in loading state
  hasMore: true,
  
  setCurrentVideoIndex: (index) => set({ currentVideoIndex: index }),
  
  // Only fetch from Firebase, exactly like working project
  fetchVideos: async () => {
    set({ loading: true });
    
    try {
      console.log("Fetching videos from Firebase");
      const firebaseVideos = await getFYPVideos(10);
      
      if (firebaseVideos && firebaseVideos.length > 0) {
        console.log(`Successfully loaded ${firebaseVideos.length} videos from Firebase`);
        
        set({ 
          videos: firebaseVideos, 
          loading: false,
          hasMore: firebaseVideos.length >= 5
        });
      } else {
        console.warn("No videos returned from Firebase");
        set({ 
          videos: [], 
          loading: false,
          hasMore: false
        });
      }
      
    } catch (error) {
      console.error('Failed to fetch videos from Firebase:', error);
      set({ 
        loading: false,
        hasMore: false
      });
    }
  },
  
  // Get more videos only from Firebase
  fetchMoreVideos: async () => {
    const { loading, videos, hasMore } = get();
    
    if (loading || !hasMore) return;
    
    set({ loading: true });
    
    try {
      console.log("Fetching more Firebase videos");
      const moreVideos = await getFYPVideos(videos.length + 5);
      
      if (moreVideos && moreVideos.length > videos.length) {
        // Filter out videos we already have
        const existingIds = new Set(videos.map(v => v.id));
        const newVideos = moreVideos.filter(v => !existingIds.has(v.id));
        
        if (newVideos.length > 0) {
          console.log(`Loaded ${newVideos.length} new videos from Firebase`);
          set({ 
            videos: [...videos, ...newVideos], 
            loading: false,
            hasMore: newVideos.length >= 3
          });
          return;
        }
      }
      
      console.log("No more unique videos available from Firebase");
      set({ hasMore: false, loading: false });
      
    } catch (error) {
      console.error('Failed to fetch more videos:', error);
      set({ loading: false });
    }
  }
}));
