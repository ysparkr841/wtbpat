import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/types';

// GET: 프로필 조회
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned
      throw error;
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('프로필 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '프로필 조회 실패' },
      { status: 500 }
    );
  }
}

// POST: 프로필 저장/업데이트
export async function POST(request: NextRequest) {
  try {
    const profile: Profile = await request.json();

    // 기존 프로필 확인
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(1)
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
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // 새로 생성
      const { data, error } = await supabase
        .from('profiles')
        .insert({
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
