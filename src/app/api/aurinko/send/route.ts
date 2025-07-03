import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getDb } from '~/server/db';
import { sendAurinkoEmail } from '~/lib/aurinko';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { to, subject, body, accountId } = await req.json();
    if (!to || !subject || !body || !accountId) {
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
    await sendAurinkoEmail(account.accessToken, Array.isArray(to) ? to : [to], subject, body);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to send email' }, { status: 500 });
  }
} 