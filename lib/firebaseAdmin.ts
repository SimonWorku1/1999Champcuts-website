import { getApps, initializeApp, applicationDefault } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { getFirestore } from 'firebase-admin/firestore';

const firebaseAdminApp = 
  getApps().length === 0
    ? initializeApp({
        credential: applicationDefault(),
        storageBucket: 'champcuts-1eb3a.appspot.com', // hardcoded to prevent env issues
      })
    : getApps()[0];

export const storage = getStorage(firebaseAdminApp);
export const db = getFirestore(firebaseAdminApp); 