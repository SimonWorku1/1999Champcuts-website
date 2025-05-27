import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

function parseForm(req: NextApiRequest): Promise<{ fields: any; files: any }> {
  const formidable = require('formidable');
  const form = new formidable.IncomingForm({
    uploadDir: path.join(process.cwd(), 'public/videos'),
    keepExtensions: true,
  });
  return new Promise((resolve, reject) => {
    form.parse(req, (err: any, fields: any, files: any) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { files } = await parseForm(req);
    const file = files.file;
    const fileObj = Array.isArray(file) ? file[0] : file;
    if (!fileObj) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    // Only allow video files
    if (!fileObj.mimetype?.startsWith('video/')) {
      fs.unlinkSync(fileObj.filepath);
      return res.status(400).json({ error: 'Only video files are allowed' });
    }
    // Rename file to original name
    const newPath = path.join(path.join(process.cwd(), 'public/videos'), fileObj.originalFilename || fileObj.newFilename);
    fs.renameSync(fileObj.filepath, newPath);
    return res.status(200).json({
      message: 'File uploaded successfully',
      filename: path.basename(newPath),
      url: `/videos/${path.basename(newPath)}`,
    });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ error: 'Error parsing the file' });
  }
} 