'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Profile, Post } from '@/types';

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [kakaoConnected, setKakaoConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, postsRes, kakaoRes] = await Promise.all([
        fetch('/api/profile'),
        fetch('/api/posts'),
        fetch('/api/kakao/status'),
      ]);

      if (profileRes.ok) {
        const data = await profileRes.json();
        setProfile(data.data);
      }

      if (postsRes.ok) {
        const data = await postsRes.json();
        setPosts(data.data || []);
      }

      if (kakaoRes.ok) {
        const data = await kakaoRes.json();
        setKakaoConnected(data.connected && !data.expired);
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
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const today = now.getDate();

  // 이번 달 글 작성 여부
  const thisMonthPost = posts.find((post) => {
    const postDate = new Date(post.created_at!);
    return (
      postDate.getMonth() === currentMonth &&
      postDate.getFullYear() === currentYear
    );
  });

  // 월별 작성 통계 (최근 6개월)
  const getMonthlyStats = () => {
    const stats = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - i, 1);
      const monthPosts = posts.filter((post) => {
        const postDate = new Date(post.created_at!);
        return (
          postDate.getMonth() === date.getMonth() &&
          postDate.getFullYear() === date.getFullYear()
        );
      });
      stats.push({
        month: date.toLocaleDateString('ko-KR', { month: 'short' }),
        count: monthPosts.length,
        completed: monthPosts.length > 0,
      });
    }
    return stats;
  };

  const monthlyStats = getMonthlyStats();

  // 캘린더 날짜 배열 생성
  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  // 글 작성한 날짜들
  const postDates = posts
    .filter((post) => {
      const postDate = new Date(post.created_at!);
      return (
        postDate.getMonth() === currentMonth &&
        postDate.getFullYear() === currentYear
      );
    })
    .map((post) => new Date(post.created_at!).getDate());

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
          <p className="text-sm text-gray-500 mt-1">
            블로그 글 생성 도구 관리 시스템
          </p>
        </div>
        <Link
          href="/write"
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          + 새 글 생성
        </Link>
      </div>

      {/* 상태 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wide">프로필</div>
          <div className="mt-2 flex items-center">
            <span
              className={`w-2 h-2 rounded-full mr-2 ${
                profile ? 'bg-green-500' : 'bg-yellow-500'
              }`}
            ></span>
            <span className="text-sm font-medium">
              {profile ? '설정 완료' : '미설정'}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wide">이번 달</div>
          <div className="mt-2 flex items-center">
            <span
              className={`w-2 h-2 rounded-full mr-2 ${
                thisMonthPost ? 'bg-green-500' : 'bg-red-500'
              }`}
            ></span>
            <span className="text-sm font-medium">
              {thisMonthPost ? '작성 완료' : '미작성'}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wide">총 작성</div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-gray-900">{posts.length}</span>
            <span className="text-sm text-gray-500 ml-1">건</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wide">카카오톡</div>
          <div className="mt-2 flex items-center">
            <span
              className={`w-2 h-2 rounded-full mr-2 ${
                kakaoConnected ? 'bg-green-500' : 'bg-gray-400'
              }`}
            ></span>
            <span className="text-sm font-medium">
              {kakaoConnected ? '연동됨' : '미연동'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* 캘린더 */}
        <div className="lg:col-span-2 bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">
              {currentYear}년 {currentMonth + 1}월
            </h2>
            <div className="flex items-center text-xs text-gray-500">
              <span className="w-3 h-3 bg-blue-500 rounded mr-1"></span>
              작성일
              <span className="w-3 h-3 bg-gray-200 rounded ml-3 mr-1"></span>
              오늘
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
              <div key={day} className="text-xs font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`aspect-square flex items-center justify-center text-sm rounded ${
                  day === null
                    ? ''
                    : postDates.includes(day)
                    ? 'bg-blue-500 text-white font-medium'
                    : day === today
                    ? 'bg-gray-200 font-medium'
                    : 'hover:bg-gray-50'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {!thisMonthPost && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ 이번 달 아직 글을 작성하지 않았습니다.
                {today >= 25 && ' 월말이 다가오고 있어요!'}
              </p>
            </div>
          )}
        </div>

        {/* 월별 통계 */}
        <div className="bg-white rounded-lg border p-4">
          <h2 className="font-semibold text-gray-900 mb-4">월별 작성 현황</h2>
          <div className="space-y-3">
            {monthlyStats.map((stat, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{stat.month}</span>
                <div className="flex items-center">
                  <div className="w-24 h-2 bg-gray-100 rounded-full mr-2">
                    <div
                      className={`h-2 rounded-full ${
                        stat.completed ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                      style={{ width: stat.completed ? '100%' : '0%' }}
                    ></div>
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      stat.completed ? 'text-blue-600' : 'text-gray-400'
                    }`}
                  >
                    {stat.count}건
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t">
            <div className="text-xs text-gray-500">작성률</div>
            <div className="text-2xl font-bold text-gray-900">
              {Math.round(
                (monthlyStats.filter((s) => s.completed).length / 6) * 100
              )}
              %
            </div>
          </div>
        </div>
      </div>

      {/* 빠른 작업 */}
      <div className="bg-white rounded-lg border p-4">
        <h2 className="font-semibold text-gray-900 mb-4">빠른 작업</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link
            href="/write"
            className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-700">글 생성</span>
          </Link>

          <Link
            href="/history"
            className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-700">작업 이력</span>
          </Link>

          <Link
            href="/profile"
            className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-700">설정</span>
          </Link>

          <a
            href="https://blog.naver.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-700">네이버 블로그</span>
          </a>
        </div>
      </div>

      {/* 최근 작업 로그 */}
      {posts.length > 0 && (
        <div className="bg-white rounded-lg border">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">최근 작업 로그</h2>
            <Link href="/history" className="text-sm text-blue-600 hover:text-blue-700">
              전체 보기
            </Link>
          </div>
          <div className="divide-y">
            {posts.slice(0, 5).map((post) => (
              <div key={post.id} className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{post.topic}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(post.created_at!).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">완료</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
