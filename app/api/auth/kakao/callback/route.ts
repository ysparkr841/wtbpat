import { NextRequest, NextResponse } from 'next/server';
import { getKakaoToken } from '@/lib/kakao';
import { createServerSupabaseClient, getServerUser } from '@/lib/server-auth';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(
      new URL('/profile?kakao=error&message=' + encodeURIComponent(error), request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/profile?kakao=error&message=인가코드없음', request.url)
    );
  }

  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.redirect(
        new URL('/login?message=로그인필요', request.url)
      );
    }

    const tokenData = await getKakaoToken(code);
    const supabase = await createServerSupabaseClient();

    // 기존 토큰 확인 (user_id 기반)
    const { data: existingToken } = await supabase
      .from('kakao_tokens')
      .select('id')
      .eq('user_id', user.id)
      .single();

    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();

    if (existingToken) {
      // 업데이트
      await supabase
        .from('kakao_tokens')
        .update({
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: expiresAt,
        })
        .eq('id', existingToken.id)
        .eq('user_id', user.id);
    } else {
      // 새로 생성
      await supabase.from('kakao_tokens').insert({
        user_id: user.id,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: expiresAt,
      });
    }

    return NextResponse.redirect(new URL('/profile?kakao=success', request.url));
  } catch (error) {
    console.error('카카오 인증 오류:', error);
    return NextResponse.redirect(
      new URL('/profile?kakao=error&message=토큰발급실패', request.url)
    );
  }
}
