import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/firebaseAdmin';

const contactInfoDocRef = db.collection('settings').doc('contactInfo');

const defaultContactInfo = {
  email: 'yeisonpablocalmo@gmail.com',
  phone: '(510) 355-2039',
  hours: {
    weekday: 'Monday - Friday: 9am - 8pm',
    saturday: 'Saturday: 10am - 6pm',
    sunday: 'Sunday: Closed',
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const doc = await contactInfoDocRef.get();
      if (!doc.exists) {
        await contactInfoDocRef.set(defaultContactInfo);
        return res.status(200).json(defaultContactInfo);
      }
      const data = doc.data() || {};
      const email = typeof data.email === 'string' && data.email.length > 0 ? data.email : defaultContactInfo.email;
      const phone = typeof data.phone === 'string' && data.phone.length > 0 ? data.phone : defaultContactInfo.phone;
      const hoursData = data.hours || {};
      const hours = {
        weekday: typeof hoursData.weekday === 'string' ? hoursData.weekday : defaultContactInfo.hours.weekday,
        saturday: typeof hoursData.saturday === 'string' ? hoursData.saturday : defaultContactInfo.hours.saturday,
        sunday: typeof hoursData.sunday === 'string' ? hoursData.sunday : defaultContactInfo.hours.sunday,
      };
      return res.status(200).json({ email, phone, hours });
    } catch (err) {
      return res.status(500).json({ error: 'Could not read contact info' });
    }
  } else if (req.method === 'POST') {
    const { email, phone, hours } = req.body || {};
    if (typeof email !== 'string' || typeof phone !== 'string' || typeof hours !== 'object' || hours === null) {
      return res.status(400).json({ error: 'Invalid payload: email, phone, and hours are required' });
    }
    const payload = {
      email,
      phone,
      hours: {
        weekday: typeof hours.weekday === 'string' ? hours.weekday : defaultContactInfo.hours.weekday,
        saturday: typeof hours.saturday === 'string' ? hours.saturday : defaultContactInfo.hours.saturday,
        sunday: typeof hours.sunday === 'string' ? hours.sunday : defaultContactInfo.hours.sunday,
      },
    };
    try {
      await contactInfoDocRef.set(payload);
      return res.status(200).json({ message: 'Contact info updated' });
    } catch (err) {
      return res.status(500).json({ error: 'Could not update contact info' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}


