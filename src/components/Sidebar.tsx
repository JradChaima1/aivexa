import React, { useState } from 'react';
import { 
  Edit, 
  Inbox, 
  FileText, 
  Send, 
  Trash2, 
  Archive, 
  Users, 
  RefreshCw, 
  MessageSquare, 
  ShoppingBag, 
  Gift 
} from 'lucide-react';
import { useLocalStorage } from 'usehooks-ts';
import { api } from '~/trpc/react';
import ComposeEmail from './ComposeEmail';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [accountId] = useLocalStorage('accountId','')
  const [tab, setTab] = useLocalStorage('sidebarTab', 'inbox');
  const { data: inboxThreads } = api.account.getNumThreads.useQuery({
         accountId,
         tab:'inbox',
  })
  const { data: draftThreads } = api.account.getNumThreads.useQuery({
    accountId,
    tab:'draft',
})
const { data: sentThreads } = api.account.getNumThreads.useQuery({
  accountId,
  tab:'sent',
})
  const menuItems = [
    { icon: Inbox, label: 'Inbox', count: inboxThreads?.toString() ?? '0', variant: tab === 'inbox' ? 'default' : 'ghost' },
    { icon: FileText, label: 'Drafts', count: draftThreads?.toString() ?? '0', variant: tab === 'drafts' ? 'default' : 'ghost' },
    { icon: Send, label: 'Sent', count: sentThreads?.toString() ?? '0' ,variant: tab === 'sent' ? 'default' : 'ghost' },
    { icon: Trash2, label: 'Junk', count: 23, variant: tab === 'junk' ? 'default' : 'ghost' },
    { icon: Trash2, label: 'Trash', variant: tab === 'trash' ? 'default' : 'ghost' },
    { icon: Archive, label: 'Archive', variant: tab === 'archive' ? 'default' : 'ghost' },
    { icon: Users, label: 'Social', count: 972, variant: tab === 'social' ? 'default' : 'ghost' },
    { icon: RefreshCw, label: 'Updates', count: 342, variant: tab === 'updates' ? 'default' : 'ghost' },
    { icon: MessageSquare, label: 'Forums', count: 128, variant: tab === 'forums' ? 'default' : 'ghost' },
    { icon: ShoppingBag, label: 'Shopping', count: 8, variant: tab === 'shopping' ? 'default' : 'ghost' },
    { icon: Gift, label: 'Promotions', count: 21, variant: tab === 'promotions' ? 'default' : 'ghost' },
  ];
  const [showCompose, setShowCompose] = useState(false);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-transparent z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-emerald-700 to-teal-800 text-white transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4">
          <button
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded mb-4 transition-colors"
            onClick={() => setShowCompose(true)}
          >
            Compose
          </button>
        </div>
        
        <nav className="px-2 pb-4">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => setTab(item.label.toLowerCase())}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg mb-1 transition-colors duration-200 ${
                item.variant === 'default' 
                  ? 'bg-emerald-900 bg-opacity-40 text-white' 
                  : 'hover:bg-emerald-600 hover:bg-opacity-40 text-white text-opacity-90'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon size={18} />
                <span className="font-medium">{item.label}</span>
              </div>
              {item.count && (
                <span className="bg-emerald-900 bg-opacity-40 text-white text-xs px-2 py-1 rounded-full">
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </aside>
      {showCompose && (
        <ComposeEmail onClose={() => setShowCompose(false)} />
      )}
    </>
  );
}