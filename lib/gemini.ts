import { GoogleGenerativeAI } from '@google/generative-ai';
import { Profile, WriteInput } from '@/types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function generateBlogPost(
  input: WriteInput,
  profile: Profile
): Promise<string> {
  // API 키 확인
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY 환경변수가 설정되지 않았습니다.');
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `
당신은 블로그 글 작성 전문가입니다. 다음 정보를 바탕으로 네이버 블로그에 올릴 글을 작성해주세요.

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
5. 글 길이는 1500~2000자 정도로 작성해주세요.
6. 네이버 블로그에 바로 붙여넣기 할 수 있는 형식으로 작성해주세요.
7. 이번 달에 있었던 일을 자연스럽게 녹여서 작성해주세요.

블로그 글을 작성해주세요:
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}
