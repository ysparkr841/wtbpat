import { NextRequest, NextResponse } from 'next/server';
import { generateBlogPost } from '@/lib/gemini';
import { generateBlogPostWithCodex } from '@/lib/openai-codex';
import { getServerUser } from '@/lib/server-auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { topic, monthlyEvent, profile, model } = body;

    if (!topic) {
      return NextResponse.json(
        { success: false, error: '주제는 필수입니다.' },
        { status: 400 }
      );
    }

    if (!profile || !profile.name) {
      return NextResponse.json(
        { success: false, error: '프로필 정보가 필요합니다.' },
        { status: 400 }
      );
    }

    let content: string;

    const CODEX_MODEL_IDS = ['gpt-5.5', 'gpt-5.4', 'gpt-5.4-mini', 'gpt-5.3-codex', 'gpt-5.3-codex-spark', 'gpt-5.2'];
    if (CODEX_MODEL_IDS.includes(model)) {
      const user = await getServerUser();
      if (!user) {
        return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 });
      }
      content = await generateBlogPostWithCodex(
        { topic, monthlyEvent: monthlyEvent || '' },
        profile,
        user.id,
        model
      );
    } else {
      content = await generateBlogPost(
        { topic, monthlyEvent: monthlyEvent || '' },
        profile,
        model
      );
    }

    return NextResponse.json({ success: true, data: { content } });
  } catch (error) {
    console.error('글 생성 오류:', error);
    // 더 자세한 에러 정보 출력
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    const errorMessage = error instanceof Error ? error.message : 'AI 글 생성 실패';
    return NextResponse.json(
      { success: false, error: `AI 글 생성 실패: ${errorMessage}` },
      { status: 500 }
    );
  }
}
