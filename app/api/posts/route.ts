import { NextRequest, NextResponse } from 'next/server';
import { Post } from '@/types';
import { createServerSupabaseClient, getServerUser } from '@/lib/server-auth';

// GET: 작성 이력 조회
export async function GET() {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', user.id)
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
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const post: Post = await request.json();
    const supabase = await createServerSupabaseClient();

    // 프로필 ID 가져오기
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        profile_id: profile?.id || null,
        topic: post.topic,
        content: post.content,
        monthly_event: post.monthly_event || null,
        positive_experience: post.positive_experience || null,
        negative_experience: post.negative_experience || null,
        improvement: post.improvement || null,
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
