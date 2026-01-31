import { NextRequest, NextResponse } from 'next/server';
import { generateBlogPost } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { topic, monthlyEvent, profile } = body;

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

    const content = await generateBlogPost(
      { topic, monthlyEvent: monthlyEvent || '' },
      profile
    );

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
