import admin from 'firebase-admin';

console.log('Running Firebase Admin setup...');

interface FirebaseAdminAppParams {
  projectId: string;
  clientEmail: string;
  storageBucket: string;
  privateKey: string;
}

function formatPrivateKey(key: string) {
  return key.replace(/\\n/g, "\n");
}

function createFirebaseAdminApp(params: FirebaseAdminAppParams) {
  const privateKey = formatPrivateKey(params.privateKey);

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
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET as string,
  privateKey: process.env.FIREBASE_PRIVATE_KEY as string,
};

const firebaseAdminApp = createFirebaseAdminApp(params);

// console.log('Firebase Admin initialized with bucket:', firebaseAdminApp.options.storageBucket); // Removed problematic log
export const storage = admin.storage(firebaseAdminApp);
export const db = admin.firestore(firebaseAdminApp); 