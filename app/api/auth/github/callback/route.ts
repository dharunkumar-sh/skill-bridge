/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { db } from "@/src/db";
import { users } from "@/src/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "GitHub credentials not configured on backend" },
      { status: 500 },
    );
  }

  try {
    const tokenRes = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
        }),
      },
    );

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      throw new Error("Failed to obtain access token");
    }

    const userRes = await fetch("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const githubUser = await userRes.json();

    let email = githubUser.email;
    if (!email) {
      const emailRes = await fetch("https://api.github.com/user/emails", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const emails = await emailRes.json();
      const primaryEmail = emails.find((e: any) => e.primary);
      email = primaryEmail?.email;
    }

    if (!email) {
      throw new Error("No email found for GitHub user");
    }

    const name = githubUser.name || githubUser.login;

    let userRecord;
    const existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (existingUsers.length > 0) {
      userRecord = existingUsers[0];
      const githubPicture = githubUser.avatar_url;
      const githubUsername = githubUser.login;
      if (
        (githubPicture && userRecord.picture !== githubPicture) ||
        (githubUsername && userRecord.githubUsername !== githubUsername)
      ) {
        await db
          .update(users)
          .set({
            picture: githubPicture,
            githubUsername: githubUsername,
          })
          .where(eq(users.id, userRecord.id));
        userRecord.picture = githubPicture;
        userRecord.githubUsername = githubUsername;
      }
    } else {
      const newUser = await db
        .insert(users)
        .values({
          email,
          name,
          picture: githubUser.avatar_url,
          githubUsername: githubUser.login,
          authProvider: "github",
        })
        .returning();
      userRecord = newUser[0];
    }

    const { passwordHash: _, ...userWithoutPassword } = userRecord;

    const html = `
      <html>
        <body>
          <script>
            window.localStorage.setItem('user', JSON.stringify(${JSON.stringify(userWithoutPassword)}));
            window.location.href = '/dashboard';
          </script>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html" },
    });
  } catch (error) {
    console.error("GitHub Auth Error:", error);
    return NextResponse.redirect(
      new URL("/?error=github_auth_failed", req.url),
    );
  }
}
