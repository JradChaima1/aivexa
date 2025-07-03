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
    enabled: !!accountId && !!tab , refetchInterval: 30000
 })

 // Trigger incremental sync on mount or when accountId/user changes
 React.useEffect(() => {
    if (!accountId || !user?.id) return;
    (async () => {
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
        refetch();
      } catch (err) {
        console.error('Error during incremental sync:', err);
      }
    })();
  }, [accountId, user?.id]);

 return {threads, isFetching, refetch,accountId,
    account: accounts?.find((e: { id: string }) => e.id === accountId), threadId, setThreadId
 }
}
export default useThreads