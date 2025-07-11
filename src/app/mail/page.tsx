"use client";
import React, { useState, useEffect, Suspense } from 'react'
import { Menu } from 'lucide-react';
import { EmailView } from '~/components/EmailView';
import { EmailList } from '~/components/EmailList';
import { Sidebar } from '~/components/Sidebar';
import { Header } from '~/components/Header';
import { toast, Toaster } from "sonner";
import { useSearchParams } from "next/navigation";
import useThreads from '~/hooks/use-threads';
import type { EmailMessage } from '~/type';

// Separate component to handle search params
function SearchParamsHandler() {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const error = searchParams?.get("error");
    if (error === "account_exists") {
      toast.error("Account already exists");
    }
  }, [searchParams]);
  
  return null;
}

const Mail = () => {
  const { threads } = useThreads();
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showEmailView, setShowEmailView] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Find the selected email object from threads
  const selectedEmail = React.useMemo(() => {
    for (const thread of threads ?? []) {
      for (const email of thread.emails) {
        if (email.id === selectedEmailId) return email;
      }
    }
    return null;
  }, [threads, selectedEmailId]);

  // Find the selected thread object from threads
  const selectedThread = React.useMemo(() => {
    for (const thread of threads ?? []) {
      if (thread.emails.some((email: any) => email.id === selectedEmailId)) {
        // Sort emails by sentAt ascending (oldest first, newest last)
        const sortedEmails = [...thread.emails].sort((a: any, b: any) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
        return {
          ...thread,
          emails: sortedEmails.map((email: any) => ({
            ...email,
            sentAt: typeof email.sentAt === 'string' ? email.sentAt : email.sentAt?.toISOString(),
            receivedAt: typeof email.receivedAt === 'string' ? email.receivedAt : email.receivedAt?.toISOString(),
            createdTime: typeof email.createdTime === 'string' ? email.createdTime : email.createdTime?.toISOString(),
            lastModifiedTime: typeof email.lastModifiedTime === 'string' ? email.lastModifiedTime : email.lastModifiedTime?.toISOString(),
          })),
        };
      }
    }
    return null;
  }, [threads, selectedEmailId]);

  const handleSelectEmail = (id: string) => {
    setSelectedEmailId(id);
    setShowEmailView(true);
  };

  const handleBackToList = () => {
    setShowEmailView(false);
  };

  if (!isClient) {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex-1 flex overflow-hidden">
          <div className="w-full lg:w-96">
            <div className="bg-white border-r border-gray-200 overflow-y-auto h-full">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Loading...</h2>
              </div>
            </div>
          </div>
          <div className="flex-1 bg-white flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Loading...</h3>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster />
      <Suspense fallback={null}>
        <SearchParamsHandler />
      </Suspense>
      <div className="h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex-1 flex overflow-hidden">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div className={`flex-1 flex overflow-hidden ${sidebarOpen ? 'z-0' : 'z-10'} relative`}>
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden fixed top-20 left-4 z-30 p-2 bg-emerald-600 text-white rounded-lg shadow-lg"
            >
              <Menu size={20} />
            </button>
            <div className={`w-full lg:w-96 ${showEmailView ? 'hidden lg:block' : 'block'}`}>
              <EmailList
                selectedEmail={selectedEmailId}
                onSelectEmail={handleSelectEmail}
              />
            </div>
            <div className={`flex-1 ${showEmailView ? 'block' : 'hidden lg:block'}`}>
              <EmailView
                thread={selectedThread}
                selectedEmailId={selectedEmailId}
                onBack={handleBackToList}
               
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Mail