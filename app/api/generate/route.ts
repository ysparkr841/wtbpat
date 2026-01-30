import { NextRequest, NextResponse } from 'next/server';
import { generateBlogPost } from '@/lib/gemini';
import { GenerateRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();

    const { topic, positiveExperience, negativeExperience, improvement, profile } = body;

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
      { topic, positiveExperience, negativeExperience, improvement },
      profile
    );

    return NextResponse.json({ success: true, data: { content } });
  } catch (error) {
    console.error('글 생성 오류:', error);
    const errorMessage = error instanceof Error ? error.message : 'AI 글 생성 실패';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
