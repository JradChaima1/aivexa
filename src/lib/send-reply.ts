import axios from 'axios';

export async function sendReplyEmail({ to, subject, body, accountId, messageId }: { to: string, subject: string, body: string, accountId: string, messageId: string }) {
  if (!to || !subject || !body || !accountId || !messageId) {
    throw new Error('All fields are required.');
  }
  // Call your backend API to get the access token and proxy the reply
  const res = await fetch('/api/aurinko/reply', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, subject, body, accountId, messageId })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to send reply');
  return data;
} 