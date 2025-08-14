import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/firebaseAdmin';

const locationDocRef = db.collection('settings').doc('location');

// Defaults mirror the current hardcoded homepage values
const defaultAddress = '1200 Contra Costa Blvd Unit H, Pleasant Hill, CA 94523';
const defaultMapEmbedUrl = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3152.332792300145!2d-122.0607166846816!3d37.94797997975336!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808560a9c8c0c3c1%3A0x1a3c6c1c1c1c1c1c!2s1200%20Contra%20Costa%20Blvd%20Unit%20H%2C%20Pleasant%20Hill%2C%20CA%2094523!5e0!3m2!1sen!2sus!4v1620000000000!5m2!1sen!2sus';

function buildEmbedUrlFromAddress(address: string): string {
  const encoded = encodeURIComponent(address);
  return `https://www.google.com/maps?q=${encoded}&output=embed`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const doc = await locationDocRef.get();
      if (!doc.exists) {
        const defaults = { address: defaultAddress, mapEmbedUrl: defaultMapEmbedUrl };
        await locationDocRef.set(defaults);
        return res.status(200).json(defaults);
      }
      const { address = defaultAddress, mapEmbedUrl } = doc.data() || {};
      const finalUrl = typeof mapEmbedUrl === 'string' && mapEmbedUrl.length > 0
        ? mapEmbedUrl
        : buildEmbedUrlFromAddress(address);
      return res.status(200).json({ address, mapEmbedUrl: finalUrl });
    } catch (err) {
      return res.status(500).json({ error: 'Could not read location settings' });
    }
  } else if (req.method === 'POST') {
    const { address } = req.body || {};
    if (typeof address !== 'string') {
      return res.status(400).json({ error: 'address is required and must be a string' });
    }
    try {
      const computedUrl = buildEmbedUrlFromAddress(address);
      await locationDocRef.set({ address, mapEmbedUrl: computedUrl });
      return res.status(200).json({ message: 'Location settings updated' });
    } catch (err) {
      return res.status(500).json({ error: 'Could not update location settings' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}


