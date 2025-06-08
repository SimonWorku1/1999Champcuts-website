import { getApps, initializeApp, applicationDefault } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { getFirestore } from 'firebase-admin/firestore';

console.log('Running Firebase Admin setup...');

const firebaseAdminApp = 
  getApps().length === 0
    ? initializeApp({
        credential: applicationDefault(),
        // Removed storageBucket here, as it will be explicitly set in getStorage() call
      })
    : getApps()[0];

console.log('Firebase Admin initialized with bucket:', firebaseAdminApp.options.storageBucket);
export const storage = getStorage(firebaseAdminApp, 'champcuts-1eb3a.firebasestorage.app'); // Updated to the correct bucket name
export const db = getFirestore(firebaseAdminApp); 