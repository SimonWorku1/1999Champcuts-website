'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState, useRef } from 'react';
import SlideshowManager from '@/components/SlideshowManager';
import ServicesManager from '@/components/ServicesManager';
import AboutFeaturesManager from '@/components/AboutFeaturesManager';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

export default function EditPage() {
  const [user, setUser] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const auth = getAuth(app);

  const allowedEmail = 'simonworku410@gmail.com'; // The specific email allowed access

  // Effect to listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
    });

    return () => unsubscribe(); // Cleanup subscription
  }, [auth]);

  const signInWithGoogle = async () => {
    setAuthError(null);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // User is signed in, state change listener will handle setting the user
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      setAuthError(error.message || 'Error signing in with Google.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error: any) {
      console.error('Error signing out:', error);
      setAuthError(error.message || 'Error signing out.');
    }
  };

  const [aboutMe, setAboutMe] = useState('');
  const [aboutMeLoading, setAboutMeLoading] = useState(true);
  const [aboutMeSaving, setAboutMeSaving] = useState(false);
  const [aboutMeSaved, setAboutMeSaved] = useState(false);
  const [aboutMeError, setAboutMeError] = useState<string | null>(null);
  const [isFading, setIsFading] = useState(false);

  // Add auto-fade for saved message
  useEffect(() => {
    if (aboutMeSaved) {
      const fadeTimer = setTimeout(() => {
        setIsFading(true);
      }, 3500); // Start fading 3.5 seconds in

      const hideTimer = setTimeout(() => {
        setAboutMeSaved(false);
        setIsFading(false);
      }, 4000); // Hide completely after 4 seconds

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [aboutMeSaved]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [aboutMe]);

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
          {loadingAuth ? (
            <div>Loading authentication...</div>
          ) : user && user.email && user.email.toLowerCase().trim() === allowedEmail.toLowerCase().trim() ? (
            <>
              <div className="flex justify-end mb-4">
                <Button onClick={handleSignOut} variant="outline">Sign Out</Button>
              </div>
              <div>
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">Slideshow Management</h2>
                  <p className="text-gray-600 mb-4">Upload, reorder, or delete media for the homepage slideshow.</p>
                  <SlideshowManager />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Services Management</h2>
                  <p className="text-gray-600 mb-4">Manage your haircutting services and their associated media.</p>
                  <ServicesManager />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Edit About Me</h2>
                  <p className="text-gray-600 mb-4">Edit the About Me section for the homepage.</p>
                  {aboutMeLoading ? (
                    <div>Loading...</div>
                  ) : (
                    <>
                      <textarea
                        ref={textareaRef}
                        className="w-full min-h-[120px] p-3 border border-gray-300 rounded-lg mb-2 resize-none overflow-hidden"
                        value={aboutMe}
                        onChange={e => setAboutMe(e.target.value)}
                        disabled={aboutMeSaving}
                        onInput={adjustTextareaHeight}
                      />
                      <div className="flex items-center gap-4 pb-6">
                        <Button onClick={saveAboutMe} disabled={aboutMeSaving}>
                          {aboutMeSaving ? 'Saving...' : 'Save'}
                        </Button>
                        {aboutMeSaved && (
                          <span className={`text-green-600 transition-opacity duration-300 ease-in-out ${isFading ? 'opacity-0' : 'opacity-100'}`}>
                            Saved!
                          </span>
                        )}
                        {aboutMeError && <span className="text-red-500">{aboutMeError}</span>}
                      </div>
                    </>
                  )}
                </div>
              </div>
              {/* About Me Features Section */}
              <section id="edit-about-features" className="w-full">
                <div className="container mx-auto px-4">
                  <AboutFeaturesManager />
                </div>
              </section>
              {/* Services Section */}
              <section id="edit-services" className="w-full py-12 bg-zinc-100 dark:bg-zinc-800">
                <div className="container mx-auto px-4">
                  {/* Services content */}
                </div>
              </section>
            </>
          ) : (
            <div className="min-h-screen bg-gray-100 py-8 flex items-center justify-center">
              <div className="bg-white rounded-lg shadow p-6 max-w-sm w-full text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
                <p className="text-gray-600 mb-4">You do not have permission to view this page. Please sign in with an authorized email.</p>
                
                <Button onClick={signInWithGoogle} className="w-full">Sign In with Google</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 