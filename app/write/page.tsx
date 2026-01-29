'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Profile, WriteInput } from '@/types';

export default function WritePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [generatedContent, setGeneratedContent] = useState('');
  const [currentInput, setCurrentInput] = useState<WriteInput>({
    topic: '',
    positiveExperience: '',
    negativeExperience: '',
    improvement: '',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [kakaoConnected, setKakaoConnected] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [profileLoading, setProfileLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState(1); // 1: 입력, 2: 결과

  useEffect(() => {
    fetchProfile();
    checkKakaoStatus();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data.data);
      }
    } catch (error) {
      console.error('프로필 불러오기 실패:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  const checkKakaoStatus = async () => {
    try {
      const response = await fetch('/api/kakao/status');
      if (response.ok) {
        const data = await response.json();
        setKakaoConnected(data.connected && !data.expired);
      }
    } catch (error) {
      console.error('카카오 상태 확인 실패:', error);
    }
  };

  const handleGenerate = async () => {
    if (!profile) {
      setMessage({ type: 'error', text: '프로필을 먼저 설정해주세요.' });
      return;
    }

    if (!currentInput.topic) {
      setMessage({ type: 'error', text: '주제를 입력해주세요.' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...currentInput, profile }),
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedContent(data.data.content);
        setStep(2);
      } else {
        setMessage({ type: 'error', text: data.error || 'AI 글 생성에 실패했습니다.' });
      }
    } catch (error) {
      console.error('글 생성 실패:', error);
      setMessage({ type: 'error', text: 'AI 글 생성 중 오류가 발생했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('복사 실패:', error);
    }
  };

  const handleSave = async () => {
    if (!currentInput || !generatedContent) return;

    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: currentInput.topic,
          content: generatedContent,
          positive_experience: currentInput.positiveExperience,
          negative_experience: currentInput.negativeExperience,
          improvement: currentInput.improvement,
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: '작업 이력에 저장되었습니다.' });
      } else {
        setMessage({ type: 'error', text: '저장 중 오류가 발생했습니다.' });
      }
    } catch (error) {
      console.error('저장 실패:', error);
      setMessage({ type: 'error', text: '저장 중 오류가 발생했습니다.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSendKakao = async () => {
    if (!generatedContent) return;

    try {
      const response = await fetch('/api/kakao/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `[블로그 글 생성 완료]\n\n주제: ${currentInput?.topic}\n\n글이 생성되었습니다. 네이버 블로그에 붙여넣기해주세요!`,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: '카카오톡으로 알림을 보냈습니다.' });
      } else {
        setMessage({ type: 'error', text: data.error || '카카오톡 전송에 실패했습니다.' });
      }
    } catch (error) {
      console.error('카카오톡 전송 실패:', error);
      setMessage({ type: 'error', text: '카카오톡 전송 중 오류가 발생했습니다.' });
    }
  };

  const handleReset = () => {
    setStep(1);
    setGeneratedContent('');
    setMessage({ type: '', text: '' });
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-white rounded-lg border p-8 text-center">
        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">프로필 설정 필요</h2>
        <p className="text-gray-500 mb-4">
          AI가 글을 생성하려면 작성자 정보가 필요합니다.
        </p>
        <Link
          href="/profile"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
        >
          프로필 설정하기
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">글 생성 도구</h1>
        <p className="text-sm text-gray-500 mt-1">
          글감을 입력하면 AI가 블로그 글을 생성합니다
        </p>
      </div>

      {/* 단계 표시 */}
      <div className="flex items-center space-x-4">
        <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}>
            1
          </div>
          <span className="ml-2 text-sm font-medium">입력</span>
        </div>
        <div className="flex-1 h-px bg-gray-200"></div>
        <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}>
            2
          </div>
          <span className="ml-2 text-sm font-medium">결과</span>
        </div>
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

      {step === 1 ? (
        /* 입력 단계 */
        <div className="bg-white rounded-lg border">
          <div className="px-4 py-3 border-b">
            <h2 className="font-semibold text-gray-900">글감 입력</h2>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                주제 / 키워드 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={currentInput.topic}
                onChange={(e) => setCurrentInput({ ...currentInput, topic: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="예: 간호 상담에서 경청의 중요성"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                긍정적 경험
              </label>
              <textarea
                value={currentInput.positiveExperience}
                onChange={(e) => setCurrentInput({ ...currentInput, positiveExperience: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="이번 달에 있었던 좋았던 경험이나 성과"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                어려웠던 점
              </label>
              <textarea
                value={currentInput.negativeExperience}
                onChange={(e) => setCurrentInput({ ...currentInput, negativeExperience: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="이번 달에 어려웠거나 아쉬웠던 점"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                개선하고 싶은 점
              </label>
              <textarea
                value={currentInput.improvement}
                onChange={(e) => setCurrentInput({ ...currentInput, improvement: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="앞으로 개선하거나 시도해보고 싶은 것"
              />
            </div>

            <div className="pt-2">
              <button
                onClick={handleGenerate}
                disabled={loading || !currentInput.topic}
                className="w-full py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    AI가 글을 생성 중입니다...
                  </span>
                ) : (
                  '글 생성하기'
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* 결과 단계 */
        <div className="space-y-4">
          {/* 도구 바 */}
          <div className="bg-white rounded-lg border p-3 flex items-center justify-between">
            <button
              onClick={handleReset}
              className="flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              다시 작성
            </button>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopy}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  copied
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {copied ? '복사됨!' : '복사'}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-3 py-1.5 text-sm font-medium bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:bg-gray-100 disabled:text-gray-400"
              >
                {saving ? '저장 중...' : '저장'}
              </button>
              {kakaoConnected && (
                <button
                  onClick={handleSendKakao}
                  className="px-3 py-1.5 text-sm font-medium bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200"
                >
                  카카오톡
                </button>
              )}
              <a
                href="https://blog.naver.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 text-sm font-medium bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
              >
                네이버 블로그
              </a>
            </div>
          </div>

          {/* 생성된 글 */}
          <div className="bg-white rounded-lg border">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">생성된 글</h2>
              <span className="text-xs text-gray-500">
                {generatedContent.length.toLocaleString()}자
              </span>
            </div>
            <div className="p-4">
              <textarea
                value={generatedContent}
                onChange={(e) => setGeneratedContent(e.target.value)}
                className="w-full h-96 p-3 border rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          </div>

          {/* 입력 정보 요약 */}
          <div className="bg-gray-50 rounded-lg border p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">입력 정보</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">주제:</span>
                <span className="ml-2 text-gray-900">{currentInput.topic}</span>
              </div>
              {currentInput.positiveExperience && (
                <div>
                  <span className="text-gray-500">긍정적 경험:</span>
                  <span className="ml-2 text-gray-900">{currentInput.positiveExperience.slice(0, 50)}...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
