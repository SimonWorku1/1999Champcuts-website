'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Trash2, ArrowUp, ArrowDown, Upload, GripVertical, X } from 'lucide-react';

interface Slide {
  id: string;
  src: string;
  title: string;
  type: 'video' | 'image';
}

export default function SlideshowManager() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [previewSlide, setPreviewSlide] = useState<Slide | null>(null);
  const [uploading, setUploading] = useState(false);

  // Fetch videos from the API
  const fetchVideos = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/videos');
      if (!res.ok) throw new Error('Failed to fetch videos');
      const data = await res.json();
      const videoSlides: Slide[] = (data.videos || []).map((v: any, idx: number) => ({
        id: v.filename,
        src: v.url,
        title: v.filename,
        type: 'video',
      }));
      setSlides(videoSlides);
      localStorage.setItem('slideshow', JSON.stringify(videoSlides));
    } catch (err) {
      setError('Could not load videos.');
      console.error('Error fetching videos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const saveSlides = (newSlides: Slide[]) => {
    localStorage.setItem('slideshow', JSON.stringify(newSlides));
    setSlides(newSlides);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('video/')) continue;
      const formData = new FormData();
      formData.append('file', file);
      await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
    }
    setUploading(false);
    await fetchVideos();
  };

  const moveSlide = (index: number, direction: 'up' | 'down') => {
    const newSlides = [...slides];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < slides.length) {
      [newSlides[index], newSlides[newIndex]] = [newSlides[newIndex], newSlides[index]];
      saveSlides(newSlides);
    }
  };

  const deleteSlide = async (index: number) => {
    const filename = slides[index]?.title;
    if (!filename) return;
    try {
      await fetch('/api/delete-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename }),
      });
      await fetchVideos();
    } catch (err) {
      console.error('Error deleting video:', err);
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedItem(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedItem === null) return;
    const newSlides = [...slides];
    const draggedSlide = newSlides[draggedItem];
    newSlides.splice(draggedItem, 1);
    newSlides.splice(dropIndex, 0, draggedSlide);
    saveSlides(newSlides);
    setDraggedItem(null);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div className="text-red-500 font-bold">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent/90">
          <Upload className="w-5 h-5" />
          <span>{uploading ? 'Uploading...' : 'Upload Media'}</span>
          <input
            type="file"
            multiple
            accept="video/*"
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>

      <div className="space-y-4">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            className={`flex items-center gap-4 p-4 bg-white rounded-lg shadow cursor-move transition-all ${
              draggedItem === index ? 'opacity-50' : ''
            }`}
          >
            <div className="flex items-center gap-2">
              <GripVertical className="w-5 h-5 text-gray-400" />
              <div 
                className="w-24 h-24 relative cursor-pointer"
                onClick={() => setPreviewSlide(slide)}
              >
                {slide.type === 'video' ? (
                  <video
                    src={slide.src}
                    className="w-full h-full object-cover rounded"
                  />
                ) : null}
              </div>
            </div>
            <div className="flex-1">
              <p className="font-medium">{slide.title}</p>
              <p className="text-sm text-gray-500">{slide.type}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => moveSlide(index, 'up')}
                disabled={index === 0}
              >
                <ArrowUp className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => moveSlide(index, 'down')}
                disabled={index === slides.length - 1}
              >
                <ArrowDown className="w-4 h-4" />
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => deleteSlide(index)}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {previewSlide && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 min-h-screen w-full"
          onClick={() => setPreviewSlide(null)}
        >
          <div 
            className="relative max-w-2xl w-full mx-4 overflow-hidden shadow-2xl flex items-center justify-center"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-white hover:text-gray-300 bg-black/50 rounded-full p-1 hover:bg-black/70 transition-colors z-10"
              onClick={() => setPreviewSlide(null)}
            >
              <X className="w-6 h-6" />
            </button>
            {previewSlide.type === 'video' ? (
              <video
                src={previewSlide.src}
                className="w-full max-w-xl max-h-[80vh] rounded-[3rem] object-cover mx-auto"
                controls
                autoPlay
              />
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
} 