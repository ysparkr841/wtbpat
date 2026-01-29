import { NextRequest, NextResponse } from 'next/server';
import { sendKakaoMessage, refreshKakaoToken } from '@/lib/kakao';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { success: false, error: '메시지가 필요합니다.' },
        { status: 400 }
      );
    }

    // 프로필 ID 가져오기
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!profile) {
      return NextResponse.json(
        { success: false, error: '프로필이 없습니다.' },
        { status: 400 }
      );
    }

    // 카카오 토큰 가져오기
    const { data: tokenData } = await supabase
      .from('kakao_tokens')
      .select('*')
      .eq('profile_id', profile.id)
      .single();

    if (!tokenData) {
      return NextResponse.json(
        { success: false, error: '카카오톡 연동이 필요합니다.' },
        { status: 401 }
      );
    }

    let accessToken = tokenData.access_token;

    // 토큰 만료 확인 및 갱신
    if (tokenData.expires_at && new Date(tokenData.expires_at) < new Date()) {
      if (!tokenData.refresh_token) {
        return NextResponse.json(
          { success: false, error: '카카오톡 재연동이 필요합니다.' },
          { status: 401 }
        );
      }

      try {
        const newTokenData = await refreshKakaoToken(tokenData.refresh_token);
        accessToken = newTokenData.access_token;

        const expiresAt = new Date(Date.now() + newTokenData.expires_in * 1000).toISOString();

        await supabase
          .from('kakao_tokens')
          .update({
            access_token: newTokenData.access_token,
            refresh_token: newTokenData.refresh_token || tokenData.refresh_token,
            expires_at: expiresAt,
          })
          .eq('id', tokenData.id);
      } catch (error) {
        console.error('토큰 갱신 실패:', error);
        return NextResponse.json(
          { success: false, error: '카카오톡 재연동이 필요합니다.' },
          { status: 401 }
        );
      }
    }

    // 메시지 전송
    await sendKakaoMessage(accessToken, message);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('카카오톡 전송 오류:', error);
    return NextResponse.json(
      { success: false, error: '카카오톡 전송 실패' },
      { status: 500 }
    );
  }
}
