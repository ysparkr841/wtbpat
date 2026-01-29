import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // 프로필 ID 가져오기
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!profile) {
      return NextResponse.json({ success: true, connected: false });
    }

    // 카카오 토큰 확인
    const { data: tokenData } = await supabase
      .from('kakao_tokens')
      .select('expires_at')
      .eq('profile_id', profile.id)
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
