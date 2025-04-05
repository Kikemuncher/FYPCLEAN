export interface LocalUser {
  uid: string;
  email: string;
  displayName: string | null;
  emailVerified: boolean;
  isAnonymous: boolean;
  metadata: {
    creationTime: string;
    lastSignInTime: string;
  };
  phoneNumber: string | null;
  photoURL: string | null;
  providerData: Array<any>;
  refreshToken: string;
  tenantId: string | null;
  delete: () => Promise<void>;
  getIdToken: () => Promise<string>;
  getIdTokenResult: () => Promise<any>;
  reload: () => Promise<void>;
  toJSON: () => object;
  username?: string;
  password?: string;
  createdAt: number;
  bio?: string;
  coverPhotoURL?: string;
  followerCount?: number;
  followingCount?: number;
  videoCount?: number;
  likeCount?: number;
  links?: {
    instagram?: string;
    twitter?: string;
    youtube?: string;
    website?: string;
  };
  followers?: string[];
  following?: string[];
  isVerified: boolean;  // Add these missing properties
  isCreator: boolean;
  accountType: 'user' | 'creator';
}

const USERS_KEY = 'social_app_users';
const CURRENT_USER_KEY = 'social_app_current_user';

export const getUsers = (): LocalUser[] => {
  if (typeof window === 'undefined') return [];
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : [];
};

export const registerUser = async (email: string, password: string, username: string): Promise<LocalUser> => {
  const users = getUsers();
  
  if (users.find(user => user.email === email)) {
    throw new Error('auth/email-already-in-use');
  }
  
  if (users.find(user => user.username === username)) {
    throw new Error('auth/username-already-in-use');
  }
  
  const newUser: LocalUser = {
    uid: `local_${Date.now()}`,
    email,
    username,
    password,
    displayName: username,
    photoURL: `https://ui-avatars.com/api/?name=${username}&background=random`,
    emailVerified: false,
    isAnonymous: false,
    metadata: {
      creationTime: new Date().toISOString(),
      lastSignInTime: new Date().toISOString()
    },
    phoneNumber: null,
    providerData: [],
    refreshToken: '',
    tenantId: null,
    delete: () => Promise.resolve(),
    getIdToken: () => Promise.resolve('mock-token'),
    getIdTokenResult: () => Promise.resolve({}),
    reload: () => Promise.resolve(),
    toJSON: () => ({}),
    createdAt: Date.now(),
    bio: '',
    coverPhotoURL: 'https://placehold.co/1200x400/gray/white?text=Cover',
    followerCount: 0,
    followingCount: 0,
    videoCount: 0,
    likeCount: 0,
    links: {},
    followers: [],
    following: [],
    isVerified: false,
    isCreator: false,
    accountType: 'user'
  };
  
  localStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]));
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
  
  return newUser;
};

// Rename signIn to loginUser
export const loginUser = async (email: string, password: string): Promise<LocalUser> => {
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    throw new Error('auth/wrong-password');
  }
  
  // Ensure all required properties are set
  const completeUser: LocalUser = {
    ...user,
    isVerified: user.isVerified || false,
    isCreator: user.isCreator || false,
    accountType: user.accountType || 'user',
    bio: user.bio || '',
    coverPhotoURL: user.coverPhotoURL || 'https://placehold.co/1200x400/gray/white?text=Cover',
    followerCount: user.followerCount || 0,
    followingCount: user.followingCount || 0,
    videoCount: user.videoCount || 0,
    likeCount: user.likeCount || 0,
    links: user.links || {},
    followers: user.followers || [],
    following: user.following || []
  };
  
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(completeUser));
  return completeUser;
};

// Rename signOut to logoutUser
export const logoutUser = async (): Promise<void> => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

// Rename getCurrentUser to getLoggedInUser
export const getLoggedInUser = (): LocalUser | null => {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem(CURRENT_USER_KEY);
  return user ? JSON.parse(user) : null;
};

export const onAuthChange = (callback: (user: LocalUser | null) => void): (() => void) => {
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === CURRENT_USER_KEY) {
      callback(e.newValue ? JSON.parse(e.newValue) : null);
    }
  };
  
  window.addEventListener('storage', handleStorageChange);
  
  // Initial call
  callback(getLoggedInUser());
  
  // Return cleanup function
  return () => window.removeEventListener('storage', handleStorageChange);
};

// Add updateUser function
export const updateUser = async (userId: string, userData: Partial<LocalUser>): Promise<LocalUser> => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.uid === userId);
  
  if (userIndex === -1) {
    throw new Error('User not found');
  }
  
  const updatedUser = {...users[userIndex], ...userData, updatedAt: Date.now()};
  users[userIndex] = updatedUser;
  
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  
  const currentUser = getLoggedInUser();
  if (currentUser && currentUser.uid === userId) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
  }
  
  return updatedUser;
};

// Add followUser function
export const followUser = async (userId: string, targetId: string): Promise<LocalUser> => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.uid === userId);
  const targetIndex = users.findIndex(u => u.uid === targetId);
  
  if (userIndex === -1 || targetIndex === -1) {
    throw new Error('User not found');
  }
  
  // Add to user's following array
  if (!users[userIndex].following) {
    users[userIndex].following = [];
  }
  if (!users[userIndex].following.includes(targetId)) {
    users[userIndex].following.push(targetId);
    users[userIndex].followingCount = (users[userIndex].followingCount || 0) + 1;
  }
  
  // Add to target's followers array
  if (!users[targetIndex].followers) {
    users[targetIndex].followers = [];
  }
  if (!users[targetIndex].followers.includes(userId)) {
    users[targetIndex].followers.push(userId);
    users[targetIndex].followerCount = (users[targetIndex].followerCount || 0) + 1;
  }
  
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  
  // Update current user if needed
  const updatedCurrentUser = users[userIndex];
  if (getLoggedInUser()?.uid === userId) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedCurrentUser));
  }

  return updatedCurrentUser;
};

// Add unfollowUser function
export const unfollowUser = async (userId: string, targetId: string): Promise<LocalUser> => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.uid === userId);
  const targetIndex = users.findIndex(u => u.uid === targetId);
  
  if (userIndex === -1 || targetIndex === -1) {
    throw new Error('User not found');
  }
  
  // Remove from user's following array
  if (users[userIndex].following && users[userIndex].following.includes(targetId)) {
    users[userIndex].following = users[userIndex].following.filter(id => id !== targetId);
    users[userIndex].followingCount = Math.max(0, (users[userIndex].followingCount || 1) - 1);
  }
  
  // Remove from target's followers array
  if (users[targetIndex].followers && users[targetIndex].followers.includes(userId)) {
    users[targetIndex].followers = users[targetIndex].followers.filter(id => id !== userId);
    users[targetIndex].followerCount = Math.max(0, (users[targetIndex].followerCount || 1) - 1);
  }
  
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  
  // Update current user if needed
  const updatedCurrentUser = users[userIndex];
  if (getLoggedInUser()?.uid === userId) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedCurrentUser));
  }

  return updatedCurrentUser;
};
