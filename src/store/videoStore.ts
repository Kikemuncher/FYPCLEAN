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

const sampleVideos: VideoData[] = [/* ... sample videos ... */];
const moreVideoSets: VideoData[] = [/* ... more videos ... */];
const fallbackVideos: VideoData[] = [/* ... fallback videos ... */];

const ensureCreatorProfiles = async (videos: VideoData[]): Promise<VideoData[]> => {
  try {
    if (typeof window === 'undefined') return videos;
    const mockProfilesStr = localStorage.getItem("mock-profiles") || '[]';
    const mockProfiles = JSON.parse(mockProfilesStr);

    return videos.map(video => {
      if (!video.creatorUid) {
        const matchingProfile = mockProfiles.find(
          (profile: any) => profile.username === video.username
        );

        if (matchingProfile) {
          return { ...video, creatorUid: matchingProfile.uid };
        } else {
          const defaultUid = `creator-${video.username}`;
          const newProfile = {
            uid: defaultUid,
            username: video.username,
            displayName: video.username,
            bio: `Creator of amazing videos`,
            photoURL: video.userAvatar,
            coverPhotoURL: "https://placehold.co/1200x400/gray/white?text=Cover",
            followerCount: Math.floor(Math.random() * 10000),
            followingCount: Math.floor(Math.random() * 500),
            videoCount: Math.floor(Math.random() * 50) + 1,
            likeCount: Math.floor(Math.random() * 100000),
            links: {},
            createdAt: Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000,
            isVerified: Math.random() > 0.7,
            isCreator: true
          };

          const allProfiles = [...mockProfiles, newProfile];
          localStorage.setItem("mock-profiles", JSON.stringify(allProfiles));

          return { ...video, creatorUid: defaultUid };
        }
      }
      return video;
    });
  } catch (error) {
    console.error("Error ensuring creator profiles:", error);
    return videos;
  }
};

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
      const videosWithProfiles = await ensureCreatorProfiles(sampleVideos);
      set({ 
        videos: videosWithProfiles,
        loading: false,
        hasMore: true,
        lastVisible: { id: videosWithProfiles[videosWithProfiles.length - 1].id }
      });
    } catch (error) {
      console.error("Error fetching videos:", error);
      set({ 
        videos: sampleVideos,
        loading: false,
        error: "Using sample videos due to connection issues.",
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
