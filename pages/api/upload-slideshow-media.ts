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

  // Remove the temporary sanity check to upload a test file
  // try {
  //   console.log('Attempting to get bucket with explicit name.');
  //   const bucketForUpload = storage.bucket('champcuts-1eb3a.firebasestorage.app');
  //   console.log('Bucket object after explicit call:', bucketForUpload);
  //   console.log('Bucket name after explicit call:', bucketForUpload.name);
  //   console.log('Bucket.file method exists:', typeof bucketForUpload.file === 'function');

  //   const file = bucketForUpload.file('uploads/test_diagnostic.txt');
  //   console.log('File object created.');

  //   await file.save('Hello from Firebase Cloud Run diagnostics!');
  //   console.log('File saved successfully.');

  //   return res.status(200).json({ message: 'Uploaded test_diagnostic.txt successfully' });
  // } catch (err) {
  //   console.error('Detailed upload error in handler:', err);
  //   return res.status(500).json({ error: 'Could not upload files (diagnostic error)' });
  // }

  const form = formidable({ multiples: true });

  try {
    const [fields, files] = await form.parse(req);
    const uploadedFiles = files.media || [];

    if (!Array.isArray(uploadedFiles) || uploadedFiles.length === 0) {
      console.log('No files uploaded.');
      return res.status(400).json({ error: 'No files uploaded.' });
    }

    const uploadedFile = uploadedFiles[0]; // Assuming single file upload for now

    if (!uploadedFile) {
      console.log('Uploaded file is undefined.');
      return res.status(400).json({ error: 'No file received.' });
    }

    const filename = `${uuidv4()}${path.extname(uploadedFile.originalFilename || 'unknown')}`;
    const filePathInStorage = `slideshow/${filename}`;
    const fileRef = bucket.file(filePathInStorage);

    console.log(`Attempting to upload: ${filename}`);

    const writeStream = fileRef.createWriteStream({
      metadata: {
        contentType: uploadedFile.mimetype || 'application/octet-stream',
      },
    });

    // Pipe the file from the formidable temporary path to Firebase Storage
    fs.createReadStream(uploadedFile.filepath).pipe(writeStream);

    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', (err) => {
        console.error('Firebase Storage Write Stream Error:', err);
        reject(err);
      });
    });

    // Get the public URL of the uploaded file
    const [url] = await fileRef.getSignedUrl({
      action: 'read',
      expires: '03-09-2491', // Long expiry date
    });

    console.log(`File uploaded successfully to: ${url}`);

    // Add item to Firestore slideshowItems collection
    await slideshowItemsCollection.add({
      id: uuidv4(), // Generate a unique ID for the slideshow item
      src: url,
      type: uploadedFile.mimetype?.startsWith('video/') ? 'video' : 'image', // Determine type based on mimetype
      originalFilename: uploadedFile.originalFilename,
      uploadedAt: new Date(),
    });

    res.status(200).json({ message: 'File uploaded successfully', url });

  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file.' });
  }
} 