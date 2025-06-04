import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import formidable from 'formidable';
import { v4 as uuidv4 } from 'uuid';

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadDirectory = path.join(process.cwd(), 'public/videos'); // Or adjust if images go elsewhere
const orderPath = path.join(process.cwd(), 'public/slideshow-order.json');

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

    // Ensure upload directory exists
    if (!fs.existsSync(uploadDirectory)) {
      fs.mkdirSync(uploadDirectory, { recursive: true });
    }

    for (const file of Array.isArray(uploadedFiles) ? uploadedFiles : [uploadedFiles]) {
      const ext = path.extname(file.originalFilename || '').toLowerCase();
      // Basic check for image/video extensions (can be expanded)
      if (!['.jpg', '.jpeg', '.png', '.gif', '.mp4', '.mov'].includes(ext)) {
         console.warn(`Skipping file with unsupported extension: ${file.originalFilename}`);
         // Optionally delete the temporary file
         fs.unlinkSync(file.filepath);
         continue;
      }

      const filename = `${uuidv4()}${ext}`;
      const filepath = path.join(uploadDirectory, filename);

      // Move the file
      fs.copyFileSync(file.filepath, filepath);
      fs.unlinkSync(file.filepath); // Remove temporary file

      newSlides.push({
        id: filename, // Use filename as ID
        src: `/videos/${filename}`, // Public URL
        title: file.originalFilename || filename, // Use original name or generated name
        type: ext === '.mp4' || ext === '.mov' ? 'video' : 'image', // Determine type
      });
      newFileIds.push(filename);
    }

    // Update slideshow order file to include new files at the end
    try {
      const orderData = fs.readFileSync(orderPath, 'utf8');
      const { order } = JSON.parse(orderData);
      const updatedOrder = [...order, ...newFileIds];
      fs.writeFileSync(orderPath, JSON.stringify({ order: updatedOrder }), 'utf8');
    } catch (orderErr) {
      console.error('Error updating slideshow order after upload:', orderErr);
      // Continue despite order file error
    }

    return res.status(200).json({ message: 'Files uploaded successfully', uploadedFiles: newSlides });

  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ error: 'Could not upload files' });
  }
} 