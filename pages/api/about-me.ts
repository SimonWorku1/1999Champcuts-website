import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/firebaseAdmin';

const aboutMeDocRef = db.collection('settings').doc('aboutMe');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const doc = await aboutMeDocRef.get();
      if (!doc.exists) {
        await aboutMeDocRef.set({ text: '', imageUrl: '' });
        return res.status(200).json({ text: '', imageUrl: '' });
      }
      const { text = '', imageUrl = '' } = doc.data() || {};
      return res.status(200).json({ text, imageUrl });
    } catch (err) {
      return res.status(500).json({ error: 'Could not read About Me' });
    }
  } else if (req.method === 'POST') {
    const { text, imageUrl } = req.body;
    if (typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }
    try {
      await aboutMeDocRef.set({ text, imageUrl: imageUrl || '' });
      return res.status(200).json({ message: 'About Me updated' });
    } catch (err) {
      return res.status(500).json({ error: 'Could not update About Me' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
} 