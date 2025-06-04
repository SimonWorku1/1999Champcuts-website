import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const orderPath = path.join(process.cwd(), 'public/slideshow-order.json');

// Ensure the order file exists
if (!fs.existsSync(orderPath)) {
  fs.writeFileSync(orderPath, JSON.stringify({ order: [] }), 'utf8');
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const data = fs.readFileSync(orderPath, 'utf8');
      return res.status(200).json(JSON.parse(data));
    } catch (err) {
      console.error('Error reading slideshow order:', err);
      return res.status(500).json({ error: 'Could not read slideshow order' });
    }
  } else if (req.method === 'POST') {
    try {
      const { order } = req.body;
      if (!Array.isArray(order)) {
        return res.status(400).json({ error: 'Invalid order format' });
      }
      fs.writeFileSync(orderPath, JSON.stringify({ order }), 'utf8');
      return res.status(200).json({ message: 'Slideshow order saved' });
    } catch (err) {
      console.error('Error saving slideshow order:', err);
      return res.status(500).json({ error: 'Could not save slideshow order' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
} 