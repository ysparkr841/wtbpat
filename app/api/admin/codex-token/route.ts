import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { createServerSupabaseClient, getServerUser } from '@/lib/server-auth';
import { encrypt } from '@/lib/crypto';

async function isAdmin(): Promise<boolean> {
  const user = await getServerUser();
  if (!user) return false;
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from('profiles').select('is_admin').eq('user_id', user.id).single();
  return data?.is_admin === true;
}

// GET: 특정 유저의 토큰 등록 여부 확인
export async function GET(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ success: false, error: '관리자 권한이 필요합니다.' }, { status: 403 });
    }

    const userId = request.nextUrl.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId가 필요합니다.' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data } = await admin
      .from('codex_tokens')
      .select('id, updated_at')
      .eq('user_id', userId)
      .single();

    return NextResponse.json({ success: true, exists: !!data, updated_at: data?.updated_at ?? null });
  } catch {
    return NextResponse.json({ success: false, error: '조회 실패' }, { status: 500 });
  }
}

// POST: 토큰 저장 (auth.json 내용을 그대로 붙여넣기)
export async function POST(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ success: false, error: '관리자 권한이 필요합니다.' }, { status: 403 });
    }

    const { userId, authJson } = await request.json();
    if (!userId || !authJson) {
      return NextResponse.json({ success: false, error: 'userId와 authJson이 필요합니다.' }, { status: 400 });
    }

    // 형식 검증
    let parsed: { tokens?: { access_token?: string; refresh_token?: string; account_id?: string } };
    try {
      parsed = typeof authJson === 'string' ? JSON.parse(authJson) : authJson;
    } catch {
      return NextResponse.json({ success: false, error: 'auth.json 형식이 올바르지 않습니다.' }, { status: 400 });
    }

    if (!parsed.tokens?.access_token || !parsed.tokens?.refresh_token || !parsed.tokens?.account_id) {
      return NextResponse.json(
        { success: false, error: 'auth.json에 tokens.access_token, tokens.refresh_token, tokens.account_id가 필요합니다.' },
        { status: 400 }
      );
    }

    const encrypted = encrypt(JSON.stringify(parsed));
    const admin = createAdminClient();

    await admin.from('codex_tokens').upsert(
      { user_id: userId, encrypted_token: encrypted, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    );

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('codex token 저장 오류:', e);
    return NextResponse.json({ success: false, error: '저장 실패' }, { status: 500 });
  }
}

// DELETE: 토큰 삭제
export async function DELETE(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ success: false, error: '관리자 권한이 필요합니다.' }, { status: 403 });
    }

    const userId = request.nextUrl.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId가 필요합니다.' }, { status: 400 });
    }

    const admin = createAdminClient();
    await admin.from('codex_tokens').delete().eq('user_id', userId);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: '삭제 실패' }, { status: 500 });
  }
}
