import type { NextApiRequest, NextApiResponse } from 'next';
// Removed direct firebase-admin imports as they are now in firebaseAdmin.ts
import { db } from '@/lib/firebaseAdmin'; // Import db from the centralized helper

// Removed Firebase Admin SDK initialization from here, now in firebaseAdmin.ts

const orderDocRef = db.collection('settings').doc('slideshowOrder');

// const orderPath = path.join(process.cwd(), 'public/slideshow-order.json'); // Old local order path

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const orderDoc = await orderDocRef.get();
      if (orderDoc.exists) {
        return res.status(200).json(orderDoc.data());
      } else {
        // If the order document doesn't exist, return an empty order
        return res.status(200).json({ order: [] });
      }
    } catch (err) {
      console.error('Error fetching slideshow order from Firestore:', err);
      return res.status(500).json({ error: 'Could not load slideshow order' });
    }
  } else if (req.method === 'POST') {
    try {
      const { order } = req.body;

      if (!Array.isArray(order)) {
        return res.status(400).json({ error: 'Invalid order data' });
      }

      await orderDocRef.set({ order });
      return res.status(200).json({ message: 'Slideshow order saved successfully' });

    } catch (err) {
      console.error('Error saving slideshow order to Firestore:', err);
      return res.status(500).json({ error: 'Could not save slideshow order' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
} 