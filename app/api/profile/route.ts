import { NextRequest, NextResponse } from 'next/server';
import { Profile } from '@/types';
import { createServerSupabaseClient, getServerUser } from '@/lib/server-auth';

// GET: 프로필 조회
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
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned
      throw error;
    }

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    console.error('프로필 조회 오류:', error);
    const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
    return NextResponse.json(
      { success: false, error: '프로필 조회 실패', details: errorMessage },
      { status: 500 }
    );
  }
}

// POST: 프로필 저장/업데이트
export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const profile: Profile = await request.json();
    const supabase = await createServerSupabaseClient();

    // 기존 프로필 확인
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    let result;

    if (existingProfile) {
      // 업데이트
      const { data, error } = await supabase
        .from('profiles')
        .update({
          name: profile.name,
          job: profile.job,
          experience: profile.experience,
          blog_style: profile.blog_style,
          additional_info: profile.additional_info,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingProfile.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // 새로 생성
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          name: profile.name,
          job: profile.job,
          experience: profile.experience,
          blog_style: profile.blog_style,
          additional_info: profile.additional_info,
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('프로필 저장 오류:', error);
    return NextResponse.json(
      { success: false, error: '프로필 저장 실패' },
      { status: 500 }
    );
  }
}
