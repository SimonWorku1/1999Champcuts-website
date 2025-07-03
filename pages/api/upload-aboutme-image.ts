import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { storage } from '@/lib/firebaseAdmin';

const bucket = storage.bucket('champcuts-1eb3a.firebasestorage.app'); // Use your bucket name

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({});
    const [fields, files] = await form.parse(req);
    const uploadedFile = files.file?.[0];

    if (!uploadedFile) {
      return res.status(400).json({ error: 'File is required' });
    }

    const ext = path.extname(uploadedFile.originalFilename || '').toLowerCase();
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];

    if (!allowedExtensions.includes(ext)) {
      try { fs.unlinkSync(uploadedFile.filepath); } catch (e) { }
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    const fileId = uuidv4();
    const filename = `${fileId}${ext}`;
    const destination = `aboutme/${filename}`;

    // Upload file to Cloud Storage
    await bucket.upload(uploadedFile.filepath, { destination });

    // Get the public URL
    const [url] = await bucket.file(destination).getSignedUrl({
      action: 'read',
      expires: '03-09-2491',
    });

    // Remove temporary file
    try { fs.unlinkSync(uploadedFile.filepath); } catch (e) { }

    return res.status(200).json({ message: 'Image uploaded successfully', imageUrl: url });
  } catch (err) {
    console.error('Error uploading About Me image:', err);
    return res.status(500).json({ error: 'Could not upload image' });
  }
} 