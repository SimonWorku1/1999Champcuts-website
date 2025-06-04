import { promises as fs } from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';

const filePath = path.join(process.cwd(), 'public', 'about-features.json');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const jsonData = await fs.readFile(filePath, 'utf-8');
      const features = JSON.parse(jsonData);
      res.status(200).json({ features });
    } catch (error) {
      console.error('Error reading about features:', error);
      res.status(500).json({ message: 'Failed to load about features.' });
    }
  } else if (req.method === 'POST') {
    try {
      const features = req.body;
      // Basic validation (optional but recommended)
      if (!Array.isArray(features)) {
        return res.status(400).json({ message: 'Invalid data format.' });
      }
      await fs.writeFile(filePath, JSON.stringify(features, null, 2), 'utf-8');
      res.status(200).json({ message: 'About features updated successfully' });
    } catch (error) {
      console.error('Error writing about features:', error);
      res.status(500).json({ message: 'Failed to save about features.' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 