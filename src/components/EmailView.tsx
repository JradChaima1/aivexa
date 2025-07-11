import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { EmailMessage } from '~/type';
import { useLocalStorage } from 'usehooks-ts';
import { sendReplyEmail } from '~/lib/send-reply';
import useThreads from '~/hooks/use-threads';
import { useUser } from '@clerk/nextjs';

export interface EmailViewProps {
  thread: { emails: EmailMessage[] } | null;
  selectedEmailId: string | null;
  onBack?: () => void;
}

export function EmailView({ thread, selectedEmailId, onBack }: EmailViewProps) {
  const [isClient, setIsClient] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [replyTo, setReplyTo] = useState('');
  const [replySubject, setReplySubject] = useState('');
  const [replyBody, setReplyBody] = useState('');
  const [replySending, setReplySending] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [replySuccess, setReplySuccess] = useState(false);
  const [accountId] = useLocalStorage('accountId', '');
  const { refetch } = useThreads();
  const { user } = useUser();

  const latestEmail = thread?.emails?.[thread.emails.length - 1];
  const replyMessageId = selectedEmailId
    ? thread?.emails.find(e => e.id === selectedEmailId)?.id
    : latestEmail?.id;

  useEffect(() => {
    setIsClient(true);
    if (latestEmail && latestEmail.from?.address) {
      setReplyTo(latestEmail.from.address);
    }
    if (latestEmail && latestEmail.subject) {
      setReplySubject(latestEmail.subject.startsWith('Re:') ? latestEmail.subject : `Re: ${latestEmail.subject}`);
    }
  }, [latestEmail]);

  const handleReplySend = async () => {
    setReplyError(null);
    setReplySuccess(false);
    setReplySending(true);
    try {
      if (!replyMessageId) {
        setReplyError('No message selected to reply to.');
        setReplySending(false);
        return;
      }
      
      await sendReplyEmail({ 
        to: replyTo, 
        subject: replySubject, 
        body: replyBody, 
        accountId, 
        messageId: replyMessageId 
      });
      
      if (accountId && user?.id) {
        try {
          const res = await fetch('/api/incremental-sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accountId, userId: user.id })
          });
          
          if (res.ok) {
            setTimeout(async () => {
              await refetch();
            }, 2000);
          }
        } catch (syncErr) {
          console.error('Error during post-reply sync:', syncErr);
          await refetch();
        }
      }
      
      setReplySuccess(true);
      setReplyBody('');
      setShowReply(false);
      
    } catch (err: any) {
      setReplyError(err.message || 'Failed to send reply');
    } finally {
      setReplySending(false);
    }
  };

  if (!thread || !thread.emails || thread.emails.length === 0) {
    return (
      <div className="flex-1 bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No email selected</h3>
          <p className="text-gray-500">Select an email from the list to view its contents</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white flex flex-col justify-between">
      <div className="p-4 border-b border-gray-200 flex items-center">
        <div className="flex items-center gap-3">
          {onBack && (
            <button 
              onClick={onBack}
              className="flex items-center px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
              title="Back to inbox"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline text-sm font-medium">Back to Inbox</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 100px)' }}>
        <div className="max-w-4xl mx-auto p-4 lg:p-6">
          {replySuccess && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm">Reply sent successfully! Refreshing thread...</p>
            </div>
          )}
          
          {thread.emails.map((email) => (
            <div key={email.id} className={`mb-6 ${selectedEmailId === email.id ? 'ring-2 ring-emerald-400 rounded' : ''}`}>
              <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 lg:p-6 rounded-t-lg">
                <h1 className="text-xl lg:text-2xl font-bold mb-2">{email.subject}</h1>
                <p className="text-emerald-100 text-sm lg:text-base">
                  {isClient && email.sentAt ? new Date(email.sentAt).toLocaleString() : ''}
                </p>
              </div>
              <div className="bg-white rounded-b-lg border border-gray-200 p-4 lg:p-6">
                <div className="flex items-center gap-3 lg:gap-4 mb-4 lg:mb-6">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white font-medium text-sm lg:text-base">
                    {(email.from?.name ? email.from.name[0] : email.from?.address ? email.from.address[0] : '?')}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm lg:text-base">{email.from?.name || email.from?.address || ''}</h3>
                    <p className="text-xs lg:text-sm text-gray-600">
                      Reply-To: {email.replyTo && email.replyTo.length > 0 ? email.replyTo.map(rt => rt.address).join(', ') : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed text-sm lg:text-base">
                  {email.body ? (
                    <iframe
                      srcDoc={email.body}
                      className="w-full h-[600px] border rounded"
                      sandbox="allow-same-origin"
                    />
                  ) : email.bodySnippet ? (
                    <div>{email.bodySnippet}</div>
                  ) : (
                    <span className="text-gray-400">(No content)</span>
                  )}
                </div>
              </div>
            </div>
          ))}

          <div className="mt-6">
            {!showReply ? (
              <button
                className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 font-semibold"
                onClick={() => setShowReply(true)}
              >
                Reply
              </button>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-2">
                <div className="mb-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">To</label>
                  <input
                    type="email"
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                    value={replyTo}
                    onChange={e => setReplyTo(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                    value={replySubject}
                    onChange={e => setReplySubject(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm h-20"
                    value={replyBody}
                    onChange={e => setReplyBody(e.target.value)}
                    required
                  />
                </div>
                {replyError && <div className="text-red-500 mb-2 text-xs">{replyError}</div>}
                <div className="flex gap-2 justify-end mt-2">
                  <button
                    className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 text-sm"
                    onClick={() => setShowReply(false)}
                    disabled={replySending}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-3 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 font-semibold text-sm disabled:opacity-60"
                    onClick={handleReplySend}
                    disabled={replySending}
                  >
                    {replySending ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}