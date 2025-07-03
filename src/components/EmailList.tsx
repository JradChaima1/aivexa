'use client'
import React, { useState, useEffect } from 'react';
import { Star, Archive, Trash2, MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns'
import useThreads from '~/hooks/use-threads';
import type { EmailMessage, EmailAddress } from '~/type';
import DOMPurify from 'dompurify';
import { useAtom } from 'jotai';
import { threadIdAtom } from '~/hooks/use-threads';
import { useUser } from '@clerk/nextjs';

interface EmailListProps {
  selectedEmail: string | null;
  onSelectEmail: (id: string) => void;
}

export function EmailList({ selectedEmail, onSelectEmail }: EmailListProps) {
  const { threads, refetch, accountId, account } = useThreads();
  const [threadId, setThreadId] = useAtom(threadIdAtom);
  const [isClient, setIsClient] = useState(false);
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fix hydration issue by ensuring client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleRefresh = async () => {
    if (!accountId || !user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/incremental-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId, userId: user.id })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to refresh emails');
      }
      await refetch();
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const groupedThreads = threads?.reduce((acc: Record<string, any[]>, thread: any) => {
    const email: EmailMessage | undefined = thread.emails[0];
    // Only format date on client side to prevent hydration mismatch
    const date = isClient && email?.sentAt ? format(email.sentAt, 'yyyy-MM-dd') : email?.sentAt || 'no-date';
    if(!acc[date]) {
      acc[date] = []
    }
    acc[date].push(thread)
    return acc
  }, {} as Record<string, any[]>)

  if (!isClient) {
    // Return minimal server-side render to prevent hydration issues
    return (
      <div className="bg-white border-r border-gray-200 overflow-y-auto h-full">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Inbox</h2>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-gray-500">Refreshing emails...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <span className="text-red-500 mb-2">{error}</span>
        <button className="p-2 bg-emerald-500 text-white rounded" onClick={handleRefresh}>Retry</button>
      </div>
    );
  }

  if (!threads || Object.keys(groupedThreads ?? {}).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <span className="text-gray-500">No emails found.</span>
        <button className="p-2 mt-2 bg-emerald-500 text-white rounded" onClick={handleRefresh}>Refresh</button>
      </div>
    );
  }

  return (
    <div className="bg-white border-r border-gray-200 overflow-y-auto h-full">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Inbox</h2>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" onClick={handleRefresh}>
              Refresh Emails
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Archive size={16} className="text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Trash2 size={16} className="text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreHorizontal size={16} className="text-gray-600" />
            </button>
          </div>
        </div>
        
        <div className="flex gap-4 text-sm">
          <button className="text-emerald-600 font-medium border-b-2 border-emerald-600 pb-2">
            All mail
          </button>
          <button className="text-gray-600 hover:text-gray-800 pb-2">
            Unread
          </button>
        </div>
      </div>
      
      <div className="divide-y divide-gray-100">
        {Object.entries(groupedThreads ?? {}).map(([date, threads]) => (
          <React.Fragment key={date}>
            <div className="px-4 py-2 text-xs text-gray-500 bg-gray-50">
              {date !== 'no-date' && isClient ? date : ''}
            </div>
            {threads.map((thread: any) => {
              const email: EmailMessage | undefined = thread.emails[0];
              if (!email) return null;
              const isUnread = email.sysLabels?.includes('unread');
              return (
                <div
                  key={email.id}
                  onClick={() => {
                    onSelectEmail(email.id);
                    setThreadId(thread.id);
                  }}
                  className={`p-4 cursor-pointer transition-colors duration-200 hover:bg-gray-50 ${
                    selectedEmail === email.id || threadId === thread.id
                      ? 'bg-emerald-50 border-r-2 border-emerald-500'
                      : ''
                  } ${isUnread ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
                      {email.from.name ? email.from.name[0] : email.from.address[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`font-medium text-gray-900 truncate ${isUnread ? 'font-semibold' : ''}`}>
                          {email.from.name || email.from.address}
                        </h3>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs text-gray-500">
                            {thread.lastMessageDate && isClient ? format(new Date(thread.lastMessageDate), 'p, MMM d') : '-'}
                          </span>
                          {email.sysLabels?.includes('flagged') && (
                            <Star size={14} className="text-yellow-400 fill-current" />
                          )}
                        </div>
                      </div>
                      <h4 className={`text-sm text-gray-800 mb-1 truncate ${isUnread ? 'font-semibold' : ''}`}>
                        {email.subject}
                      </h4>
                      <p
                        className="text-sm text-gray-600 line-clamp-2 mb-2"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(email.bodySnippet || '') }}
                      />
                      <div className="flex gap-2 flex-wrap">
                        {email.sysLabels?.map((tag: string, index: number) => (
                          <span
                            key={index}
                            className="inline-block bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}