import { auth } from "@clerk/nextjs/server";
import { NextResponse, NextRequest } from "next/server";
import { getAccountDetails, getAurinkoToken } from "~/lib/aurinko";
import { getDb } from "~/server/db"; 
import { waitUntil } from "@vercel/functions";
import axios from "axios";

export const GET = async (req: NextRequest) => {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const params = req.nextUrl.searchParams;
  const status = params.get("status");
  if (status !== "success")
    return NextResponse.json(
      { message: "Failed to link account" },
      { status: 400 }
    );

  const code = params.get("code");
  const token = await getAurinkoToken(code as string);
  if (!token)
    return NextResponse.json(
      { error: "Failed to fetch token" },
      { status: 400 }
    );

  const accountDetails = await getAccountDetails(token.accessToken);

  const db = await getDb(); // 👈 fixed usage

  const existingAccount = await db.account.findFirst({
    where: {
      emailAddress: accountDetails.email,
      userId: userId,
    },
  });

  if (existingAccount) {
    // Redirect to /mail?error=account_exists
    return NextResponse.redirect(new URL("/mail?error=account_exists", req.url));
  }

  await db.account.create({
    data: {
      id: token.accountId.toString(),
      userId,
      emailAddress: accountDetails.email,
      name: accountDetails.name,
      accessToken: token.accessToken,
    },
  });

  waitUntil(
    axios
      .post(`${process.env.NEXT_LOCAL_URL}/api/initial-sync`, {
        accountId: token.accountId.toString(),
        userId,
      })
      .then((response) => {
        console.log("Initial sync triggered", response.data);
      })
      .catch((error) => {
        console.error("Failed to trigger initial sync", error);
      })
  );

  return NextResponse.redirect(new URL("/mail", req.url));
};
