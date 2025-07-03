import axios from "axios";
import { headers } from "next/headers";
import { resolve } from "path";
import type { EmailMessage, SyncResponse, SyncUpdatedResponse } from "~/type";

export class Account {
    private token: string;

    constructor(token: string) {
        this.token = token

    }

    private async startSync() {
        const response = await axios.post<SyncResponse>('https://api.aurinko.io/v1/email/sync', {}, {
            headers: {
                Authorization: `Bearer ${this.token}`
            },
            params: {
                daysWithin: 7,
                bodyType: 'html'
            }
        })
        return response.data
    }
    async getUpdatedEmails({ deltaToken,  pageToken }: {deltaToken?: string, pageToken?: string}) {
        let params: Record<string, string> = {}
        if (deltaToken) params.deltaToken = deltaToken
        if (pageToken) params.pageToken = pageToken
        const response = await axios.get<SyncUpdatedResponse>('https://api.aurinko.io/v1/email/sync/updated', {
            headers: {
                Authorization: `Bearer ${this.token}`,
            }, 
            params
        });
         return response.data;
    }
    async performInitialSync() {
        try {
            // start the sync process
            let syncResponse = await this.startSync()
            let retryCount = 0;
            const maxRetries = 30; // e.g., 30 seconds max
            while (!syncResponse.ready) {
                if (retryCount++ >= maxRetries) {
                    throw new Error('Sync did not become ready after maximum retries');
                }
                await new Promise(resolve => setTimeout(resolve, 1000));
                syncResponse = await this.startSync()
            }
            let storedDeltaToken: string = syncResponse.syncUpdatedToken
            let updatedResponse = await this.getUpdatedEmails({deltaToken: storedDeltaToken})
            if (updatedResponse.nextDeltaToken) {
                //sync has completed
                storedDeltaToken = updatedResponse.nextDeltaToken
            }
            let allEmails: EmailMessage[] = updatedResponse.records
            //fetch all pages if  there are more

            while(updatedResponse.nextPageToken)  {
                updatedResponse = await this.getUpdatedEmails({ pageToken: updatedResponse.nextPageToken});
                allEmails = allEmails.concat(updatedResponse.records)
                if (updatedResponse.nextDeltaToken) {
                    storedDeltaToken = updatedResponse.nextDeltaToken
                }
            }
            // Log all email subjects and sentAt for debugging
            console.log('Aurinko returned emails:', allEmails.map(e => ({ subject: e.subject, sentAt: e.sentAt })));
            console.log('initial sync completed, we have synced', allEmails.length, 'emails')
               // Store the latestDeltaToken for future incremental syncs
               return {
                emails: allEmails,
                deltaToken: storedDeltaToken,
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Error during sync:', JSON.stringify(error.response?.data, null, 2));
                throw new Error('Axios error during sync: ' + (error.response?.data?.message || error.message));
            } else {
                console.error('Error during sync:', error);
                throw error;
            }
        }
    }
}