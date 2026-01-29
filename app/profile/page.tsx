'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Profile } from '@/types';

function SettingsContent() {
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<Profile>({
    name: '',
    job: '간호 상담사',
    experience: '',
    blog_style: '',
    additional_info: '',
  });
  const [kakaoStatus, setKakaoStatus] = useState<{
    connected: boolean;
    expired: boolean;
  } | null>(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
    checkKakaoStatus();

    const kakaoResult = searchParams.get('kakao');
    if (kakaoResult === 'success') {
      setMessage({ type: 'success', text: '카카오톡 연동이 완료되었습니다.' });
    } else if (kakaoResult === 'error') {
      const errorMessage = searchParams.get('message');
      setMessage({ type: 'error', text: `카카오톡 연동 실패: ${errorMessage || '알 수 없는 오류'}` });
    }
  }, [searchParams]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          setProfile(data.data);
        }
      }
    } catch (error) {
      console.error('프로필 불러오기 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkKakaoStatus = async () => {
    try {
      const response = await fetch('/api/kakao/status');
      if (response.ok) {
        const data = await response.json();
        setKakaoStatus({ connected: data.connected, expired: data.expired });
      }
    } catch (error) {
      console.error('카카오 상태 확인 실패:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: '설정이 저장되었습니다.' });
      } else {
        setMessage({ type: 'error', text: '저장 중 오류가 발생했습니다.' });
      }
    } catch (error) {
      console.error('프로필 저장 실패:', error);
      setMessage({ type: 'error', text: '저장 중 오류가 발생했습니다.' });
    } finally {
      setSaving(false);
    }
  };

  const handleKakaoConnect = () => {
    window.location.href = '/api/auth/kakao';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">설정</h1>
        <p className="text-sm text-gray-500 mt-1">
          글 생성에 사용될 정보 및 연동 설정
        </p>
      </div>

      {message.text && (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.type === 'error'
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* 프로필 설정 */}
      <div className="bg-white rounded-lg border">
        <div className="px-4 py-3 border-b">
          <h2 className="font-semibold text-gray-900">작성자 정보</h2>
          <p className="text-xs text-gray-500 mt-0.5">AI가 글을 생성할 때 참고하는 정보입니다</p>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="홍길동"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                직업
              </label>
              <input
                type="text"
                value={profile.job}
                onChange={(e) => setProfile({ ...profile, job: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="간호 상담사"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              경력
            </label>
            <textarea
              value={profile.experience}
              onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="예: 종합병원 10년 근무, 현재 개인 상담소 운영"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              블로그 스타일
            </label>
            <textarea
              value={profile.blog_style}
              onChange={(e) => setProfile({ ...profile, blog_style: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="예: 친근하고 따뜻한 말투, 전문용어는 쉽게 풀어서 설명, 독자에게 공감과 위로를 주는 글"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              추가 정보
            </label>
            <textarea
              value={profile.additional_info}
              onChange={(e) => setProfile({ ...profile, additional_info: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="글 작성 시 참고할 추가 정보"
            />
          </div>

          <div className="pt-2">
            <button
              onClick={handleSave}
              disabled={saving || !profile.name}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {saving ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>
      </div>

      {/* 카카오톡 연동 */}
      <div className="bg-white rounded-lg border">
        <div className="px-4 py-3 border-b">
          <h2 className="font-semibold text-gray-900">카카오톡 연동</h2>
          <p className="text-xs text-gray-500 mt-0.5">글 생성 완료 시 나에게 보내기로 알림</p>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                kakaoStatus?.connected && !kakaoStatus?.expired
                  ? 'bg-yellow-100'
                  : 'bg-gray-100'
              }`}>
                <svg className="w-5 h-5 text-yellow-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3C6.5 3 2 6.58 2 11c0 2.89 1.92 5.42 4.8 6.87-.2.73-.77 2.66-.88 3.07-.14.49.18.48.38.35.16-.1 2.51-1.7 3.53-2.4.7.1 1.43.16 2.17.16 5.5 0 10-3.58 10-8S17.5 3 12 3z"/>
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">카카오톡</p>
                <p className="text-xs text-gray-500">
                  {kakaoStatus === null
                    ? '상태 확인 중...'
                    : kakaoStatus.connected && !kakaoStatus.expired
                    ? '연동됨'
                    : kakaoStatus.expired
                    ? '연동 만료됨'
                    : '미연동'}
                </p>
              </div>
            </div>
            <button
              onClick={handleKakaoConnect}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                kakaoStatus?.connected && !kakaoStatus?.expired
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-yellow-400 text-yellow-900 hover:bg-yellow-500'
              }`}
            >
              {kakaoStatus?.connected && !kakaoStatus?.expired ? '다시 연동' : '연동하기'}
            </button>
          </div>

          {!(kakaoStatus?.connected && !kakaoStatus?.expired) && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <h3 className="text-xs font-medium text-gray-700 mb-2">연동 전 필요한 설정</h3>
              <ol className="text-xs text-gray-500 space-y-1 list-decimal list-inside">
                <li>카카오 개발자 사이트에서 앱 등록</li>
                <li>카카오 로그인 활성화</li>
                <li>Redirect URI 설정</li>
                <li>동의항목에서 &quot;카카오톡 메시지 전송&quot; 권한 설정</li>
              </ol>
            </div>
          )}
        </div>
      </div>

      {/* 환경 정보 */}
      <div className="bg-white rounded-lg border">
        <div className="px-4 py-3 border-b">
          <h2 className="font-semibold text-gray-900">시스템 정보</h2>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">AI 모델:</span>
              <span className="ml-2 text-gray-900">Gemini 1.5 Flash</span>
            </div>
            <div>
              <span className="text-gray-500">데이터 저장:</span>
              <span className="ml-2 text-gray-900">Supabase</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}
