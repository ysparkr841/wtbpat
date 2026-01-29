import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Post } from '@/types';

// GET: 작성 이력 조회
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('이력 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '이력 조회 실패' },
      { status: 500 }
    );
  }
}

// POST: 글 저장
export async function POST(request: NextRequest) {
  try {
    const post: Post = await request.json();

    // 프로필 ID 가져오기
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const { data, error } = await supabase
      .from('posts')
      .insert({
        profile_id: profile?.id || null,
        topic: post.topic,
        content: post.content,
        positive_experience: post.positive_experience,
        negative_experience: post.negative_experience,
        improvement: post.improvement,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('글 저장 오류:', error);
    return NextResponse.json(
      { success: false, error: '글 저장 실패' },
      { status: 500 }
    );
  }
}
