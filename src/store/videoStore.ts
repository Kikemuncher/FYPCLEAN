// src/store/videoStore.ts - Update this file

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
  hasMore: true,
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
      
      if (result.items.length > 0) {
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
          return;
        }
      }
      
      // If we get here, either no videos were found or all download URLs failed
      console.log("No videos found in Firebase, using sample videos");
      
      // Use sample videos as fallback
      const sampleVideos: VideoData[] = [
        {
          id: "vid-1",
          username: "neon_vibes",
          caption: "Late night city walk 🌃 #neon",
          song: "Synthwave Dreams",
          likes: 1032,
          comments: 183,
          saves: 88,
          shares: 45,
          views: 19230,
          videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-1232-large.mp4",
          userAvatar: "https://randomuser.me/api/portraits/women/85.jpg",
          hashtags: ["neon", "nightlife"]
        },
        {
          id: "vid-2",
          username: "nature_lover",
          caption: "Camping under the stars ✨🏕️",
          song: "Acoustic Calm",
          likes: 875,
          comments: 120,
          saves: 64,
          shares: 32,
          views: 15400,
          videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-mountain-landscape-1434-large.mp4",
          userAvatar: "https://randomuser.me/api/portraits/women/65.jpg",
          hashtags: ["camping", "nature"]
        }
      ];
      
      set({ videos: sampleVideos, loading: false, hasMore: true });
    } catch (error) {
      console.error("Error fetching videos:", error);
      set({ 
        videos: get().videos.length > 0 ? get().videos : getSampleVideos(),
        loading: false,
        error: "Error fetching videos from Firebase Storage.",
        hasMore: false
      });
    }
  },

  fetchMoreVideos: async () => {
    const { loading, hasMore } = get();
    if (loading || !hasMore) return;
    set({ loading: true, error: null });

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const { videos } = get();
      
      // For now, just append more sample videos
      const moreVideos: VideoData[] = [
        {
          id: `more-${Date.now()}-1`,
          username: "mixkit_user",
          caption: "Holiday vibes incoming 🎄❄️",
          song: "Jingle Beat",
          likes: 1540,
          comments: 220,
          saves: 112,
          shares: 76,
          views: 22100,
          videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-snowy-winter-scene-1568-large.mp4",
          userAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
          hashtags: ["holiday", "christmas"]
        },
        {
          id: `more-${Date.now()}-2`,
          username: "user_skater",
          caption: "Sunset skating session 🛹🔥",
          song: "Urban Flow",
          likes: 2000,
          comments: 330,
          saves: 150,
          shares: 90,
          views: 31000,
          videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-a-young-woman-skating-at-sunset-4517-large.mp4",
          userAvatar: "https://randomuser.me/api/portraits/women/29.jpg",
          hashtags: ["skate", "sunset"]
        }
      ];

      set({ 
        videos: [...videos, ...moreVideos],
        loading: false,
        hasMore: videos.length + moreVideos.length < 15,
      });
    } catch (error) {
      console.error("Error fetching more videos:", error);
      set({ 
        loading: false,
        error: "Error loading more videos."
      });
    }
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

function getSampleVideos(): VideoData[] {
  return [
    {
      id: "sample-1",
      username: "sample_user",
      caption: "Sample video (Firebase connection failed)",
      song: "Original Sound",
      likes: 500,
      comments: 50,
      saves: 25,
      shares: 10,
      views: 5000,
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-1232-large.mp4",
      userAvatar: "https://randomuser.me/api/portraits/lego/1.jpg",
    }
  ];
}
