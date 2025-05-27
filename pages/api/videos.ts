import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const videosDir = path.join(process.cwd(), 'public/videos');
  try {
    const files = fs.readdirSync(videosDir);
    const videos = files.filter(f => f.match(/\.(mp4|mov|webm|avi|mkv)$/i)).map(filename => ({
      filename,
      url: `/videos/${filename}`,
    }));
    res.status(200).json({ videos });
  } catch (e) {
    res.status(500).json({ error: 'Could not list videos' });
  }
} 