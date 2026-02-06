'use client';

import { useState, useEffect } from 'react';
import { Post } from '@/types';

export default function HistoryPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  const handleDelete = async (id: string) => {
    if (!confirm('정말 이 글을 삭제하시겠습니까?')) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/posts?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPosts(posts.filter((post) => post.id !== id));
        if (selectedPost?.id === id) {
          setSelectedPost(null);
        }
      } else {
        alert('삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('삭제 실패:', error);
      alert('삭제에 실패했습니다.');
    } finally {
      setDeleting(false);
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
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-teal-200 border-t-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">작업 이력</h1>
          <p className="text-gray-500 mt-1">
            지금까지 생성한 글 목록입니다
          </p>
        </div>
        <div className="px-4 py-2 bg-teal-50 text-teal-700 rounded-xl font-medium text-sm">
          총 {posts.length}건
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">아직 생성한 글이 없어요</h2>
          <p className="text-gray-500 mb-6">첫 번째 블로그 글을 생성해보세요!</p>
          <a
            href="/write"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-medium rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all shadow-lg shadow-teal-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            글 생성하러 가기
          </a>
        </div>
      ) : (
        <div className="grid lg:grid-cols-5 gap-6">
          {/* 목록 */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-teal-50 to-cyan-50">
              <h2 className="font-bold text-gray-900">작업 목록</h2>
            </div>
            <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
              {posts.map((post) => (
                <button
                  key={post.id}
                  onClick={() => setSelectedPost(post)}
                  className={`w-full px-5 py-4 text-left hover:bg-gray-50 transition-all ${
                    selectedPost?.id === post.id ? 'bg-teal-50 border-l-4 border-teal-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 truncate">
                        {post.topic}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDate(post.created_at!)} {formatTime(post.created_at!)}
                      </p>
                    </div>
                    <span className="flex-shrink-0 px-2.5 py-1 text-xs bg-teal-50 text-teal-700 rounded-full font-medium">
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
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-teal-50 to-cyan-50">
                  <div>
                    <h2 className="font-bold text-gray-900">{selectedPost.topic}</h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatDate(selectedPost.created_at!)} {formatTime(selectedPost.created_at!)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopy(selectedPost.content)}
                      className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
                        copied
                          ? 'bg-teal-100 text-teal-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {copied ? '복사 완료!' : '복사'}
                    </button>
                    <button
                      onClick={() => handleDelete(selectedPost.id!)}
                      disabled={deleting}
                      className="px-4 py-2 text-sm font-medium rounded-xl transition-all bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50"
                    >
                      {deleting ? '삭제 중...' : '삭제'}
                    </button>
                  </div>
                </div>

                {/* 입력 정보 */}
                {(selectedPost.monthly_event || selectedPost.positive_experience ||
                  selectedPost.negative_experience ||
                  selectedPost.improvement) && (
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                      입력 정보
                    </h3>
                    <div className="space-y-2 text-sm">
                      {selectedPost.monthly_event && (
                        <p className="text-gray-600">
                          <span className="text-gray-400 mr-2">있었던 일:</span>
                          {selectedPost.monthly_event}
                        </p>
                      )}
                      {selectedPost.positive_experience && (
                        <p className="text-gray-600">
                          <span className="text-gray-400 mr-2">긍정적 경험:</span>
                          {selectedPost.positive_experience}
                        </p>
                      )}
                      {selectedPost.negative_experience && (
                        <p className="text-gray-600">
                          <span className="text-gray-400 mr-2">어려웠던 점:</span>
                          {selectedPost.negative_experience}
                        </p>
                      )}
                      {selectedPost.improvement && (
                        <p className="text-gray-600">
                          <span className="text-gray-400 mr-2">개선점:</span>
                          {selectedPost.improvement}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* 글 내용 */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      생성된 글
                    </h3>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                      {selectedPost.content.length.toLocaleString()}자
                    </span>
                  </div>
                  <div className="h-80 overflow-y-auto p-4 bg-gray-50 rounded-xl">
                    <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                      {selectedPost.content}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center h-full flex items-center justify-center min-h-[400px]">
                <div>
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
