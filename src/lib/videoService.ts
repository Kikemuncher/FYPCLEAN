import { create } from 'zustand';
import { VideoData } from '@/types/video';
import * as videoService from "@/lib/videoService";

interface VideoState {
  currentVideoIndex: number;
  videos: VideoData[];
  loading: boolean;
  hasMore: boolean;
  lastVisible: any | null;
  error: string | null;
  setCurrentVideoIndex: (index: number) => void;
  fetchVideos: () => Promise<{videos: VideoData[], lastVisible: any | null}>;
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
      const result = await videoService.getFeedVideos();
      set({ 
        videos: result.videos, 
        lastVisible: result.lastVisible,
        hasMore: result.videos.length > 0,
        loading: false 
      });
      return result;
    } catch (error) {
      console.error('Error fetching videos:', error);
      set({ loading: false, error: 'Error fetching videos' });
      throw error;
    }
  },

  fetchMoreVideos: async () => {
    const { lastVisible, loading } = get();
    if (loading || !lastVisible) return;
    
    set({ loading: true });
    try {
      const result = await videoService.getFeedVideos(lastVisible);
      if (result.videos.length === 0) {
        set({ hasMore: false, loading: false });
        return;
      }
      
      set(state => ({ 
        videos: [...state.videos, ...result.videos],
        lastVisible: result.lastVisible,
        hasMore: result.videos.length > 0,
        loading: false 
      }));
    } catch (error) {
      console.error('Error fetching more videos:', error);
      set({ loading: false, error: 'Error fetching more videos' });
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
