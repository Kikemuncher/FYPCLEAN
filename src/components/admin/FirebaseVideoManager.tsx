'use client';

import { useState, useEffect } from 'react';
import { db, storage } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { ref, listAll, getDownloadURL } from 'firebase/storage';

export default function FirebaseVideoManager() {
  const { currentUser, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [storageVideos, setStorageVideos] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [message, setMessage] = useState("");
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  
  // Check if user is admin
  const isAdminUser = () => {
    if (!currentUser) return false;
    return (currentUser.email?.includes('admin') || userProfile?.username === 'admin');
  };
  
  // Load users for assignment dropdown
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef);
        const querySnapshot = await getDocs(q);
        
        const userList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          username: doc.data().username || 'User',
          email: doc.data().email || 'No email'
        }));
        
        setUsers(userList);
      } catch (error) {
        console.error("Error loading users:", error);
        setMessage("Failed to load users");
      }
    };
    
    if (isAdminUser()) {
      loadUsers();
    }
  }, [currentUser, userProfile]);
  
  // Scan Firebase Storage for videos
  const scanStorage = async () => {
    setLoading(true);
    setMessage("Scanning Firebase Storage for videos...");
    
    try {
      // Look in common video storage paths
      const storagePaths = ['videos', 'video', 'media'];
      let foundVideos: any[] = [];
      
      for (const path of storagePaths) {
        try {
          const storageRef = ref(storage, path);
          const result = await listAll(storageRef);
          
          // Handle case where videos are in folders by user
          if (result.prefixes.length > 0) {
            for (const prefix of result.prefixes) {
              const userFolderRef = ref(storage, `${path}/${prefix.name}`);
              const userFolderResult = await listAll(userFolderRef);
              
              for (const item of userFolderResult.items) {
                if (item.name.endsWith('.mp4') || item.name.endsWith('.mov') || item.name.endsWith('.webm')) {
                  const url = await getDownloadURL(item);
                  foundVideos.push({
                    url: url,
                    name: item.name,
                    path: `${path}/${prefix.name}/${item.name}`,
                    userId: prefix.name // The folder name might be the user ID
                  });
                }
              }
            }
          }
          
          // Handle videos directly in this path
          for (const item of result.items) {
            if (item.name.endsWith('.mp4') || item.name.endsWith('.mov') || item.name.endsWith('.webm')) {
              const url = await getDownloadURL(item);
              foundVideos.push({
                url: url,
                name: item.name,
                path: `${path}/${item.name}`,
                userId: 'unknown'
              });
            }
          }
        } catch (error) {
          console.log(`Error scanning path ${path}:`, error);
        }
      }
      
      setStorageVideos(foundVideos);
      
      if (foundVideos.length === 0) {
        setMessage("No videos found in Firebase Storage.");
      } else {
        setMessage(`Found ${foundVideos.length} videos in Firebase Storage!`);
      }
    } catch (error) {
      console.error("Error scanning storage:", error);
      setMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Assign all videos to admin
  const assignToAdmin = async () => {
    if (!currentUser) {
      setMessage("You must be logged in as admin");
      return;
    }
    
    setLoading(true);
    setMessage("Assigning videos to admin account...");
    
    try {
      const batch = writeBatch(db);
      let assignedCount = 0;
      
      for (const video of storageVideos) {
        // Check if this video URL already exists in Firestore
        const videosRef = collection(db, 'videos');
        const q = query(videosRef, where('videoUrl', '==', video.url));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          // Create a new document for this video
          const videoDocRef = doc(collection(db, 'videos'));
          batch.set(videoDocRef, {
            videoUrl: video.url,
            caption: video.name.split('.')[0] || 'Untitled Video',
            userId: currentUser.uid,
            username: userProfile?.username || 'admin',
            createdAt: serverTimestamp(),
            views: 0,
            likes: [],
            comments: 0,
            shares: 0,
            song: "Original Sound",
            status: "active",
            isPrivate: false,
            userAvatar: userProfile?.photoURL || ''
          });
          
          assignedCount++;
        }
      }
      
      if (assignedCount > 0) {
        // Update admin's video count
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          batch.update(userRef, {
            videoCount: (userData.videoCount || 0) + assignedCount
          });
        }
        
        // Commit all changes
        await batch.commit();
        
        setMessage(`Successfully assigned ${assignedCount} videos to admin account!`);
      } else {
        setMessage("No new videos to assign. All videos may already be in Firestore.");
      }
    } catch (error) {
      console.error("Error assigning videos to admin:", error);
      setMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Load all videos assigned to the admin
  const loadAdminVideos = async () => {
    if (!currentUser) {
      setMessage("You must be logged in as admin");
      return;
    }
    
    setLoading(true);
    setMessage("Loading admin videos...");
    
    try {
      const videosRef = collection(db, 'videos');
      const q = query(videosRef, where('userId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      
      const videos = querySnapshot.docs.map(doc => ({
        id: doc.id,
        url: doc.data().videoUrl,
        name: doc.data().caption || 'Untitled',
        thumbnail: doc.data().thumbnailUrl || '',
      }));
      
      setStorageVideos(videos);
      
      if (videos.length === 0) {
        setMessage("No videos found assigned to admin account.");
      } else {
        setMessage(`Found ${videos.length} videos assigned to admin!`);
        setShowAssignForm(true);
      }
    } catch (error) {
      console.error("Error loading admin videos:", error);
      setMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Toggle video selection for assignment
  const toggleVideoSelection = (videoId: string) => {
    setSelectedVideos(prev => {
      if (prev.includes(videoId)) {
        return prev.filter(id => id !== videoId);
      } else {
        return [...prev, videoId];
      }
    });
  };
  
  // Assign selected videos to a user
  const assignVideosToUser = async () => {
    if (!selectedUser || selectedVideos.length === 0) {
      setMessage("Please select videos and a target user");
      return;
    }
    
    setLoading(true);
    setMessage(`Assigning ${selectedVideos.length} videos to user...`);
    
    try {
      // Check if target user exists
      const userRef = doc(db, 'users', selectedUser);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        setMessage("Target user not found");
        setLoading(false);
        return;
      }
      
      const userData = userDoc.data();
      const batch = writeBatch(db);
      
      // Update each selected video
      for (const videoId of selectedVideos) {
        const videoRef = doc(db, 'videos', videoId);
        const videoDoc = await getDoc(videoRef);
        
        if (videoDoc.exists()) {
          batch.update(videoRef, {
            userId: selectedUser,
            username: userData.username || 'user',
            userAvatar: userData.photoURL || ''
          });
        }
      }
      
      // Update user's video count
      batch.update(userRef, {
        videoCount: (userData.videoCount || 0) + selectedVideos.length
      });
      
      // If removing from admin, update admin's count
      if (currentUser) {
        const adminRef = doc(db, 'users', currentUser.uid);
        const adminDoc = await getDoc(adminRef);
        
        if (adminDoc.exists()) {
          const adminData = adminDoc.data();
          if ((adminData.videoCount || 0) >= selectedVideos.length) {
            batch.update(adminRef, {
              videoCount: adminData.videoCount - selectedVideos.length
            });
          }
        }
      }
      
      // Commit all changes
      await batch.commit();
      
      setMessage(`Successfully assigned ${selectedVideos.length} videos to user!`);
      setSelectedVideos([]);
      
      // Reload admin videos
      loadAdminVideos();
    } catch (error) {
      console.error("Error assigning videos to user:", error);
      setMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  // Only show for admin users
  if (!isAdminUser()) {
    return null;
  }
  
  return (
    <div className="bg-zinc-900 p-6 rounded-lg mb-6">
      <h2 className="text-2xl font-bold mb-4 text-white">Firebase Video Manager</h2>
      
      {message && (
        <div className="mb-6 p-4 bg-zinc-800 rounded-lg">
          <p className="text-white">{message}</p>
        </div>
      )}
      
      <div className="space-y-6">
        {!showAssignForm ? (
          <div className="flex flex-wrap gap-3">
            <button
              onClick={scanStorage}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md disabled:opacity-50"
            >
              {loading ? 'Scanning...' : '1. Scan Storage for Videos'}
            </button>
            
            <button
              onClick={assignToAdmin}
              disabled={loading || storageVideos.length === 0}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md disabled:opacity-50"
            >
              {loading ? 'Assigning...' : '2. Assign All Videos to Admin'}
            </button>
            
            <button
              onClick={loadAdminVideos}
              disabled={loading}
              className="bg-pink-600 hover:bg-pink-700 text-white py-2 px-4 rounded-md disabled:opacity-50"
            >
              {loading ? 'Loading...' : '3. Distribute Admin Videos'}
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-4 mb-6">
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="bg-zinc-800 border border-zinc-700 text-white py-2 px-3 rounded-md"
              >
                <option value="">Select User</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.username} ({user.email})
                  </option>
                ))}
              </select>
              
              <button
                onClick={assignVideosToUser}
                disabled={loading || !selectedUser || selectedVideos.length === 0}
                className="bg-pink-600 hover:bg-pink-700 text-white py-2 px-4 rounded-md disabled:opacity-50"
              >
                {loading ? 'Assigning...' : `Assign ${selectedVideos.length} Videos`}
              </button>
              
              <button
                onClick={() => {
                  setShowAssignForm(false);
                  setSelectedVideos([]);
                }}
                className="bg-zinc-700 hover:bg-zinc-600 text-white py-2 px-4 rounded-md"
              >
                Back
              </button>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {storageVideos.map((video, index) => (
                <div 
                  key={video.id || index} 
                  className={`bg-zinc-800 rounded-lg overflow-hidden cursor-pointer ${
                    selectedVideos.includes(video.id) ? 'ring-2 ring-pink-500' : ''
                  }`}
                  onClick={() => video.id && toggleVideoSelection(video.id)}
                >
                  <div className="aspect-video">
                    <video 
                      src={video.url} 
                      className="w-full h-full object-cover"
                      muted
                      poster={video.thumbnail}
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="text-white text-sm truncate">{video.name}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {storageVideos.length > 0 && !showAssignForm && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-white mb-3">Found {storageVideos.length} Videos:</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {storageVideos.map((video, index) => (
                <div key={index} className="bg-zinc-800 rounded-lg overflow-hidden">
                  <div className="aspect-video">
                    <video 
                      src={video.url} 
                      className="w-full h-full object-cover"
                      muted
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="text-white text-sm truncate">{video.name}</h3>
                    <p className="text-zinc-400 text-xs truncate">{video.path}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
