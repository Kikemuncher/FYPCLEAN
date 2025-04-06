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
  isVerified: boolean;
  isCreator: boolean;
  accountType: 'user' | 'creator';
}

const USERS_KEY = 'social_app_users';
const CURRENT_USER_KEY = 'social_app_current_user';

// Add this to the firebase.ts file
export const isLocalStorageAvailable = () => {
  if (typeof window === 'undefined') return false;
  try {
    const testKey = '__test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};

// Then use this in localAuthService.ts
const getLocalStorage = (key: string): string | null => {
  if (!isLocalStorageAvailable()) return null;
  return localStorage.getItem(key);
};

const setLocalStorage = (key: string, value: string): void => {
  if (!isLocalStorageAvailable()) return;
  localStorage.setItem(key, value);
};

const removeLocalStorage = (key: string): void => {
  if (!isLocalStorageAvailable()) return;
  localStorage.removeItem(key);
};

export const getUsers = (): LocalUser[] => {
  if (typeof window === 'undefined' || !isLocalStorageAvailable()) return [];
  const users = getLocalStorage(USERS_KEY);
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
      lastSignInTime: new Date().toISOString(),
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
    accountType: 'user',
  };

  setLocalStorage(USERS_KEY, JSON.stringify([...users, newUser]));
  setLocalStorage(CURRENT_USER_KEY, JSON.stringify(newUser));

  return newUser;
};

export const loginUser = async (email: string, password: string): Promise<LocalUser> => {
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    throw new Error('auth/wrong-password');
  }

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
    following: user.following || [],
  };

  setLocalStorage(CURRENT_USER_KEY, JSON.stringify(completeUser));
  return completeUser;
};

export const logoutUser = async (): Promise<void> => {
  removeLocalStorage(CURRENT_USER_KEY);
};

export const getLoggedInUser = (): LocalUser | null => {
  if (typeof window === 'undefined' || !isLocalStorageAvailable()) return null;
  const user = getLocalStorage(CURRENT_USER_KEY);
  return user ? JSON.parse(user) : null;
};

export const onAuthChange = (callback: (user: LocalUser | null) => void): (() => void) => {
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === CURRENT_USER_KEY) {
      callback(e.newValue ? JSON.parse(e.newValue) : null);
    }
  };

  window.addEventListener('storage', handleStorageChange);

  callback(getLoggedInUser());

  return () => window.removeEventListener('storage', handleStorageChange);
};

export const updateUser = async (userId: string, userData: Partial<LocalUser>): Promise<LocalUser> => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.uid === userId);

  if (userIndex === -1) {
    throw new Error('User not found');
  }

  const updatedUser = { ...users[userIndex], ...userData, updatedAt: Date.now() };
  users[userIndex] = updatedUser;

  setLocalStorage(USERS_KEY, JSON.stringify(users));

  const currentUser = getLoggedInUser();
  if (currentUser && currentUser.uid === userId) {
    setLocalStorage(CURRENT_USER_KEY, JSON.stringify(updatedUser));
  }

  return updatedUser;
};

export const followUser = async (userId: string, targetId: string): Promise<LocalUser> => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.uid === userId);
  const targetIndex = users.findIndex(u => u.uid === targetId);

  if (userIndex === -1 || targetIndex === -1) {
    throw new Error('User not found');
  }

  if (!users[userIndex].following) {
    users[userIndex].following = [];
  }
  if (!users[userIndex].following.includes(targetId)) {
    users[userIndex].following.push(targetId);
    users[userIndex].followingCount = (users[userIndex].followingCount || 0) + 1;
  }

  if (!users[targetIndex].followers) {
    users[targetIndex].followers = [];
  }
  if (!users[targetIndex].followers.includes(userId)) {
    users[targetIndex].followers.push(userId);
    users[targetIndex].followerCount = (users[targetIndex].followerCount || 0) + 1;
  }

  setLocalStorage(USERS_KEY, JSON.stringify(users));

  const updatedCurrentUser = users[userIndex];
  if (getLoggedInUser()?.uid === userId) {
    setLocalStorage(CURRENT_USER_KEY, JSON.stringify(updatedCurrentUser));
  }

  return updatedCurrentUser;
};

export const unfollowUser = async (userId: string, targetId: string): Promise<LocalUser> => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.uid === userId);
  const targetIndex = users.findIndex(u => u.uid === targetId);

  if (userIndex === -1 || targetIndex === -1) {
    throw new Error('User not found');
  }

  if (users[userIndex].following && users[userIndex].following.includes(targetId)) {
    users[userIndex].following = users[userIndex].following.filter(id => id !== targetId);
    users[userIndex].followingCount = Math.max(0, (users[userIndex].followingCount || 1) - 1);
  }

  if (users[targetIndex].followers && users[targetIndex].followers.includes(userId)) {
    users[targetIndex].followers = users[targetIndex].followers.filter(id => id !== userId);
    users[targetIndex].followerCount = Math.max(0, (users[targetIndex].followerCount || 1) - 1);
  }

  setLocalStorage(USERS_KEY, JSON.stringify(users));

  const updatedCurrentUser = users[userIndex];
  if (getLoggedInUser()?.uid === userId) {
    setLocalStorage(CURRENT_USER_KEY, JSON.stringify(updatedCurrentUser));
  }

  return updatedCurrentUser;
};

// Add to localAuthService.ts
export const convertToUserProfile = (localUser: LocalUser): UserProfile => {
  return {
    uid: localUser.uid,
    username: localUser.username || '',
    displayName: localUser.displayName || '',
    bio: localUser.bio || '',
    photoURL: localUser.photoURL || '',
    coverPhotoURL: localUser.coverPhotoURL || 'https://placehold.co/1200x400/gray/white?text=Cover',
    followerCount: localUser.followerCount || 0,
    followingCount: localUser.followingCount || 0,
    videoCount: localUser.videoCount || 0,
    likeCount: localUser.likeCount || 0,
    links: localUser.links || {},
    createdAt: localUser.createdAt,
    isVerified: localUser.isVerified || false,
    isCreator: localUser.isCreator || false,
    accountType: localUser.accountType || 'user',
    followers: localUser.followers || [],
    following: localUser.following || []
  };
};
