import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export default function MapManager() {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');

  // derive preview on address change (client-side preview)
  useEffect(() => {
    if (!address) {
      setPreviewUrl('');
      return;
    }
    const encoded = encodeURIComponent(address);
    setPreviewUrl(`https://www.google.com/maps?q=${encoded}&output=embed`);
  }, [address]);

  useEffect(() => {
    const fetchLocation = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/location');
        const data = await res.json();
        setAddress(data.address || '');
        setPreviewUrl(data.mapEmbedUrl || '');
      } catch (e) {
        setError('Failed to load location settings');
      } finally {
        setLoading(false);
      }
    };
    fetchLocation();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const res = await fetch('/api/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });
      if (!res.ok) throw new Error('Failed to save');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      setError(e.message || 'Failed to save location settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Map & Address</h2>
      <p className="text-gray-600 mb-4">Enter the address; the map updates automatically.</p>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
              placeholder="Enter address shown next to the map"
              disabled={saving}
            />
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700 text-white">
              {saving ? 'Saving...' : 'Save'}
            </Button>
            {saved && <span className="text-green-600">Saved!</span>}
            {error && <span className="text-red-500">{error}</span>}
          </div>
          {previewUrl && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Preview</h3>
              <iframe
                src={previewUrl}
                width="100%"
                height="300"
                style={{ border: 0, borderRadius: '0.5rem' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Map Preview"
              ></iframe>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


