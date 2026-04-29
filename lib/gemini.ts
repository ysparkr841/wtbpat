import { GoogleGenerativeAI } from '@google/generative-ai';
import { Profile, WriteInput } from '@/types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const GEMINI_MODELS = [
  { id: 'gemini-2.5-flash', label: 'Flash 2.5', desc: '균형 잡힌 성능' },
  { id: 'gemini-2.5-flash-lite', label: 'Flash 2.5 Lite', desc: '빠르고 안정적' },
  { id: 'gemini-2.5-pro', label: 'Pro 2.5', desc: '최고 품질' },
];

export const DEFAULT_MODEL = 'gemini-2.5-flash';

export const CHAR_COUNT_OPTIONS = [
  { value: '500~700',   label: '짧게',     desc: '500~700자' },
  { value: '800~1000',  label: '보통',     desc: '800~1000자' },
  { value: '1500~2000', label: '길게',     desc: '1500~2000자' },
  { value: '2500~3000', label: '매우 길게', desc: '2500~3000자' },
];
export const DEFAULT_CHAR_COUNT = '1500~2000';

export async function generateBlogPost(
  input: WriteInput,
  profile: Profile,
  modelId: string = DEFAULT_MODEL,
  charCount: string = DEFAULT_CHAR_COUNT
): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY 환경변수가 설정되지 않았습니다.');
  }

  const model = genAI.getGenerativeModel({ model: modelId });

  // 현재 날짜 정보 생성
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  // 계절 판단
  let season = '';
  if (month >= 3 && month <= 5) {
    season = '봄';
  } else if (month >= 6 && month <= 8) {
    season = '여름';
  } else if (month >= 9 && month <= 11) {
    season = '가을';
  } else {
    season = '겨울';
  }

  const prompt = `
당신은 블로그 글 작성 전문가입니다. 다음 정보를 바탕으로 네이버 블로그에 올릴 글을 작성해주세요.

## 오늘 날짜
- 현재 날짜: ${year}년 ${month}월 ${day}일
- 현재 계절: ${season}
- 참고: 현재 한국은 ${season}이며, ${month === 12 || month <= 2 ? '영하의 추운 날씨' : month >= 6 && month <= 8 ? '무더운 날씨' : '선선한 날씨'}입니다.

## 작성자 정보
- 이름: ${profile.name}
- 직업: ${profile.job}
- 경력: ${profile.experience || '없음'}
- 블로그 스타일: ${profile.blog_style || '친근하고 따뜻한 말투'}
- 추가 정보: ${profile.additional_info || '없음'}

## 이번 달 글감
- 주제/키워드: ${input.topic}
- 이번 달에 있었던 일: ${input.monthlyEvent || '없음'}

## 작성 가이드라인
1. ${profile.blog_style || '친근하고 따뜻한 말투'}의 말투와 스타일을 유지해주세요.
2. 전문성과 진정성이 느껴지는 글로 작성해주세요.
3. 독자가 공감할 수 있도록 경험을 생생하게 전달해주세요.
4. 적절한 소제목을 사용해 가독성을 높여주세요.
5. 글 길이는 ${charCount}자 정도로 작성해주세요. 이 글자 수를 반드시 지켜주세요.
6. 네이버 블로그에 바로 붙여넣기 할 수 있는 형식으로 작성해주세요.
7. 이번 달에 있었던 일을 자연스럽게 녹여서 작성해주세요.
8. 위에 명시된 날짜와 계절을 반드시 인지하고, 글의 맥락이나 표현에 자연스럽게 반영해주세요. 단, 날씨나 계절 인사로 글을 시작할 필요는 없습니다.
9. 마크다운 문법(#, ##, **, *, -, > 등)을 절대 사용하지 마세요. 소제목은 줄바꿈과 일반 텍스트로만 표현하세요.
10. AI가 쓴 느낌이 나지 않도록 자연스럽고 사람이 직접 쓴 것처럼 작성해주세요. 과도한 나열식 문장, 틀에 박힌 표현, 지나치게 정형화된 구조는 피해주세요.

블로그 글을 작성해주세요:
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}
