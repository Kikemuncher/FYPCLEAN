# Setting up Firebase Emulators for Development

To avoid the "client is offline" Firestore error, we'll use Firebase emulators for local development.

## Installation Steps

1. Install the Firebase CLI if you haven't already:
   ```
   npm install -g firebase-tools
   ```

2. Log in to Firebase:
   ```
   firebase login
   ```

3. Initialize Firebase in your project:
   ```
   firebase init
   ```
   
   - Select Firestore and Storage emulators
   - Choose your project
   - Accept the default ports

4. Start the emulators:
   ```
   firebase emulators:start
   ```

## Usage

Once the emulators are running:

1. Your app will automatically connect to the local Firestore emulator
2. You can access the Firestore emulator UI at http://localhost:4000
3. The Storage emulator will be available at http://localhost:9199

## Adding Test Data

1. Open the Firestore Emulator UI at http://localhost:4000
2. Click the "Start Collection" button
3. Add a collection named "videos" with some test documents

## Troubleshooting

If you still experience the "client is offline" error:

1. Make sure the emulators are running
2. Check that the emulator connection code in `src/lib/firebase.ts` is correct
3. Clear your browser cache or use incognito mode
