import type { NextApiRequest, NextApiResponse } from 'next';
// Removed direct firebase-admin imports as they are now in firebaseAdmin.ts
import { db, storage } from '@/lib/firebaseAdmin'; // Import db and storage from the centralized helper

// Removed Firebase Admin SDK initialization from here, now in firebaseAdmin.ts

const bucket = storage.bucket('champcuts-1eb3a.firebasestorage.app'); // Explicitly set the bucket name here
const slideshowItemsCollection = db.collection('slideshowItems');
const orderDocRef = db.collection('settings').doc('slideshowOrder');

// const videosDirectory = path.join(process.cwd(), 'public/videos'); // Old local storage path
// const orderPath = path.join(process.cwd(), 'public/slideshow-order.json'); // Old local order path

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'DELETE') {
    try {
      const { id } = req.query; // id is the Firestore document ID (which is also the UUID filename)
      console.log('Backend: Received DELETE request for slideshow item ID:', id); // Debug log
      if (typeof id !== 'string') {
        console.error('Backend: Invalid ID type for deletion:', typeof id); // Debug log
        return res.status(400).json({ error: 'Invalid ID' });
      }

      // Get the item from Firestore to find the file path in Cloud Storage
      const itemDoc = await slideshowItemsCollection.doc(id).get();
      if (!itemDoc.exists) {
        console.error('Backend: Slideshow item not found in Firestore for ID:', id); // Debug log
        return res.status(404).json({ error: 'Slideshow item not found' });
      }
      const itemData = itemDoc.data() as { src?: string }; // Assuming src contains the Cloud Storage URL
      const fileUrl = itemData.src; // This is the signed URL
      console.log('Backend: Retrieved fileUrl from Firestore:', fileUrl); // Debug log

      if (!fileUrl) {
         console.error('Backend: No Cloud Storage URL found for item:', id); // Original error log
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
           } else { console.error('Backend: Could not extract file path from URL:', fileUrl);}

        } catch (e) {
          console.error('Backend: Error parsing file URL:', e);
        }
      }
      console.log('Backend: Calculated filePathInStorage:', filePathInStorage); // Debug log

      // Delete the file from Cloud Storage if path was extracted
      if (filePathInStorage) {
        try {
          console.log('Backend: Attempting to delete file from Cloud Storage:', filePathInStorage); // Debug log
          await bucket.file(filePathInStorage).delete();
          console.log(`Backend: Deleted file: ${filePathInStorage} from Cloud Storage`); // Original log
        } catch (storageErr: any) {
           // If file not found in storage, it might have been deleted manually, proceed with Firestore deletion
          if (storageErr.code !== 404) { // Ignore 404 errors during deletion
             console.error('Backend: Error deleting file from Cloud Storage:', storageErr); // Original error log
             // Depending on requirements, you might want to stop here if storage deletion is critical
          }
        }
      }

      // Delete the item document from Firestore
      console.log('Backend: Attempting to delete document from Firestore with ID:', id); // Debug log
      await slideshowItemsCollection.doc(id).delete();
      console.log(`Deleted document with ID: ${id} from Firestore`); // Original log

      // Remove the deleted item's ID from the slideshow order in Firestore
      const orderDoc = await orderDocRef.get();
      if (orderDoc.exists) {
        const orderData = orderDoc.data();
        const currentOrder: string[] = orderData?.order || [];
        const updatedOrder = currentOrder.filter((itemId: string) => itemId !== id);
        console.log('Backend: Updating slideshow order in Firestore.', updatedOrder); // Debug log
        await orderDocRef.set({ order: updatedOrder });
        console.log(`Removed item ${id} from slideshow order in Firestore`); // Original log
      }

      return res.status(200).json({ message: 'Slideshow item and associated file deleted successfully' });
    } catch (err) {
      console.error('Error deleting slideshow item:', err); // Original error log
      return res.status(500).json({ error: 'Could not delete slideshow item' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
} 