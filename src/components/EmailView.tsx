import React from 'react';
import { ArrowLeft, ArrowRight, Archive, Trash2, Star, Reply, Forward, MoreHorizontal } from 'lucide-react';

interface EmailViewProps {
  email: {
    id: string;
    sender: string;
    subject: string;
    content: string;
    time: string;
    date: string;
    replyTo: string;
    avatar: string;
  } | null;
  onBack?: () => void;
}

export function EmailView({ email, onBack }: EmailViewProps) {
  if (!email) {
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
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3 ">
          {/* Back to inbox button - visible on all devices */}
      
          {/* Navigation buttons for desktop */}
          <div className="hidden lg:flex items-center gap-1 ml-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Previous email">
              <ArrowLeft size={16} className="text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Next email">
              <ArrowRight size={16} className="text-gray-600" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
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
          
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Archive">
            <Archive size={16} className="text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Delete">
            <Trash2 size={16} className="text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Star">
            <Star size={16} className="text-gray-600" />
          </button>
        </div>
      </div>
      
      {/* Email Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 lg:p-6">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 lg:p-6 rounded-lg mb-4 lg:mb-6">
            <h1 className="text-xl lg:text-2xl font-bold mb-2">{email.subject}</h1>
            <p className="text-emerald-100 text-sm lg:text-base">{email.date}</p>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
            <div className="flex items-center gap-3 lg:gap-4 mb-4 lg:mb-6">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white font-medium text-sm lg:text-base">
                {email.avatar}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm lg:text-base">{email.sender}</h3>
                <p className="text-xs lg:text-sm text-gray-600">Reply-To: {email.replyTo}</p>
              </div>
            </div>
            
            <div className="prose prose-gray max-w-none">
              <div className="whitespace-pre-wrap text-gray-800 leading-relaxed text-sm lg:text-base">
                {email.content}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-6 lg:mt-8 pt-4 lg:pt-6 border-t border-gray-200">
              <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors">
                <Reply size={16} />
                Reply
              </button>
              <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors">
                <Forward size={16} />
                Forward
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors self-center sm:self-auto">
                <MoreHorizontal size={16} className="text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}