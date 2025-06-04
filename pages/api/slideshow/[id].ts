import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { Console } from 'console';

const videosDirectory = path.join(process.cwd(), 'public/videos');
const orderPath = path.join(process.cwd(), 'public/slideshow-order.json');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'DELETE') {
    try {
      const { id } = req.query; // id is the filename
      if (typeof id !== 'string') {
        return res.status(400).json({ error: 'Invalid ID' });
      }

      const filePath = path.join(videosDirectory, id);

      // Check if the file exists before attempting to delete
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found' });
      }

      // Delete the file
      fs.unlinkSync(filePath);

      // Remove the deleted item from the slideshow order file
      try {
        const orderData = fs.readFileSync(orderPath, 'utf8');
        const { order } = JSON.parse(orderData);
        const updatedOrder = order.filter((itemId: string) => itemId !== id);
        fs.writeFileSync(orderPath, JSON.stringify({ order: updatedOrder }), 'utf8');
      } catch (orderErr) {
        console.error('Error updating slideshow order after delete:', orderErr);
        // Continue despite order file error, as the main file is deleted
      }

      return res.status(200).json({ message: 'File deleted successfully' });
    } catch (err) {
      console.error('Error deleting file:', err);
      return res.status(500).json({ error: 'Could not delete file' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
} 