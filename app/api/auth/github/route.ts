import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  
  if (!clientId) {
    console.error('GITHUB_CLIENT_ID is missing in environment variables');
    return NextResponse.json({ error: 'GitHub Client ID not configured' }, { status: 500 });
  }

  const { origin } = new URL(req.url);
  const redirectUri = `${origin}/api/auth/github/callback`;
  
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email`;
  
  return NextResponse.redirect(githubAuthUrl);
}
