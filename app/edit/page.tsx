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
import { Trash2 } from 'lucide-react';

export default function EditPage() {
  const [user, setUser] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const auth = getAuth(app);

  // const allowedEmail = 'simonworku410@gmail.com'; // The specific email allowed access
  const allowedEmails = ['simonworku410@gmail.com','lukasamaree@gmail.com', 'Yeisonpablocalmo@gmail.com']; // Array of emails allowed access

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
  const [aboutMeImage, setAboutMeImage] = useState('');
  const [aboutMeLoading, setAboutMeLoading] = useState(true);
  const [aboutMeSaving, setAboutMeSaving] = useState(false);
  const [aboutMeSaved, setAboutMeSaved] = useState(false);
  const [aboutMeError, setAboutMeError] = useState<string | null>(null);
  const [isFading, setIsFading] = useState(false);

  // Hero text state
  const [heroTitle, setHeroTitle] = useState('1999CHAMPCUTZ');
  const [heroTagline, setHeroTagline] = useState('Premium barbershop experience with skilled professionals dedicated to perfecting your style');
  const [heroTextLoading, setHeroTextLoading] = useState(true);
  const [heroTextSaving, setHeroTextSaving] = useState(false);
  const [heroTextSaved, setHeroTextSaved] = useState(false);
  const [heroTextError, setHeroTextError] = useState<string | null>(null);

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
        setAboutMeImage(data.imageUrl || '');
        setTimeout(adjustTextareaHeight, 0); // Ensure textarea grows after aboutMe is set
      } catch (err) {
        setAboutMeError('Could not load About Me');
      } finally {
        setAboutMeLoading(false);
      }
    };
    fetchAboutMe();
  }, []);

  const handleAboutMeImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const formData = new FormData();
    formData.append('file', e.target.files[0]);
    try {
      const res = await fetch('/api/upload-aboutme-image', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.imageUrl) {
        setAboutMeImage(data.imageUrl);
      } else {
        setAboutMeError(data.error || 'Failed to upload image');
      }
    } catch (err) {
      setAboutMeError('Failed to upload image');
    }
  };

  const saveAboutMe = async () => {
    setAboutMeSaving(true);
    setAboutMeError(null);
    setAboutMeSaved(false);
    try {
      const res = await fetch('/api/about-me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: aboutMe, imageUrl: aboutMeImage }),
      });
      if (!res.ok) throw new Error('Failed to save');
      setAboutMeSaved(true);
    } catch (err) {
      setAboutMeError('Could not save About Me');
    } finally {
      setAboutMeSaving(false);
    }
  };

  // Hero text functions
  useEffect(() => {
    const fetchHeroText = async () => {
      setHeroTextLoading(true);
      setHeroTextError(null);
      try {
        const res = await fetch('/api/hero-text');
        const data = await res.json();
        setHeroTitle(data.title || '1999CHAMPCUTZ');
        setHeroTagline(data.tagline || 'Premium barbershop experience with skilled professionals dedicated to perfecting your style');
      } catch (err) {
        setHeroTextError('Could not load hero text');
      } finally {
        setHeroTextLoading(false);
      }
    };
    fetchHeroText();
  }, []);

  const saveHeroText = async () => {
    setHeroTextSaving(true);
    setHeroTextError(null);
    setHeroTextSaved(false);
    try {
      const res = await fetch('/api/hero-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: heroTitle, tagline: heroTagline }),
      });
      if (!res.ok) throw new Error('Failed to save');
      setHeroTextSaved(true);
    } catch (err) {
      setHeroTextError('Could not save hero text');
    } finally {
      setHeroTextSaving(false);
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
          ) : user && user.email && allowedEmails.map(email => email.toLowerCase().trim()).includes(user.email.toLowerCase().trim()) ? (
            <>
              <div className="flex justify-end mb-4">
                <Button onClick={handleSignOut} variant="outline">Sign Out</Button>
              </div>
              <div>
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">Hero Text Editor</h2>
                  <p className="text-gray-600 mb-4">Edit the main title and tagline displayed on the homepage hero section.</p>
                  {heroTextLoading ? (
                    <div>Loading...</div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Main Title
                        </label>
                        <input
                          type="text"
                          value={heroTitle}
                          onChange={(e) => setHeroTitle(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg"
                          placeholder="Enter main title"
                          disabled={heroTextSaving}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tagline
                        </label>
                        <textarea
                          value={heroTagline}
                          onChange={(e) => setHeroTagline(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg"
                          rows={3}
                          placeholder="Enter tagline"
                          disabled={heroTextSaving}
                        />
                      </div>
                      <div className="flex items-center gap-4">
                        <Button 
                          onClick={saveHeroText} 
                          disabled={heroTextSaving}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {heroTextSaving ? 'Saving...' : 'Save'}
                        </Button>
                        {heroTextSaved && (
                          <span className="text-green-600">Saved!</span>
                        )}
                        {heroTextError && <span className="text-red-500">{heroTextError}</span>}
                      </div>
                    </div>
                  )}
                </div>
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
                      <div className="flex flex-col md:flex-row gap-6 items-start mb-2">
                        <div className="flex-1 w-full">
                          <textarea
                            ref={textareaRef}
                            className="w-full min-h-[40px] max-h-[400px] p-3 border border-gray-300 rounded-lg mb-2 resize-none overflow-hidden"
                            rows={1}
                            value={aboutMe}
                            onChange={e => { setAboutMe(e.target.value); adjustTextareaHeight(); }}
                            onInput={adjustTextareaHeight}
                            disabled={aboutMeSaving}
                          />
                          <div className="flex items-center gap-4 pb-6">
                            <Button 
                              onClick={saveAboutMe} 
                              disabled={aboutMeSaving}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              {aboutMeSaving ? 'Saving...' : 'Save'}
                            </Button>
                            {aboutMeSaved && (
                              <span className={`text-green-600 transition-opacity duration-300 ease-in-out ${isFading ? 'opacity-0' : 'opacity-100'}`}>
                                Saved!
                              </span>
                            )}
                            {aboutMeError && <span className="text-red-500">{aboutMeError}</span>}
                          </div>
                        </div>
                        <div className="flex flex-col items-center gap-2 min-w-[160px]">
                          {aboutMeImage && (
                            <div className="relative group w-40 h-40 mb-2">
                              <img src={aboutMeImage} alt="Owner" className="w-40 h-40 object-cover rounded-full border" />
                              <button
                                type="button"
                                className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => setAboutMeImage('')}
                                title="Remove image"
                              >
                                <Trash2 className="w-10 h-10 text-white" />
                              </button>
                            </div>
                          )}
                          <span className="text-sm font-medium mb-1 block">Owner Picture</span>
                          <label className="w-full cursor-pointer">
                            <span className="sr-only">Upload Image</span>
                            <div className="w-full bg-accent hover:bg-accent/90 text-white font-semibold py-2 px-4 rounded text-center transition-colors">
                              Upload Image
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleAboutMeImageUpload}
                              className="hidden"
                              disabled={aboutMeSaving}
                            />
                          </label>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              {/* About Me Features Section */}
              <section id="edit-about-features" className="w-full">
                <div className="container mx-auto px-4">
                  <div className="bg-white border border-zinc-200 rounded-lg shadow p-4">
                    <AboutFeaturesManager />
                  </div>
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