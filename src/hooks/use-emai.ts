import { useState, useCallback } from 'react';

export interface Email {
  id: string;
  sender: string;
  subject: string;
  preview: string;
  content: string;
  time: string;
  date: string;
  replyTo: string;
  isStarred: boolean;
  isRead: boolean;
  avatar: string;
  tags: string[];
}

export function useEmails() {
  const [emails] = useState<Email[]>([
    {
      id: '1',
      sender: 'William Smith',
      subject: 'Meeting Tomorrow',
      preview: "Hi, let's have a meeting tomorrow to discuss the project. I've been reviewing the project details and have some ideas I'd like to share...",
      content: `Hi, let's have a meeting tomorrow to discuss the project. I've been reviewing the project details and have some ideas I'd like to share. It's crucial that we align on our next steps to ensure the project's success.

Please come prepared with any questions or insights you may have. Looking forward to our meeting.

Best regards, William`,
      time: '11 months ago',
      date: 'Oct 22, 2023, 9:00:00 AM',
      replyTo: 'william.smith@example.com',
      isStarred: true,
      isRead: false,
      avatar: 'WS',
      tags: ['work', 'important']
    },
    {
      id: '2',
      sender: 'Alice Smith',
      subject: 'Re: Project Update',
      preview: "Thank you for the project update. It looks great! I've gone through the requirements specification, and it looks like we have...",
      content: `Thank you for the project update. It looks great! I've gone through the requirements specification, and it looks like we have everything covered.

The timeline seems reasonable and the deliverables are well-defined. I'm excited to see this project come to fruition.

Let me know if you need any additional resources or support.

Best,
Alice`,
      time: '11 months ago',
      date: 'Oct 21, 2023, 2:30:00 PM',
      replyTo: 'alice.smith@example.com',
      isStarred: false,
      isRead: true,
      avatar: 'AS',
      tags: ['work', 'important']
    },
    {
      id: '3',
      sender: 'Bob Johnson',
      subject: 'Weekend Plans',
      preview: 'Any plans for the weekend? I was thinking of going hiking in the nearby mountains. We last went...',
      content: `Any plans for the weekend? I was thinking of going hiking in the nearby mountains. We last went there about a year ago and it was amazing.

The weather forecast looks perfect for outdoor activities. Would you be interested in joining?

Let me know what you think!

Cheers,
Bob`,
      time: 'over 1 year ago',
      date: 'Sep 15, 2022, 4:45:00 PM',
      replyTo: 'bob.johnson@example.com',
      isStarred: false,
      isRead: true,
      avatar: 'BJ',
      tags: ['personal']
    }
  ]);

  const [selectedEmailId, setSelectedEmailId] = useState<string | null>('1');

  const selectedEmail = emails.find(email => email.id === selectedEmailId) || null;

  const selectEmail = useCallback((id: string) => {
    setSelectedEmailId(id);
  }, []);

  return {
    emails,
    selectedEmail,
    selectedEmailId,
    selectEmail
  };
}