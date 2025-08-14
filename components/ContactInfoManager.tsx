import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

interface Hours {
  weekday: string;
  saturday: string;
  sunday: string;
}

export default function ContactInfoManager() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [hours, setHours] = useState<Hours>({ weekday: '', saturday: '', sunday: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContact = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/contact-info');
        const data = await res.json();
        setEmail(data.email || '');
        setPhone(data.phone || '');
        setHours(data.hours || { weekday: '', saturday: '', sunday: '' });
      } catch (e) {
        setError('Failed to load contact info');
      } finally {
        setLoading(false);
      }
    };
    fetchContact();
  }, []);

  const handleChange = (key: keyof Hours, value: string) => {
    setHours(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const res = await fetch('/api/contact-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone, hours }),
      });
      if (!res.ok) throw new Error('Failed to save');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      setError(e.message || 'Failed to save contact info');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Contact Info</h2>
      <p className="text-gray-600 mb-4">Edit the phone number, email, and working hours.</p>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
              placeholder="(510) 555-1234"
              disabled={saving}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
              placeholder="name@example.com"
              disabled={saving}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Weekday Hours</label>
            <input
              type="text"
              value={hours.weekday}
              onChange={(e) => handleChange('weekday', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
              placeholder="Monday - Friday: 9am - 8pm"
              disabled={saving}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Saturday Hours</label>
            <input
              type="text"
              value={hours.saturday}
              onChange={(e) => handleChange('saturday', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
              placeholder="Saturday: 10am - 6pm"
              disabled={saving}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sunday Hours</label>
            <input
              type="text"
              value={hours.sunday}
              onChange={(e) => handleChange('sunday', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
              placeholder="Sunday: Closed"
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
        </div>
      )}
    </div>
  );
}


