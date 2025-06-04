'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Trash2, Upload, Plus, X, Clock, Edit2 } from 'lucide-react';
import { DndContext, SortableContext } from '@dnd-kit/core';

interface Service {
  id: string;
  name: string;
  price: string;
  duration: string;
  premium?: boolean;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
}

export default function ServicesManager() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showDeleteButtonId, setShowDeleteButtonId] = useState<string | null>(null);

  // Fetch services from the API
  const fetchServices = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/services');
      if (!res.ok) throw new Error('Failed to fetch services');
      const data = await res.json();
      setServices(data.services || []);
    } catch (err) {
      setError('Could not load services.');
      console.error('Error fetching services:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, serviceId: string) => {
    const files = event.target.files;
    if (!files || !files[0]) return;
    
    setUploading(true);
    const file = files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('serviceId', serviceId);

    try {
      const res = await fetch('/api/upload-service-media', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to upload media');
      await fetchServices();
    } catch (err) {
      console.error('Error uploading media:', err);
      setError('Could not upload media');
    } finally {
      setUploading(false);
    }
  };

  const saveService = async (service: Service) => {
    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(service),
      });
      if (!res.ok) throw new Error('Failed to save service');
      await fetchServices();
      setEditingService(null);
      setEditingId(null);
    } catch (err) {
      console.error('Error saving service:', err);
      setError('Could not save service');
    }
  };

  const deleteService = async (serviceId: string) => {
    try {
      const res = await fetch(`/api/services/${serviceId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete service');
      await fetchServices();
    } catch (err) {
      console.error('Error deleting service:', err);
      setError('Could not delete service');
    }
  };

  const removeMedia = async (serviceId: string) => {
    try {
      // Find the service to update
      const serviceToUpdate = services.find(s => s.id === serviceId);
      if (!serviceToUpdate) return;

      // Create an updated service object without mediaUrl and mediaType
      const updatedService = { ...serviceToUpdate, mediaUrl: undefined, mediaType: undefined };

      // Send the updated service to the save endpoint
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedService),
      });

      if (!res.ok) throw new Error('Failed to remove media');

      // Optimistically update the state
      setServices(services.map(s => s.id === serviceId ? updatedService : s));

      // Optionally, also delete the file from the server to clean up storage
      // This would require a new API endpoint specifically for deleting media files.
      // For now, we'll just remove the reference in services.json.

    } catch (err) {
      console.error('Error removing media:', err);
      setError('Could not remove media');
      fetchServices(); // Refetch if optimistic update fails
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Services</h3>
        <Button
          onClick={() => setEditingService({
            id: Date.now().toString(),
            name: '',
            price: '',
            duration: '',
          })}
          className="bg-accent hover:bg-accent/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </div>

      {error && <div className="text-red-500 font-bold">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {services.map((service) => (
          <div
            key={service.id}
            className="bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition group relative min-h-[250px]"
            onMouseLeave={() => setShowDeleteButtonId(null)}
          >
            {service.mediaUrl && (
              <div className="relative w-full h-48">
                {service.mediaType === 'video' ? (
                  <video
                    src={service.mediaUrl}
                    className="w-full h-full object-cover"
                    controls={false}
                    autoPlay
                    muted
                    loop
                  />
                ) : (
                  <img
                    src={service.mediaUrl}
                    alt={service.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            )}
            <div className="p-6">
              <div className="flex-1">
                {/* Display mode */}
                {editingId !== service.id && (
                  <>
                    {/* Content above buttons */}
                    <div className="flex flex-col">
                      <h3 className="text-xl font-bold mb-2">{service.name}</h3>
                      <div className="flex items-center mb-4">
                        <Clock className="w-4 h-4 mr-2 text-accent" />
                        <span>
                          {/* Display hours if greater than 0 */}
                          {parseInt(service.duration.split(' ')[0] || '0') > 0 && (
                            <>{parseInt(service.duration.split(' ')[0] || '0')} {parseInt(service.duration.split(' ')[0] || '0') > 1 ? 'hours' : 'hour'}</>
                          )}
                          {/* Add space if both hours and minutes are displayed */}
                          {parseInt(service.duration.split(' ')[0] || '0') > 0 && parseInt(service.duration.split(' ')[2] || '0') > 0 && ' '}
                          {/* Display minutes if greater than 0 */}
                          {parseInt(service.duration.split(' ')[2] || '0') > 0 && (
                            <>{parseInt(service.duration.split(' ')[2] || '0')} {parseInt(service.duration.split(' ')[2] || '0') > 1 ? 'minutes' : 'minute'}</>
                          )}
                          {/* Display 0 minutes if both are 0 (unlikely but for completeness) */}
                          {parseInt(service.duration.split(' ')[0] || '0') === 0 && parseInt(service.duration.split(' ')[2] || '0') === 0 && '0 minutes'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold">{service.price}</span>
                        {service.premium && (
                          <span className="px-3 py-1 bg-blue-700 text-white text-xs rounded-full font-semibold">
                            PREMIUM HOURS
                          </span>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Edit mode */}
                {editingId === service.id && (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor={`name-${service.id}`} className="block mb-1 font-medium">Service Name</label>
                      <input
                        type="text"
                        id={`name-${service.id}`}
                        value={services.find(s => s.id === service.id)?.name || ''}
                        onChange={(e) => {
                          const updatedService = { ...service, name: e.target.value };
                          setServices(services.map(s => s.id === service.id ? updatedService : s));
                        }}
                        className="w-full border rounded px-3 py-2 dark:bg-zinc-700 dark:border-zinc-600"
                        placeholder="Service name"
                      />
                    </div>
                    <div>
                      <label htmlFor={`duration-${service.id}`} className="block mb-1 font-medium">Duration</label>
                      <div className="flex items-center gap-2">
                        {/* Hours Input */}
                        <input
                          type="number"
                          id={`duration-hours-${service.id}`}
                          value={services.find(s => s.id === service.id)?.duration.split(' ')[0] || ''}
                          onChange={(e) => {
                            const updatedService = { ...service, duration: e.target.value };
                            setServices(services.map(s => s.id === service.id ? updatedService : s));
                          }}
                          className="w-20 border rounded px-3 py-2 dark:bg-zinc-700 dark:border-zinc-600"
                          placeholder="Hours"
                          min="0"
                        />
                        <span>hrs</span>

                        {/* Minutes Input */}
                        <input
                          type="number"
                          id={`duration-minutes-${service.id}`}
                          value={services.find(s => s.id === service.id)?.duration.split(' ')[2] || '0'}
                          onChange={(e) => {
                            const updatedService = { ...service, duration: service.duration.split(' ')[0] + ' hours ' + e.target.value + ' minutes' };
                            setServices(services.map(s => s.id === service.id ? updatedService : s));
                          }}
                          className="w-20 border rounded px-3 py-2 dark:bg-zinc-700 dark:border-zinc-600"
                          placeholder="Minutes"
                          min="0"
                          max="59"
                        />
                        <span>min</span>
                      </div>
                    </div>
                    <div>
                      <label htmlFor={`price-${service.id}`} className="block mb-1 font-medium">Price</label>
                      <div className="flex items-center gap-2 mt-4">
                        <span className="text-2xl font-bold">{service.price}</span>
                        {service.premium && (
                          <span className="ml-4 px-3 py-1 bg-blue-700 text-white text-xs rounded-full font-semibold">
                            PREMIUM HOURS
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 space-y-4">
                      <div>
                        <label className="block mb-2 font-medium">Media (Optional)</label>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 cursor-pointer bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent/90">
                            <Upload className="w-4 h-4" />
                            <span>{uploading ? 'Uploading...' : 'Upload Media'}</span>
                            <input
                              type="file"
                              accept="image/*,video/*"
                              onChange={(e) => handleFileUpload(e, service.id)}
                              className="hidden"
                              disabled={uploading}
                            />
                          </label>
                          {service.mediaUrl && (
                            <Button
                              onClick={() => removeMedia(service.id)}
                              className="bg-red-500 hover:bg-red-600 text-white"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Save and Cancel Buttons for inline editing */}
                    <div className="flex justify-end gap-2">
                      <Button
                        onClick={() => saveService(services.find(s => s.id === editingId)!)}
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        Save
                      </Button>
                      <Button
                        onClick={() => setEditingId(null)}
                        variant="outline"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              {/* Action Buttons positioned at the bottom right corner, or below content in display mode */}
              {editingId !== service.id && (
                <div className="flex justify-end mt-4">
                  <div className="relative flex items-center group">
                    {/* Delete Button (appears on hover) */}
                    <button
                      onClick={() => deleteService(service.id)}
                      className={`absolute right-[3rem] top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 border-red-500 text-red-500 flex items-center justify-center bg-transparent hover:bg-red-500 hover:text-white shadow-md z-10 transition-all duration-200 ${showDeleteButtonId === service.id ? 'opacity-100 -translate-x-12' : 'opacity-0 translate-x-0'}`}
                      aria-label="Delete service"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* Edit Button */}
                    <Button
                      onClick={() => setEditingId(service.id)}
                      variant="outline"
                      className="border-accent text-accent hover:bg-accent hover:text-white relative z-20 bg-zinc-100 dark:bg-zinc-800"
                      aria-label="Edit service"
                      onMouseEnter={() => setShowDeleteButtonId(service.id)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {editingService && !editingId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Add New Service</h3>
            <div className="space-y-4">
              <div>
                <label className="block mb-2">Service Name</label>
                <input
                  type="text"
                  value={editingService.name}
                  onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block mb-2">Price</label>
                <input
                  type="text"
                  value={editingService.price}
                  onChange={(e) => setEditingService({ ...editingService, price: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block mb-2">Duration</label>
                <div className="flex items-center gap-2">
                  {/* Hours Input */}
                  <input
                    type="number"
                    value={editingService.duration.split(' ')[0] || ''}
                    onChange={(e) => {
                      const currentMinutes = editingService.duration.split(' ')[2] || '0';
                      setEditingService({ ...editingService, duration: `${e.target.value} hours ${currentMinutes} minutes` });
                    }}
                    className="w-20 border rounded px-3 py-2 dark:bg-zinc-700 dark:border-zinc-600"
                    placeholder="Hours"
                    min="0"
                  />
                  <span>hrs</span>

                  {/* Minutes Input */}
                  <input
                    type="number"
                    value={editingService.duration.split(' ')[2] || '0'}
                    onChange={(e) => {
                      const currentHours = editingService.duration.split(' ')[0] || '0';
                      setEditingService({ ...editingService, duration: `${currentHours} hours ${e.target.value} minutes` });
                    }}
                    className="w-20 border rounded px-3 py-2 dark:bg-zinc-700 dark:border-zinc-600"
                    placeholder="Minutes"
                    min="0"
                    max="59"
                  />
                  <span>min</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="premium"
                  checked={editingService.premium}
                  onChange={(e) => setEditingService({ ...editingService, premium: e.target.checked })}
                />
                <label htmlFor="premium">Premium Service</label>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  onClick={() => saveService(editingService)}
                  className="bg-accent hover:bg-accent/90"
                >
                  Save Service
                </Button>
                <Button
                  onClick={() => setEditingService(null)}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 