import type { NextApiRequest, NextApiResponse } from 'next';
import { initializeApp, applicationDefault, getApps, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import path from 'path';
import fs from 'fs';

// Initialize Firebase Admin SDK if not already initialized
// Use getApps().length to check if an app is already initialized
// Use getApp() with a try-catch to check for the default app specifically
let firebaseAdminApp;

try {
  firebaseAdminApp = getApp();
} catch (e: any) {
  if (e.code === 'app/no-app') {
    firebaseAdminApp = initializeApp({
      credential: applicationDefault(),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
  } else {
    console.error('Error getting Firebase app:', e);
    // Re-throw or handle as appropriate
    throw e;
  }
}

const db = getFirestore(firebaseAdminApp);
const storage = getStorage(firebaseAdminApp);
const bucket = storage.bucket();
const slideshowItemsCollection = db.collection('slideshowItems');
const orderDocRef = db.collection('settings').doc('slideshowOrder');

// const videosDirectory = path.join(process.cwd(), 'public/videos'); // Old local storage path
// const orderPath = path.join(process.cwd(), 'public/slideshow-order.json'); // Old local order path

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'DELETE') {
    try {
      const { id } = req.query; // id is the Firestore document ID (which is also the UUID filename)
      if (typeof id !== 'string') {
        return res.status(400).json({ error: 'Invalid ID' });
      }

      // Get the item from Firestore to find the file path in Cloud Storage
      const itemDoc = await slideshowItemsCollection.doc(id).get();
      if (!itemDoc.exists) {
        return res.status(404).json({ error: 'Slideshow item not found' });
      }
      const itemData = itemDoc.data() as { src?: string }; // Assuming src contains the Cloud Storage URL
      const fileUrl = itemData.src; // This is the signed URL

      if (!fileUrl) {
         console.error('No Cloud Storage URL found for item:', id);
         // Still attempt to delete the Firestore document and update order
      }

      // Extract the file path from the signed URL
      // This is a simplified way; a more robust approach would be to store the path separately
      let filePathInStorage: string | undefined;
      if (fileUrl) {
        try {
          const url = new URL(fileUrl);
          // The path in the URL should correspond to the path in the bucket (excluding bucket name)
          // Assuming the format is like https://firebasestorage.googleapis.com/.../o/slideshow%2F<filename>?...
          const pathname = url.pathname;
          const bucketName = bucket.name; // Get the actual bucket name
          const pathSegments = pathname.split('/');
          // Find the index of the bucket name in the path segments
          const bucketIndex = pathSegments.indexOf(bucketName);
           if (bucketIndex !== -1 && bucketIndex < pathSegments.length -1) {
             // Rejoin segments after the bucket name and decode
             filePathInStorage = pathSegments.slice(bucketIndex + 2).join('/'); // +2 to skip 'o' and bucket name
             filePathInStorage = decodeURIComponent(filePathInStorage);
             // Assuming files are in a 'slideshow' folder in the bucket
             if (!filePathInStorage.startsWith('slideshow/')){
                filePathInStorage = `slideshow/${filePathInStorage}`;
              }
           } else { console.error('Could not extract file path from URL:', fileUrl);}

        } catch (e) {
          console.error('Error parsing file URL:', e);
        }
      }

      // Delete the file from Cloud Storage if path was extracted
      if (filePathInStorage) {
        try {
          await bucket.file(filePathInStorage).delete();
          console.log(`Deleted file: ${filePathInStorage} from Cloud Storage`);
        } catch (storageErr: any) {
           // If file not found in storage, it might have been deleted manually, proceed with Firestore deletion
          if (storageErr.code !== 404) { // Ignore 404 errors during deletion
             console.error('Error deleting file from Cloud Storage:', storageErr);
             // Depending on requirements, you might want to stop here if storage deletion is critical
          }
        }
      }

      // Delete the item document from Firestore
      await slideshowItemsCollection.doc(id).delete();
      console.log(`Deleted document with ID: ${id} from Firestore`);

      // Remove the deleted item's ID from the slideshow order in Firestore
      const orderDoc = await orderDocRef.get();
      if (orderDoc.exists) {
        const orderData = orderDoc.data();
        const currentOrder: string[] = orderData?.order || [];
        const updatedOrder = currentOrder.filter((itemId: string) => itemId !== id);
        await orderDocRef.set({ order: updatedOrder });
        console.log(`Removed item ${id} from slideshow order in Firestore`);
      }

      return res.status(200).json({ message: 'Slideshow item and associated file deleted successfully' });
    } catch (err) {
      console.error('Error deleting slideshow item:', err);
      return res.status(500).json({ error: 'Could not delete slideshow item' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
} 