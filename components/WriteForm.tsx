'use client';

import { useState } from 'react';
import { WriteInput } from '@/types';

interface WriteFormProps {
  onGenerate: (input: WriteInput) => Promise<void>;
  loading: boolean;
}

export default function WriteForm({ onGenerate, loading }: WriteFormProps) {
  const [input, setInput] = useState<WriteInput>({
    topic: '',
    positiveExperience: '',
    negativeExperience: '',
    improvement: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onGenerate(input);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setInput((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          이번 달 주제/키워드 *
        </label>
        <input
          type="text"
          name="topic"
          value={input.topic}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="예: 간호 상담에서 경청의 중요성"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          긍정적 경험
        </label>
        <textarea
          name="positiveExperience"
          value={input.positiveExperience}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="이번 달에 있었던 좋았던 경험이나 성과를 적어주세요"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          어려웠던 점 / 부정적 경험
        </label>
        <textarea
          name="negativeExperience"
          value={input.negativeExperience}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="이번 달에 어려웠거나 아쉬웠던 점을 적어주세요"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          개선하고 싶은 점
        </label>
        <textarea
          name="improvement"
          value={input.improvement}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="앞으로 개선하거나 시도해보고 싶은 것을 적어주세요"
        />
      </div>

      <button
        type="submit"
        disabled={loading || !input.topic}
        className="w-full py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            AI가 글을 작성 중입니다...
          </span>
        ) : (
          'AI 글 생성'
        )}
      </button>
    </form>
  );
}
