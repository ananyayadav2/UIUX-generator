import { db } from "@/config/db";
import { usersTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const email = user.primaryEmailAddress?.emailAddress;
    if (!email) return NextResponse.json({ error: "No email found" }, { status: 400 });

    // Check if user exists
    const users = await db.select().from(usersTable).where(eq(usersTable.email, email));

    if (users.length > 0) {
      return NextResponse.json(users[0]);
    }

    // Insert new user
    const result = await db.insert(usersTable).values({
      name: user.fullName || 'Anonymous',
      email: email,
    }).returning();

    return NextResponse.json(result[0]);
  } catch (error: any) {
    console.error("User API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}