import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { v4 as uuidv4 } from 'uuid';
import { initializeApp, applicationDefault, getApps, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import path from 'path';
import fs from 'fs';

// Initialize Firebase Admin SDK if not already initialized
console.log('FIREBASE_STORAGE_BUCKET value during initialization:', process.env.FIREBASE_STORAGE_BUCKET);
if (getApps().length === 0) {
  initializeApp({
    credential: applicationDefault(),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

const db = getFirestore();
const storage = getStorage();
const bucket = storage.bucket();

export const config = {
  api: {
    bodyParser: false,
  },
};

// const uploadDirectory = path.join(process.cwd(), 'public/videos'); // Old local storage path
const orderDocRef = db.collection('settings').doc('slideshowOrder'); // Firestore document for order
const slideshowItemsCollection = db.collection('slideshowItems'); // Firestore collection for slideshow items

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({});
    const [fields, files] = await form.parse(req);
    const uploadedFiles = files.files; // Expecting 'files' based on SlideshowManager

    if (!uploadedFiles || uploadedFiles.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const newSlides: { id: string; src: string; title: string; type: 'image' | 'video' }[] = [];
    const newFileIds: string[] = [];

    // // Ensure upload directory exists - Not needed with Cloud Storage
    // if (!fs.existsSync(uploadDirectory)) {
    //   fs.mkdirSync(uploadDirectory, { recursive: true });
    // }

    for (const file of Array.isArray(uploadedFiles) ? uploadedFiles : [uploadedFiles]) {
      const ext = path.extname(file.originalFilename || '').toLowerCase();
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.mp4', '.mov'];

      if (!allowedExtensions.includes(ext)) {
         console.warn(`Skipping file with unsupported extension: ${file.originalFilename}`);
         // Optionally delete the temporary file created by formidable
         try { fs.unlinkSync(file.filepath); } catch (e) { console.error('Error deleting temp file:', e); }
         continue;
      }

      const fileId = uuidv4(); // Use UUID as ID for Firestore document and Cloud Storage filename
      const filename = `${fileId}${ext}`;
      const destination = `slideshow/${filename}`; // Path within the Cloud Storage bucket

      // Upload file to Cloud Storage
      await bucket.upload(file.filepath, { destination });

      // Get the public URL (assuming bucket is public or objects are made public)
      // For more secure access, consider signed URLs or different rules.
      const [url] = await bucket.file(destination).getSignedUrl({
        action: 'read',
        expires: '03-09-2491', // Effectively never expires for public content
      });

      // Add metadata to Firestore
      await slideshowItemsCollection.doc(fileId).set({
         id: fileId, // Use UUID as ID
         src: url, // Cloud Storage public URL
         title: file.originalFilename || filename, // Use original name or generated name
         type: ext === '.mp4' || ext === '.mov' ? 'video' : 'image', // Determine type
      });

      newSlides.push({
        id: fileId, // Use UUID as ID
        src: url, // Cloud Storage public URL
        title: file.originalFilename || filename, // Use original name or generated name
        type: ext === '.mp4' || ext === '.mov' ? 'video' : 'image', // Determine type
      });
      newFileIds.push(fileId);

      // Remove temporary file created by formidable
       try { fs.unlinkSync(file.filepath); } catch (e) { console.error('Error deleting temp file:', e); }
    }

    // Update slideshow order in Firestore
    const orderDoc = await orderDocRef.get();
    let currentOrder: string[] = [];
    if (orderDoc.exists) {
      currentOrder = orderDoc.data()?.order || [];
    }
    const updatedOrder = [...currentOrder, ...newFileIds];
    await orderDocRef.set({ order: updatedOrder });

    return res.status(200).json({ message: 'Files uploaded successfully', uploadedFiles: newSlides });

  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ error: 'Could not upload files' });
  }
} 