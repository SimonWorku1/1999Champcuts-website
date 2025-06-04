'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Scissors, Calendar, MapPin } from 'lucide-react';

interface AboutFeature {
  icon: string;
  title: string;
  description: string;
}

export default function AboutFeaturesManager() {
  const [features, setFeatures] = useState<AboutFeature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isFading, setIsFading] = useState(false);

  const fetchFeatures = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/about-features');
      if (!res.ok) throw new Error('Failed to fetch about features');
      const data = await res.json();
      setFeatures(data.features || []);
    } catch (err) {
      setError('Could not load about features.');
      console.error('Error fetching about features:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, []);

  const handleInputChange = (index: number, field: keyof AboutFeature, value: string) => {
    const newFeatures = [...features];
    // Ensure icon is not changed
    if (field !== 'icon') {
       newFeatures[index] = { ...newFeatures[index], [field]: value };
       setFeatures(newFeatures);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setError(null);
    try {
      const res = await fetch('/api/about-features', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(features),
      });

      if (!res.ok) throw new Error('Failed to save features');

      setSaveSuccess(true);
      // The useEffect below will handle fading and hiding

    } catch (err) {
      setError('Could not save features.');
      console.error('Error saving features:', err);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    // Add auto-fade for saved message
    if (saveSuccess) {
      const fadeTimer = setTimeout(() => {
        setIsFading(true);
      }, 3500); // Start fading 3.5 seconds in

      const hideTimer = setTimeout(() => {
        setSaveSuccess(false);
        setIsFading(false);
      }, 4000); // Hide completely after 4 seconds

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [saveSuccess]);

  if (isLoading) {
    return <div>Loading about features...</div>;
  }

  return (
    <div>
      <h3 className="text-lg font-semibold">About Me Features</h3>

      {error && <div className="text-red-500 font-bold">{error}</div>}

      <div className="space-y-8">
        {features.map((feature, index) => (
          <div key={index} className="bg-zinc-100 dark:bg-zinc-800 p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
               {/* Icon display (not editable) */}
               {feature.icon === 'Scissors' && <Scissors className="w-6 h-6 text-accent mr-4" />}
               {feature.icon === 'Calendar' && <Calendar className="w-6 h-6 text-accent mr-4" />}
               {feature.icon === 'MapPin' && <MapPin className="w-6 h-6 text-accent mr-4" />}
               <h4 className="text-xl font-bold">{feature.title}</h4>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor={`feature-title-${index}`} className="block mb-1 font-medium">Title</label>
                <input
                  id={`feature-title-${index}`}
                  type="text"
                  value={feature.title}
                  onChange={(e) => handleInputChange(index, 'title', e.target.value)}
                  className="w-full border rounded px-3 py-2 dark:bg-zinc-700 dark:border-zinc-600"
                />
              </div>
              <div>
                <label htmlFor={`feature-description-${index}`} className="block mb-1 font-medium">Description</label>
                <textarea
                  id={`feature-description-${index}`}
                  value={feature.description}
                  onChange={(e) => handleInputChange(index, 'description', e.target.value)}
                  className="w-full border rounded px-3 py-2 dark:bg-zinc-700 dark:border-zinc-600"
                  rows={3}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center mt-4">
        <Button onClick={handleSave} disabled={isSaving || isLoading}>
          {isSaving ? 'Saving...' : 'Save Features'}
        </Button>

        {saveSuccess && (
          <span className={`flex items-center text-green-500 font-semibold ml-4 transition-opacity duration-300 ease-in-out ${isFading ? 'opacity-0' : 'opacity-100'}`}>
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Saved!
          </span>
        )}
      </div>
    </div>
  );
}