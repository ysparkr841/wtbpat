import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getServerUser } from '@/lib/server-auth';

// POST: 아바타 이미지 업로드
export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: '파일이 필요합니다.' },
        { status: 400 }
      );
    }

    // 파일 크기 제한 (2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: '파일 크기는 2MB 이하여야 합니다.' },
        { status: 400 }
      );
    }

    // 파일 타입 확인
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: '이미지 파일만 업로드할 수 있습니다.' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // 파일 확장자 추출
    const ext = file.name.split('.').pop() || 'jpg';
    const fileName = `${user.id}/avatar.${ext}`;

    // 기존 아바타 삭제 (있다면)
    await supabase.storage.from('avatars').remove([`${user.id}/avatar.jpg`, `${user.id}/avatar.png`, `${user.id}/avatar.gif`, `${user.id}/avatar.webp`]);

    // 새 아바타 업로드
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.error('아바타 업로드 오류:', uploadError);
      return NextResponse.json(
        { success: false, error: '이미지 업로드에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 공개 URL 생성
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    // 프로필에 아바타 URL 저장
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('프로필 업데이트 오류:', updateError);
    }

    return NextResponse.json({
      success: true,
      data: { avatar_url: publicUrl },
    });
  } catch (error) {
    console.error('아바타 업로드 오류:', error);
    return NextResponse.json(
      { success: false, error: '이미지 업로드 실패' },
      { status: 500 }
    );
  }
}

// DELETE: 아바타 이미지 삭제
export async function DELETE() {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // 아바타 파일 삭제
    await supabase.storage.from('avatars').remove([
      `${user.id}/avatar.jpg`,
      `${user.id}/avatar.png`,
      `${user.id}/avatar.gif`,
      `${user.id}/avatar.webp`,
    ]);

    // 프로필에서 아바타 URL 제거
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: null })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('프로필 업데이트 오류:', updateError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('아바타 삭제 오류:', error);
    return NextResponse.json(
      { success: false, error: '이미지 삭제 실패' },
      { status: 500 }
    );
  }
}
