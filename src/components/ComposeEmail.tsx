import React, { useState } from 'react';
import { useLocalStorage } from 'usehooks-ts';

interface ComposeEmailProps {
  onClose: () => void;
}

const ComposeEmail: React.FC<ComposeEmailProps> = ({ onClose }) => {
  const [accountId] = useLocalStorage('accountId', '');
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSend = async () => {
    setError(null);
    setSuccess(false);
    if (!to || !subject || !body || !accountId) {
      setError('All fields are required.');
      return;
    }
    setSending(true);
    try {
      const res = await fetch('/api/aurinko/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, body, accountId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send email');
      setSuccess(true);
      setTo('');
      setSubject('');
      setBody('');
    } catch (err: any) {
      setError(err.message || 'Failed to send email');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative animate-fadeIn">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-2xl font-semibold mb-4 text-emerald-700">Compose Email</h2>
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
          <input
            type="email"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            value={to}
            onChange={e => setTo(e.target.value)}
            placeholder="recipient@example.com"
            required
          />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="Subject"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
          <textarea
            className="w-full border border-gray-300 rounded px-3 py-2 h-32 resize-vertical focus:outline-none focus:ring-2 focus:ring-emerald-400"
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Write your message..."
            required
          />
        </div>
        {error && <div className="text-red-500 mb-2 text-sm">{error}</div>}
        {success && <div className="text-green-600 mb-2 text-sm">Email sent!</div>}
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
            onClick={onClose}
            disabled={sending}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 font-semibold disabled:opacity-60"
            onClick={handleSend}
            disabled={sending}
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComposeEmail; 