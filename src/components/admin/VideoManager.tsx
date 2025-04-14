'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  listAllVideos, 
  assignVideosToUser, 
  removeTestVideos 
} from '@/utils/firebaseAdmin';

export default function VideoManager() {
  const { currentUser, userProfile } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [targetUserId, setTargetUserId] = useState('');
  const [testUserIds, setTestUserIds] = useState('');
  const [testKeywords, setTestKeywords] = useState('test,sample,debug');
  const [operation, setOperation] = useState('list'); // list, assign, remove

  // Enhanced admin check function
  const isAdminUser = () => {
    if (!currentUser) return false;
    
    // Check multiple conditions that could identify an admin
    return (
      // Check email
      (currentUser.email && currentUser.email.includes('admin')) ||
      // Check username
      (userProfile?.username && userProfile.username.toLowerCase() === 'admin') ||
      // Check display name
      (userProfile?.displayName && userProfile.displayName.includes('Admin')) ||
      // Check custom admin role if it exists
      (userProfile?.role === 'admin')
    );
  };

  // Only allow admins to access this component
  if (!isAdminUser()) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-md">
        Access denied. Admin privileges required.
      </div>
    );
  }

  const handleListVideos = async () => {
    try {
      setLoading(true);
      setMessage('');
      const result = await listAllVideos();
      setVideos(result);
      setMessage(`Found ${result.length} videos`);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAssignVideos = async () => {
    if (!targetUserId) {
      setMessage('Please enter a target user ID');
      return;
    }
    
    try {
      setLoading(true);
      setMessage('');
      
      const sourceUserIds = testUserIds.split(',')
        .map(id => id.trim())
        .filter(id => id);
      
      const result = await assignVideosToUser(targetUserId, {
        sourceUserIds: sourceUserIds.length > 0 ? sourceUserIds : undefined,
        count: 10,
        deleteOriginal: false
      });
      
      if (result) {
        setMessage('Successfully assigned videos');
      } else {
        setMessage('Failed to assign videos');
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRemoveTestVideos = async () => {
    try {
      setLoading(true);
      setMessage('');
      
      const userIds = testUserIds.split(',')
        .map(id => id.trim())
        .filter(id => id);
        
      const keywords = testKeywords.split(',')
        .map(kw => kw.trim())
        .filter(kw => kw);
      
      const result = await removeTestVideos({
        testUserIds: userIds.length > 0 ? userIds : undefined,
        testKeywords: keywords.length > 0 ? keywords : undefined,
        limit: 50
      });
      
      if (result) {
        setMessage('Successfully removed test videos');
      } else {
        setMessage('No test videos found or removal failed');
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-md shadow-md">
      <h2 className="text-xl font-bold mb-6">Video Management</h2>
      
      {/* Operation selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Operation
        </label>
        <div className="flex space-x-4">
          <button
            className={`px-4 py-2 rounded ${operation === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setOperation('list')}
          >
            List Videos
          </button>
          <button
            className={`px-4 py-2 rounded ${operation === 'assign' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setOperation('assign')}
          >
            Assign Videos
          </button>
          <button
            className={`px-4 py-2 rounded ${operation === 'remove' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setOperation('remove')}
          >
            Remove Test Videos
          </button>
        </div>
      </div>
      
      {/* Form fields based on operation */}
      {operation === 'assign' && (
        <div className="mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target User ID
            </label>
            <input
              type="text"
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="User ID to assign videos to"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Source User IDs (comma separated, optional)
            </label>
            <input
              type="text"
              value={testUserIds}
              onChange={(e) => setTestUserIds(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="User IDs to take videos from"
            />
          </div>
        </div>
      )}
      
      {operation === 'remove' && (
        <div className="mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Test User IDs (comma separated, optional)
            </label>
            <input
              type="text"
              value={testUserIds}
              onChange={(e) => setTestUserIds(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="User IDs to remove videos from"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Test Keywords (comma separated)
            </label>
            <input
              type="text"
              value={testKeywords}
              onChange={(e) => setTestKeywords(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Keywords to identify test videos"
            />
          </div>
        </div>
      )}
      
      {/* Action button */}
      <button
        onClick={() => {
          if (operation === 'list') handleListVideos();
          else if (operation === 'assign') handleAssignVideos();
          else if (operation === 'remove') handleRemoveTestVideos();
        }}
        disabled={loading}
        className={`px-6 py-2 rounded-md ${
          loading ? 'bg-gray-400' : operation === 'remove' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
        } text-white font-medium`}
      >
        {loading ? 'Processing...' : 
         operation === 'list' ? 'List Videos' : 
         operation === 'assign' ? 'Assign Videos' : 'Remove Test Videos'}
      </button>
      
      {message && (
        <div className={`mt-4 p-3 rounded-md ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}
      
      {/* Results display */}
      {videos.length > 0 && operation === 'list' && (
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Caption
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Username
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {videos.map(video => (
                <tr key={video.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {video.id.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {video.caption?.substring(0, 30) || 'No caption'}
                    {video.caption?.length > 30 ? '...' : ''}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {video.username || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {video.userEmail || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {video.createdAt?.toLocaleString() || 'Unknown'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
