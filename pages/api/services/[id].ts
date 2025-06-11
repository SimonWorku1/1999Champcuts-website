import type { NextApiRequest, NextApiResponse } from 'next';
// import fs from 'fs'; // Removed fs
// import path from 'path'; // Removed path
import { db, storage } from '@/lib/firebaseAdmin'; // Import db and storage

const bucket = storage.bucket('champcuts-1eb3a.firebasestorage.app'); // Explicitly set the bucket name
const servicesCollection = db.collection('services');

// const servicesPath = path.join(process.cwd(), 'public/services.json'); // Removed old local path

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      if (typeof id !== 'string') {
        console.error('Backend Service Delete: Invalid ID type for deletion:', typeof id);
        return res.status(400).json({ error: 'Invalid ID' });
      }

      console.log('Backend Service Delete: Received DELETE request for service ID:', id);

      // Get the service from Firestore to find the mediaUrl in Cloud Storage
      const serviceDoc = await servicesCollection.doc(id).get();
      if (!serviceDoc.exists) {
        console.error('Backend Service Delete: Service item not found in Firestore for ID:', id);
        return res.status(404).json({ error: 'Service item not found' });
      }
      const serviceData = serviceDoc.data() as { mediaUrl?: string };
      const mediaUrl = serviceData?.mediaUrl;
      console.log('Backend Service Delete: Retrieved mediaUrl from Firestore:', mediaUrl);

      let filePathInStorage: string | undefined;
      if (mediaUrl) {
        try {
          const url = new URL(mediaUrl);
          const pathname = url.pathname;
          const bucketName = bucket.name;
          const pathSegments = pathname.split('/');
          const bucketIndex = pathSegments.indexOf(bucketName);
          if (bucketIndex !== -1 && bucketIndex < pathSegments.length - 1) {
            filePathInStorage = pathSegments.slice(bucketIndex + 2).join('/');
            filePathInStorage = decodeURIComponent(filePathInStorage);
            if (!filePathInStorage.startsWith('services/')) {
              filePathInStorage = `services/${filePathInStorage}`;
            }
          } else {
            console.error('Backend Service Delete: Could not extract file path from URL:', mediaUrl);
          }
        } catch (e) {
          console.error('Backend Service Delete: Error parsing media URL:', e);
        }
      }
      console.log('Backend Service Delete: Calculated filePathInStorage:', filePathInStorage);

      // Delete the file from Cloud Storage if path was extracted
      if (filePathInStorage) {
        try {
          console.log('Backend Service Delete: Attempting to delete file from Cloud Storage:', filePathInStorage);
          await bucket.file(filePathInStorage).delete();
          console.log(`Backend Service Delete: Deleted file: ${filePathInStorage} from Cloud Storage`);
        } catch (storageErr: any) {
          if (storageErr.code !== 404) {
            console.error('Backend Service Delete: Error deleting file from Cloud Storage:', storageErr);
          }
        }
      }

      // Delete the service document from Firestore
      console.log('Backend Service Delete: Attempting to delete document from Firestore with ID:', id);
      await servicesCollection.doc(id).delete();
      console.log(`Backend Service Delete: Deleted document with ID: ${id} from Firestore`);

      return res.status(200).json({ message: 'Service and associated media deleted successfully' });
    } catch (err) {
      console.error('Error deleting service:', err);
      return res.status(500).json({ error: 'Could not delete service' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
} 