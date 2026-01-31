import { createSupabaseBrowserClient } from './supabase';

export type AuthError = {
  message: string;
};

export type AuthResult = {
  success: boolean;
  error?: AuthError;
};

// 회원가입
export async function signUp(email: string, password: string): Promise<AuthResult> {
  const supabase = createSupabaseBrowserClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { success: false, error: { message: error.message } };
  }

  return { success: true };
}

// 로그인
export async function signIn(email: string, password: string): Promise<AuthResult> {
  const supabase = createSupabaseBrowserClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: { message: error.message } };
  }

  return { success: true };
}

// 로그아웃
export async function signOut(): Promise<AuthResult> {
  const supabase = createSupabaseBrowserClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    return { success: false, error: { message: error.message } };
  }

  return { success: true };
}

// 현재 사용자 가져오기
export async function getUser() {
  const supabase = createSupabaseBrowserClient();

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

// 세션 가져오기
export async function getSession() {
  const supabase = createSupabaseBrowserClient();

  const { data: { session }, error } = await supabase.auth.getSession();

  if (error || !session) {
    return null;
  }

  return session;
}
