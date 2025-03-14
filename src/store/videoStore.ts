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

// Fallback sample videos that are guaranteed to work
const sampleVideos: VideoData[] = [
  {
    id: 'sample-1',
    username: 'user1',
    caption: 'Winter moments #christmas',
    song: 'Winter Sounds',
    likes: 3400,
    comments: 120,
    saves: 230,
    shares: 45,
    views: 12500,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-mother-with-her-little-daughter-decorating-a-christmas-tree-39745-large.mp4',
    userAvatar: 'https://randomuser.me/api/portraits/women/68.jpg'
  },
  {
    id: 'sample-2',
    username: 'user2',
    caption: 'Nature vibes 🍭',
    song: 'Nature Sounds',
    likes: 5200,
    comments: 230,
    saves: 340,
    shares: 120,
    views: 18700,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-mother-with-her-little-daughter-eating-a-marshmallow-in-nature-39764-large.mp4',
    userAvatar: 'https://randomuser.me/api/portraits/women/45.jpg'
  },
  {
    id: 'sample-3',
    username: 'user3',
    caption: 'Neon lights ✨ #neon',
    song: 'Neon Dreams',
    likes: 7800,
    comments: 450,
    saves: 560,
    shares: 230,
    views: 45600,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-1232-large.mp4',
    userAvatar: 'https://randomuser.me/api/portraits/women/32.jpg'
  },
  {
    id: 'sample-4',
    username: 'user4',
    caption: 'Fashion shoot BTS 📸',
    song: 'Fashion Week',
    likes: 9200,
    comments: 340,
    saves: 450,
    shares: 180,
    views: 56000,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-taking-photos-from-different-angles-of-a-model-34421-large.mp4',
    userAvatar: 'https://randomuser.me/api/portraits/men/45.jpg'
  },
  {
    id: 'sample-5',
    username: 'user5',
    caption: 'Summer splash 💦 #pool',
    song: 'Pool Party',
    likes: 6500,
    comments: 320,
    saves: 410,
    shares: 150,
    views: 34000,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-womans-feet-splashing-in-the-pool-1261-large.mp4',
    userAvatar: 'https://randomuser.me/api/portraits/women/24.jpg'
  }
];

export const useVideoStore = create<VideoState>((set, get) => ({
  currentVideoIndex: 0,
  videos: [],
  loading: true,
  hasMore: true,
  
  setCurrentVideoIndex: (index) => set({ currentVideoIndex: index }),
  
  fetchVideos: async () => {
    set({ loading: true });
    
    try {
      console.log("Trying to fetch videos from Firebase first");
      
      // First try Firebase
      const firebaseVideos = await getFYPVideos(10);
      
      if (firebaseVideos && firebaseVideos.length > 0) {
        console.log(`Got ${firebaseVideos.length} videos from Firebase`);
        
        // Check if the videos have valid URLs
        const validVideos = firebaseVideos.filter(video => 
          video.videoUrl && video.videoUrl.trim() !== ''
        );
        
        if (validVideos.length > 0) {
          console.log(`${validVideos.length} videos have valid URLs`);
          set({ 
            videos: validVideos, 
            loading: false,
            hasMore: true
          });
          return;
        }
      }
      
      // If we get here, use sample videos as fallback
      console.log("No valid videos from Firebase, using sample videos instead");
      set({ 
        videos: sampleVideos,
        loading: false,
        hasMore: true
      });
      
    } catch (error) {
      console.error('Error fetching videos:', error);
      
      // Use sample videos as fallback
      console.log("Error occurred, using sample videos");
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
      // If we're already using sample videos, just add more of them
      if (videos[0] && videos[0].id.startsWith('sample-')) {
        console.log("Adding more sample videos");
        
        const moreVideos = sampleVideos.map((video, index) => ({
          ...video,
          id: `more-sample-${Date.now()}-${index}`,
          caption: `${video.caption} #more`,
        }));
        
        setTimeout(() => {
          set({ 
            videos: [...videos, ...moreVideos.slice(0, 3)],
            loading: false,
            hasMore: videos.length < 15
          });
        }, 500);
        
        return;
      }
      
      // Otherwise try to get more Firebase videos
      console.log("Fetching more Firebase videos");
      const moreFirebaseVideos = await getFYPVideos(videos.length + 5);
      
      if (moreFirebaseVideos && moreFirebaseVideos.length > videos.length) {
        const newVideos = moreFirebaseVideos.filter(
          newVideo => !videos.some(existingVideo => existingVideo.id === newVideo.id)
        );
        
        if (newVideos.length > 0) {
          set({ 
            videos: [...videos, ...newVideos],
            loading: false,
            hasMore: true
          });
          return;
        }
      }
      
      // If we couldn't get more Firebase videos, use sample videos
      const moreVideos = sampleVideos.map((video, index) => ({
        ...video,
        id: `more-sample-${Date.now()}-${index}`,
        caption: `${video.caption} #more`,
      }));
      
      set({ 
        videos: [...videos, ...moreVideos.slice(0, 3)],
        loading: false,
        hasMore: videos.length < 15
      });
      
    } catch (error) {
      console.error('Error fetching more videos:', error);
      set({ loading: false });
    }
  }
}));
