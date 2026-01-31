'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from '@/lib/auth';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user) {
      checkAdminStatus();
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  const checkAdminStatus = async () => {
    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const data = await response.json();
        setIsAdmin(data.data?.is_admin === true);
      }
    } catch (error) {
      console.error('프로필 조회 실패:', error);
    }
  };

  const navItems = [
    { href: '/', label: '홈' },
    { href: '/write', label: '글쓰기' },
    { href: '/history', label: '이력' },
    { href: '/profile', label: '설정' },
  ];

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
    router.refresh();
  };

  // 로그인 페이지에서는 네비게이션 숨김
  const isAuthPage = pathname === '/login';

  return (
    <nav className="bg-white/70 backdrop-blur-md border-b border-teal-100 sticky top-0 z-50">
      <div className="max-w-xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link href={user ? '/' : '/login'} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <span className="font-semibold text-teal-700">블로그 글쓰기</span>
          </Link>

          {!loading && !isAuthPage && (
            <div className="flex items-center gap-1">
              {user ? (
                <>
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        pathname === item.href
                          ? 'bg-teal-100 text-teal-700 font-medium'
                          : 'text-gray-500 hover:text-teal-700 hover:bg-teal-50'
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        pathname === '/admin'
                          ? 'bg-amber-100 text-amber-700 font-medium'
                          : 'text-amber-600 hover:text-amber-700 hover:bg-amber-50'
                      }`}
                    >
                      관리
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="ml-2 px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:text-teal-700 hover:bg-teal-50 transition-colors"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="px-3 py-1.5 rounded-lg text-sm bg-teal-500 text-white hover:bg-teal-600 transition-colors"
                >
                  로그인
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
