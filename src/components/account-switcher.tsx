'use client'
import { api } from '../trpc/react'
import React from 'react'
import { useLocalStorage } from "usehooks-ts"
import { Select, SelectItem, SelectTrigger } from './ui/select'
import { cn } from '~/lib/utils'
import { SelectContent, SelectValue } from '@radix-ui/react-select'
import { useIsMedium } from '~/hooks/use-mobile'
import { Plus } from 'lucide-react'
import { getAurinkoAuthUrl } from '~/lib/aurinko'

const AccountSwitcher = () =>{
    const { data } = api.account.getAccounts.useQuery()
    const [accountId, setAccountId] = useLocalStorage('accountId', '')
    const isMedium = useIsMedium()
    
    if (!data) return null
    return (
     <Select
        defaultValue={accountId}
        onValueChange={async (value) => {
          if (value === "add-account") {
            const authUrl = await getAurinkoAuthUrl('Google');
            window.location.href = authUrl;
          } else {
            setAccountId(value);
          }
        }}
      >
        <SelectTrigger
          className={cn(
            // Match header/sidebar style
            "px-2 py-1 rounded-md border border-white border-opacity-30 bg-emerald-900 bg-opacity-60 text-white font-bold min-w-[44px] max-w-[220px] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 hover:bg-emerald-700 hover:bg-opacity-80 shadow-sm",
          )}
          aria-label="Select account"
        >
         <SelectValue placeholder='Select an account'>
            <span className="flex items-center justify-center">
                {isMedium
                  ? data.find(account => account.id === accountId)?.emailAddress[0] || 'Select an account'
                  : data.find(account => account.id === accountId)?.emailAddress || 'Select an account'}
            </span>
         </SelectValue>
        </SelectTrigger>
       <SelectContent className='z-50 bg-emerald-900 bg-opacity-90 border border-white border-opacity-30 rounded-lg shadow-lg mt-2 text-white'>
        {data.map((account) =>{
            return(
                <SelectItem key={account.id} value={account.id} className="text-emerald-300 hover:bg-emerald-800 hover:text-white font-semibold flex items-center gap-2 rounded-md px-3 py-2 cursor-pointer transition-colors mt-1">
                    {isMedium ? (
                        <div className="flex flex-col">
                            <span className="font-medium">{account.name}</span>
                            <span className="text-sm text-gray-200">{account.emailAddress}</span>
                        </div>
                    ) : (
                        account.emailAddress
                    )}
                </SelectItem>
            )
        })}
        <SelectItem 
          value="add-account" className="text-emerald-300 hover:bg-emerald-800 hover:text-white font-semibold flex items-center gap-2 rounded-md px-3 py-2 cursor-pointer transition-colors mt-1">
            <Plus size={18} />
            <span>Add Account</span>
        </SelectItem>
       </SelectContent>
     </Select>
    )
}

export default AccountSwitcher