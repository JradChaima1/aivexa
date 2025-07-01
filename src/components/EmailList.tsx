'use client'
import React from 'react';
import { Star, Archive, Trash2, MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns'
import useThreads from '~/hooks/use-threads';
import type { EmailMessage, EmailAddress } from '~/type';

// Define the EmailListProps interfaces to match backend data
interface EmailListProps {
  selectedEmail: string | null;
  onSelectEmail: (id: string) => void;
}

export function EmailList({ selectedEmail, onSelectEmail }: EmailListProps) {
  const { threads } = useThreads()
  const groupedThreads = threads?.reduce((acc: Record<string, any[]>, thread: any) => {
    const email: EmailMessage | undefined = thread.emails[0];
    const date = format(email?.sentAt ?? new Date(), 'yyyy-MM-dd')
    if(!acc[date]) {
      acc[date] = []
    }
    acc[date].push(thread)
    return acc
  }, {} as Record<string, any[]>)
 


  return (
    <div className="bg-white border-r border-gray-200 overflow-y-auto h-full">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Inbox</h2>
          <div className="flex items-center gap-2">
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
            {/* Optionally, show the date as a header */}
             <div className="px-4 py-2 text-xs text-gray-500 bg-gray-50">{date}</div> 
            {threads.map((thread: any) => {
              const email: EmailMessage | undefined = thread.emails[0];
              if (!email) return null;
              const isUnread = email.sysLabels?.includes('unread');
              return (
                <div
                  key={email.id}
                  onClick={() => onSelectEmail(email.id)}
                  className={`p-4 cursor-pointer transition-colors duration-200 hover:bg-gray-50 ${
                    selectedEmail === email.id
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
                            {(() => {
                              const dateStr = thread.lastMessageDate;
                              const date = dateStr ? new Date(dateStr) : null;
                              return date && !isNaN(date.getTime()) ? format(date, 'p, MMM d') : '-';
                            })()}
                          </span>
                          {/* Optionally, show a star if flagged: email.sysLabels?.includes('flagged') */}
                          {email.sysLabels?.includes('flagged') && (
                            <Star size={14} className="text-yellow-400 fill-current" />
                          )}
                        </div>
                      </div>
                      <h4 className={`text-sm text-gray-800 mb-1 truncate ${isUnread ? 'font-semibold' : ''}`}>
                        {email.subject}
                      </h4>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {email.bodySnippet || ''}
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {/* Show tags from sysLabels */}
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