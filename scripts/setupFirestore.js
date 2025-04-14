// Firestore Setup and Test Script

// Import Firebase modules
const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query,
  limit,
  serverTimestamp
} = require('firebase/firestore');

// Firebase configuration - replace with your actual config
const firebaseConfig = {
  apiKey: "AIzaSyC4SfB5JU5HyMA0KTZ1s1X6BukAaLluR1I",
  authDomain: "tiktok-a7af5.firebaseapp.com",
  projectId: "tiktok-a7af5",
  storageBucket: "tiktok-a7af5.appspot.com", 
  messagingSenderId: "609721475346",
  appId: "1:609721475346:web:c80084600ed104b6b153cb",
  measurementId: "G-3Z96CKXW1W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Test 1: Basic Firestore connectivity
 */
async function testFirestoreConnectivity() {
  console.log('🔍 Test 1: Testing basic Firestore connectivity...');
  
  try {
    // Try to access a collection
    const testCollection = collection(db, 'test-collection');
    const q = query(testCollection, limit(1));
    const snapshot = await getDocs(q);
    
    console.log(`✅ Firestore connection successful. Found ${snapshot.size} documents.`);
    return true;
  } catch (error) {
    console.error(`❌ Firestore connection failed: ${error.message}`);
    return false;
  }
}

/**
 * Test 2: CRUD operations test
 */
async function testFirestoreCRUD() {
  console.log('\n🔍 Test 2: Testing Firestore CRUD operations...');
  
  const testDocId = `test-doc-${Date.now()}`;
  const testCollectionName = 'firestore-tests';
  
  try {
    // Create operation
    console.log(`📝 Creating test document: ${testCollectionName}/${testDocId}`);
    
    const testData = {
      message: 'Test data from setupFirestore.js',
      timestamp: serverTimestamp(),
      testId: testDocId,
      testNumber: Math.floor(Math.random() * 1000)
    };
    
    await setDoc(doc(db, testCollectionName, testDocId), testData);
    console.log('✅ CREATE operation successful');
    
    // Read operation
    console.log(`📖 Reading test document: ${testCollectionName}/${testDocId}`);
    const docSnap = await getDoc(doc(db, testCollectionName, testDocId));
    
    if (docSnap.exists()) {
      console.log('✅ READ operation successful:', docSnap.data());
    } else {
      throw new Error('Document does not exist after creation');
    }
    
    // Update operation
    console.log(`🔄 Updating test document: ${testCollectionName}/${testDocId}`);
    await setDoc(doc(db, testCollectionName, testDocId), {
      ...testData,
      updated: true,
      updateTimestamp: serverTimestamp()
    }, { merge: true });
    console.log('✅ UPDATE operation successful');
    
    // Read again to verify update
    const updatedDocSnap = await getDoc(doc(db, testCollectionName, testDocId));
    if (updatedDocSnap.exists() && updatedDocSnap.data().updated === true) {
      console.log('✅ Verified update was successful:', updatedDocSnap.data());
    } else {
      throw new Error('Update verification failed');
    }
    
    // No Delete operation to keep the test document for verification
    
    return true;
  } catch (error) {
    console.error(`❌ CRUD test failed: ${error.message}`);
    return false;
  }
}

/**
 * Test 3: Initialize database collections and schema
 */
async function initializeFirestore() {
  console.log('\n🔍 Test 3: Initializing Firestore collections and schema...');
  
  try {
    // Create users collection with a sample user
    console.log('📁 Creating users collection...');
    await setDoc(doc(db, 'users', 'sample-user-1'), {
      username: 'sampleuser',
      displayName: 'Sample User',
      email: 'sample@example.com',
      bio: 'This is a sample user created by the setup script',
      photoURL: '',
      coverPhotoURL: '',
      followerCount: 0,
      followingCount: 0,
      videoCount: 0,
      likeCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isVerified: false,
      isCreator: false
    });
    
    // Create usernames collection for uniqueness
    console.log('📁 Creating usernames collection...');
    await setDoc(doc(db, 'usernames', 'sampleuser'), {
      uid: 'sample-user-1'
    });
    
    // Create videos collection with a sample video
    console.log('📁 Creating videos collection...');
    await setDoc(doc(db, 'videos', 'sample-video-1'), {
      userId: 'sample-user-1',
      username: 'sampleuser',
      caption: 'Sample video created by setup script',
      videoUrl: 'https://example.com/sample.mp4',
      thumbnailUrl: 'https://example.com/thumbnail.jpg',
      views: 0,
      likes: [],
      comments: 0,
      shares: 0,
      createdAt: serverTimestamp()
    });
    
    // Create comments collection
    console.log('📁 Creating comments collection...');
    await setDoc(doc(db, 'comments', 'sample-comment-1'), {
      videoId: 'sample-video-1',
      userId: 'sample-user-1',
      username: 'sampleuser',
      text: 'This is a sample comment',
      likes: 0,
      createdAt: serverTimestamp()
    });
    
    // Create likes collection
    console.log('📁 Creating likes collection...');
    await setDoc(doc(db, 'likes', 'sample-like-1'), {
      videoId: 'sample-video-1',
      userId: 'sample-user-1',
      createdAt: serverTimestamp()
    });
    
    // Create follows collection
    console.log('📁 Creating follows collection...');
    await setDoc(doc(db, 'follows', 'sample-follow-1'), {
      followerUid: 'sample-user-1',
      followingUid: 'sample-user-2',
      createdAt: serverTimestamp()
    });
    
    console.log('✅ All collections have been initialized successfully');
    return true;
  } catch (error) {
    console.error(`❌ Collection initialization failed: ${error.message}`);
    return false;
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('🚀 Starting Firestore Setup and Test Script');
  console.log('==========================================');
  
  // Test basic connectivity first
  const connectivityResult = await testFirestoreConnectivity();
  
  if (connectivityResult) {
    // If connectivity works, test CRUD operations
    await testFirestoreCRUD();
    
    // Ask if user wants to initialize schema
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    readline.question('\n❓ Do you want to initialize the Firestore database schema? (y/n) ', async (answer) => {
      if (answer.toLowerCase() === 'y') {
        await initializeFirestore();
      } else {
        console.log('Skipping database initialization');
      }
      
      console.log('\n✨ All tests completed!');
      readline.close();
    });
  } else {
    console.error('\n❌ Cannot proceed with further tests due to connectivity issues.');
    console.log('\nTroubleshooting tips:');
    console.log('1. Check your Firebase project ID and configuration');
    console.log('2. Ensure your Firestore database has been created in the Firebase Console');
    console.log('3. Check your Firestore rules to make sure they allow read/write operations');
    console.log('4. Verify your internet connection and firewall settings');
  }
}

// Run all the tests
runTests();
