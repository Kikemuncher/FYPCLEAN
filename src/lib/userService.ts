// src/lib/userService.ts
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  getDoc, 
  doc, 
  updateDoc, 
  setDoc,
  increment,
  limit,
  orderBy,
  serverTimestamp,
  Timestamp,
  deleteDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { User, UserProfile, CreatorApplication, UserRelationship } from '@/types/user';

// Determine if we're using mock auth
const USE_MOCK_AUTH = true;
