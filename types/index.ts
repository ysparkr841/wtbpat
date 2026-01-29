// 프로필 타입
export interface Profile {
  id?: string;
  name: string;
  job: string;
  experience: string;
  blog_style: string;
  additional_info: string;
  created_at?: string;
  updated_at?: string;
}

// 글 작성 입력 타입
export interface WriteInput {
  topic: string;
  positiveExperience: string;
  negativeExperience: string;
  improvement: string;
}

// 저장된 글 타입
export interface Post {
  id?: string;
  profile_id?: string;
  topic: string;
  content: string;
  positive_experience: string;
  negative_experience: string;
  improvement: string;
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
  positiveExperience: string;
  negativeExperience: string;
  improvement: string;
  profile: Profile;
}

// 글 생성 응답 타입
export interface GenerateResponse {
  content: string;
}
