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

// Guaranteed working sample videos from mixkit 
const sampleVideos: VideoData[] = [
  {
    id: 'sample-1',
    username: 'mixkit_official',
    caption: 'Winter moments #christmas #family',
    song: 'Winter Memories - Ambient',
    likes: 2456,
    comments: 87,
    saves: 134,
    shares: 56,
    views: 15640,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-mother-with-her-little-daughter-decorating-a-christmas-tree-39745-large.mp4',
    userAvatar: 'https://randomuser.me/api/portraits/women/76.jpg'
  },
  {
    id: 'sample-2',
    username: 'nature_vibes',
    caption: 'Sweet moments in nature 🍭 #nature #family',
    song: 'Nature Sounds - Relaxing',
    likes: 4523,
    comments: 132,
    saves: 267,
    shares: 89,
    views: 28651,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-mother-with-her-little-daughter-eating-a-marshmallow-in-nature-39764-large.mp4',
    userAvatar: 'https://randomuser.me/api/portraits/women/79.jpg'
  },
  {
    id: 'sample-3',
    username: 'neon_dreams',
    caption: 'Neon vibes tonight ✨ #neon #aesthetic',
    song: 'Neon Lights - Electronic',
    likes: 6789,
    comments: 254,
    saves: 345,
    shares: 123,
    views: 45678,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-1232-large.mp4',
    userAvatar: 'https://randomuser.me/api/portraits/women/32.jpg'
  },
  {
    id: 'sample-4',
    username: 'fashion_clicks',
    caption: 'Behind the scenes at our photoshoot 📸 #fashion #model',
    song: 'Fashion Week - Runway',
    likes: 8901,
    comments: 321,
    saves: 432,
    shares: 165,
    views: 67890,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-taking-photos-from-different-angles-of-a-model-34421-large.mp4',
    userAvatar: 'https://randomuser.me/api/portraits/men/43.jpg'
  },
  {
    id: 'sample-5',
    username: 'summer_splash',
    caption: 'Pool day vibes 💦 #summer #pool',
    song: 'Summer Splash - Pool Party',
    likes: 7654,
    comments: 298,
    saves: 387,
    shares: 145,
    views: 56789,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-womans-feet-splashing-in-the-pool-1261-large.mp4',
    userAvatar: 'https://randomuser.me/api/portraits/women/67.jpg'
  },
  {
    id: 'sample-6',
    username: 'urban_dancer',
    caption: 'Friday night moves 💃 #dance #urban',
    song: 'Downtown - Street Dance',
    likes: 9876,
    comments: 345,
    saves: 432,
    shares: 178,
    views: 78901,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-missing-a-basketball-shot-2284-large.mp4',
    userAvatar: 'https://randomuser.me/api/portraits/women/45.jpg'
  },
  {
    id: 'sample-7',
    username: 'beauty_lens',
    caption: 'Glitter makeup tutorial ✨ #makeup #beauty',
    song: 'Glam Session - Beauty Beats',
    likes: 11234,
    comments: 435,
    saves: 567,
    shares: 213,
    views: 98765,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-decorating-her-eyelids-with-glitter-20186-large.mp4',
    userAvatar: 'https://randomuser.me/api/portraits/women/23.jpg'
  }
];

export const useVideoStore = create<VideoState>((set, get) => ({
  currentVideoIndex: 0,
  videos: [], // Start with empty array
  loading: true,
  hasMore: true,
  
  setCurrentVideoIndex: (index) => set({ currentVideoIndex: index }),
  
  fetchVideos: async () => {
    set({ loading: true });
    try {
      // Reset the video feed to start fresh
      resetVideoFeed();
      console.log("Attempting to fetch videos from Firebase...");
      
      // USE SAMPLE VIDEOS IMMEDIATELY for testing - remove this line to try Firebase first
      set({ videos: sampleVideos, loading: false, hasMore: true });
      return;
      
      // Try to get videos from Firebase with timeout
      const firebasePromise = getFYPVideos(8);
      
      // Create a timeout promise
      const timeoutPromise = new Promise<VideoData[]>((resolve) => {
        setTimeout(() => {
          console.log("Firebase fetch timed out, using sample videos");
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
            hasMore: validVideos.length >= 5
          });
          return;
        }
      }
      
      // If we get here, use sample videos
      console.warn("No valid videos from Firebase, using sample videos");
      set({ 
        videos: sampleVideos,
        loading: false,
        hasMore: true
      });
      
    } catch (error) {
      console.error('Failed to fetch videos from Firebase:', error);
      // In case of error, use sample videos
      console.log("Using sample videos due to Firebase error");
      set({ 
        videos: sampleVideos,
        loading: false,
        hasMore: true
      });
    }
  },
  
  fetchMoreVideos: async () => {
    const { loading, videos, hasMore } = get();
    
    if (loading || !hasMore) return;
    
    set({ loading: true });
    try {
      // For now, always use more sample videos
      // This ensures the app works smoothly regardless of Firebase status
      
      // Create new versions of sample videos with different IDs
      const moreVideos = sampleVideos.map((video, index) => ({
        ...video,
        id: `more-${index}-${Date.now()}`, // Ensure unique IDs
        caption: `${video.caption} #more`,
      }));
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Add more videos
      set({ 
        videos: [...videos, ...moreVideos.slice(0, 3)], 
        loading: false,
        hasMore: videos.length < 15 // Limit to prevent too many videos
      });
      
    } catch (error) {
      console.error('Failed to fetch more videos:', error);
      set({ loading: false });
    }
  }
}));
