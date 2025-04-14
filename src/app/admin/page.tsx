'use client';

import { useAuth } from '@/contexts/AuthContext';
import PageLayout from '@/components/layout/PageLayout';
import FirebaseVideoManager from '@/components/admin/FirebaseVideoManager';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc, 
  getDoc, 
  orderBy, 
  limit, 
  writeBatch
} from 'firebase/firestore';
import { syncStorageWithFirestore, linkVideosToUser } from '@/utils/storageSyncUtils';

export default function AdminPage() {
  const { currentUser, userProfile, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('videos');
  const [videos, setVideos] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [targetUser, setTargetUser] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [syncStatus, setSyncStatus] = useState('');
  const [syncInProgress, setSyncInProgress] = useState(false);
  
  // Load initial data
  useEffect(() => {
    if (!isAdminUser()) return;
    
    if (activeTab === 'videos') {
      loadVideos();
    } else if (activeTab === 'users') {
      loadUsers();
    }
  }, [activeTab]);
  
  // Check if user is admin
  const isAdminUser = () => {
    if (!currentUser) return false;
    
    return (
      (currentUser.email && currentUser.email.includes('admin')) ||
      (userProfile?.username && userProfile.username.toLowerCase() === 'admin') ||
      (userProfile?.role === 'admin')
    );
  };
  
  const loadVideos = async () => {
    try {
      setIsProcessing(true);
      const videosRef = collection(db, 'videos');
      const q = query(videosRef, orderBy('createdAt', 'desc'), limit(50));
      const querySnapshot = await getDocs(q);
      
      const videoData = [];
      for (const videoDoc of querySnapshot.docs) {
        const data = videoDoc.data();
        
        // Fetch user info
        let username = data.username || 'Unknown';
        let userAvatar = data.userAvatar || '';
        
        if (data.userId) {
          try {
            const userDoc = await getDoc(doc(db, 'users', data.userId));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              username = userData.username || data.username || 'Unknown';
              userAvatar = userData.photoURL || data.userAvatar || '';
            }
          } catch (e) {
            // Continue with existing data if user fetch fails
          }
        }
        
        videoData.push({
          id: videoDoc.id,
          userId: data.userId || '',
          username,
          caption: data.caption || 'No caption',
          videoUrl: data.videoUrl || '',
          thumbnailUrl: data.thumbnailUrl || '',
          userAvatar,
          views: data.views || 0,
          likes: Array.isArray(data.likes) ? data.likes.length : data.likes || 0,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toLocaleDateString() : 'Unknown date'
        });
      }
      
      setVideos(videoData);
    } catch (error) {
      console.error("Error loading videos:", error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const loadUsers = async () => {
    try {
      setIsProcessing(true);
      const usersRef = collection(db, 'users');
      const q = query(usersRef, limit(50));
      const querySnapshot = await getDocs(q);
      
      const userData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setUsers(userData);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleVideoSelect = (videoId) => {
    setSelectedVideos(prev => {
      if (prev.includes(videoId)) {
        return prev.filter(id => id !== videoId);
      } else {
        return [...prev, videoId];
      }
    });
  };
  
  const handleSelectAll = () => {
    if (selectedVideos.length === videos.length) {
      setSelectedVideos([]);
    } else {
      setSelectedVideos(videos.map(video => video.id));
    }
  };
  
  const assignVideosToUser = async () => {
    if (!targetUser || selectedVideos.length === 0) {
      setActionMessage('Please select videos and a target user');
      return;
    }
    
    try {
      setIsProcessing(true);
      setActionMessage('');
      
      // Verify target user exists
      const targetUserRef = doc(db, 'users', targetUser);
      const targetUserDoc = await getDoc(targetUserRef);
      
      if (!targetUserDoc.exists()) {
        setActionMessage('Target user not found');
        return;
      }
      
      const targetUserData = targetUserDoc.data();
      const batch = writeBatch(db);
      
      // Process selected videos
      for (const videoId of selectedVideos) {
        const videoRef = doc(db, 'videos', videoId);
        batch.update(videoRef, {
          userId: targetUser,
          username: targetUserData.username || 'unknown'
        });
      }
      
      // Update user's video count
      batch.update(targetUserRef, {
        videoCount: (targetUserData.videoCount || 0) + selectedVideos.length
      });
      
      await batch.commit();
      
      setActionMessage(`Successfully assigned ${selectedVideos.length} videos to user`);
      setSelectedVideos([]);
      loadVideos();
      
    } catch (error) {
      console.error("Error assigning videos:", error);
      setActionMessage(`Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const deleteSelectedVideos = async () => {
    if (selectedVideos.length === 0) {
      setActionMessage('Please select videos to delete');
      return;
    }
    
    if (!confirm(`Are you sure you want to delete ${selectedVideos.length} videos?`)) {
      return;
    }
    
    try {
      setIsProcessing(true);
      setActionMessage('');
      
      const batch = writeBatch(db);
      
      for (const videoId of selectedVideos) {
        const videoRef = doc(db, 'videos', videoId);
        const videoDoc = await getDoc(videoRef);
        
        if (videoDoc.exists()) {
          const videoData = videoDoc.data();
          
          // Delete video document
          batch.delete(videoRef);
          
          // Update user's video count if needed
          if (videoData.userId) {
            const userRef = doc(db, 'users', videoData.userId);
            const userDoc = await getDoc(userRef);
            
            if (userDoc.exists()) {
              const userData = userDoc.data();
              if (userData.videoCount > 0) {
                batch.update(userRef, {
                  videoCount: userData.videoCount - 1
                });
              }
            }
          }
        }
      }
      
      await batch.commit();
      
      setActionMessage(`Successfully deleted ${selectedVideos.length} videos`);
      setSelectedVideos([]);
      loadVideos();
      
    } catch (error) {
      console.error("Error deleting videos:", error);
      setActionMessage(`Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleStorageSync = async () => {
    try {
      setSyncInProgress(true);
      setSyncStatus('Scanning storage for videos...');
      
      const result = await syncStorageWithFirestore();
      
      setSyncStatus(`Sync complete! Found ${result.totalVideos} videos, created ${result.newDocsCreated} new documents.`);
      
      // Reload videos if we're on the videos tab
      if (activeTab === 'videos') {
        loadVideos();
      }
    } catch (error) {
      setSyncStatus(`Error: ${error.message}`);
      console.error('Error syncing storage with Firestore:', error);
    } finally {
      setSyncInProgress(false);
    }
  };
  
  const handleLinkVideosToUser = async (userId: string, username: string) => {
    try {
      setSyncInProgress(true);
      setSyncStatus(`Linking videos to user: ${username}...`);
      
      const result = await linkVideosToUser(userId, username);
      
      setSyncStatus(`Linked ${result.processed} videos to user: ${username}`);
      
      // Reload videos if we're on the videos tab
      if (activeTab === 'videos') {
        loadVideos();
      }
    } catch (error) {
      setSyncStatus(`Error: ${error.message}`);
      console.error('Error linking videos to user:', error);
    } finally {
      setSyncInProgress(false);
    }
  };
  
  // Filter videos based on search term
  const filteredVideos = videos.filter(video => 
    video.caption.toLowerCase().includes(searchTerm.toLowerCase()) ||
    video.username.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Don't redirect immediately, wait for auth to complete
  useEffect(() => {
    if (!loading && !isAdminUser()) {
      router.push('/');
    }
  }, [currentUser, userProfile, loading]);
  
  if (loading) {
    return (
      <PageLayout>
        <div className="flex justify-center items-center min-h-[70vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-600"></div>
        </div>
      </PageLayout>
    );
  }
  
  if (!isAdminUser()) {
    return (
      <PageLayout>
        <div className="flex justify-center items-center min-h-[70vh]">
          <div className="bg-red-100 text-red-700 p-4 rounded-md">
            Access denied. Admin privileges required.
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="bg-zinc-900 rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-white">Admin Dashboard</h1>
        
        {/* Firebase Video Manager - Top Priority */}
        <FirebaseVideoManager />
        
        {/* Tabs */}
        <div className="flex border-b border-zinc-700 mb-6 overflow-x-auto">
          <button
            className={`py-3 px-6 whitespace-nowrap ${activeTab === 'videos' ? 'text-pink-500 border-b-2 border-pink-500' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('videos')}
          >
            Videos
          </button>
          <button
            className={`py-3 px-6 whitespace-nowrap ${activeTab === 'users' ? 'text-pink-500 border-b-2 border-pink-500' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
          <button
            className={`py-3 px-6 whitespace-nowrap ${activeTab === 'storage' ? 'text-pink-500 border-b-2 border-pink-500' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('storage')}
          >
            Storage Sync
          </button>
        </div>
        
        {/* Search bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-2 px-4 bg-zinc-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>
        
        {/* Action message */}
        {actionMessage && (
          <div className={`mb-6 p-4 rounded-md ${actionMessage.includes('Error') ? 'bg-red-900/20 text-red-500' : 'bg-green-900/20 text-green-500'}`}>
            {actionMessage}
          </div>
        )}
        
        {/* Videos tab content */}
        {activeTab === 'videos' && (
          <div>
            {/* Action bar */}
            <div className="mb-6 flex flex-wrap gap-4">
              <button
                onClick={handleSelectAll}
                className="py-2 px-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-md"
              >
                {selectedVideos.length === videos.length ? 'Deselect All' : 'Select All'}
              </button>
              
              <select
                value={targetUser}
                onChange={(e) => setTargetUser(e.target.value)}
                className="py-2 px-4 bg-zinc-800 text-white rounded-md"
              >
                <option value="">Select Target User</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.username || user.email || user.id}
                  </option>
                ))}
              </select>
              
              <button
                onClick={assignVideosToUser}
                disabled={isProcessing || selectedVideos.length === 0 || !targetUser}
                className="py-2 px-4 bg-pink-600 hover:bg-pink-700 text-white rounded-md disabled:opacity-50"
              >
                Assign to User
              </button>
              
              <button
                onClick={deleteSelectedVideos}
                disabled={isProcessing || selectedVideos.length === 0}
                className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-md disabled:opacity-50"
              >
                Delete Selected
              </button>
              
              <button
                onClick={loadVideos}
                disabled={isProcessing}
                className="py-2 px-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-md disabled:opacity-50"
              >
                Refresh
              </button>
            </div>
            
            {/* Video grid */}
            {isProcessing && videos.length === 0 ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-pink-500"></div>
              </div>
            ) : filteredVideos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredVideos.map(video => (
                  <div 
                    key={video.id} 
                    className={`bg-zinc-800 rounded-lg overflow-hidden ${
                      selectedVideos.includes(video.id) ? 'ring-2 ring-pink-500' : ''
                    }`}
                    onClick={() => handleVideoSelect(video.id)}
                  >
                    <div className="aspect-video relative">
                      {video.thumbnailUrl ? (
                        <img 
                          src={video.thumbnailUrl} 
                          alt={video.caption} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-zinc-700 flex items-center justify-center">
                          <span className="text-gray-400">No Thumbnail</span>
                        </div>
                      )}
                      
                      <div className="absolute top-2 left-2">
                        <input 
                          type="checkbox" 
                          checked={selectedVideos.includes(video.id)}
                          onChange={() => {}} // Handled by parent click
                          onClick={e => e.stopPropagation()}
                          className="h-5 w-5 accent-pink-500"
                        />
                      </div>
                      
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 py-1 px-2 rounded text-xs text-white">
                        {video.views} views
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="flex items-center mb-2">
                        <img 
                          src={video.userAvatar || "https://via.placeholder.com/40"} 
                          alt={video.username}
                          className="w-8 h-8 rounded-full mr-2 object-cover"
                        />
                        <span className="text-sm text-white">{video.username}</span>
                      </div>
                      <p className="text-gray-300 text-sm mb-1 line-clamp-2">{video.caption}</p>
                      <p className="text-gray-400 text-xs">{video.createdAt}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-400">No videos found</p>
              </div>
            )}
          </div>
        )}
        
        {/* Users tab content */}
        {activeTab === 'users' && (
          <div>
            {/* Users table */}
            {isProcessing && users.length === 0 ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-pink-500"></div>
              </div>
            ) : filteredUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-zinc-800">
                    <tr>
                      <th className="py-2 px-4 text-left text-white">Username</th>
                      <th className="py-2 px-4 text-left text-white">Email</th>
                      <th className="py-2 px-4 text-left text-white">ID</th>
                      <th className="py-2 px-4 text-center text-white">Videos</th>
                      <th className="py-2 px-4 text-center text-white">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user.id} className="border-b border-zinc-700">
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <img 
                              src={user.photoURL || "https://via.placeholder.com/40"}
                              alt={user.username || "User"}
                              className="w-8 h-8 rounded-full mr-2 object-cover"
                            />
                            <span className="text-white">{user.username || 'No Username'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-300">{user.email || 'No Email'}</td>
                        <td className="py-3 px-4 text-gray-400">{user.id}</td>
                        <td className="py-3 px-4 text-center text-gray-300">{user.videoCount || 0}</td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => {
                              setTargetUser(user.id);
                              setActiveTab('videos');
                            }}
                            className="bg-zinc-700 hover:bg-zinc-600 text-white py-1 px-3 rounded-md text-sm"
                          >
                            View Videos
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-400">No users found</p>
              </div>
            )}
          </div>
        )}
        
        {/* Storage Sync tab content */}
        {activeTab === 'storage' && (
          <div>
            <div className="mb-6 bg-zinc-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-white mb-4">Storage to Firestore Sync</h2>
              <p className="text-gray-300 mb-6">
                This utility scans videos in Firebase Storage and creates corresponding Firestore documents.
                Use this if you have videos in Storage but don't see them in the app.
              </p>
              
              <button
                onClick={handleStorageSync}
                disabled={syncInProgress}
                className="py-2 px-6 bg-pink-600 hover:bg-pink-700 text-white rounded-md disabled:opacity-50"
              >
                {syncInProgress ? 'Syncing...' : 'Start Sync'}
              </button>
              
              {syncStatus && (
                <div className="mt-4 p-4 bg-zinc-700 rounded-lg">
                  <p className="text-white">{syncStatus}</p>
                </div>
              )}
            </div>
            
            <div className="bg-zinc-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-white mb-4">Link Videos to Users</h2>
              <p className="text-gray-300 mb-6">
                Select a user to link their storage videos to their account.
              </p>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-zinc-700">
                      <th className="py-2 px-4 text-left text-white">Username</th>
                      <th className="py-2 px-4 text-left text-white">Email</th>
                      <th className="py-2 px-4 text-center text-white">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id} className="border-b border-zinc-700">
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <img 
                              src={user.photoURL || "https://via.placeholder.com/40"}
                              alt={user.username || "User"}
                              className="w-8 h-8 rounded-full mr-2 object-cover"
                            />
                            <span className="text-white">{user.username || 'No Username'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-300">{user.email || 'No Email'}</td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleLinkVideosToUser(user.id, user.username || user.email || user.id)}
                            disabled={syncInProgress}
                            className="bg-pink-600 hover:bg-pink-700 text-white py-1 px-3 rounded-md text-sm disabled:opacity-50"
                          >
                            Link Videos
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
