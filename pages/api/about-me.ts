import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const aboutMePath = path.join(process.cwd(), 'public/about-me.json');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      if (!fs.existsSync(aboutMePath)) {
        fs.writeFileSync(aboutMePath, JSON.stringify({ text: '' }), 'utf8');
      }
      const data = fs.readFileSync(aboutMePath, 'utf8');
      const { text } = JSON.parse(data);
      return res.status(200).json({ text });
    } catch (err) {
      return res.status(500).json({ error: 'Could not read About Me' });
    }
  } else if (req.method === 'POST') {
    const { text } = req.body;
    if (typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }
    try {
      fs.writeFileSync(aboutMePath, JSON.stringify({ text }), 'utf8');
      return res.status(200).json({ message: 'About Me updated' });
    } catch (err) {
      return res.status(500).json({ error: 'Could not update About Me' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
} 