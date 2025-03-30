import { create } from 'zustand';
import { VideoData } from '@/types/video';
import { storage } from '@/lib/firebase';
import { ref, listAll, getDownloadURL } from 'firebase/storage';

interface VideoState {
  currentVideoIndex: number;
  videos: VideoData[];
  loading: boolean;
  hasMore: boolean;
  lastVisible: any | null;
  error: string | null;
  setCurrentVideoIndex: (index: number) => void;
  fetchVideos: () => Promise<void>;
  fetchMoreVideos: () => Promise<void>;
  likeVideo: (videoId: string) => void;
  unlikeVideo: (videoId: string) => void;
  shareVideo: (videoId: string) => void;
  saveVideo: (videoId: string) => void;
  incrementView: (videoId: string) => void;
}

export const useVideoStore = create<VideoState>((set, get) => ({
  currentVideoIndex: 0,
  videos: [],
  loading: false,
  hasMore: false,
  lastVisible: null,
  error: null,

  setCurrentVideoIndex: (index) => {
    const { videos } = get();
    if (videos.length === 0) return;
    const safeIndex = Math.min(Math.max(0, index), videos.length - 1);
    set({ currentVideoIndex: safeIndex });
  },

  fetchVideos: async () => {
    set({ loading: true, error: null });

    try {
      console.log("Fetching videos from Firebase Storage...");
      const videosRef = ref(storage, 'videos/');
      
      const result = await listAll(videosRef);
      console.log(`Found ${result.items.length} videos in storage`);
      
      if (result.items && result.items.length > 0) {
        const videoUrls = await Promise.all(
          result.items.map(async (item) => {
            try {
              const url = await getDownloadURL(item);
              console.log(`Got download URL for ${item.name}`);
              return {
                id: item.name,
                username: "TikTok User",
                caption: "Video from Firebase Storage",
                song: "Original Sound",
                likes: Math.floor(Math.random() * 1000),
                comments: Math.floor(Math.random() * 100),
                saves: Math.floor(Math.random() * 50),
                shares: Math.floor(Math.random() * 30),
                views: Math.floor(Math.random() * 10000),
                videoUrl: url,
                userAvatar: "https://randomuser.me/api/portraits/lego/1.jpg",
              };
            } catch (err) {
              console.error(`Error getting download URL for ${item.name}:`, err);
              return null;
            }
          })
        );
        
        const validVideos = videoUrls.filter(v => v !== null) as VideoData[];
        
        if (validVideos.length > 0) {
          console.log(`Successfully loaded ${validVideos.length} videos from Firebase`);
          set({ videos: validVideos, loading: false, hasMore: false });
        } else {
          console.log("No valid videos found in Firebase");
          set({ loading: false, error: "No valid videos found in Firebase Storage" });
        }
      } else {
        console.log("No videos found in Firebase Storage");
        set({ loading: false, error: "No videos found in Firebase Storage" });
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
      set({ 
        loading: false,
        error: "Error fetching videos from Firebase Storage."
      });
    }
  },

  fetchMoreVideos: async () => {
    // Since we're not implementing pagination for Firebase Storage,
    // this function won't do anything for now
    set({ hasMore: false });
  },

  likeVideo: (videoId) => {
    const { videos } = get();
    if (!videoId) return;
    const updatedVideos = videos.map(video => 
      video.id === videoId 
        ? { ...video, likes: video.likes + 1 } 
        : video
    );
    set({ videos: updatedVideos });
  },

  unlikeVideo: (videoId) => {
    const { videos } = get();
    if (!videoId) return;
    const updatedVideos = videos.map(video => 
      video.id === videoId 
        ? { ...video, likes: Math.max(0, video.likes - 1) } 
        : video
    );
    set({ videos: updatedVideos });
  },

  shareVideo: (videoId) => {
    const { videos } = get();
    if (!videoId) return;
    const updatedVideos = videos.map(video => 
      video.id === videoId 
        ? { ...video, shares: video.shares + 1 } 
        : video
    );
    set({ videos: updatedVideos });
  },

  saveVideo: (videoId) => {
    const { videos } = get();
    if (!videoId) return;
    const updatedVideos = videos.map(video => 
      video.id === videoId 
        ? { ...video, saves: video.saves + 1 } 
        : video
    );
    set({ videos: updatedVideos });
  },

  incrementView: (videoId) => {
    const { videos } = get();
    if (!videoId) return;
    const updatedVideos = videos.map(video => 
      video.id === videoId 
        ? { ...video, views: video.views + 1 } 
        : video
    );
    set({ videos: updatedVideos });
  }
}));
