import { createBrowserClient } from '@supabase/ssr';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 브라우저용 클라이언트 (클라이언트 컴포넌트에서 사용)
export function createSupabaseBrowserClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

// 서버용 클라이언트 (API 라우트에서 사용)
let serverSupabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (serverSupabaseInstance) {
    return serverSupabaseInstance;
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase 환경변수가 설정되지 않았습니다.');
  }

  serverSupabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  return serverSupabaseInstance;
}

// 기존 코드와의 호환성을 위해 getter로 export
export const supabase = {
  from: (table: string) => getSupabase().from(table),
};
