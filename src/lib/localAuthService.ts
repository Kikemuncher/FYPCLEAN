interface LocalUser {
  uid: string;
  email: string;
  username: string;
  password: string;
  displayName?: string;
  photoURL?: string;
  createdAt: number;
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
    createdAt: Date.now()
  };
  
  localStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]));
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
  
  return newUser;
};

export const signIn = async (email: string, password: string): Promise<LocalUser> => {
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    throw new Error('auth/wrong-password');
  }
  
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  return user;
};

export const signOut = async (): Promise<void> => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUser = (): LocalUser | null => {
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
  callback(getCurrentUser());
  
  // Return cleanup function
  return () => window.removeEventListener('storage', handleStorageChange);
};
