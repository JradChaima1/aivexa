import { NextResponse, type NextRequest } from "next/server";
import { Account } from "~/lib/account";
import { syncEmailsToDatabase } from "~/lib/sync-to-db";
import { getDb } from "~/server/db";

export const POST = async (req: NextRequest) => {
  try {
    const { accountId, userId } = await req.json();
    console.log('Incremental sync called for', { accountId, userId });

    if (!accountId || !userId) {
      console.log('Missing accountId or userId');
      return NextResponse.json(
        { error: "Missing accountId or userId" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const dbAccount = await db.account.findUnique({
      where: {
        id: accountId,
        userId,
      },
    });

    if (!dbAccount) {
      console.log('Account not found');
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const account = new Account(dbAccount.accessToken);
    const deltaToken = dbAccount.nextDeltaToken || undefined;
    console.log('Using deltaToken:', deltaToken);

    let updatedResponse;
    try {
      updatedResponse = await account.getUpdatedEmails({ deltaToken });
    } catch (err) {
      console.error('Error fetching updated emails:', err);
      return NextResponse.json({ error: "FAILED_TO_SYNC" }, { status: 500 });
    }
    if (!updatedResponse) {
      console.log('No updatedResponse from Aurinko');
      return NextResponse.json({ error: "FAILED_TO_SYNC" }, { status: 500 });
    }

    const { nextDeltaToken, records: emails } = updatedResponse;
    console.log('Aurinko returned', emails.length, 'emails');

    if (nextDeltaToken) {
      try {
        await db.account.update({
          where: {
            id: accountId
          },
          data: {
            nextDeltaToken: nextDeltaToken
          }
        });
      } catch (err) {
        console.error('Error updating nextDeltaToken in DB:', err);
        return NextResponse.json({ error: "FAILED_TO_UPDATE_TOKEN" }, { status: 500 });
      }
    }

    try {
      await syncEmailsToDatabase(emails, accountId);
    } catch (err) {
      console.error('Error syncing emails to database:', err);
      return NextResponse.json({ error: "FAILED_TO_SAVE_EMAILS" }, { status: 500 });
    }
    console.log("incremental sync completed", nextDeltaToken);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error in incremental sync:', error);
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}; 