import { 
  getDownloadURL, 
  ref, 
  uploadString, 
  uploadBytesResumable,
  listAll
} from 'firebase/storage';
import { storage } from './firebase';

// Upload a file to storage (base64 string)
export const uploadFileBase64 = async (
  folder: string,
  file: string, 
  filename: string
): Promise<string> => {
  try {
    const storageRef = ref(storage, `${folder}/${filename}`);
    await uploadString(storageRef, file, 'data_url');
    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Upload a file to storage (File object)
export const uploadFile = async (
  folder: string,
  file: File, 
  progressCallback?: (progress: number) => void
): Promise<string> => {
  try {
    const fileExtension = file.name.split('.').pop();
    const filename = `${Date.now()}.${fileExtension}`;
    const storageRef = ref(storage, `${folder}/${filename}`);
    
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (progressCallback) progressCallback(progress);
        },
        (error) => {
          console.error('Upload failed:', error);
          reject(error);
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadUrl);
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Get all files from a folder
export const getFilesFromFolder = async (folder: string): Promise<string[]> => {
  try {
    const folderRef = ref(storage, folder);
    const result = await listAll(folderRef);
    
    const urls = await Promise.all(
      result.items.map(async (itemRef) => {
        return await getDownloadURL(itemRef);
      })
    );
    
    return urls;
  } catch (error) {
    console.error('Error getting files from folder:', error);
    return [];
  }
};
