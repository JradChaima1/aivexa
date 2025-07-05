import React from 'react'
import { useLocalStorage } from 'usehooks-ts'
import { api } from '~/trpc/react'
import { atom, useAtom } from "jotai"
import { useUser } from "@clerk/nextjs"

export const threadIdAtom = atom<string | null> (null)

const useThreads = () => {
 const { user } = useUser()
 const {data: accounts } = api.account.getAccounts.useQuery()
 const [accountId] = useLocalStorage('accountId', '')
 const [tab] = useLocalStorage('tab', 'inbox')
 const [done] = useLocalStorage('done', false)
 const [threadId, setThreadId ] = useAtom(threadIdAtom)
 const {data: threads, isFetching, refetch} = api.account.getThreads.useQuery({
    accountId,
    tab,
    done
 },{
    enabled: !!accountId && !!tab
 })

 // Run on mount and when user/accountId changes
 React.useEffect(() => {
    if (!accountId || !user?.id) return;
    
    const syncEmails = async () => {
      try {
        const res = await fetch('/api/incremental-sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accountId, userId: user.id })
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to sync threads');
        }
        await refetch();
      } catch (err) {
        console.error('Error during incremental sync:', err);
      }
    };

    syncEmails();
  }, [accountId, user?.id, refetch]); // Add dependencies to ensure sync runs when they change

  // Enhanced refetch function that includes incremental sync
  const forceRefresh = async () => {
    if (!accountId || !user?.id) return;
    
    try {
      // First trigger incremental sync
      const res = await fetch('/api/incremental-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId, userId: user.id })
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to sync threads');
      }
      
      // Then refetch the threads
      await refetch();
    } catch (err) {
      console.error('Error during force refresh:', err);
      // Still try to refetch even if sync fails
      await refetch();
    }
  };

 return {
    threads, 
    isFetching, 
    refetch,
    forceRefresh,
    accountId,
    account: accounts?.find((e: { id: string }) => e.id === accountId), 
    threadId, 
    setThreadId
 }
}

export default useThreads