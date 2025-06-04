'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Trash2, ArrowUp, ArrowDown, Upload, GripVertical, X } from 'lucide-react';
import { DndContext, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus } from 'lucide-react';

interface Slide {
  id: string;
  src: string;
  title: string;
  type: 'video' | 'image';
}

interface SlideshowManagerProps {
  // Define any props if needed
}

export default function SlideshowManager(props: SlideshowManagerProps) {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [previewSlide, setPreviewSlide] = useState<Slide | null>(null);
  const [uploading, setUploading] = useState(false);
  const [slideshowOrderSaved, setSlideshowOrderSaved] = useState(false);
  const [isSlideshowFading, setIsSlideshowFading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchSlides = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [slidesRes, orderRes] = await Promise.all([
        fetch('/api/slideshow'),
        fetch('/api/slideshow-order') // Fetch the saved order
      ]);

      if (!slidesRes.ok) throw new Error('Failed to fetch slides');
      const slidesData = await slidesRes.json();
      const fetchedSlides: Slide[] = slidesData.slides || [];

      let orderedSlides = fetchedSlides;
      if (orderRes.ok) {
        const orderData = await orderRes.json();
        const savedOrder: string[] = orderData.order || [];
        // Reorder slides based on saved order
        if (savedOrder.length > 0) {
          const slidesMap = new Map(fetchedSlides.map(slide => [slide.id, slide]));
          orderedSlides = savedOrder
            .map(id => slidesMap.get(id))
            .filter((slide): slide is Slide => slide !== undefined);
          // Add any new slides that might not be in the saved order to the end
          const orderedIds = new Set(orderedSlides.map(slide => slide.id));
          fetchedSlides.forEach(slide => {
            if (!orderedIds.has(slide.id)) {
              orderedSlides.push(slide);
            }
          });
        }
      }
      
      setSlides(orderedSlides);

    } catch (err) {
      setError('Could not load slideshow items.');
      console.error('Error fetching slideshow:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    for (const file of Array.from(files)) {
      formData.append('files', file);
    }

    try {
      const res = await fetch('/api/upload-slideshow-media', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to upload files');
      await fetchSlides(); // Refresh the list including the new file(s)
    } catch (err) {
      console.error('Error uploading files:', err);
      setError('Could not upload files.');
    } finally {
      setUploading(false);
    }
  };

  const deleteSlide = async (id: string) => {
    try {
      const res = await fetch(`/api/slideshow/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete slide');
      // Optimistically remove the slide
      setSlides(prevSlides => prevSlides.filter(slide => slide.id !== id));
      // Also remove from saved order if it exists
      await saveOrder(slides.filter(slide => slide.id !== id).map(slide => slide.id));
    } catch (err) {
      console.error('Error deleting slide:', err);
      setError('Could not delete slide.');
      fetchSlides(); // Refetch if optimistic update fails
    }
  };

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setSlides((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }, []);

  const moveSlide = (id: string, direction: 'up' | 'down') => {
    setSlides(prevSlides => {
      const newSlides = [...prevSlides];
      const index = newSlides.findIndex(slide => slide.id === id);
      if (index === -1) return newSlides; // Should not happen

      const newIndex = direction === 'up' ? index - 1 : index + 1;

      if (newIndex >= 0 && newIndex < newSlides.length) {
        [newSlides[index], newSlides[newIndex]] = [newSlides[newIndex], newSlides[index]];
        return newSlides;
      }

      return newSlides; // No change if move is out of bounds
    });
  };

  const saveOrder = async (currentOrder?: string[]) => {
    const orderToSave = currentOrder || slides.map(slide => slide.id);
    try {
      const res = await fetch('/api/slideshow-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: orderToSave }),
      });
      if (!res.ok) throw new Error('Failed to save order');
      console.log('Slideshow order saved!');
      setSlideshowOrderSaved(true);
    } catch (err) {
      console.error('Error saving order:', err);
      setError('Could not save order.');
    }
  };

  // Add auto-fade for saved message
  useEffect(() => {
    if (slideshowOrderSaved) {
      const fadeTimer = setTimeout(() => {
        setIsSlideshowFading(true);
      }, 3500); // Start fading 3.5 seconds in

      const hideTimer = setTimeout(() => {
        setSlideshowOrderSaved(false);
        setIsSlideshowFading(false);
      }, 4000); // Hide completely after 4 seconds

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [slideshowOrderSaved]);

  if (isLoading) {
    return <div>Loading slideshow...</div>;
  }

  if (error) {
    return <div className="text-red-500 font-bold">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Slideshow Items</h3>
        <div className="flex items-center gap-4">
          {/* Add Save Order Button */}
          <Button onClick={() => saveOrder()} className="bg-green-500 hover:bg-green-600 text-white">
             Save
           </Button>
           {slideshowOrderSaved && (
             <span className={`text-green-600 transition-opacity duration-300 ease-in-out ${isSlideshowFading ? 'opacity-0' : 'opacity-100'}`}>
               Saved!
             </span>
           )}
          <label className="flex items-center gap-2 cursor-pointer bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent/90">
            <Upload className="w-4 h-4" />
            <span>{uploading ? 'Uploading...' : 'Upload Files'}</span>
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={slides.map(slide => slide.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {slides.map(slide => (
              <SortableItem key={slide.id} id={slide.id} slide={slide} onDelete={deleteSlide} moveSlide={moveSlide} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

interface SortableItemProps {
  id: string;
  slide: Slide;
  onDelete: (id: string) => void;
  moveSlide: (id: string, direction: 'up' | 'down') => void;
}

function SortableItem({ id, slide, onDelete, moveSlide }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled: false });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative bg-white rounded-lg shadow overflow-hidden flex items-center gap-4 p-4"
    >
      {/* Drag Handle */}
      <div
        className="cursor-grab touch-action-none p-2"
        {...listeners}
        {...attributes}
      >
        <GripVertical className="w-6 h-6 text-gray-400" />
      </div>

      <div className="w-48 h-32 relative rounded overflow-hidden">
        {slide.type === 'video' ? (
          <video src={slide.src} className="w-full h-full object-cover" controls={false} autoPlay muted loop />
        ) : (
          <img src={slide.src} alt={slide.title} className="w-full h-full object-cover" />
        )}
      </div>
      <div className="flex-1 flex justify-between items-center">
        <p className="font-medium truncate">{slide.title}</p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              console.log('Move up clicked for', id);
              moveSlide(slide.id, 'up');
            }}
            className="p-1 rounded-full hover:bg-accent hover:text-white transition-colors"
            aria-label="Move slide up"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              console.log('Move down clicked for', id);
              moveSlide(slide.id, 'down');
            }}
            className="p-1 rounded-full hover:bg-accent hover:text-white transition-colors"
            aria-label="Move slide down"
          >
            <ArrowDown className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              console.log('Delete clicked for', id);
              onDelete(slide.id);
            }}
            className="p-1 bg-red-500 bg-opacity-75 rounded-full text-white hover:bg-red-600 hover:bg-opacity-100"
            aria-label="Delete slide"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
} 