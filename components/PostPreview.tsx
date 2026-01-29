'use client';

import { useState } from 'react';

interface PostPreviewProps {
  content: string;
  onEdit: (content: string) => void;
  onSave: () => Promise<void>;
  onSendKakao?: () => Promise<void>;
  saving: boolean;
  kakaoConnected?: boolean;
}

export default function PostPreview({
  content,
  onEdit,
  onSave,
  onSendKakao,
  saving,
  kakaoConnected,
}: PostPreviewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('복사 실패:', error);
    }
  };

  const handleSaveEdit = () => {
    onEdit(editedContent);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedContent(content);
    setIsEditing(false);
  };

  const handleSendKakao = async () => {
    if (!onSendKakao) return;
    setSending(true);
    try {
      await onSendKakao();
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">생성된 글</h2>
        <div className="flex space-x-2">
          {!isEditing && (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                수정
              </button>
              <button
                onClick={handleCopy}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  copied
                    ? 'bg-green-100 text-green-700'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                {copied ? '복사됨!' : '복사'}
              </button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full h-96 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm"
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleCancelEdit}
              className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSaveEdit}
              className="px-4 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >
              수정 완료
            </button>
          </div>
        </div>
      ) : (
        <div className="prose prose-green max-w-none">
          <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
            {content}
          </div>
        </div>
      )}

      <div className="mt-6 pt-4 border-t flex flex-wrap gap-3">
        <button
          onClick={onSave}
          disabled={saving}
          className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
        >
          {saving ? '저장 중...' : '이력에 저장'}
        </button>

        {kakaoConnected && onSendKakao && (
          <button
            onClick={handleSendKakao}
            disabled={sending}
            className="px-6 py-2 bg-yellow-400 text-yellow-900 font-medium rounded-lg hover:bg-yellow-500 disabled:bg-gray-400 transition-colors"
          >
            {sending ? '전송 중...' : '카카오톡으로 전송'}
          </button>
        )}

        <a
          href="https://blog.naver.com"
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-2 bg-green-100 text-green-700 font-medium rounded-lg hover:bg-green-200 transition-colors"
        >
          네이버 블로그 열기
        </a>
      </div>
    </div>
  );
}
