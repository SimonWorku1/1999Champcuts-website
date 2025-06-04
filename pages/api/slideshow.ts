import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const videosDirectory = path.join(process.cwd(), 'public/videos');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Ensure the videos directory exists
      if (!fs.existsSync(videosDirectory)) {
        fs.mkdirSync(videosDirectory, { recursive: true });
      }

      const filenames = fs.readdirSync(videosDirectory);
      const videoFiles = filenames.filter(filename => {
        const ext = path.extname(filename).toLowerCase();
        return ext === '.mov' || ext === '.mp4'; // Add other video extensions if needed
      });

      const slides = videoFiles.map(filename => ({
        id: filename, // Use filename as a simple ID for now
        src: `/videos/${filename}`, // Public URL path
        title: filename, // Display filename as title
        type: 'video' as const,
      }));

      return res.status(200).json({ slides });
    } catch (err) {
      console.error('Error reading videos directory:', err);
      return res.status(500).json({ error: 'Could not load slideshow items' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
} 