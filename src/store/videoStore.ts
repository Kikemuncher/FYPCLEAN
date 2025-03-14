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

// Guaranteed working video URLs from Mixkit
const sampleVideos: VideoData[] = [
  {
    id: 'sample-1',
    username: 'mixkit_vids',
    caption: 'Mother and daughter decorating a Christmas tree #family #moments',
    song: 'Holiday Joy - Christmas Mix',
    likes: 45689,
    comments: 543,
    saves: 2341,
    shares: 876,
    views: 234567,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-mother-with-her-little-daughter-decorating-a-christmas-tree-39745-large.mp4',
    userAvatar: 'https://randomuser.me/api/portraits/women/44.jpg'
  },
  {
    id: 'sample-2',
    username: 'travel_moments',
    caption: 'Marshmallow moments in nature 🌿 #outdoors #family',
    song: 'Nature Sounds - Acoustic',
    likes: 32567,
    comments: 432,
    saves: 1543,
    shares: 654,
    views: 187654,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-mother-with-her-little-daughter-eating-a-marshmallow-in-nature-39764-large.mp4',
    userAvatar: 'https://randomuser.me/api/portraits/women/65.jpg'
  },
  {
    id: 'sample-3',
    username: 'neon_dreams',
    caption: 'Neon aesthetic vibes ✨ #neon #nightlife',
    song: 'Cyberpunk Dreams - DJ Mix',
    likes: 78901,
    comments: 876,
    saves: 3456,
    shares: 987,
    views: 453789,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-1232-large.mp4',
    userAvatar: 'https://randomuser.me/api/portraits/women/22.jpg'
  },
  {
    id: 'sample-4',
    username: 'fashion_fotog',
    caption: 'Fashion photoshoot BTS 📸 #fashion #photography',
    song: 'Runway Beats - Fashion Week',
    likes: 56432,
    comments: 654,
    saves: 2345,
    shares: 765,
    views: 345678,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-taking-photos-from-different-angles-of-a-model-34421-large.mp4',
    userAvatar: 'https://randomuser.me/api/portraits/men/32.jpg'
  },
  {
    id: 'sample-5',
    username: 'pool_vibes',
    caption: 'Summer splash 💦 #poolday #summer',
    song: 'Pool Party - Summer Mix',
    likes: 65432,
    comments: 765,
    saves: 2987,
    shares: 876,
    views: 395678,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-womans-feet-splashing-in-the-pool-1261-large.mp4',
    userAvatar: 'https://randomuser.me/api/portraits/women/29.jpg'
  }
];

export const useVideoStore = create<VideoState>((set, get) => ({
  currentVideoIndex: 0,
  videos: sampleVideos, // Start with sample videos immediately
  loading: false,       // No initial loading needed
  hasMore: true,
  
  setCurrentVideoIndex: (index) => set({ currentVideoIndex: index }),
  
  // Simplified fetch videos - always uses sample videos to ensure reliability
  fetchVideos: async () => {
    set({ loading: true });
    
    try {
      console.log("Loading guaranteed working videos");
      
      // Simply use the sample videos directly
      // This ensures the app always works reliably
      setTimeout(() => {
        set({ 
          videos: sampleVideos, 
          loading: false,
          hasMore: true
        });
      }, 300);
      
    } catch (error) {
      console.error('Error in fetchVideos:', error);
      set({ videos: sampleVideos, loading: false, hasMore: true });
    }
  },
  
  // Fetch more videos - always uses more sample videos
  fetchMoreVideos: async () => {
    const { loading, videos, hasMore } = get();
    
    if (loading || !hasMore) return;
    
    set({ loading: true });
    
    try {
      // Create new variations of sample videos
      const moreVideos = sampleVideos.map((video, index) => ({
        ...video,
        id: `more-${Date.now()}-${index}`, // Ensure unique IDs
        caption: `${video.caption} #fyp`,
      }));
      
      // Simulate network delay
      setTimeout(() => {
        set({ 
          videos: [...videos, ...moreVideos.slice(0, 3)], 
          loading: false,
          hasMore: videos.length < 12 // Limit to prevent too many videos
        });
      }, 700);
      
    } catch (error) {
      console.error('Error in fetchMoreVideos:', error);
      set({ loading: false });
    }
  }
}));
