import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { getServerUser } from '@/lib/server-auth';

// 현재 로그인한 유저가 ChatGPT 토큰을 보유하고 있는지 확인
export async function GET() {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ success: false, exists: false }, { status: 401 });
    }

    const admin = createAdminClient();
    const { data } = await admin
      .from('codex_tokens')
      .select('id')
      .eq('user_id', user.id)
      .single();

    return NextResponse.json({ success: true, exists: !!data });
  } catch {
    return NextResponse.json({ success: true, exists: false });
  }
}
