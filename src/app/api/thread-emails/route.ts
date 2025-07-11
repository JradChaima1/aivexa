import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '~/server/db';

export async function GET(req: NextRequest) {
  const threadId = req.nextUrl.searchParams.get('threadId');
  if (!threadId) {
    return NextResponse.json({ error: 'Missing threadId' }, { status: 400 });
  }

  const db = await getDb();
  const thread = await db.thread.findUnique({
    where: { id: threadId },
    include: {
      emails: {
        orderBy: { sentAt: 'asc' }
      }
    }
  });

  if (!thread) {
    return NextResponse.json({ emails: [] });
  }

  return NextResponse.json({ emails: thread.emails });
} 