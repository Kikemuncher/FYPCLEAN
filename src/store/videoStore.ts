import { create } from 'zustand';
import { VideoData } from '@/types/video';

interface VideoState {
  currentVideoIndex: number;
  videos: VideoData[];
  setCurrentVideoIndex: (index: number) => void;
}

// Sample video data
const sampleVideos: VideoData[] = [
  {
    id: '1',
    username: 'user1',
    caption: 'This is a cool video #fyp',
    song: 'Original Sound - user1',
    likes: 1200,
    comments: 56,
    saves: 20,
    shares: 30,
    videoUrl: 'https://i.imgur.com/fz7AGxc.mp4',
    userAvatar: 'https://placehold.co/100x100',
  },
  {
    id: '2',
    username: 'user2',
    caption: 'Another awesome video #trending',
    song: 'Popular Song - Artist',
    likes: 2500,
    comments: 120,
    saves: 85,
    shares: 45,
    videoUrl: 'https://i.imgur.com/FTBZJPJ.mp4',
    userAvatar: 'https://placehold.co/100x100',
  },
  {
    id: '3',
    username: 'user3',
    caption: 'Check this out! #viral',
    song: 'Viral Sound - Famous',
    likes: 5600,
    comments: 230,
    saves: 140,
    shares: 90,
    videoUrl: 'https://i.imgur.com/Dhbly0P.mp4',
    userAvatar: 'https://placehold.co/100x100',
  },
  {
    id: '4',
    username: 'user4',
    caption: 'Can't believe this happened! #funny',
    song: 'Funny Audio - Creator',
    likes: 8900,
    comments: 310,
    saves: 200,
    shares: 150,
    videoUrl: 'https://i.imgur.com/GWQZUFh.mp4',
    userAvatar: 'https://placehold.co/100x100',
  },
  {
    id: '5',
    username: 'user5',
    caption: 'This is amazing! #wow',
    song: 'Amazing - Artist',
    likes: 15000,
    comments: 450,
    saves: 350,
    shares: 280,
    videoUrl: 'https://i.imgur.com/sFPVL8W.mp4',
    userAvatar: 'https://placehold.co/100x100',
  },
];

export const useVideoStore = create<VideoState>((set) => ({
  currentVideoIndex: 0,
  videos: sampleVideos,
  setCurrentVideoIndex: (index) => set({ currentVideoIndex: index }),
}));
