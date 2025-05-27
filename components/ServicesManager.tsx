'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Trash2, Upload, Plus, X, Clock, Edit2 } from 'lucide-react';

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
            className="bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition group relative"
          >
            {service.mediaUrl && (
              <div className="relative w-full h-48">
                {service.mediaType === 'video' ? (
                  <video
                    src={service.mediaUrl}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={service.mediaUrl}
                    alt={service.name}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <label className="cursor-pointer bg-accent text-white p-2 rounded-full hover:bg-accent/90">
                    <Upload className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={(e) => handleFileUpload(e, service.id)}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                  <button
                    onClick={() => deleteService(service.id)}
                    className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
            <div className="p-6">
              {editingId === service.id ? (
                <input
                  type="text"
                  value={service.name}
                  onChange={(e) => {
                    const updatedService = { ...service, name: e.target.value };
                    setServices(services.map(s => s.id === service.id ? updatedService : s));
                  }}
                  className="text-xl font-bold mb-2 w-full border rounded px-2 py-1"
                  placeholder="Service name"
                />
              ) : (
                <h3 className="text-xl font-bold mb-2">{service.name}</h3>
              )}
              <div className="flex items-center mb-2">
                <Clock className="w-4 h-4 mr-2 text-accent" />
                {editingId === service.id ? (
                  <input
                    type="text"
                    value={service.duration}
                    onChange={(e) => {
                      const updatedService = { ...service, duration: e.target.value };
                      setServices(services.map(s => s.id === service.id ? updatedService : s));
                    }}
                    className="border rounded px-2 py-1"
                    placeholder="Duration"
                  />
                ) : (
                  <span>{service.duration}</span>
                )}
              </div>
              <div className="flex justify-between items-center mt-4">
                {editingId === service.id ? (
                  <input
                    type="text"
                    value={service.price}
                    onChange={(e) => {
                      const updatedService = { ...service, price: e.target.value };
                      setServices(services.map(s => s.id === service.id ? updatedService : s));
                    }}
                    className="text-2xl font-bold border rounded px-2 py-1 w-32"
                    placeholder="Price"
                  />
                ) : (
                  <span className="text-2xl font-bold">{service.price}</span>
                )}
                <div className="flex items-center gap-2">
                  {service.premium && (
                    <span className="px-3 py-1 bg-blue-700 text-white text-xs rounded-full font-semibold">
                      PREMIUM HOURS
                    </span>
                  )}
                  {editingId === service.id ? (
                    <Button
                      onClick={() => saveService(service)}
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      Save
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setEditingId(service.id)}
                      variant="outline"
                      className="border-accent text-accent hover:bg-accent hover:text-white"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
              {editingId === service.id && (
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
                          onClick={() => deleteService(service.id)}
                          className="bg-red-500 hover:bg-red-600 text-white"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove Media
                        </Button>
                      )}
                    </div>
                  </div>
                  {service.mediaUrl && (
                    <div className="relative w-full h-48 border rounded-lg overflow-hidden">
                      {service.mediaType === 'video' ? (
                        <video
                          src={service.mediaUrl}
                          className="w-full h-full object-cover"
                          controls
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
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {editingService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
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
                <input
                  type="text"
                  value={editingService.duration}
                  onChange={(e) => setEditingService({ ...editingService, duration: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
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
                  onClick={() => setEditingService(null)}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => saveService(editingService)}
                  className="bg-accent hover:bg-accent/90"
                >
                  Save Service
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 