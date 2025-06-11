import type { NextApiRequest, NextApiResponse } from 'next';
// Removed direct firebase-admin imports as they are now in firebaseAdmin.ts
import path from 'path'; // Keep path for order file if needed for migration
import fs from 'fs'; // Keep fs for order file if needed for migration
import { db } from '@/lib/firebaseAdmin'; // Import db from the centralized helper

// Removed Firebase Admin SDK initialization from here, now in firebaseAdmin.ts

const slideshowItemsCollection = db.collection('slideshowItems');
const orderDocRef = db.collection('settings').doc('slideshowOrder');

// const videosDirectory = path.join(process.cwd(), 'public/videos'); // Old local storage path

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Fetch all slideshow items from Firestore
      const itemsSnapshot = await slideshowItemsCollection.get();
      const fetchedSlides = itemsSnapshot.docs.map(doc => {
        const data = doc.data() as { src: string; title: string; type: 'video' | 'image' }; // Removed id from type
        console.log(`Slideshow item ID: ${doc.id}, src: ${data.src}`); // Diagnostic log, using doc.id
        return {
          id: doc.id, // Use the actual Firestore document ID
          src: data.src,
          title: data.title,
          type: data.type,
        };
      });

      let orderedSlides = fetchedSlides;
      
      // Fetch the saved order from Firestore
      const orderDoc = await orderDocRef.get();
      if (orderDoc.exists) {
        const orderData = orderDoc.data();
        const savedOrder: string[] = orderData?.order || [];

        // Reorder slides based on saved order
        if (savedOrder.length > 0) {
          const slidesMap = new Map(fetchedSlides.map(slide => [slide.id, slide]));
          orderedSlides = savedOrder
            .map(id => slidesMap.get(id))
            .filter((slide): slide is { id: string; src: string; title: string; type: 'video' | 'image' } => slide !== undefined);

          // Add any new slides that might not be in the saved order to the end
          const orderedIds = new Set(orderedSlides.map(slide => slide.id));
          fetchedSlides.forEach(slide => {
            if (!orderedIds.has(slide.id)) {
              orderedSlides.push(slide);
            }
          });
        }
      }

      return res.status(200).json({ slides: orderedSlides });
    } catch (err) {
      console.error('Error fetching slideshow items from Firestore:', err);
      return res.status(500).json({ error: 'Could not load slideshow items' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
} 