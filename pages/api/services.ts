import type { NextApiRequest, NextApiResponse } from 'next';
// import fs from 'fs'; // Removed fs
// import path from 'path'; // Removed path
import { db } from '@/lib/firebaseAdmin'; // Import db
import { v4 as uuidv4 } from 'uuid'; // Import uuidv4

const servicesCollection = db.collection('services'); // Firestore collection

// const servicesPath = path.join(process.cwd(), 'public/services.json'); // Removed old local path

// Removed initial file check, Firestore handles document existence

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const servicesSnapshot = await servicesCollection.get();
      const services = servicesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      return res.status(200).json({ services });
    } catch (err: any) {
      console.error('Error fetching services from Firestore:', err.message || err);
      return res.status(500).json({ error: 'Could not read services', details: err.message || 'Unknown error' });
    }
  } else if (req.method === 'POST') {
    try {
      const newService = req.body;

      if (!newService.id) {
        // If no ID, it's a new service, create a new document with uuidv4 ID
        const documentId = uuidv4();
        await servicesCollection.doc(documentId).set({
          ...newService,
          id: documentId, // Ensure the ID is stored within the document as well
        });
        return res.status(200).json({ message: 'Service added', id: documentId });
      } else {
        // If ID exists, update the existing service
        await servicesCollection.doc(newService.id).set(newService, { merge: true });
        return res.status(200).json({ message: 'Service saved/updated' });
      }

    } catch (err: any) {
      console.error('Error saving service to Firestore:', err.message || err);
      return res.status(500).json({ error: 'Could not save service', details: err.message || 'Unknown error' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
} 