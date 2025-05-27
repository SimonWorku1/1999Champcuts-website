import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const servicesPath = path.join(process.cwd(), 'public/services.json');

// Ensure the services file exists
if (!fs.existsSync(servicesPath)) {
  fs.writeFileSync(servicesPath, JSON.stringify({ services: [] }), 'utf8');
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const data = fs.readFileSync(servicesPath, 'utf8');
      return res.status(200).json(JSON.parse(data));
    } catch (err) {
      return res.status(500).json({ error: 'Could not read services' });
    }
  } else if (req.method === 'POST') {
    try {
      const data = fs.readFileSync(servicesPath, 'utf8');
      const { services } = JSON.parse(data);
      const newService = req.body;
      
      // If service already exists, update it
      const existingIndex = services.findIndex((s: any) => s.id === newService.id);
      if (existingIndex >= 0) {
        services[existingIndex] = newService;
      } else {
        services.push(newService);
      }

      fs.writeFileSync(servicesPath, JSON.stringify({ services }), 'utf8');
      return res.status(200).json({ message: 'Service saved' });
    } catch (err) {
      return res.status(500).json({ error: 'Could not save service' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
} 