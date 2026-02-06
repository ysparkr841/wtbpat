'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Profile, Post } from '@/types';

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, postsRes] = await Promise.all([
        fetch('/api/profile'),
        fetch('/api/posts'),
      ]);

      if (profileRes.ok) {
        const data = await profileRes.json();
        setProfile(data.data);
      }

      if (postsRes.ok) {
        const data = await postsRes.json();
        setPosts(data.data || []);
      }
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const thisMonthPost = posts.find((post) => {
    const postDate = new Date(post.created_at!);
    return (
      postDate.getMonth() === currentMonth &&
      postDate.getFullYear() === currentYear
    );
  });

  // 추천 주제들
  const suggestedTopics = [
    '환자 소통 노하우',
    '번아웃 극복기',
    '보호자 상담 팁',
    '신규 간호사 조언',
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 px-4">
      {/* 캐릭터와 인사 */}
      <div className="text-center pt-6">
        <div className="inline-block mb-4 relative">
          <div className="w-24 h-24 bg-gradient-to-br from-teal-100 via-cyan-100 to-emerald-100 rounded-[2rem] flex items-center justify-center shadow-lg">
            <svg className="w-20 h-20" viewBox="0 0 100 100">
              {/* 얼굴 */}
              <circle cx="50" cy="52" r="28" fill="#FFE4C9"/>
              {/* 볼 터치 */}
              <ellipse cx="32" cy="58" rx="5" ry="3" fill="#FFB6B6" opacity="0.6"/>
              <ellipse cx="68" cy="58" rx="5" ry="3" fill="#FFB6B6" opacity="0.6"/>
              {/* 간호사 모자 */}
              <path d="M 25 35 Q 25 20 50 18 Q 75 20 75 35 L 72 40 L 28 40 Z" fill="white" stroke="#0d9488" strokeWidth="1.5"/>
              <rect x="42" y="22" width="16" height="10" rx="2" fill="white" stroke="#0d9488" strokeWidth="1.5"/>
              <path d="M 47 25 L 53 25 M 50 23 L 50 29" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
              {/* 머리카락 */}
              <path d="M 28 40 Q 22 45 24 55" stroke="#4A3728" strokeWidth="3" fill="none" strokeLinecap="round"/>
              <path d="M 72 40 Q 78 45 76 55" stroke="#4A3728" strokeWidth="3" fill="none" strokeLinecap="round"/>
              {/* 눈 - 반짝반짝 */}
              <ellipse cx="40" cy="52" rx="4" ry="5" fill="#2D2D2D"/>
              <ellipse cx="60" cy="52" rx="4" ry="5" fill="#2D2D2D"/>
              <circle cx="38" cy="50" r="1.5" fill="white"/>
              <circle cx="58" cy="50" r="1.5" fill="white"/>
              {/* 미소 */}
              <path d="M 43 62 Q 50 68 57 62" stroke="#2D2D2D" strokeWidth="2" fill="none" strokeLinecap="round"/>
              {/* 손 흔들기 */}
              <ellipse cx="78" cy="70" rx="6" ry="8" fill="#FFE4C9" stroke="#E8C4A8" strokeWidth="1"/>
              <path d="M 76 64 L 74 60 M 78 63 L 78 58 M 80 64 L 82 60" stroke="#FFE4C9" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          {/* 반짝이 효과 */}
          <div className="absolute -top-1 -right-1 text-lg animate-pulse">✨</div>
        </div>
        <h1 className="text-xl font-semibold text-gray-700 mb-1">
          {profile ? `${profile.name} 선생님, 안녕하세요!` : '안녕하세요!'}
        </h1>
        <p className="text-gray-500 text-sm">오늘의 경험을 블로그에 담아보세요</p>
      </div>

      {/* 메인 CTA */}
      <Link
        href="/write"
        className="block p-6 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl text-white hover:from-teal-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-lg">이번 달 글 작성하기</p>
            <p className="text-teal-50 text-sm mt-0.5">AI가 전문적인 글로 다듬어드려요</p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
        </div>
      </Link>

      {/* 이번 달 상태 */}
      <div className={`p-4 rounded-xl ${thisMonthPost ? 'bg-teal-50 border border-teal-200' : 'bg-amber-50 border border-amber-200'}`}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{thisMonthPost ? '🎉' : '📝'}</span>
          <div>
            <p className={`font-medium text-sm ${thisMonthPost ? 'text-teal-700' : 'text-amber-700'}`}>
              {currentMonth + 1}월 {thisMonthPost ? '글 작성 완료!' : '아직 글을 안 썼어요'}
            </p>
            <p className={`text-xs ${thisMonthPost ? 'text-teal-600' : 'text-amber-600'}`}>
              {thisMonthPost ? thisMonthPost.topic : '환자분들께 도움이 되는 글을 남겨보세요'}
            </p>
          </div>
        </div>
      </div>

      {/* 추천 주제 */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <span>💡</span> 이런 주제는 어때요?
        </p>
        <div className="flex flex-wrap gap-2">
          {suggestedTopics.map((topic) => (
            <Link
              key={topic}
              href={`/write?topic=${encodeURIComponent(topic)}`}
              className="px-3 py-1.5 bg-teal-50 text-teal-700 text-sm rounded-lg hover:bg-teal-100 transition-colors"
            >
              {topic}
            </Link>
          ))}
        </div>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-xl border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">📚</span>
            <span className="text-xs text-gray-500">총 작성</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{posts.length}<span className="text-sm font-normal text-gray-400 ml-1">건</span></p>
        </div>
        <Link href="/profile" className="bg-white p-4 rounded-xl border border-gray-100 hover:border-teal-300 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">👤</span>
            <span className="text-xs text-gray-500">내 프로필</span>
          </div>
          <p className="font-medium text-gray-800 truncate">{profile ? profile.name : '설정하기'}</p>
        </Link>
      </div>

      {/* 최근 글 */}
      {posts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-medium text-gray-700 text-sm">최근 작성한 글</h2>
            <Link href="/history" className="text-xs text-teal-600 hover:text-teal-700">
              전체 보기
            </Link>
          </div>
          <div className="space-y-2">
            {posts.slice(0, 3).map((post) => (
              <div key={post.id} className="bg-white p-3 rounded-lg border border-gray-100 flex items-center gap-3">
                <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-700 text-sm truncate">{post.topic}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(post.created_at!).toLocaleDateString('ko-KR', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 팁 카드 */}
      <div className="bg-gradient-to-r from-cyan-50 to-teal-50 rounded-xl p-4 border border-teal-100">
        <p className="text-sm text-teal-800 font-medium mb-1">💬 글쓰기 팁</p>
        <p className="text-xs text-teal-700">
          실제 경험을 바탕으로 쓰면 더 진정성 있는 글이 됩니다.
          환자분과의 에피소드나 동료와의 협업 경험을 담아보세요.
        </p>
      </div>
    </div>
  );
}
