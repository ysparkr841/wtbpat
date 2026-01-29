'use client';

import { useState, useEffect } from 'react';
import { Post } from '@/types';

export default function HistoryPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts');
      if (response.ok) {
        const data = await response.json();
        setPosts(data.data || []);
      }
    } catch (error) {
      console.error('이력 불러오기 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('복사 실패:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">작업 이력</h1>
          <p className="text-sm text-gray-500 mt-1">
            생성한 글 목록 및 관리
          </p>
        </div>
        <div className="text-sm text-gray-500">
          총 <span className="font-medium text-gray-900">{posts.length}</span>건
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-500 mb-2">아직 생성한 글이 없습니다</p>
          <a href="/write" className="text-sm text-blue-600 hover:text-blue-700">
            첫 번째 글 생성하기 →
          </a>
        </div>
      ) : (
        <div className="grid lg:grid-cols-5 gap-6">
          {/* 테이블 */}
          <div className="lg:col-span-2 bg-white rounded-lg border overflow-hidden">
            <div className="px-4 py-3 border-b bg-gray-50">
              <h2 className="text-sm font-medium text-gray-700">작업 목록</h2>
            </div>
            <div className="divide-y max-h-[600px] overflow-y-auto">
              {posts.map((post) => (
                <button
                  key={post.id}
                  onClick={() => setSelectedPost(post)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                    selectedPost?.id === post.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {post.topic}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(post.created_at!)} {formatTime(post.created_at!)}
                      </p>
                    </div>
                    <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded">
                      완료
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 상세 보기 */}
          <div className="lg:col-span-3">
            {selectedPost ? (
              <div className="bg-white rounded-lg border">
                <div className="px-4 py-3 border-b flex items-center justify-between">
                  <div>
                    <h2 className="font-medium text-gray-900">{selectedPost.topic}</h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatDate(selectedPost.created_at!)} {formatTime(selectedPost.created_at!)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleCopy(selectedPost.content)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        copied
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {copied ? '복사됨!' : '복사'}
                    </button>
                    <a
                      href="https://blog.naver.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 text-xs font-medium bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                    >
                      블로그 열기
                    </a>
                  </div>
                </div>

                {/* 입력 정보 */}
                {(selectedPost.positive_experience ||
                  selectedPost.negative_experience ||
                  selectedPost.improvement) && (
                  <div className="px-4 py-3 bg-gray-50 border-b">
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                      입력 정보
                    </h3>
                    <div className="space-y-1 text-sm">
                      {selectedPost.positive_experience && (
                        <p className="text-gray-600">
                          <span className="text-gray-400">긍정적 경험:</span>{' '}
                          {selectedPost.positive_experience}
                        </p>
                      )}
                      {selectedPost.negative_experience && (
                        <p className="text-gray-600">
                          <span className="text-gray-400">어려웠던 점:</span>{' '}
                          {selectedPost.negative_experience}
                        </p>
                      )}
                      {selectedPost.improvement && (
                        <p className="text-gray-600">
                          <span className="text-gray-400">개선점:</span>{' '}
                          {selectedPost.improvement}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* 글 내용 */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      생성된 글
                    </h3>
                    <span className="text-xs text-gray-400">
                      {selectedPost.content.length.toLocaleString()}자
                    </span>
                  </div>
                  <div className="h-80 overflow-y-auto p-3 bg-gray-50 rounded-lg">
                    <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                      {selectedPost.content}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg border p-12 text-center h-full flex items-center justify-center">
                <div>
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <p className="text-gray-500">왼쪽 목록에서 항목을 선택하세요</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
