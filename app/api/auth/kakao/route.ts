import { NextResponse } from 'next/server';
import { getKakaoAuthUrl } from '@/lib/kakao';

export async function GET() {
  const authUrl = getKakaoAuthUrl();
  return NextResponse.redirect(authUrl);
}
