import admin from 'firebase-admin';

console.log('Running Firebase Admin setup...');
console.log('Environment Variable: NEXT_PUBLIC_FIREBASE_PROJECT_ID', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
console.log('Environment Variable: FIREBASE_CLIENT_EMAIL', process.env.FIREBASE_CLIENT_EMAIL);
console.log('Environment Variable: FIREBASE_PRIVATE_KEY', process.env.FIREBASE_PRIVATE_KEY ? '*****' : 'UNDEFINED/EMPTY'); // Mask sensitive key
console.log('Environment Variable: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);

interface FirebaseAdminAppParams {
  projectId: string;
  clientEmail: string;
  storageBucket: string;
  privateKey: string;
}

function formatPrivateKey(key: string) {
  return key;
}

function createFirebaseAdminApp(params: FirebaseAdminAppParams) {
  const privateKey = params.privateKey;

  if (admin.apps.length > 0) {
    return admin.app();
  }

  const cert = admin.credential.cert({
    projectId: params.projectId,
    clientEmail: params.clientEmail,
    privateKey,
  });

  return admin.initializeApp({
    credential: cert,
    projectId: params.projectId,
  });
}

const params = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID as string,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL as string,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET as string,
  privateKey: process.env.FIREBASE_PRIVATE_KEY as string,
};

const firebaseAdminApp = createFirebaseAdminApp(params);

// console.log('Firebase Admin initialized with bucket:', firebaseAdminApp.options.storageBucket); // Removed problematic log
export const storage = admin.storage(firebaseAdminApp);
console.log('Firebase Admin storage object initialized. It has a bucket method:', typeof storage.bucket === 'function');
export const db = admin.firestore(firebaseAdminApp); 