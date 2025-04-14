// src/app/feed/page.tsx
"use client";

import VideoPlayer from '@/components/VideoPlayer/VideoPlayer'; // Using alias @ assumed from tsconfig

// Mock data for demonstration
const mockVideos = [
  {
    id: '1',
    videoUrl: '/videos/video1.mp4', // Replace with actual URLs later
    creatorUsername: 'cool_creator',
    creatorAvatarUrl: 'https://i.pravatar.cc/150?img=1', // Placeholder avatar
    isFollowingCreator: false,
    likeCount: 1234,
    isLiked: false,
    commentCount: 56,
    shareCount: 12,
    isSaved: false,
    caption: 'Check out this amazing vertical video! #cool #demo',
    hashtags: ['cool', 'demo'],
    mentions: [],
    soundName: 'Original Audio - cool_creator',
    soundImageUrl: 'https://i.pravatar.cc/150?img=1', // Use avatar as sound image placeholder
  },
  {
    id: '2',
    videoUrl: '/videos/video2.mp4',
    creatorUsername: 'another_user',
    creatorAvatarUrl: 'https://i.pravatar.cc/150?img=2',
    isFollowingCreator: true,
    likeCount: 5678,
    isLiked: true,
    commentCount: 102,
    shareCount: 34,
    isSaved: true,
    caption: 'Another great clip @cool_creator #fyp',
    hashtags: ['fyp'],
    mentions: ['cool_creator'],
    soundName: 'Epic Sound Track - Musician',
    soundImageUrl: 'https://i.pravatar.cc/150?img=3', // Different sound image
  },
  // Add more mock videos as needed
];

export default function FeedPage() {
  return (
    // Container for vertical scroll snapping
    <div className="h-screen overflow-y-scroll snap-y snap-mandatory">
      {mockVideos.map((video) => (
        <VideoPlayer
          key={video.id}
          videoUrl={video.videoUrl}
          creatorUsername={video.creatorUsername}
          creatorAvatarUrl={video.creatorAvatarUrl}
          isFollowingCreator={video.isFollowingCreator}
          likeCount={video.likeCount}
          isLiked={video.isLiked}
          commentCount={video.commentCount}
          shareCount={video.shareCount}
          isSaved={video.isSaved}
          caption={video.caption}
          hashtags={video.hashtags}
          mentions={video.mentions}
          soundName={video.soundName}
          soundImageUrl={video.soundImageUrl}
        />
      ))}
    </div>
  );
}
