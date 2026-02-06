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

  // 매월 21일 기준으로 작성 완료 여부 체크
  const now = new Date();
  const currentDay = now.getDate();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // 21일 기준 기간 계산 (예: 2월 21일 ~ 3월 20일)
  let periodStart: Date;
  let periodEnd: Date;

  if (currentDay >= 21) {
    // 이번 달 21일 ~ 다음 달 20일
    periodStart = new Date(currentYear, currentMonth, 21);
    periodEnd = new Date(currentYear, currentMonth + 1, 20, 23, 59, 59);
  } else {
    // 지난 달 21일 ~ 이번 달 20일
    periodStart = new Date(currentYear, currentMonth - 1, 21);
    periodEnd = new Date(currentYear, currentMonth, 20, 23, 59, 59);
  }

  const thisMonthPost = posts.find((post) => {
    const postDate = new Date(post.created_at!);
    return postDate >= periodStart && postDate <= periodEnd;
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
            <svg className="w-14 h-14" viewBox="0 0 100 100">
              {/* 청진기 */}
              <path d="M 30 35 Q 25 50 30 65 Q 35 80 50 85 Q 65 80 70 65 Q 75 50 70 35"
                stroke="#0d9488" strokeWidth="4" fill="none" strokeLinecap="round"/>
              <circle cx="50" cy="88" r="8" fill="#0d9488"/>
              <circle cx="50" cy="88" r="5" fill="#5eead4"/>
              {/* 이어피스 */}
              <circle cx="30" cy="32" r="6" fill="#0d9488"/>
              <circle cx="70" cy="32" r="6" fill="#0d9488"/>
              <path d="M 30 32 Q 30 20 40 18" stroke="#0d9488" strokeWidth="3" fill="none" strokeLinecap="round"/>
              <path d="M 70 32 Q 70 20 60 18" stroke="#0d9488" strokeWidth="3" fill="none" strokeLinecap="round"/>
              {/* 펜 */}
              <rect x="45" y="40" width="10" height="35" rx="2" fill="#14b8a6"/>
              <polygon points="45,75 55,75 50,85" fill="#0f766e"/>
              <rect x="45" y="40" width="10" height="8" fill="#0f766e"/>
            </svg>
          </div>
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
              {currentDay >= 21 ? currentMonth + 1 : currentMonth}월 {thisMonthPost ? '글 작성 완료!' : '아직 글을 안 썼어요'}
              <span className="text-xs opacity-70 ml-1">
                ({periodStart.getMonth() + 1}/{periodStart.getDate()}~{periodEnd.getMonth() + 1}/{periodEnd.getDate()})
              </span>
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
            <span className="text-lg">🩺</span>
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
