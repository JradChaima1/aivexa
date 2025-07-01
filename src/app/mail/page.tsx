"use client";
import React, { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react';
import { useEmails } from '~/hooks/use-emai';
import { EmailView } from '~/components/EmailView';
import { EmailList } from '~/components/EmailList';
import { Sidebar } from '~/components/Sidebar';
import { Header } from '~/components/Header';

const Mail = () => {
  const { emails, selectedEmail, selectedEmailId, selectEmail } = useEmails();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showEmailView, setShowEmailView] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleSelectEmail = (id: string) => {
    selectEmail(id);
    setShowEmailView(true);
  };

  const handleBackToList = () => {
    setShowEmailView(false);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
    <Header />
    
    <div className="flex-1 flex overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className={`flex-1 flex overflow-hidden ${sidebarOpen ? 'z-0' : 'z-10'} relative`}>
        {/* Mobile menu button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed top-20 left-4 z-30 p-2 bg-emerald-600 text-white rounded-lg shadow-lg"
        >
          <Menu size={20} />
        </button>
        
        {/* Email List - Show on desktop always, on mobile/tablet only when email view is not active */}
        <div className={`w-full lg:w-96 ${showEmailView ? 'hidden lg:block' : 'block'}`}>
          <EmailList
            emails={emails}
            selectedEmail={selectedEmailId}
            onSelectEmail={handleSelectEmail}
          />
        </div>
        
        {/* Email View - Show on desktop always, on mobile/tablet only when email is selected */}
        <div className={`flex-1 ${showEmailView ? 'block' : 'hidden lg:block'}`}>
          <EmailView
            email={selectedEmail}
            onBack={handleBackToList}
          />
        </div>
      </div>
    </div>
  </div>
  )
}

export default Mail