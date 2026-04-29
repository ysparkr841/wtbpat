import { encrypt, decrypt } from './crypto';
import { createAdminClient } from './supabase-admin';
import { Profile, WriteInput } from '@/types';

const CODEX_API_URL = 'https://chatgpt.com/backend-api/codex/responses';
const REFRESH_URL = 'https://auth.openai.com/oauth/token';
const CODEX_CLIENT_ID = 'app_EMoamEEZ73f0CkXaXp7hrann';
const TOKEN_TTL_MS = 55 * 60 * 1000;

export const CODEX_MODELS = [
  { id: 'gpt-5.5',          label: 'GPT-5.5',       desc: '최신 최고 성능' },
  { id: 'gpt-5.4',          label: 'GPT-5.4',       desc: '강력한 추론' },
  { id: 'gpt-5.4-mini',     label: 'GPT-5.4 Mini',  desc: '빠르고 가벼움' },
  { id: 'gpt-5.3-codex',    label: 'GPT-5.3 Codex', desc: '코딩 특화' },
  { id: 'gpt-5.2',          label: 'GPT-5.2',       desc: '이전 세대' },
];
export const DEFAULT_CODEX_MODEL = 'gpt-5.5';

interface CodexTokens {
  id_token: string;
  access_token: string;
  refresh_token: string;
  account_id: string;
}

interface CodexAuthData {
  tokens: CodexTokens;
  last_refresh: string;
}

async function refreshTokens(refreshToken: string): Promise<Partial<CodexTokens>> {
  const res = await fetch(REFRESH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: CODEX_CLIENT_ID,
      scope: 'openid profile email offline_access',
    }),
  });

  if (!res.ok) throw new Error('ChatGPT 토큰 갱신 실패. auth.json을 다시 등록해주세요.');

  const data = await res.json();
  if (!data.access_token) throw new Error('갱신된 토큰이 유효하지 않습니다.');

  return {
    access_token: data.access_token,
    id_token: data.id_token,
    refresh_token: data.refresh_token,
  };
}

async function getAndRefreshToken(userId: string): Promise<CodexAuthData> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from('codex_tokens')
    .select('encrypted_token')
    .eq('user_id', userId)
    .single();

  if (error || !data) throw new Error('등록된 ChatGPT 토큰이 없습니다.');

  const authData: CodexAuthData = JSON.parse(decrypt(data.encrypted_token));
  const lastRefresh = new Date(authData.last_refresh).getTime();
  const isExpired = Date.now() - lastRefresh > TOKEN_TTL_MS;

  if (!isExpired) return authData;

  const refreshed = await refreshTokens(authData.tokens.refresh_token);
  const updated: CodexAuthData = {
    tokens: {
      ...authData.tokens,
      ...refreshed,
      refresh_token: refreshed.refresh_token ?? authData.tokens.refresh_token,
    },
    last_refresh: new Date().toISOString(),
  };

  await admin
    .from('codex_tokens')
    .update({
      encrypted_token: encrypt(JSON.stringify(updated)),
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  return updated;
}

export async function generateBlogPostWithCodex(
  input: WriteInput,
  profile: Profile,
  userId: string,
  modelId: string = DEFAULT_CODEX_MODEL,
  charCount: string = '1500~2000'
): Promise<string> {
  const authData = await getAndRefreshToken(userId);
  const { access_token, account_id } = authData.tokens;

  const now = new Date();
  const month = now.getMonth() + 1;
  const seasons = ['겨울','겨울','봄','봄','봄','여름','여름','여름','가을','가을','가을','겨울'];
  const season = seasons[now.getMonth()];

  const instructions = `당신은 블로그 글 작성 전문가입니다. 네이버 블로그에 올릴 글을 작성해주세요.

작성자 정보:
- 이름: ${profile.name}
- 직업: ${profile.job}
- 경력: ${profile.experience || '없음'}
- 블로그 스타일: ${profile.blog_style || '친근하고 따뜻한 말투'}
- 추가 정보: ${profile.additional_info || '없음'}

작성 가이드라인:
1. ${profile.blog_style || '친근하고 따뜻한 말투'}의 말투와 스타일을 유지하세요.
2. 전문성과 진정성이 느껴지는 글로 작성하세요.
3. 적절한 소제목을 사용해 가독성을 높이세요.
4. 글 길이는 ${charCount}자 정도로 작성하세요. 이 글자 수를 반드시 지켜주세요.
5. 네이버 블로그에 바로 붙여넣기 할 수 있는 형식으로 작성하세요.
6. 현재 날짜(${now.getFullYear()}년 ${month}월)와 계절(${season})을 반드시 인지하고 글의 맥락에 자연스럽게 반영하세요. 단, 날씨나 계절 인사로 글을 시작할 필요는 없습니다.
7. 마크다운 문법(#, ##, **, *, -, > 등)을 절대 사용하지 마세요. 소제목은 줄바꿈과 일반 텍스트로만 표현하세요.
8. AI가 쓴 느낌이 나지 않도록 자연스럽고 사람이 직접 쓴 것처럼 작성하세요. 과도한 나열식 문장, 틀에 박힌 표현, 지나치게 정형화된 구조는 피하세요.`;

  const prompt = `오늘 날짜: ${now.getFullYear()}년 ${month}월 ${now.getDate()}일 (${season})

주제/키워드: ${input.topic}
이번 달에 있었던 일: ${input.monthlyEvent || '없음'}

위 글감으로 블로그 글을 작성해주세요.`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${access_token}`,
    'OpenAI-Beta': 'responses=experimental',
  };
  if (account_id) headers['chatgpt-account-id'] = account_id;

  const res = await fetch(CODEX_API_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: modelId,
      instructions,
      input: [{ role: 'user', content: prompt }],
      store: false,
      stream: true,
    }),
  });

  if (res.status === 401) {
    throw new Error('ChatGPT 인증이 만료되었습니다. 관리자에게 auth.json 재등록을 요청해주세요.');
  }
  if (!res.ok) {
    const errBody = await res.text().catch(() => '(읽기 실패)');
    console.error(`Codex API ${res.status}:`, errBody);
    throw new Error(`ChatGPT API 오류 (${res.status}): ${errBody}`);
  }

  // SSE 스트림에서 텍스트 수집
  const reader = res.body?.getReader();
  if (!reader) throw new Error('응답 스트림을 읽을 수 없습니다.');

  const decoder = new TextDecoder();
  let fullText = '';
  let completedText = '';
  let buffer = '';
  let currentEvent = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (line.startsWith('event: ')) {
        currentEvent = line.slice(7).trim();
        continue;
      }
      if (!line.startsWith('data: ')) continue;
      const raw = line.slice(6).trim();
      if (raw === '[DONE]') continue;
      try {
        const parsed = JSON.parse(raw);
        if (currentEvent === 'response.output_text.delta' && typeof parsed.delta === 'string') {
          // 텍스트 조각 누적
          fullText += parsed.delta;
        } else if (currentEvent === 'response.completed' && parsed.response?.output_text) {
          // completed 이벤트의 전체 텍스트를 최종값으로 사용
          completedText = parsed.response.output_text;
        }
      } catch {
        // 파싱 불가 라인 무시
      }
    }
  }

  // completed 이벤트가 있으면 그걸 우선 사용, 없으면 누적 delta 사용
  const result = completedText || fullText;
  if (!result) throw new Error('ChatGPT 응답이 비어있습니다.');
  return result;
}
