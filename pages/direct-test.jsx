Skip to main content
Firebase logo
Project Overview
Project shortcuts
Storage
What's new
Genkit
New
Vertex AI
New
Product categories
Build
Run
Analytics
AI
All products
Related development tools
IDX
Checks
Billing plan:Blaze
Pay as you go

warning:
Enable Multi-factor Authentication (MFA) on your Google Account before May 13, 2025 to keep accessing Firebase. Learn more 
Tiktok
Storage
tiktok-a7af5.firebasestorage.app
Files
Rules
Usage
Extensions
Write Security Rules that control access to Storage based on the contents of your Firestore Database.
Rules Playground
Simulation type
get
Location
/b/tiktok-a7af5.firebasestorage.app/o
path/to/resource
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;  // Fully open access
    }
  }
}

1
rules_version = '2';
2
service firebase.storage {
3
  match /b/{bucket}/o {
4
    match /{allPaths=**} {
5
      allow read, write: if true;  // Fully open access
6
    }
7
  }
8
}
9
​
This Firebase-provisioned API key is for use only with Firebase Web Apps and only with Firebase-related APIs. This key is automatically restricted to Firebase-related APIs. Learn more
Genkit for Node.js is Generally Available
Generate images using Imagen 3 models
Genkit for Node.js is Generally Available
Generate images using Imagen 3 models
