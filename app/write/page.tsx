'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Profile, WriteInput } from '@/types';
import { GEMINI_MODELS, DEFAULT_MODEL } from '@/lib/gemini';
import { CODEX_MODELS, DEFAULT_CODEX_MODEL } from '@/lib/openai-codex';

const suggestedTopics = [
  { title: '환자 소통', desc: '효과적인 환자 상담 노하우' },
  { title: '번아웃 극복', desc: '간호사의 마음 건강 지키기' },
  { title: '보호자 상담', desc: '보호자와의 신뢰 쌓기' },
  { title: '신규 간호사', desc: '선배로서 전하는 조언' },
  { title: '팀워크', desc: '병원에서의 협업 이야기' },
  { title: '자기계발', desc: '간호사의 성장 스토리' },
];

function WritePageContent() {
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [generatedContent, setGeneratedContent] = useState('');
  const [currentInput, setCurrentInput] = useState<WriteInput>({
    topic: '',
    monthlyEvent: '',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [kakaoConnected, setKakaoConnected] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [profileLoading, setProfileLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
  const [hasCodexToken, setHasCodexToken] = useState(false);

  useEffect(() => {
    fetchProfile();
    checkKakaoStatus();
    checkCodexStatus();

    // URL 파라미터에서 topic 가져오기
    const topic = searchParams.get('topic');
    if (topic) {
      setCurrentInput(prev => ({ ...prev, topic }));
    }
  }, [searchParams]);

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

  const checkCodexStatus = async () => {
    try {
      const res = await fetch('/api/codex-token/status');
      if (res.ok) {
        const data = await res.json();
        setHasCodexToken(data.exists);
      }
    } catch {}
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
        body: JSON.stringify({ ...currentInput, profile, model: selectedModel }),
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
          monthly_event: currentInput.monthlyEvent,
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: '저장되었습니다!' });
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
          message: `[블로그 글 생성 완료]\n\n주제: ${currentInput?.topic}\n\n글이 생성되었습니다. 블로그에 붙여넣기해주세요!`,
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
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-xl mx-auto px-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🩺</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">프로필 설정이 필요해요</h2>
          <p className="text-gray-500 text-sm mb-6">
            AI가 선생님의 스타일에 맞는 글을 작성하려면<br/>프로필 정보가 필요합니다
          </p>
          <Link
            href="/profile"
            className="inline-flex items-center px-5 py-2.5 bg-teal-500 text-white font-medium rounded-xl hover:bg-teal-600 transition-colors"
          >
            프로필 설정하기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 space-y-6">
      {/* 헤더 */}
      <div className="text-center pt-2">
        <h1 className="text-xl font-semibold text-gray-800">블로그 글 작성</h1>
        <p className="text-gray-500 text-sm mt-1">
          주제만 입력하면 AI가 전문적인 글로 다듬어드려요
        </p>
      </div>

      {/* 단계 표시 */}
      <div className="flex items-center gap-3 px-2">
        <div className={`flex items-center gap-2 ${step >= 1 ? 'text-teal-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            step >= 1 ? 'bg-teal-500 text-white' : 'bg-gray-100'
          }`}>
            1
          </div>
          <span className="text-sm font-medium">글감 입력</span>
        </div>
        <div className="flex-1 h-0.5 bg-gray-100 rounded">
          <div className={`h-full bg-teal-500 transition-all duration-300 ${step >= 2 ? 'w-full' : 'w-0'}`}></div>
        </div>
        <div className={`flex items-center gap-2 ${step >= 2 ? 'text-teal-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            step >= 2 ? 'bg-teal-500 text-white' : 'bg-gray-100'
          }`}>
            2
          </div>
          <span className="text-sm font-medium">결과 확인</span>
        </div>
      </div>

      {message.text && (
        <div className={`p-3 rounded-xl text-sm ${
          message.type === 'error'
            ? 'bg-red-50 text-red-700 border border-red-100'
            : 'bg-teal-50 text-teal-700 border border-teal-100'
        }`}>
          {message.text}
        </div>
      )}

      {step === 1 ? (
        <div className="space-y-4">
          {/* 추천 주제 */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-sm font-medium text-gray-700 mb-3">추천 주제</p>
            <div className="grid grid-cols-2 gap-2">
              {suggestedTopics.map((topic) => (
                <button
                  key={topic.title}
                  onClick={() => setCurrentInput({ ...currentInput, topic: topic.title })}
                  className={`p-3 rounded-lg text-left transition-colors ${
                    currentInput.topic === topic.title
                      ? 'bg-teal-50 border-2 border-teal-300'
                      : 'bg-gray-50 border border-gray-100 hover:bg-teal-50'
                  }`}
                >
                  <p className="font-medium text-gray-800 text-sm">{topic.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{topic.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 입력 폼 */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                주제 또는 키워드 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={currentInput.topic}
                onChange={(e) => setCurrentInput({ ...currentInput, topic: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                placeholder="예: 환자와의 소통에서 배운 점"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이번 달 경험 <span className="text-gray-400 font-normal">(선택)</span>
              </label>
              <textarea
                value={currentInput.monthlyEvent}
                onChange={(e) => setCurrentInput({ ...currentInput, monthlyEvent: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all resize-none"
                placeholder="예: 이번 달에 있었던 환자분과의 에피소드, 동료와의 협업 경험 등을 적어주시면 더 생생한 글이 됩니다."
              />
            </div>

            {/* 모델 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">AI 모델 선택</label>
              <div className="grid grid-cols-3 gap-2">
                {GEMINI_MODELS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedModel(m.id)}
                    className={`p-2.5 rounded-lg border text-left transition-colors ${
                      selectedModel === m.id
                        ? 'border-teal-400 bg-teal-50'
                        : 'border-gray-200 bg-gray-50 hover:bg-teal-50'
                    }`}
                  >
                    <p className={`text-xs font-semibold ${selectedModel === m.id ? 'text-teal-700' : 'text-gray-700'}`}>{m.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{m.desc}</p>
                  </button>
                ))}
                {hasCodexToken && CODEX_MODELS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedModel(m.id)}
                    className={`p-2.5 rounded-lg border text-left transition-colors ${
                      selectedModel === m.id
                        ? 'border-green-400 bg-green-50'
                        : 'border-gray-200 bg-gray-50 hover:bg-green-50'
                    }`}
                  >
                    <p className={`text-xs font-semibold ${selectedModel === m.id ? 'text-green-700' : 'text-gray-700'}`}>{m.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{m.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !currentInput.topic}
              className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-medium rounded-xl hover:from-rose-600 hover:to-pink-600 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  AI가 글을 작성하고 있어요...
                </span>
              ) : (
                '글 생성하기'
              )}
            </button>
          </div>

          {/* 팁 */}
          <div className="bg-teal-50 rounded-xl p-4 border border-teal-100">
            <p className="text-sm text-teal-800">
              <span className="font-medium">💡 Tip:</span> 실제 경험을 담으면 더 진정성 있는 글이 됩니다.
              환자분과의 대화, 업무 중 느낀 점 등을 자유롭게 적어보세요.
            </p>
          </div>
        </div>
      ) : (
        /* 결과 단계 */
        <div className="space-y-4">
          {/* 액션 버튼 */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleReset}
              className="flex items-center gap-1 text-gray-600 hover:text-gray-900 text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              다시 작성
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  copied ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {copied ? '복사됨!' : '복사'}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-3 py-1.5 text-sm font-medium bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 disabled:opacity-50"
              >
                {saving ? '저장 중...' : '저장'}
              </button>
              {kakaoConnected && (
                <button
                  onClick={handleSendKakao}
                  className="px-3 py-1.5 text-sm font-medium bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z"/>
                  </svg>
                  카톡 전송
                </button>
              )}
            </div>
          </div>

          {/* 생성된 글 */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <span className="font-medium text-gray-700 text-sm">생성된 글</span>
              <span className="text-xs text-gray-500">{generatedContent.length.toLocaleString()}자</span>
            </div>
            <textarea
              value={generatedContent}
              onChange={(e) => setGeneratedContent(e.target.value)}
              className="w-full h-80 p-4 text-sm leading-relaxed focus:outline-none resize-none"
            />
          </div>

          {/* 입력 정보 */}
          <div className="bg-gray-50 rounded-xl p-4 text-sm">
            <p className="text-gray-500 mb-1">주제: <span className="text-gray-700">{currentInput.topic}</span></p>
            {currentInput.monthlyEvent && (
              <p className="text-gray-500">경험: <span className="text-gray-700">{currentInput.monthlyEvent}</span></p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function WritePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-500 border-t-transparent"></div>
      </div>
    }>
      <WritePageContent />
    </Suspense>
  );
}
