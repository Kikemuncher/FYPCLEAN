// src/lib/videoService.ts

import { VideoData } from '@/types/video';
import * as localStorageService from '@/lib/localStorageService'; // Assumes safelySetItem is defined here

// Get all videos
export const getAllVideos = (): VideoData[] => {
  return localStorageService.getVideos();
};

// Get videos for feed (could implement algorithms here later)
export const getFeedVideos = (): VideoData[] => {
  const videos = localStorageService.getVideos();
  return videos.sort((a, b) => {
    // Sort by created timestamp if available, newest first
    if (a.createdAt && b.createdAt) {
      return b.createdAt - a.createdAt;
    }
    return Math.random() - 0.5; // Simple randomization if no timestamps
  });
};

// Create a new video
export const createVideo = (
  creatorUid: string,
  videoData: Partial<VideoData>
): VideoData => {
  const creator = localStorageService.getUserProfileById(creatorUid);
  
  if (!creator) {
    throw new Error('Creator not found');
  }
  
  const newVideo: VideoData = {
    id: `video-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    username: creator.username,
    userAvatar: creator.photoURL,
    caption: videoData.caption || '',
    song: videoData.song || 'Original Sound',
    likes: 0,
    comments: 0,
    saves: 0,
    shares: 0,
    views: 0,
    videoUrl: videoData.videoUrl || '',
    creatorUid: creatorUid,
    createdAt: Date.now(),
    hashtags: videoData.hashtags || []
  };
  
  // Save to storage
  localStorageService.saveVideo(newVideo);
  
  // Update creator's video count
  const updatedProfile = {
    ...creator,
    videoCount: (creator.videoCount || 0) + 1
  };
  localStorageService.saveUserProfile(updatedProfile);
  
  return newVideo;
};

// Get videos by creator
export const getVideosByCreator = (creatorUid: string): VideoData[] => {
  return localStorageService.getVideosByUser(creatorUid);
};

// Get video by ID
export const getVideoById = (videoId: string): VideoData | null => {
  const videos = localStorageService.getVideos();
  return videos.find(video => video.id === videoId) || null;
};

// Delete video (Using safelySetItem approach from Snippet $1)
export const deleteVideo = (videoId: string, creatorUid: string): boolean => {
  const videos = localStorageService.getVideos();
  const video = videos.find(v => v.id === videoId);

  // Check if video exists and if creatorUid is provided and matches video's creatorUid
  if (!video || (video.creatorUid && video.creatorUid !== creatorUid)) {
    return false; // Not found or not authorized
  }

  const filteredVideos = videos.filter(v => v.id !== videoId);
  
  // Delegate saving to localStorageService, assuming it handles try/catch & stringify
  const success = localStorageService.safelySetItem('local_videos', filteredVideos);

  // If saving the filtered list was successful AND the video had a creator
  if (success && video.creatorUid) {
    const creator = localStorageService.getUserProfileById(video.creatorUid);
    if (creator) {
      const updatedProfile = {
        ...creator,
        videoCount: Math.max(0, (creator.videoCount || 0) - 1) // Decrement video count
      };
      // Assuming saveUserProfile handles its own success/failure reporting if needed
      localStorageService.saveUserProfile(updatedProfile);
    }
  }

  return success; // Return the success status of saving the filtered video list
};


// Like/unlike helpers
export const likeVideo = (userId: string, videoId: string): boolean => {
  const video = getVideoById(videoId);
  if (!video) return false;
  
  const success = localStorageService.likeVideo(userId, videoId);
  
  if (success) {
    // Update video likes count
    video.likes += 1;
    localStorageService.saveVideo(video); // Save the updated video object
    
    // Update creator's like count
    if (video.creatorUid) {
      const creator = localStorageService.getUserProfileById(video.creatorUid);
      if (creator) {
        const updatedProfile = {
          ...creator,
          likeCount: (creator.likeCount || 0) + 1
        };
        localStorageService.saveUserProfile(updatedProfile);
      }
    }
  }
  
  return success;
};

export const unlikeVideo = (userId: string, videoId: string): boolean => {
  const video = getVideoById(videoId);
  if (!video) return false;
  
  const success = localStorageService.unlikeVideo(userId, videoId);
  
  if (success) {
    // Update video likes count
    video.likes = Math.max(0, video.likes - 1);
    localStorageService.saveVideo(video); // Save the updated video object
    
    // Update creator's like count
    if (video.creatorUid) {
      const creator = localStorageService.getUserProfileById(video.creatorUid);
      if (creator) {
        const updatedProfile = {
          ...creator,
          likeCount: Math.max(0, (creator.likeCount || 0) - 1)
        };
        localStorageService.saveUserProfile(updatedProfile);
      }
    }
  }
  
  return success;
};

// View increment
export const incrementVideoView = (videoId: string): boolean => {
  const video = getVideoById(videoId);
  if (!video) return false;
  
  video.views += 1;
  // Assuming saveVideo handles overwriting/updating the specific video
  return localStorageService.saveVideo(video); 
};
