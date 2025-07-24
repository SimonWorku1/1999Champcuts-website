import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/firebaseAdmin';

const heroTextDocRef = db.collection('settings').doc('heroText');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const doc = await heroTextDocRef.get();
      if (!doc.exists) {
        // Set default values if document doesn't exist
        const defaultHeroText = {
          title: '1999CHAMPCUTZ',
          tagline: 'Premium barbershop experience with skilled professionals dedicated to perfecting your style'
        };
        await heroTextDocRef.set(defaultHeroText);
        return res.status(200).json(defaultHeroText);
      }
      const { title = '1999CHAMPCUTZ', tagline = 'Premium barbershop experience with skilled professionals dedicated to perfecting your style' } = doc.data() || {};
      return res.status(200).json({ title, tagline });
    } catch (err) {
      console.error('Error fetching hero text:', err);
      return res.status(500).json({ error: 'Could not read hero text' });
    }
  } else if (req.method === 'POST') {
    const { title, tagline } = req.body;
    if (typeof title !== 'string' || typeof tagline !== 'string') {
      return res.status(400).json({ error: 'Title and tagline are required strings' });
    }
    try {
      await heroTextDocRef.set({ title, tagline });
      return res.status(200).json({ message: 'Hero text updated' });
    } catch (err) {
      console.error('Error updating hero text:', err);
      return res.status(500).json({ error: 'Could not update hero text' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
} 