"use server";
import axios from 'axios'
import { auth } from "@clerk/nextjs/server"


export const getAurinkoAuthUrl = async (serviceType: 'Google' | 'Office365') => {
    const { userId } = await auth()
    if (!userId) throw new Error("Unauthorized")

    const params = new URLSearchParams({
        clientId: process.env.AURINKO_CLIENT_ID as string,
        serviceType,
        scopes: 'Mail.Read Mail.ReadWrite Mail.Send Mail.Drafts Mail.All',
        responseType: 'code',
        returnUrl: `${process.env.NEXT_PUBLIC_URL}/api/aurinko/callback`

    })
    return `https://api.aurinko.io/v1/auth/authorize?${params.toString()}`
}
export const getAurinkoToken = async (code: string) => {
    try{
        const response = await axios.post(`https://api.aurinko.io/v1/auth/token/${code}`,
        {},
        {
               auth : {
                username: process.env.AURINKO_CLIENT_ID as string,
                password: process.env.AURINKO_CLIENT_SECRET as string,
               }
        }
     );
    
    return response.data as {
        accountId: number,
        accessToken: string,
        userId: string,
        userSession: string

    }
} catch (error) {
if(axios.isAxiosError(error)){
    console.log('Error fetching Aurinko token', error.response?.data)
}
else {
    console.error('Unexepted error fetching aurinko token',error)
}
}
}
export const getAccountDetails = async (accessToken : string) => {
    try {
        const response = await axios.get('https://api.aurinko.io/v1/account',{
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        return response.data as {
            email: string,
            name: string,
        };
    } catch (error) {
        if(axios.isAxiosError(error)){
            console.log('Error fetching account details:', error.response?.data);
        }
         else {
            console.error('Unexpected error fetching account details', error);
         }
         throw error;
    }
}

/**
 * Send an email using the Aurinko API
 * @param accessToken - The Aurinko account access token
 * @param to - Array of recipient email addresses (strings)
 * @param subject - Email subject
 * @param body - Email body (HTML or plain text)
 */
export const sendAurinkoEmail = async (
  accessToken: string,
  to: string[],
  subject: string,
  body: string
) => {
  try {
    const response = await axios.post(
      'https://api.aurinko.io/v1/email/messages',
      {
        subject,
        body,
        to: to.map(address => ({ address }))
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error sending Aurinko email:', error.response?.data);
      throw new Error(error.response?.data?.error || 'Failed to send email');
    } else {
      console.error('Unexpected error sending Aurinko email', error);
      throw error;
    }
  }
};
