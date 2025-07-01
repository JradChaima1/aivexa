import React from 'react';
import { Search, Bell, Settings, User, Mail } from 'lucide-react';
import AccountSwitcher from '~/components/account-switcher';

export function Header() {
  return (
    <header className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-4 py-3 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-emerald-900 bg-opacity-60 rounded-lg flex items-center justify-center">
          <Mail size={18} className="text-white" />
        </div>
        <h1 className="text-xl font-bold">MailFlow</h1>
      </div>
      
      <div className="flex-1 max-w-md mx-8 hidden md:block">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white text-opacity-70" />
          <input
            type="text"
            placeholder="Search emails..."
            className="w-full bg-emerald-900 bg-opacity-70 border border-white border-opacity-30 rounded-lg pl-10 pr-4 py-2 text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
          />
        </div>
      </div>
    
      
      <div className="flex items-center gap-3">
        <button className="p-2 hover:bg-emerald-900 hover:bg-opacity-40 rounded-lg transition-colors">
          <Bell size={18} />
        </button>
        <div className="ml-4 w-56"><AccountSwitcher /></div>
        <button className="p-2 hover:bg-emerald-900 hover:bg-opacity-40 rounded-lg transition-colors">
          <User size={18} />
        </button>
      
      </div>
    </header>
  );
}