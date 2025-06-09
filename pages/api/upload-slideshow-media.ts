import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { storage, db } from '@/lib/firebaseAdmin'; // Import both storage and db

// Removed Firebase Admin SDK initialization from here, now in firebaseAdmin.ts

const bucket = storage.bucket('champcuts-1eb3a.firebasestorage.app'); // Explicitly set the bucket name here

// Test bucket access:
console.log('Using storage bucket:', bucket.name);

export const config = {
  api: {
    bodyParser: false,
  },
};

// const uploadDirectory = path.join(process.cwd(), 'public/videos'); // Old local storage path
const orderDocRef = db.collection('settings').doc('slideshowOrder'); // Firestore document for order
const slideshowItemsCollection = db.collection('slideshowItems'); // Firestore collection for slideshow items

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Inside upload-slideshow-media API handler.');
  console.log('Type of storage object:', typeof storage);
  console.log('storage.bucket method exists:', typeof storage.bucket === 'function');

  // This is a temporary sanity check to upload a test file
  try {
    console.log('Attempting to get bucket with explicit name.');
    const bucketForUpload = storage.bucket('champcuts-1eb3a.firebasestorage.app');
    console.log('Bucket object after explicit call:', bucketForUpload);
    console.log('Bucket name after explicit call:', bucketForUpload.name);
    console.log('Bucket.file method exists:', typeof bucketForUpload.file === 'function');

    const file = bucketForUpload.file('uploads/test_diagnostic.txt');
    console.log('File object created.');

    await file.save('Hello from Firebase Cloud Run diagnostics!');
    console.log('File saved successfully.');

    return res.status(200).json({ message: 'Uploaded test_diagnostic.txt successfully' });
  } catch (err) {
    console.error('Detailed upload error in handler:', err);
    return res.status(500).json({ error: 'Could not upload files (diagnostic error)' });
  }
} 