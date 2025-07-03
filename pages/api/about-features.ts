import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/firebaseAdmin';

const aboutFeaturesDocRef = db.collection('settings').doc('aboutFeatures');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const doc = await aboutFeaturesDocRef.get();
      if (!doc.exists) {
        await aboutFeaturesDocRef.set({ features: [] });
        return res.status(200).json({ features: [] });
      }
      const { features = [] } = doc.data() || {};
      return res.status(200).json({ features });
    } catch (error) {
      console.error('Error reading about features:', error);
      res.status(500).json({ message: 'Failed to load about features.' });
    }
  } else if (req.method === 'POST') {
    try {
      const features = req.body;
      if (!Array.isArray(features)) {
        return res.status(400).json({ message: 'Invalid data format.' });
      }
      await aboutFeaturesDocRef.set({ features });
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