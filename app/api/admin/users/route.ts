import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { createServerSupabaseClient, getServerUser } from '@/lib/server-auth';
import { CreateUserRequest } from '@/types';

// 관리자 권한 확인
async function isAdmin(): Promise<boolean> {
  const user = await getServerUser();
  if (!user) return false;

  const supabase = await createServerSupabaseClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('user_id', user.id)
    .single();

  return profile?.is_admin === true;
}

// GET: 사용자 목록 조회 (관리자 전용)
export async function GET() {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json(
        { success: false, error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    const adminClient = createAdminClient();

    // 모든 사용자 조회
    const { data: { users }, error: usersError } = await adminClient.auth.admin.listUsers();

    if (usersError) throw usersError;

    // 프로필 정보 조회
    const { data: profiles, error: profilesError } = await adminClient
      .from('profiles')
      .select('*');

    if (profilesError) throw profilesError;

    // 사용자와 프로필 매핑
    const usersWithProfiles = users.map(user => {
      const profile = profiles?.find(p => p.user_id === user.id);
      return {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        name: profile?.name || '',
        is_admin: profile?.is_admin || false,
        avatar_url: profile?.avatar_url || null,
      };
    });

    return NextResponse.json({ success: true, data: usersWithProfiles });
  } catch (error: unknown) {
    console.error('사용자 목록 조회 오류:', error);
    const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
    return NextResponse.json(
      { success: false, error: '사용자 목록 조회 실패', details: errorMessage },
      { status: 500 }
    );
  }
}

// POST: 새 사용자 생성 (관리자 전용, 이메일 인증 없이)
export async function POST(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json(
        { success: false, error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    const { email, password, name }: CreateUserRequest = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: '이메일, 비밀번호, 이름이 필요합니다.' },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    // 사용자 생성 (이메일 확인 자동 완료)
    const { data: userData, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // 이메일 확인 자동 완료
    });

    if (createError) {
      if (createError.message.includes('already')) {
        return NextResponse.json(
          { success: false, error: '이미 존재하는 이메일입니다.' },
          { status: 400 }
        );
      }
      throw createError;
    }

    // 프로필 생성
    const { error: profileError } = await adminClient
      .from('profiles')
      .insert({
        user_id: userData.user.id,
        name,
        job: '간호 상담사',
        experience: '',
        blog_style: '',
        additional_info: '',
        is_admin: false,
      });

    if (profileError) {
      // 프로필 생성 실패 시 사용자도 삭제
      await adminClient.auth.admin.deleteUser(userData.user.id);
      throw profileError;
    }

    return NextResponse.json({
      success: true,
      data: {
        id: userData.user.id,
        email: userData.user.email,
        name,
      },
    });
  } catch (error) {
    console.error('사용자 생성 오류:', error);
    return NextResponse.json(
      { success: false, error: '사용자 생성 실패' },
      { status: 500 }
    );
  }
}

// DELETE: 사용자 삭제 (관리자 전용)
export async function DELETE(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json(
        { success: false, error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '사용자 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 자기 자신은 삭제 불가
    const currentUser = await getServerUser();
    if (currentUser?.id === userId) {
      return NextResponse.json(
        { success: false, error: '자신의 계정은 삭제할 수 없습니다.' },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    // 사용자 삭제 (관련 데이터도 CASCADE로 삭제됨)
    const { error } = await adminClient.auth.admin.deleteUser(userId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('사용자 삭제 오류:', error);
    return NextResponse.json(
      { success: false, error: '사용자 삭제 실패' },
      { status: 500 }
    );
  }
}
