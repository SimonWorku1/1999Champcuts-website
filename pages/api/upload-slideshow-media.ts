import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { storage, db } from '@/lib/firebaseAdmin'; // Import both storage and db

// Removed Firebase Admin SDK initialization from here, now in firebaseAdmin.ts

const bucket = storage.bucket(); // Now using bucket configured in lib/firebaseAdmin.ts

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
  // This is a temporary sanity check to upload a test file
  const file = bucket.file('uploads/test.txt');
  await file.save('Hello from Firebase Cloud Run!');
  res.status(200).json({ message: 'Uploaded test.txt successfully' });
} 