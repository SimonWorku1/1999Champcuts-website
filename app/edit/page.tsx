'use client';

import React, { useEffect, useState } from 'react';
import SlideshowManager from '@/components/SlideshowManager';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function EditPage() {
  const [aboutMe, setAboutMe] = useState('');
  const [aboutMeLoading, setAboutMeLoading] = useState(true);
  const [aboutMeSaving, setAboutMeSaving] = useState(false);
  const [aboutMeSaved, setAboutMeSaved] = useState(false);
  const [aboutMeError, setAboutMeError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAboutMe = async () => {
      setAboutMeLoading(true);
      setAboutMeError(null);
      try {
        const res = await fetch('/api/about-me');
        const data = await res.json();
        setAboutMe(data.text || '');
      } catch (err) {
        setAboutMeError('Could not load About Me');
      } finally {
        setAboutMeLoading(false);
      }
    };
    fetchAboutMe();
  }, []);

  const saveAboutMe = async () => {
    setAboutMeSaving(true);
    setAboutMeError(null);
    setAboutMeSaved(false);
    try {
      const res = await fetch('/api/about-me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: aboutMe }),
      });
      if (!res.ok) throw new Error('Failed to save');
      setAboutMeSaved(true);
    } catch (err) {
      setAboutMeError('Could not save About Me');
    } finally {
      setAboutMeSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-end mb-4">
            <Link href="/">
              <Button variant="outline">Go to Home</Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Section</h1>
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Slideshow Management</h2>
              <p className="text-gray-600 mb-4">Upload, reorder, or delete media for the homepage slideshow.</p>
              <SlideshowManager />
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-4">Edit About Me</h2>
              <p className="text-gray-600 mb-4">Edit the About Me section for the homepage.</p>
              {aboutMeLoading ? (
                <div>Loading...</div>
              ) : (
                <>
                  <textarea
                    className="w-full min-h-[120px] p-3 border border-gray-300 rounded-lg mb-2"
                    value={aboutMe}
                    onChange={e => setAboutMe(e.target.value)}
                    disabled={aboutMeSaving}
                  />
                  <div className="flex items-center gap-4">
                    <Button onClick={saveAboutMe} disabled={aboutMeSaving}>
                      {aboutMeSaving ? 'Saving...' : 'Save'}
                    </Button>
                    {aboutMeSaved && <span className="text-green-600">Saved!</span>}
                    {aboutMeError && <span className="text-red-500">{aboutMeError}</span>}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 