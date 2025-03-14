// src/store/videoStore.ts
import { create } from 'zustand';
import { VideoData } from '@/types/video';
import { 
  initializeApp, 
  getApps 
} from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit
} from 'firebase/firestore';

interface VideoState {
  currentVideoIndex: number;
  videos: VideoData[];
  loading: boolean;
  hasMore: boolean;
  setCurrentVideoIndex: (index: number) => void;
  fetchVideos: () => Promise<void>;
  fetchMoreVideos: () => Promise<void>;
}

// Direct Firebase initialization - no imports from other files
// This eliminates any potential cross-file issues
const getFirebaseVideos = async (count = 10): Promise<VideoData[]> => {
  try {
    // Direct Firebase initialization with your credentials
    const firebaseConfig = {
      apiKey: "AIzaSyC4SfB5JU5HyMA0KTZ1s1X6BukAaLluR1I",
      authDomain: "tiktok-a7af5.firebaseapp.com",
      projectId: "tiktok-a7af5", 
      storageBucket: "tiktok-a7af5.appspot.com",
      messagingSenderId: "609721475346",
      appId: "1:609721475346:web:c80084600ed104b6b153cb"
    };
    
    // Initialize Firebase directly here
    let app;
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    
    // Get Firestore instance
    const db = getFirestore(app);
    
    // Query videos directly
    const videosRef = collection(db, 'videos');
    const q = query(videosRef, orderBy('timestamp', 'desc'), limit(count));
    const snapshot = await getDocs(q);
    
    console.log(`Retrieved ${snapshot.docs.length} videos from Firebase`);
    
    // Convert to VideoData objects
    return snapshot.docs.map(doc => {
      const data = doc.data();
      
      return {
        id: doc.id,
        username: data.username || 'user',
        caption: data.caption || '',
        song: data.song || 'Original Sound',
        likes: data.likes || 0,
        comments: data.comments || 0,
        saves: data.saves || 0,
        shares: data.shares || 0,
        views: data.views || 0,
        videoUrl: data.url || '', // Using 'url' as in your working project
        userAvatar: data.profilePic || 'https://randomuser.me/api/portraits/lego/1.jpg',
      };
    });
  } catch (error) {
    console.error('Error fetching Firebase videos:', error);
    return [];
  }
};

// Sample videos as fallback only if Firebase completely fails
const fallbackVideos: VideoData[] = [
  {
    id: '1',
    username: 'mixkit_user',
    caption: 'Decorating the Christmas tree with my daughter #family',
    song: 'Christmas Joy - Holiday Mix',
    likes: 45689,
    comments: 1234,
    saves: 5678,
    shares: 910,
    views: 123456,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-mother-with-her-little-daughter-decorating-a-christmas-tree-39745-large.mp4',
    userAvatar: 'https://randomuser.me/api/portraits/women/44.jpg'
  },
  {
    id: '2',
    username: 'nature_moments',
    caption: 'Beautiful day in nature with marshmallows 🌿',
    song: 'Nature Sounds - Relaxing Mix',
    likes: 34567,
    comments: 987,
    saves: 6543,
    shares: 210,
    views: 87654,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-mother-with-her-little-daughter-eating-a-marshmallow-in-nature-39764-large.mp4',
    userAvatar: 'https://randomuser.me/api/portraits/women/65.jpg'
  },
  {
    id: '3',
    username: 'neon_vibes',
    caption: 'Neon aesthetic at night ✨ #neon',
    song: 'Neon Dreams - Synthwave',
    likes: 78901,
    comments: 2345,
    saves: 7890,
    shares: 432,
    views: 234567,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-1232-large.mp4',
    userAvatar: 'https://randomuser.me/api/portraits/women/22.jpg'
  }
];

export const useVideoStore = create<VideoState>((set, get) => ({
  currentVideoIndex: 0,
  videos: [],
  loading: true,
  hasMore: true,
  
  setCurrentVideoIndex: (index) => set({ currentVideoIndex: index }),
  
  // Direct Firebase fetch with fallback
  fetchVideos: async () => {
    set({ loading: true });
    
    try {
      console.log("Fetching videos directly from Firebase");
      
      // Get videos directly from Firebase
      const firebaseVideos = await getFirebaseVideos(10);
      
      if (firebaseVideos && firebaseVideos.length > 0) {
        console.log(`Successfully loaded ${firebaseVideos.length} Firebase videos`);
        
        // Use valid Firebase videos
        set({ 
          videos: firebaseVideos, 
          loading: false,
          hasMore: true
        });
      } else {
        console.warn("No Firebase videos found, using fallback");
        
        // Use fallback videos if Firebase returned nothing
        set({ 
          videos: fallbackVideos,
          loading: false,
          hasMore: true
        });
      }
    } catch (error) {
      console.error('Failed to fetch videos:', error);
      
      // Use fallback videos on error
      set({ 
        videos: fallbackVideos,
        loading: false,
        hasMore: true
      });
    }
  },
  
  // Fetch more videos
  fetchMoreVideos: async () => {
    const { loading, videos, hasMore } = get();
    
    if (loading || !hasMore) return;
    
    set({ loading: true });
    
    try {
      // Get more Firebase videos if we're using Firebase
      if (videos[0] && !videos[0].id.startsWith('fallback-')) {
        const moreFirebaseVideos = await getFirebaseVideos(videos.length + 5);
        
        if (moreFirebaseVideos.length > videos.length) {
          // Filter out videos we already have
          const existingIds = new Set(videos.map(v => v.id));
          const newVideos = moreFirebaseVideos.filter(v => !existingIds.has(v.id));
          
          if (newVideos.length > 0) {
            set({ 
              videos: [...videos, ...newVideos],
              loading: false,
              hasMore: true
            });
            return;
          }
        }
      }
      
      // If we can't get more Firebase videos or we're using fallback videos
      const moreFallbackVideos = fallbackVideos.map((video, index) => ({
        ...video,
        id: `fallback-${Date.now()}-${index}`,
        caption: `${video.caption} #more`,
      }));
      
      set({ 
        videos: [...videos, ...moreFallbackVideos],
        loading: false,
        hasMore: videos.length < 15
      });
    } catch (error) {
      console.error('Failed to fetch more videos:', error);
      set({ loading: false });
    }
  }
}));
