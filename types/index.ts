// 프로필 타입
export interface Profile {
  id?: string;
  user_id?: string;
  name: string;
  job: string;
  experience: string;
  blog_style: string;
  additional_info: string;
  avatar_url?: string;
  is_admin?: boolean;
  created_at?: string;
  updated_at?: string;
}

// 사용자 생성 요청 타입 (관리자용)
export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
}

// 글 작성 입력 타입
export interface WriteInput {
  topic: string;
  monthlyEvent?: string;  // 이번 달에 있던 일 (간소화)
  positiveExperience?: string;
  negativeExperience?: string;
  improvement?: string;
}

// 저장된 글 타입
export interface Post {
  id?: string;
  profile_id?: string;
  topic: string;
  content: string;
  monthly_event?: string;  // 이번 달에 있던 일
  // 하위 호환성을 위해 유지
  positive_experience?: string;
  negative_experience?: string;
  improvement?: string;
  created_at?: string;
}

// 카카오 토큰 타입
export interface KakaoToken {
  id?: string;
  profile_id?: string;
  access_token: string;
  refresh_token?: string;
  expires_at?: string;
  created_at?: string;
}

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// 글 생성 요청 타입
export interface GenerateRequest {
  topic: string;
  monthlyEvent: string;
  profile: Profile;
}

// 글 생성 응답 타입
export interface GenerateResponse {
  content: string;
}
