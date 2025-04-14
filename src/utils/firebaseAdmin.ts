import { db } from '@/lib/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc, 
  deleteDoc,
  writeBatch,
  limit,
  getDoc
} from 'firebase/firestore';

/**
 * List all videos in the database with their owners
 */
export const listAllVideos = async () => {
  try {
    const videosRef = collection(db, 'videos');
    const q = query(videosRef, limit(100));
    const querySnapshot = await getDocs(q);
    
    const videos = [];
    for (const videoDoc of querySnapshot.docs) {
      const videoData = videoDoc.data();
      const userRef = doc(db, 'users', videoData.userId);
      const userDoc = await getDoc(userRef);
      
      videos.push({
        id: videoDoc.id,
        caption: videoData.caption,
        userId: videoData.userId,
        username: videoData.username,
        userEmail: userDoc.exists() ? userDoc.data().email : 'Unknown',
        createdAt: videoData.createdAt?.toDate?.() || new Date()
      });
    }
    
    console.table(videos);
    return videos;
  } catch (error) {
    console.error("Error listing videos:", error);
    return [];
  }
};

/**
 * Assign videos to a specific user account
 * @param targetUserId The user ID to assign videos to
 * @param options Options for reassigning videos
 */
export const assignVideosToUser = async (
  targetUserId: string, 
  options: {
    sourceUserIds?: string[], // Specific user IDs to take videos from
    count?: number,           // Maximum number of videos to reassign
    deleteOriginal?: boolean  // Whether to delete originals or copy
  } = {}
) => {
  try {
    // Verify target user exists
    const targetUserRef = doc(db, 'users', targetUserId);
    const targetUserDoc = await getDoc(targetUserRef);
    if (!targetUserDoc.exists()) {
      console.error(`Target user ${targetUserId} does not exist`);
      return false;
    }

    const targetUserData = targetUserDoc.data();
    console.log(`Target user: ${targetUserData.username || targetUserData.email}`);
    
    // Build query for videos
    const videosRef = collection(db, 'videos');
    let q;
    
    if (options.sourceUserIds && options.sourceUserIds.length > 0) {
      q = query(
        videosRef, 
        where('userId', 'in', options.sourceUserIds),
        limit(options.count || 10)
      );
    } else {
      q = query(
        videosRef,
        limit(options.count || 10)
      );
    }
    
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      console.log('No videos found to reassign');
      return false;
    }
    
    const batch = writeBatch(db);
    let reassignedCount = 0;

    // Process each video
    for (const videoDoc of querySnapshot.docs) {
      const videoData = videoDoc.data();
      const videoRef = doc(db, 'videos', videoDoc.id);
      
      if (options.deleteOriginal) {
        // Update the existing document
        batch.update(videoRef, {
          userId: targetUserId,
          username: targetUserData.username || 'user'
        });
      } else {
        // Create a new copy assigned to the target user
        const newVideoRef = doc(collection(db, 'videos'));
        batch.set(newVideoRef, {
          ...videoData,
          userId: targetUserId,
          username: targetUserData.username || 'user'
        });
      }
      
      reassignedCount++;
    }
    
    await batch.commit();
    console.log(`Successfully reassigned ${reassignedCount} videos to user ${targetUserId}`);
    
    // Update the target user's video count
    await updateDoc(targetUserRef, {
      videoCount: (targetUserData.videoCount || 0) + reassignedCount
    });
    
    return true;
  } catch (error) {
    console.error("Error reassigning videos:", error);
    return false;
  }
};

/**
 * Remove test videos from the database
 * @param criteria Criteria for identifying test videos
 */
export const removeTestVideos = async (
  criteria: {
    testUserIds?: string[],   // Specific user IDs considered test accounts
    testKeywords?: string[],  // Keywords in caption or username that identify test videos
    olderThan?: Date,         // Remove videos older than this date
    limit?: number            // Maximum number of videos to delete
  } = {}
) => {
  try {
    const videosRef = collection(db, 'videos');
    let testVideos = [];
    
    // First get videos by test user IDs if provided
    if (criteria.testUserIds && criteria.testUserIds.length > 0) {
      const q = query(videosRef, where('userId', 'in', criteria.testUserIds));
      const querySnapshot = await getDocs(q);
      testVideos.push(...querySnapshot.docs);
    }
    
    // If we have keywords, fetch all videos and filter by caption or username
    if (criteria.testKeywords && criteria.testKeywords.length > 0) {
      const q = query(videosRef, limit(criteria.limit || 500));
      const querySnapshot = await getDocs(q);
      
      const keywordVideos = querySnapshot.docs.filter(doc => {
        const data = doc.data();
        return criteria.testKeywords!.some(keyword => 
          (data.caption && data.caption.toLowerCase().includes(keyword.toLowerCase())) ||
          (data.username && data.username.toLowerCase().includes(keyword.toLowerCase()))
        );
      });
      
      // Add keyword-matching videos that weren't already added
      const existingIds = new Set(testVideos.map(doc => doc.id));
      for (const doc of keywordVideos) {
        if (!existingIds.has(doc.id)) {
          testVideos.push(doc);
        }
      }
    }
    
    // If we're filtering by date
    if (criteria.olderThan) {
      const timestamp = criteria.olderThan.getTime();
      testVideos = testVideos.filter(doc => {
        const createdAt = doc.data().createdAt?.toMillis?.();
        return createdAt && createdAt < timestamp;
      });
    }
    
    // Apply limit if specified
    if (criteria.limit && testVideos.length > criteria.limit) {
      testVideos = testVideos.slice(0, criteria.limit);
    }
    
    // Nothing to delete
    if (testVideos.length === 0) {
      console.log('No test videos found matching criteria');
      return false;
    }
    
    // Get confirmation from the user (would need to be implemented in a UI)
    console.log(`About to delete ${testVideos.length} videos. Videos to delete:`);
    const videosToDelete = testVideos.map(doc => ({
      id: doc.id,
      caption: doc.data().caption,
      username: doc.data().username
    }));
    console.table(videosToDelete);
    
    // Delete the videos using batched writes
    let deletedCount = 0;
    const batchSize = 500; // Firestore batch limit
    
    for (let i = 0; i < testVideos.length; i += batchSize) {
      const batch = writeBatch(db);
      const batchVideos = testVideos.slice(i, i + batchSize);
      
      for (const videoDoc of batchVideos) {
        const videoData = videoDoc.data();
        
        // Delete the video document
        batch.delete(doc(db, 'videos', videoDoc.id));
        
        // Update the user's video count
        if (videoData.userId) {
          const userRef = doc(db, 'users', videoData.userId);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const currentCount = userData.videoCount || 0;
            if (currentCount > 0) {
              batch.update(userRef, {
                videoCount: currentCount - 1
              });
            }
          }
        }
        
        deletedCount++;
      }
      
      await batch.commit();
    }
    
    console.log(`Successfully deleted ${deletedCount} test videos`);
    return true;
    
  } catch (error) {
    console.error("Error removing test videos:", error);
    return false;
  }
};
