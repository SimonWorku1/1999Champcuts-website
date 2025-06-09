import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs'; // Keep fs for temporary file cleanup from formidable
import { db, storage } from '@/lib/firebaseAdmin'; // Import db and storage from the centralized helper

const bucket = storage.bucket('champcuts-1eb3a.firebasestorage.app'); // Explicitly set the bucket name here
const servicesCollection = db.collection('services');

export const config = {
  api: {
    bodyParser: false,
  },
};

// const servicesPath = path.join(process.cwd(), 'public/services.json'); // No longer directly modifying services.json via fs

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({});
    const [fields, files] = await form.parse(req);
    const uploadedFile = files.file?.[0];
    const serviceId = fields.serviceId?.[0];

    if (!uploadedFile || !serviceId) {
      return res.status(400).json({ error: 'File and service ID are required' });
    }

    const ext = path.extname(uploadedFile.originalFilename || '').toLowerCase();
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.mp4', '.mov'];

    if (!allowedExtensions.includes(ext)) {
      console.warn(`Skipping file with unsupported extension: ${uploadedFile.originalFilename}`);
      try { fs.unlinkSync(uploadedFile.filepath); } catch (e) { console.error('Error deleting temp file:', e); }
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    const fileId = uuidv4();
    const filename = `${fileId}${ext}`;
    const destination = `services/${filename}`; // Path within the Cloud Storage bucket

    // Upload file to Cloud Storage
    await bucket.upload(uploadedFile.filepath, { destination });

    // Get the public URL
    const [url] = await bucket.file(destination).getSignedUrl({
      action: 'read',
      expires: '03-09-2491', // Effectively never expires for public content
    });

    // Fetch the current service to check for existing media
    const serviceDocRef = servicesCollection.doc(serviceId);
    const serviceDoc = await serviceDocRef.get();

    if (serviceDoc.exists) {
      const serviceData = serviceDoc.data();
      const oldMediaUrl = serviceData?.mediaUrl;

      // If an old media exists and is a Firebase Storage URL, delete it
      if (oldMediaUrl && oldMediaUrl.includes('firebasestorage.app')) {
        try {
          const oldFilename = oldMediaUrl.split('/o/services%2F')[1]?.split('?alt=media')[0];
          if (oldFilename) {
            const decodedOldFilename = decodeURIComponent(oldFilename);
            await bucket.file(`services/${decodedOldFilename}`).delete();
            console.log(`Deleted old media: services/${decodedOldFilename}`);
          }
        } catch (deleteError) {
          console.error('Error deleting old media from Firebase Storage:', deleteError);
        }
      }
    }

    // Update service in Firestore with new media URL
    await servicesCollection.doc(serviceId).update({
      mediaUrl: url,
      mediaType: uploadedFile.mimetype?.startsWith('video/') ? 'video' : 'image',
    });

    // Remove temporary file created by formidable
    try { fs.unlinkSync(uploadedFile.filepath); } catch (e) { console.error('Error deleting temp file:', e); }

    return res.status(200).json({ message: 'Media uploaded successfully', mediaUrl: url });

  } catch (err) {
    console.error('Error uploading media for service:', err);
    return res.status(500).json({ error: 'Could not upload media' });
  }
} 