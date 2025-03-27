import { create } from 'zustand';
import { VideoData } from '@/types/video';

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

let firebaseEnabled = false;
try {
  const isFirebaseAvailable = typeof window !== 'undefined' && 
    window.location.hostname !== 'localhost' && 
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (isFirebaseAvailable) {
    firebaseEnabled = true;
    console.log('Firebase mode enabled');
  } else {
    console.log('Sample video mode enabled');
  }
} catch (error) {
  console.error('Error checking Firebase availability:', error);
}

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

const moreVideoSets: VideoData[] = [
  {
    id: "vid-3",
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
    id: "vid-4",
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

const fallbackVideos: VideoData[] = [
  {
    id: "vid-5",
    username: "default_creator",
    caption: "Fallback clip in case of errors",
    song: "Default Beat",
    likes: 500,
    comments: 50,
    saves: 20,
    shares: 10,
    views: 8500,
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-fallback-video-1250-large.mp4",
    userAvatar: "https://randomuser.me/api/portraits/men/45.jpg",
    hashtags: ["fallback", "video"]
  }
];

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
      await new Promise(resolve => setTimeout(resolve, 800));
      const { videos } = get();
      if (videos.length > 0) {
        set({ loading: false });
        return;
      }
      set({ 
        videos: sampleVideos,
        loading: false,
        hasMore: true,
        lastVisible: { id: sampleVideos[sampleVideos.length - 1].id }
      });
    } catch (error) {
      console.error("Error fetching videos:", error);
      set({ 
        videos: fallbackVideos,
        loading: false,
        error: "Using fallback videos due to connection issues.",
        hasMore: true 
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
      if (videos.length >= 15) {
        set({ hasMore: false, loading: false });
        return;
      }
      const additionalVideos = moreVideoSets.map((video, index) => ({
        ...video,
        id: `more-${Date.now()}-${index}`,
      }));
      set({ 
        videos: [...videos, ...additionalVideos],
        loading: false,
        hasMore: videos.length + additionalVideos.length < 15,
        lastVisible: additionalVideos.length > 0 
          ? { id: additionalVideos[additionalVideos.length - 1].id }
          : get().lastVisible
      });
    } catch (error) {
      console.error("Error fetching more videos:", error);
      const { videos } = get();
      set({ 
        videos: [...videos, ...fallbackVideos],
        loading: false,
        hasMore: false,
        error: "Using fallback videos due to connection issues."
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
