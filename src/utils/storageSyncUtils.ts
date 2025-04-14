import { db, storage } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  query, 
  where, 
  getDocs, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  ref, 
  listAll, 
  getDownloadURL, 
  getMetadata 
} from 'firebase/storage';

/**
 * Scan Firebase Storage for videos and create corresponding Firestore documents
 */
export const syncStorageWithFirestore = async (targetUserId?: string) => {
  try {
    console.log('Starting sync from Storage to Firestore');
    
    // Get all videos from storage
    const storageRef = ref(storage, 'videos');
    const listResult = await listAll(storageRef);
    
    // Initialize counters
    let totalVideos = 0;
    let newDocsCreated = 0;
    
    // Process all user folders
    for (const prefixRef of listResult.prefixes) {
      const userId = prefixRef.name;
      console.log(`Processing videos for user: ${userId}`);
      
      // If targetUserId is specified, only process videos for that user
      if (targetUserId && userId !== targetUserId) {
        continue;
      }
      
      // Get all videos for this user
      const userVideosRef = ref(storage, `videos/${userId}`);
      const userVideosResult = await listAll(userVideosRef);
      
      // Process each video file
      for (const itemRef of userVideosResult.items) {
        totalVideos++;
        const videoFileName = itemRef.name;
        const videoUrl = await getDownloadURL(itemRef);
        const metadata = await getMetadata(itemRef);
        
        // Check if a Firestore document already exists for this video
        const videosRef = collection(db, 'videos');
        const q = query(videosRef, where('videoUrl', '==', videoUrl));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          // No document exists, create one
          const videoDocRef = doc(collection(db, 'videos'));
          
          // Get the timestamp from metadata or generate a new one
          const createdAt = metadata.timeCreated 
            ? new Date(metadata.timeCreated) 
            : new Date();
            
          // Create video document
          await setDoc(videoDocRef, {
            userId: userId,
            videoUrl: videoUrl,
            caption: videoFileName.split('.')[0] || 'Untitled Video',
            createdAt: serverTimestamp(),
            views: 0,
            likes: [],
            comments: 0,
            shares: 0,
            status: 'active',
            isPrivate: false
          });
          
          console.log(`Created new document for video: ${videoFileName}`);
          newDocsCreated++;
        } else {
          console.log(`Document already exists for video: ${videoFileName}`);
        }
      }
    }
    
    console.log(`Sync complete. Found ${totalVideos} videos, created ${newDocsCreated} new documents.`);
    return { totalVideos, newDocsCreated };
    
  } catch (error) {
    console.error('Error syncing Storage with Firestore:', error);
    throw error;
  }
};

/**
 * Link videos to a specific user
 */
export const linkVideosToUser = async (userId: string, username: string) => {
  try {
    // Find all videos in storage for this user
    const userVideosRef = ref(storage, `videos/${userId}`);
    
    // Check if user folder exists
    try {
      const userVideosResult = await listAll(userVideosRef);
      const videoUrls: string[] = [];
      
      // Get download URLs for all videos
      for (const itemRef of userVideosResult.items) {
        const url = await getDownloadURL(itemRef);
        videoUrls.push(url);
      }
      
      if (videoUrls.length === 0) {
        console.log(`No videos found in storage for user: ${userId}`);
        return { processed: 0 };
      }
      
      // Find existing documents for these videos
      let processed = 0;
      for (const url of videoUrls) {
        const videosRef = collection(db, 'videos');
        const q = query(videosRef, where('videoUrl', '==', url));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          // Update existing documents
          for (const videoDoc of querySnapshot.docs) {
            await setDoc(videoDoc.ref, {
              userId: userId,
              username: username
            }, { merge: true });
            processed++;
          }
        }
      }
      
      console.log(`Linked ${processed} videos to user: ${userId}`);
      return { processed };
      
    } catch (error) {
      console.log(`No user folder found for user: ${userId}`);
      return { processed: 0 };
    }
    
  } catch (error) {
    console.error('Error linking videos to user:', error);
    throw error;
  }
};
