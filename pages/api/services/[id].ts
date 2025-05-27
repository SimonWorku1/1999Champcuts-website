import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const servicesPath = path.join(process.cwd(), 'public/services.json');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      const data = fs.readFileSync(servicesPath, 'utf8');
      const { services } = JSON.parse(data);
      
      // Remove the service
      const updatedServices = services.filter((s: any) => s.id !== id);
      
      // Delete associated media if it exists
      const service = services.find((s: any) => s.id === id);
      if (service?.mediaUrl) {
        const mediaPath = path.join(process.cwd(), 'public', service.mediaUrl);
        if (fs.existsSync(mediaPath)) {
          fs.unlinkSync(mediaPath);
        }
      }

      fs.writeFileSync(servicesPath, JSON.stringify({ services: updatedServices }), 'utf8');
      return res.status(200).json({ message: 'Service deleted' });
    } catch (err) {
      return res.status(500).json({ error: 'Could not delete service' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
} 