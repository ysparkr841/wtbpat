import { NextResponse } from 'next/server';
import { createServerSupabaseClient, getServerUser } from '@/lib/server-auth';

export async function GET() {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // 카카오 토큰 확인 (user_id 기반)
    const { data: tokenData } = await supabase
      .from('kakao_tokens')
      .select('expires_at')
      .eq('user_id', user.id)
      .single();

    if (!tokenData) {
      return NextResponse.json({ success: true, connected: false });
    }

    // 만료 확인
    const isExpired = tokenData.expires_at
      ? new Date(tokenData.expires_at) < new Date()
      : false;

    return NextResponse.json({
      success: true,
      connected: true,
      expired: isExpired,
    });
  } catch (error) {
    console.error('카카오 상태 확인 오류:', error);
    return NextResponse.json(
      { success: false, error: '상태 확인 실패' },
      { status: 500 }
    );
  }
}
