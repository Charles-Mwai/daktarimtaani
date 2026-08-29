import { NextRequest, NextResponse } from 'next/server';
import { ROLE_COOKIE } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const res = NextResponse.json({ success: true });

  // Accept an optional ?role= param so logout only clears the current portal's cookie
  const { searchParams } = new URL(req.url);
  const role = searchParams.get('role')?.toUpperCase() as keyof typeof ROLE_COOKIE | null;

  if (role && ROLE_COOKIE[role]) {
    res.cookies.delete(ROLE_COOKIE[role]);
  } else {
    // Clear all role cookies (fallback)
    Object.values(ROLE_COOKIE).forEach((name) => res.cookies.delete(name));
  }

  return res;
}
