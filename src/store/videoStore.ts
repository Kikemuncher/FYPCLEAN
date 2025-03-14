import { create } from 'zustand';
import { VideoData } from '@/types/video';
import { getFYPVideos, resetVideoFeed } from '@/lib/firebaseService';

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
  
  // Only get videos from Firebase
  fetchVideos: async () => {
    set({ loading: true });
    
    try {
      // Reset pagination to start fresh
      resetVideoFeed();
      
      console.log("Fetching videos from Firebase only");
      const firebaseVideos = await getFYPVideos(10);
      
      if (firebaseVideos && firebaseVideos.length > 0) {
        // Only use videos that have valid URLs
        const validVideos = firebaseVideos.filter(video => 
          video.videoUrl && 
          (video.videoUrl.startsWith('http://') || video.videoUrl.startsWith('https://'))
        );
        
        console.log(`Loaded ${validVideos.length} videos from Firebase`);
        
        set({ 
          videos: validVideos, 
          loading: false,
          hasMore: validVideos.length >= 5 // If we got a good number, assume there might be more
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
            hasMore: newVideos.length >= 3 // If we got a decent number of new videos, assume there might be more
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
