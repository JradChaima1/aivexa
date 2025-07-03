import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getDb } from '~/server/db';
import axios from 'axios';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { to, subject, body, accountId, messageId } = await req.json();
    if (!to || !subject || !body || !accountId || !messageId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const db = await getDb();
    const account = await db.account.findFirst({
      where: { id: accountId, userId },
      select: { accessToken: true }
    });
    if (!account) {
      return NextResponse.json({ error: 'Account not found or not authorized' }, { status: 403 });
    }
    // Call Aurinko reply endpoint
    await axios.post(
      `https://api.aurinko.io/v1/email/messages/${messageId}/reply`,
      {
        subject,
        body,
        to: Array.isArray(to) ? to.map((address: string) => ({ address })) : [{ address: to }],
      },
      {
        headers: {
          'Authorization': `Bearer ${account.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to send reply' }, { status: 500 });
  }
} 