'use client';

import { useState, useEffect } from 'react';
import { storage } from '@/lib/firebase';
import { ref, listAll, getDownloadURL } from 'firebase/storage';
import Link from 'next/link';

export default function StorageTestPage() {
  const [status, setStatus] = useState<string>('Testing Storage connection...');
  const [error, setError] = useState<string | null>(null);
  const [folderContents, setFolderContents] = useState<any[]>([]);

  useEffect(() => {
    async function testStorage() {
      try {
        // First check if storage is initialized
        if (!storage) {
          setStatus('Firebase Storage is not initialized');
          setError('Storage object is undefined');
          return;
        }

        // Try to list root items
        setStatus('Listing root folders...');
        const rootRef = ref(storage, '/');
        
        try {
          const rootResult = await listAll(rootRef);
          
          setFolderContents([
            ...rootResult.prefixes.map(folder => ({ 
              name: folder.name,
              type: 'folder'
            })),
            ...rootResult.items.map(item => ({ 
              name: item.name, 
              type: 'file'
            }))
          ]);
          
          setStatus(`Storage connection successful! Found ${rootResult.prefixes.length} folders and ${rootResult.items.length} files`);
          
          // Try to check if videos folder exists
          const videosRef = ref(storage, 'videos');
          try {
            const videosResult = await listAll(videosRef);
            setStatus(prev => `${prev}\nFound 'videos' folder with ${videosResult.items.length} items.`);
          } catch (videosError) {
            setError(`Error accessing 'videos' folder: ${videosError.code}. You may need to create this folder in Firebase console.`);
          }
        } catch (listError) {
          console.error('Error listing storage contents:', listError);
          setStatus('Error accessing Firebase Storage');
          setError(`${listError.code}: ${listError.message}`);
        }
      } catch (error) {
        console.error('Storage test error:', error);
        setStatus('Error testing Storage connection');
        setError(error.message);
      }
    }

    testStorage();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl font-bold mb-6">Firebase Storage Test</h1>
      
      <div className="bg-zinc-900 p-4 rounded-lg mb-6">
        <h2 className="font-bold mb-2">Status</h2>
        <p className={status.includes('successful') ? 'text-green-400' : 'text-yellow-400'}>
          {status}
        </p>
        
        {error && (
          <div className="mt-4 p-3 bg-red-900/30 border border-red-500 rounded">
            <p className="text-red-400">{error}</p>
          </div>
        )}
      </div>
      
      {folderContents.length > 0 && (
        <div className="bg-zinc-900 p-4 rounded-lg mb-6">
          <h2 className="font-bold mb-2">Storage Contents</h2>
          <ul className="space-y-1">
            {folderContents.map((item, index) => (
              <li key={index} className="flex items-center">
                <span className="mr-2">
                  {item.type === 'folder' ? '📁' : '📄'}
                </span>
                <span>{item.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="bg-zinc-900 p-4 rounded-lg mb-6">
        <h2 className="font-bold mb-2">Troubleshooting Steps</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>Check Firebase console to ensure Storage is enabled for your project</li>
          <li>Create a 'videos' folder in Firebase Storage if it doesn't exist</li>
          <li>Verify Storage Rules allow read access:
            <pre className="bg-black p-2 mt-1 rounded text-xs overflow-x-auto">
              {`rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /videos/{videoId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}`}
            </pre>
          </li>
          <li>Try uploading a test video through Firebase console</li>
        </ol>
      </div>
      
      <Link href="/" className="bg-pink-500 hover:bg-pink-600 text-white py-2 px-4 rounded">
        Back Home
      </Link>
    </div>
  );
}
