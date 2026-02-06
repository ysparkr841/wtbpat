const KAKAO_REST_API_KEY = process.env.KAKAO_REST_API_KEY!;
const KAKAO_REDIRECT_URI = process.env.KAKAO_REDIRECT_URI!;

// 카카오 로그인 URL 생성
export function getKakaoAuthUrl(): string {
  const baseUrl = 'https://kauth.kakao.com/oauth/authorize';
  const params = new URLSearchParams({
    client_id: KAKAO_REST_API_KEY,
    redirect_uri: KAKAO_REDIRECT_URI,
    response_type: 'code',
    scope: 'talk_message',
  });
  return `${baseUrl}?${params.toString()}`;
}

// 인가 코드로 토큰 발급
export async function getKakaoToken(code: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
}> {
  const response = await fetch('https://kauth.kakao.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: KAKAO_REST_API_KEY,
      redirect_uri: KAKAO_REDIRECT_URI,
      code,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('카카오 토큰 발급 실패:', response.status, errorData);
    throw new Error(`카카오 토큰 발급 실패: ${errorData.error_description || errorData.error || response.status}`);
  }

  return response.json();
}

// 토큰 갱신
export async function refreshKakaoToken(refreshToken: string): Promise<{
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}> {
  const response = await fetch('https://kauth.kakao.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: KAKAO_REST_API_KEY,
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    throw new Error('카카오 토큰 갱신 실패');
  }

  return response.json();
}

// 나에게 보내기
export async function sendKakaoMessage(
  accessToken: string,
  message: string
): Promise<void> {
  const templateObject = {
    object_type: 'text',
    text: message.length > 200 ? message.substring(0, 197) + '...' : message,
    link: {
      web_url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      mobile_web_url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    },
    button_title: '글 관리하기',
  };

  const response = await fetch(
    'https://kapi.kakao.com/v2/api/talk/memo/default/send',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
      body: new URLSearchParams({
        template_object: JSON.stringify(templateObject),
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.msg || '카카오톡 메시지 전송 실패');
  }
}
