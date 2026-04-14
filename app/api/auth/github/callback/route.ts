/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { db } from "@/src/db";
import { users } from "@/src/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    console.error("No code provided in GitHub callback");
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error("GitHub credentials missing in env");
    return NextResponse.json(
      { error: "GitHub credentials not configured on backend" },
      { status: 500 },
    );
  }

  try {
    const redirectUri = `${origin}/api/auth/github/callback`;

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
          redirect_uri: redirectUri,
        }),
      },
    );

    const tokenData = await tokenRes.json();
    
    if (tokenData.error) {
      console.error("GitHub token error:", tokenData.error, tokenData.error_description);
      throw new Error(`GitHub token error: ${tokenData.error}`);
    }

    const accessToken = tokenData.access_token;

    if (!accessToken) {
      throw new Error("Failed to obtain access token");
    }

    const userRes = await fetch("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    
    if (!userRes.ok) {
        throw new Error(`Failed to fetch GitHub user: ${userRes.statusText}`);
    }
    
    const githubUser = await userRes.json();

    let email = githubUser.email;
    if (!email) {
      const emailRes = await fetch("https://api.github.com/user/emails", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      
      if (emailRes.ok) {
        const emails = await emailRes.json();
        if (Array.isArray(emails)) {
            const primaryEmail = emails.find((e: any) => e.primary);
            email = primaryEmail?.email;
        }
      }
    }

    if (!email) {
      throw new Error("No public email found for GitHub user. Please make your email public in GitHub settings.");
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
      
      // Update user info if it changed
      if (
        (githubPicture && userRecord.picture !== githubPicture) ||
        (githubUsername && userRecord.githubUsername !== githubUsername)
      ) {
        const updated = await db
          .update(users)
          .set({
            picture: githubPicture,
            githubUsername: githubUsername,
          })
          .where(eq(users.id, userRecord.id))
          .returning();
        userRecord = updated[0];
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

    // Determine redirect based on onboarding status
    const redirectPath = userWithoutPassword.hasCompletedOnboarding
      ? "/dashboard"
      : "/onboarding";

    const redirectUrl = `${origin}${redirectPath}`;

    const html = `
      <html>
        <body>
          <script>
            try {
              localStorage.setItem('user', JSON.stringify(${JSON.stringify(userWithoutPassword)}));
              window.location.href = '${redirectUrl}';
            } catch (e) {
              console.error('Error saving user to localStorage:', e);
              window.location.href = '/?error=local_storage_failed';
            }
          </script>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html" },
    });
  } catch (error: any) {
    console.error("GitHub Auth Error:", error.message || error);
    return NextResponse.redirect(
      new URL(`/?error=github_auth_failed&message=${encodeURIComponent(error.message || 'unknown')}`, req.url),
    );
  }
}
