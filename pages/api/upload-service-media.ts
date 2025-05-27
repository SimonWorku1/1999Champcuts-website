import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import formidable from 'formidable';
import { v4 as uuidv4 } from 'uuid';

export const config = {
  api: {
    bodyParser: false,
  },
};

const servicesPath = path.join(process.cwd(), 'public/services.json');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({});
    const [fields, files] = await form.parse(req);
    const file = files.file?.[0];
    const serviceId = fields.serviceId?.[0];

    if (!file || !serviceId) {
      return res.status(400).json({ error: 'File and service ID are required' });
    }

    // Create services directory if it doesn't exist
    const servicesDir = path.join(process.cwd(), 'public/services');
    if (!fs.existsSync(servicesDir)) {
      fs.mkdirSync(servicesDir, { recursive: true });
    }

    // Generate unique filename
    const ext = path.extname(file.originalFilename || '');
    const filename = `${uuidv4()}${ext}`;
    const filepath = path.join(servicesDir, filename);

    // Move the file
    fs.copyFileSync(file.filepath, filepath);
    fs.unlinkSync(file.filepath);

    // Update service in services.json
    const data = fs.readFileSync(servicesPath, 'utf8');
    const { services } = JSON.parse(data);
    const serviceIndex = services.findIndex((s: any) => s.id === serviceId);

    if (serviceIndex >= 0) {
      // Delete old media if it exists
      const oldMediaUrl = services[serviceIndex].mediaUrl;
      if (oldMediaUrl) {
        const oldMediaPath = path.join(process.cwd(), 'public', oldMediaUrl);
        if (fs.existsSync(oldMediaPath)) {
          fs.unlinkSync(oldMediaPath);
        }
      }

      // Update service with new media
      services[serviceIndex] = {
        ...services[serviceIndex],
        mediaUrl: `/services/${filename}`,
        mediaType: file.mimetype?.startsWith('video/') ? 'video' : 'image',
      };

      fs.writeFileSync(servicesPath, JSON.stringify({ services }), 'utf8');
    }

    return res.status(200).json({ message: 'Media uploaded successfully' });
  } catch (err) {
    console.error('Error uploading media:', err);
    return res.status(500).json({ error: 'Could not upload media' });
  }
} 