// This file should be run directly in your app
// Add this to a page temporarily to run direct debugging

import { useState, useEffect } from 'react';
import { 
  initializeApp, 
  getApps
} from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit,
  collectionGroup
} from 'firebase/firestore';

export default function DebugFirebase() {
  const [messages, setMessages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Log a message and add it to state
  const log = (message: string) => {
    console.log(message);
    setMessages(prev => [...prev, message]);
  };

  useEffect(() => {
    const debugFirebase = async () => {
      log("Starting Firebase debugging...");
      
      try {
        // 1. Directly initialize Firebase
        const firebaseConfig = {
          apiKey: "AIzaSyC4SfB5JU5HyMA0KTZ1s1X6BukAaLluR1I",
          authDomain: "tiktok-a7af5.firebaseapp.com",
          projectId: "tiktok-a7af5",
          storageBucket: "tiktok-a7af5.appspot.com",
          messagingSenderId: "609721475346",
          appId: "1:609721475346:web:c80084600ed104b6b153cb",
          measurementId: "G-3Z96CKXW1W"
        };
        
        log("Firebase config loaded");
        
        // 2. Initialize the Firebase app directly
        let app;
        if (!getApps().length) {
          app = initializeApp(firebaseConfig);
          log("Firebase app initialized");
        } else {
          app = getApps()[0];
          log("Using existing Firebase app");
        }
        
        // 3. Initialize Firestore directly
        const db = getFirestore(app);
        log("Firestore initialized");
        
        // 4. Try direct collection query
        log("Attempting to query 'videos' collection...");
        const videosRef = collection(db, 'videos');
        const q1 = query(videosRef, orderBy('timestamp', 'desc'), limit(10));
        
        const snapshot1 = await getDocs(q1);
        log(`Query returned ${snapshot1.docs.length} documents`);
        
        if (snapshot1.docs.length > 0) {
          const firstDoc = snapshot1.docs[0].data();
          log(`First document fields: ${Object.keys(firstDoc).join(', ')}`);
          log(`Video URL: ${firstDoc.url || 'missing'}`);
        } else {
          log("No documents found in videos collection");
          
          // 5. Try a different query approach - collection group
          log("Trying collectionGroup query...");
          const q2 = query(collectionGroup(db, 'videos'), limit(10));
          
          const snapshot2 = await getDocs(q2);
          log(`CollectionGroup query returned ${snapshot2.docs.length} documents`);
          
          if (snapshot2.docs.length > 0) {
            const firstDoc = snapshot2.docs[0].data();
            log(`First document fields: ${Object.keys(firstDoc).join(', ')}`);
            log(`Document path: ${snapshot2.docs[0].ref.path}`);
          } else {
            log("No documents found in any videos collection");
          }
        }
      } catch (error) {
        log(`Error during debugging: ${error}`);
      }
      
      setIsLoading(false);
    };
    
    debugFirebase();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Firebase Debugging</h1>
      
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="bg-black text-white p-4 rounded">
          <pre className="whitespace-pre-wrap">
            {messages.map((msg, i) => (
              <div key={i}>{msg}</div>
            ))}
          </pre>
        </div>
      )}
    </div>
  );
}
