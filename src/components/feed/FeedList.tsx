// src/components/feed/FeedList.tsx 
// Add this near the top with your other imports:
import { initializeApp } from "firebase/app";
import { getStorage, ref, listAll, getDownloadURL } from "firebase/storage";

// Then update your loadVideos function in useEffect:

useEffect(() => {
  console.log("Starting to fetch videos...");
  let isMounted = true;
  
  const loadVideos = async () => {
    try {
      // First try using your existing fetchVideos function
      console.log("Trying to fetch videos through store...");
      await fetchVideos();
      
      // Check if videos were loaded
      if (videos.length === 0) {
        console.log("No videos loaded from store, trying direct method");
        
        // Initialize Firebase directly with correct config
        const firebaseConfig = {
          apiKey: "AIzaSyC4SfB5JU5HyMA0KTZ1s1X6BukAaLluR1I",
          authDomain: "tiktok-a7af5.firebaseapp.com",
          projectId: "tiktok-a7af5",
          storageBucket: "tiktok-a7af5.firebasestorage.app",
          messagingSenderId: "609721475346",
          appId: "1:609721475346:web:c80084600ed104b6b153cb",
          measurementId: "G-3Z96CKXW1W"
        };
        
        // Initialize a separate Firebase instance just for this component
        const app = initializeApp(firebaseConfig, 'feed-list-' + Date.now());
        const storage = getStorage(app);
        
        // List videos directly
        const videosRef = ref(storage, 'videos');
        const result = await listAll(videosRef);
        
        if (result.items.length > 0) {
          console.log(`Found ${result.items.length} videos directly`);
          
          // Process videos and create video objects
          const directVideos = [];
          
          // Only get first 5 videos for testing
          for (const item of result.items.slice(0, 5)) {
            try {
              const url = await getDownloadURL(item);
              directVideos.push({
                id: item.name,
                videoUrl: url,
                username: "user",
                userAvatar: "https://placehold.co/100x100",
                song: "Song Name",
                caption: item.name.replace(/\.\w+$/, '').replace(/Snaptik\.app_/, '')
              });
            } catch (err) {
              console.error(`Error getting URL for ${item.name}:`, err);
            }
          }
          
          if (directVideos.length > 0 && isMounted) {
            // Use setCurrentVideoIndex from your store
            setCurrentVideoIndex(0);
            
            // If your store has setVideos method, use it
            if (typeof useVideoStore().setVideos === 'function') {
              useVideoStore().setVideos(directVideos);
            } else {
              // Otherwise, find another way to update the videos
              // This depends on how your store is structured
              console.log("Store doesn't have setVideos method");
            }
            
            setIsLoading(false);
          }
        } else {
          if (isMounted) {
            setLoadingError("No videos found in storage");
            setIsLoading(false);
          }
        }
      } else {
        // Videos loaded from store successfully
        if (isMounted) {
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error("Error loading videos:", error);
      if (isMounted) {
        setLoadingError("Failed to load videos. Please refresh the page.");
        setIsLoading(false);
      }
    }
  };
  
  loadVideos();
  
  return () => {
    isMounted = false;
  };
}, [fetchVideos]);
