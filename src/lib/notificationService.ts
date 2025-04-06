// src/lib/notificationService.ts
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  writeBatch,
  serverTimestamp,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from './firebase';

export interface Notification {
  id: string;
  type: 'follow' | 'like' | 'comment' | 'mention';
  fromUserId: string;
  fromUsername?: string;
  fromUserPhoto?: string;
  toUserId: string;
  videoId?: string;
  commentId?: string;
  comment?: string;
  read: boolean;
  createdAt: number;
}

// Get user notifications
export const getUserNotifications = async (
  userId: string,
  lastVisibleDoc?: QueryDocumentSnapshot<DocumentData>,
  pageSize: number = 20
): Promise<{notifications: Notification[], lastVisible: QueryDocumentSnapshot<DocumentData> | null}> => {
  try {
    let notificationsQuery;
    
    if (lastVisibleDoc) {
      notificationsQuery = query(
        collection(db, 'notifications'),
        where('toUserId', '==', userId),
        orderBy('createdAt', 'desc'),
        startAfter(lastVisibleDoc),
        limit(pageSize)
      );
    } else {
      notificationsQuery = query(
        collection(db, 'notifications'),
        where('toUserId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      );
    }
    
    const querySnapshot = await getDocs(notificationsQuery);
    
    const notifications: Notification[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      notifications.push({
        id: doc.id,
        type: data.type,
        fromUserId: data.fromUserId,
        fromUsername: data.fromUsername,
        fromUserPhoto: data.fromUserPhoto,
        toUserId: data.toUserId,
        videoId: data.videoId,
        commentId: data.commentId,
        comment: data.comment,
        read: data.read,
        createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now()
      });
    });
    
    const lastVisible = querySnapshot.docs.length > 0 ? 
      querySnapshot.docs[querySnapshot.docs.length - 1] : null;
      
    return { notifications, lastVisible };
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    return { notifications: [], lastVisible: null };
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId: string): Promise<boolean> => {
  try {
    await updateDoc(doc(db, 'notifications', notificationId), {
      read: true
    });
    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (userId: string): Promise<boolean> => {
  try {
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('toUserId', '==', userId),
      where('read', '==', false)
    );
    
    const querySnapshot = await getDocs(notificationsQuery);
    
    if (querySnapshot.empty) {
      return true;
    }
    
    const batch = writeBatch(db);
    
    querySnapshot.forEach((doc) => {
      batch.update(doc.ref, { read: true });
    });
    
    await batch.commit();
    return true;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }
};

// Create follow notification
export const createFollowNotification = async (
  fromUserId: string,
  toUserId: string
): Promise<boolean> => {
  try {
    // Get user data
    const userDoc = await getDoc(doc(db, 'users', fromUserId));
    
    if (!userDoc.exists()) {
      return false;
    }
    
    const userData = userDoc.data();
    
    // Check if notification already exists
    const existingQuery = query(
      collection(db, 'notifications'),
      where('type', '==', 'follow'),
      where('fromUserId', '==', fromUserId),
      where('toUserId', '==', toUserId)
    );
    
    const existingDocs = await getDocs(existingQuery);
    
    if (!existingDocs.empty) {
      // Update existing notification instead of creating a new one
      const existingDoc = existingDocs.docs[0];
      await updateDoc(existingDoc.ref, {
        read: false,
        createdAt: serverTimestamp()
      });
      return true;
    }
    
    // Create new notification
    await addDoc(collection(db, 'notifications'), {
      type: 'follow',
      fromUserId,
      fromUsername: userData.username,
      fromUserPhoto: userData.photoURL,
      toUserId,
      read: false,
      createdAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error creating follow notification:', error);
    return false;
  }
};

// Create like notification
export const createLikeNotification = async (
  fromUserId: string,
  toUserId: string,
  videoId: string
): Promise<boolean> => {
  try {
    // Get user data
    const userDoc = await getDoc(doc(db, 'users', fromUserId));
    
    if (!userDoc.exists()) {
      return false;
    }
    
    const userData = userDoc.data();
    
    // Check if notification already exists
    const existingQuery = query(
      collection(db, 'notifications'),
      where('type', '==', 'like'),
      where('fromUserId', '==', fromUserId),
      where('toUserId', '==', toUserId),
      where('videoId', '==', videoId)
    );
    
    const existingDocs = await getDocs(existingQuery);
    
    if (!existingDocs.empty) {
      // Update existing notification instead of creating a new one
      const existingDoc = existingDocs.docs[0];
      await updateDoc(existingDoc.ref, {
        read: false,
        createdAt: serverTimestamp()
      });
      return true;
    }
    
    // Create new notification
    await addDoc(collection(db, 'notifications'), {
      type: 'like',
      fromUserId,
      fromUsername: userData.username,
      fromUserPhoto: userData.photoURL,
      toUserId,
      videoId,
      read: false,
      createdAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error creating like notification:', error);
    return false;
  }
};

// Create comment notification
export const createCommentNotification = async (
  fromUserId: string,
  toUserId: string,
  videoId: string,
  commentId: string,
  comment: string
): Promise<boolean> => {
  try {
    // Get user data
    const userDoc = await getDoc(doc(db, 'users', fromUserId));
    
    if (!userDoc.exists()) {
      return false;
    }
    
    const userData = userDoc.data();
    
    // Create notification
    await addDoc(collection(db, 'notifications'), {
      type: 'comment',
      fromUserId,
      fromUsername: userData.username,
      fromUserPhoto: userData.photoURL,
      toUserId,
      videoId,
      commentId,
      comment: comment.length > 100 ? comment.substring(0, 100) + '...' : comment,
      read: false,
      createdAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error creating comment notification:', error);
    return false;
  }
};

// Get unread notification count
export const getUnreadNotificationCount = async (userId: string): Promise<number> => {
  try {
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('toUserId', '==', userId),
      where('read', '==', false)
    );
    
    const querySnapshot = await getDocs(notificationsQuery);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error getting unread notification count:', error);
    return 0;
  }
};
