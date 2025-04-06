// src/lib/storageService.ts
import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject, 
  listAll 
} from 'firebase/storage';
import { storage } from './firebase';

/**
 * Upload a file to Firebase Storage
 * @param path Storage path (e.g., 'videos', 'profile_images')
 * @param file File to upload
 * @param fileName Optional custom file name (default: timestamp-based)
 * @param progressCallback Optional callback for upload progress
 * @returns Promise with download URL
 */
export const uploadFile = async (
  path: string,
  file: File,
  fileName?: string,
  progressCallback?: (progress: number) => void
): Promise<string> => {
  try {
    const fileExtension = file.name.split('.').pop();
    const finalFileName = fileName || `${Date.now()}.${fileExtension}`;
    const storageRef = ref(storage, `${path}/${finalFileName}`);
    
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (progressCallback) progressCallback(progress);
        },
        (error) => {
          console.error('Error uploading file:', error);
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  } catch (error) {
    console.error('Error in file upload:', error);
    throw error;
  }
};

/**
 * Upload a profile image
 * @param userId User ID
 * @param file Image file
 * @param progressCallback Optional callback for upload progress
 * @returns Promise with download URL
 */
export const uploadProfileImage = async (
  userId: string,
  file: File,
  progressCallback?: (progress: number) => void
): Promise<string> => {
  const fileExtension = file.name.split('.').pop();
  const fileName = `${userId}_${Date.now()}.${fileExtension}`;
  return uploadFile('profile_images', file, fileName, progressCallback);
};

/**
 * Upload a cover image
 * @param userId User ID
 * @param file Image file
 * @param progressCallback Optional callback for upload progress
 * @returns Promise with download URL
 */
export const uploadCoverImage = async (
  userId: string,
  file: File,
  progressCallback?: (progress: number) => void
): Promise<string> => {
  const fileExtension = file.name.split('.').pop();
  const fileName = `${userId}_${Date.now()}.${fileExtension}`;
  return uploadFile('cover_images', file, fileName, progressCallback);
};

/**
 * Upload a video file
 * @param userId User ID
 * @param file Video file
 * @param progressCallback Optional callback for upload progress
 * @returns Promise with download URL
 */
export const uploadVideo = async (
  userId: string,
  file: File,
  progressCallback?: (progress: number) => void
): Promise<string> => {
  const fileExtension = file.name.split('.').pop();
  const fileName = `${userId}_${Date.now()}.${fileExtension}`;
  return uploadFile('videos', file, fileName, progressCallback);
};

/**
 * Upload a video thumbnail
 * @param videoId Video ID
 * @param file Image file
 * @param progressCallback Optional callback for upload progress
 * @returns Promise with download URL
 */
export const uploadThumbnail = async (
  videoId: string,
  file: File | Blob,
  progressCallback?: (progress: number) => void
): Promise<string> => {
  const fileName = `${videoId}_thumbnail.jpg`;
  return uploadFile('thumbnails', file as File, fileName, progressCallback);
};

/**
 * Delete a file from storage
 * @param url Full URL of the file to delete
 * @returns Promise that resolves when deletion is complete
 */
export const deleteFile = async (url: string): Promise<void> => {
  try {
    // Create a reference from the URL
    const fileRef = ref(storage, url);
    await deleteObject(fileRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

/**
 * List all files in a directory
 * @param path Storage path to list
 * @returns Promise with array of download URLs
 */
export const listFiles = async (path: string): Promise<string[]> => {
  try {
    const directoryRef = ref(storage, path);
    const filesList = await listAll(directoryRef);
    
    // Get download URLs for all items
    const downloadURLs = await Promise.all(
      filesList.items.map(async (itemRef) => {
        return await getDownloadURL(itemRef);
      })
    );
    
    return downloadURLs;
  } catch (error) {
    console.error('Error listing files:', error);
    return [];
  }
};

/**
 * Generate a thumbnail image from a video element
 * @param videoElement HTML Video element
 * @param width Thumbnail width (default: 480)
 * @param height Thumbnail height (default: 852 for 9:16 aspect ratio)
 * @returns Promise with Blob of the thumbnail
 */
export const generateThumbnailFromVideo = (
  videoElement: HTMLVideoElement,
  width = 480,
  height = 852
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    try {
      // Create a canvas element
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      // Draw the video frame to the canvas
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      ctx.drawImage(videoElement, 0, 0, width, height);
      
      // Convert canvas to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create thumbnail blob'));
          }
        },
        'image/jpeg',
        0.8 // Quality
      );
    } catch (error) {
      reject(error);
    }
  });
};
