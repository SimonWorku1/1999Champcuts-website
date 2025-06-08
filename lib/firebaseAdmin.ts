import { getApps, initializeApp, applicationDefault } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { getFirestore } from 'firebase-admin/firestore';

console.log('Running Firebase Admin setup...');

const firebaseAdminApp = 
  getApps().length === 0
    ? initializeApp({
        credential: applicationDefault(),
        storageBucket: 'champcuts-1eb3a.appspot.com', // ✅ hardcoded to prevent env issues
      })
    : getApps()[0];

console.log('Firebase Admin initialized with bucket:', firebaseAdminApp.options.storageBucket);
export const storage = getStorage(firebaseAdminApp);
export const db = getFirestore(firebaseAdminApp); 