import type { NextApiRequest, NextApiResponse } from 'next';
import { db, storage } from '@/lib/firebaseAdmin';

const bucket = storage.bucket('champcuts-1eb3a.firebasestorage.app'); // Explicitly set the bucket name here
const servicesCollection = db.collection('services');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { serviceId } = req.body;

    if (!serviceId) {
      console.error('Remove Service Media: serviceId missing.');
      return res.status(400).json({ error: 'Service ID is required' });
    }

    console.log('Remove Service Media: Received request for service ID:', serviceId);

    // Fetch the service document to get the current mediaUrl
    const serviceDoc = await servicesCollection.doc(serviceId).get();

    if (!serviceDoc.exists) {
      console.error('Remove Service Media: Service document not found for ID:', serviceId);
      return res.status(404).json({ error: 'Service not found' });
    }

    const serviceData = serviceDoc.data() as { mediaUrl?: string };
    const mediaUrl = serviceData?.mediaUrl;

    if (mediaUrl && mediaUrl.includes('firebasestorage.app')) {
      // Extract the file path from the signed URL
      let filePathInStorage: string | undefined;
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
          console.error('Remove Service Media: Could not extract file path from URL:', mediaUrl);
        }
      } catch (e) {
        console.error('Remove Service Media: Error parsing media URL:', e);
      }

      if (filePathInStorage) {
        try {
          console.log('Remove Service Media: Attempting to delete file from Cloud Storage:', filePathInStorage);
          await bucket.file(filePathInStorage).delete();
          console.log(`Remove Service Media: Deleted file: ${filePathInStorage} from Cloud Storage`);
        } catch (storageErr: any) {
          if (storageErr.code !== 404) { // Ignore 404 errors during deletion if file already gone
            console.error('Remove Service Media: Error deleting file from Cloud Storage:', storageErr);
          }
        }
      }
    } else {
      console.log('Remove Service Media: No media URL found or it is not a Firebase Storage URL. Skipping storage deletion.');
    }

    // Update the Firestore document to remove mediaUrl and mediaType
    await servicesCollection.doc(serviceId).update({
      mediaUrl: null, // Set to null to remove the field or undefined to delete it
      mediaType: null, // Set to null to remove the field or undefined to delete it
    });
    console.log('Remove Service Media: Firestore document updated to remove media references for service ID:', serviceId);

    return res.status(200).json({ message: 'Media removed successfully' });

  } catch (error) {
    console.error('Error removing service media:', error);
    return res.status(500).json({ error: 'Could not remove service media' });
  }
} 