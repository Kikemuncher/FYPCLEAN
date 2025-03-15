// src/store/videoStore.ts
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

// Try loading Firebase
let firebaseEnabled = false;
try {
  // Simple check if Firebase might be available - this is just for detection
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

// Enhanced sample videos that are guaranteed to work
const sampleVideos: VideoData[] = [
  {
    id: 'sample-1',
    username: 'mixkit_user',
    caption: 'Christmas decorations with family #holidays',
    song: 'Holiday Vibes - Christmas Mix',
    likes: 45600,
    comments: 1230,
    saves: 5670,
    shares: 910,
    views: 123000,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-mother-with-her-little-daughter-decorating-a-christmas-tree-39745-large.mp4',
    userAvatar: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    id: 'sample-2',
    username: 'nature_lover',
    caption: 'Nature day with marshmallows 🌿 #outdoors #camping',
    song: 'Nature Sounds - Peaceful Morning',
    likes: 34500,
    comments: 980,
    saves: 6540,
    shares: 210,
    views: 87600,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-mother-with-her-little-daughter-eating-a-marshmallow-in-nature-39764-large.mp4',
    userAvatar: 'https://randomuser.me/api/portraits/women/65.jpg',
  },
  {
    id: 'sample-3',
    username: 'neon_vibes',
    caption: 'Neon lights at night ✨ #aesthetic #nightlife',
    song: 'Neon Dreams - Synthwave Mix',
    likes: 78900,
    comments: 2340,
    saves: 7890,
    shares: 430,
    views: 234000,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-1232-large.mp4',
    userAvatar: 'https://randomuser.me/api/portraits/women/22.jpg',
  },
  {
    id: 'sample-4',
    username: 'fashion_photo',
    caption: 'Fashion shoot BTS 📸 #fashion #photoshoot',
    song: 'Studio Vibes - Fashion Week',
    likes: 23400,
    comments: 870,
    saves: 5430,
    shares: 320,
    views: 98700,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-taking-photos-from-different-angles-of-a-model-34421-large.mp4',
    userAvatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    id: 'sample-5',
    username: 'pool_vibes',
    caption: 'Pool day 💦 #summer #poolside #relax',
    song: 'Summer Splash - Beach Mix',
    likes: 67800,
    comments: 1540,
    saves: 8760,
    shares: 540,
    views: 345000,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-womans-feet-splashing-in-the-pool-1261-large.mp4',
    userAvatar: 'https://randomuser.me/api/portraits/women/29.jpg',
  }
];

// Additional videos for infinite scroll
const moreVideoSets: VideoData[] = [
  {
    id: 'more-1',
    username: 'city_explorer',
    caption: 'City lights and urban vibes 🏙️ #citylife #urban #nightcity',
    song: 'Urban Beats - City Nights',
    likes: 54200,
    comments: 1120,
    saves: 4890,
    shares: 620,
    views: 178000,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-city-traffic-in-a-street-with-pink-lighting-34562-large.mp4',
    userAvatar: 'https://randomuser.me/api/portraits/men/76.jpg',
  },
  {
    id: 'more-2',
    username: 'coffee_lover',
    caption: 'Morning coffee rituals ☕ #coffee #morning #routine',
    song: 'Morning Jazz - Coffee Shop',
    likes: 29600,
    comments: 870,
    saves: 3520,
    shares: 290,
    views: 89400,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-pouring-coffee-in-a-cup-seen-up-close-18250-large.mp4',
    userAvatar: 'https://randomuser.me/api/portraits/women/52.jpg',
  },
  {
    id: 'more-3',
    username: 'fitness_coach',
    caption: 'Daily workout motivation 💪 #fitness #workout #motivation',
    song: 'Pump Up - Workout Mix',
    likes: 87300,
    comments: 2940,
    saves: 12600,
    shares: 1840,
    views: 567000,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-exercising-with-battle-ropes-40168-large.mp4',
    userAvatar: 'https://randomuser.me/api/portraits/women/36.jpg',
  },
];

// Add more fallback videos if needed
const fallbackVideos: VideoData[] = [
  {
    id: 'fallback-1',
    username: 'travel_addict',
    caption: 'Beach sunset vibes 🌅 #travel #beach #sunset',
    song: 'Tropical Dreams - Beach Sounds',
    likes: 123400,
    comments: 4300,
    saves: 18700,
    shares: 8900,
    views: 893000,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-silhouette-sunrise-watching-the-beach-1209-large.mp4',
    userAvatar: 'https://randomuser.me/api/portraits/women/17.jpg',
  },
  {
    id: 'fallback-2',
    username: 'food_lover',
    caption: 'Making fresh pasta at home 🍝 #cooking #homemade #pasta',
    song: 'Italian Cooking - Kitchen Vibes',
    likes: 67800,
    comments: 2190,
    saves: 9230,
    shares: 3120,
    views: 412000,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-making-handmade-pasta-on-a-wooden-counter-9124-large.mp4',
    userAvatar: 'https://randomuser.me/api/portraits/women/89.jpg',
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
    // Guard against out-of-bounds indices
    const { videos } = get();
    if (videos.length === 0) return;
    
    const safeIndex = Math.min(Math.max(0, index), videos.length - 1);
    set({ currentVideoIndex: safeIndex });
  },
  
  // Initial fetch
  fetchVideos: async () => {
    set({ loading: true, error: null });
    
    try {
      // Simulate network delay for a more realistic experience
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // For safety, check if videos have been loaded already
      const { videos } = get();
      if (videos.length > 0) {
        set({ loading: false });
        return;
      }
      
      // Always use sample videos for reliability
      set({ 
        videos: sampleVideos,
        loading: false,
        hasMore: true,
        lastVisible: { id: sampleVideos[sampleVideos.length - 1].id }
      });
    } catch (error) {
      console.error("Error fetching videos:", error);
      
      // Fallback to sample videos in case of error
      set({ 
        videos: sampleVideos,
        loading: false,
        error: "Using sample videos due to connection issues.",
        hasMore: true 
      });
    }
  },
  
  // Fetch more videos for infinite scroll
  fetchMoreVideos: async () => {
    const { loading, hasMore } = get();
    
    if (loading || !hasMore) return;
    
    set({ loading: true, error: null });
    
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { videos } = get();
      
      // Check if we should add more videos
      if (videos.length >= 15) {
        set({ hasMore: false, loading: false });
        return;
      }
      
      // Get a slice of additional videos - create unique IDs
      const additionalVideos = moreVideoSets.map((video, index) => ({
        ...video,
        id: `more-${Date.now()}-${index}`,
      }));
      
      set({ 
        videos: [...videos, ...additionalVideos],
        loading: false,
        hasMore: videos.length + additionalVideos.length < 15, // Limit for demo purposes
        lastVisible: additionalVideos.length > 0 
          ? { id: additionalVideos[additionalVideos.length - 1].id }
          : get().lastVisible
      });
    } catch (error) {
      console.error("Error fetching more videos:", error);
      
      // Add fallback videos in case of error
      const { videos } = get();
      
      set({ 
        videos: [...videos, ...fallbackVideos],
        loading: false,
        hasMore: false,
        error: "Using fallback videos due to connection issues."
      });
    }
  },
  
  // Like video
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
  
  // Unlike video
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
  
  // Share video
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
  
  // Save video
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
  
  // Increment view count
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
