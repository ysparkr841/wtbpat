'use client';

import { useState, useEffect } from 'react';
import { Profile } from '@/types';

interface ProfileFormProps {
  onSave?: (profile: Profile) => void;
}

export default function ProfileForm({ onSave }: ProfileFormProps) {
  const [profile, setProfile] = useState<Profile>({
    name: '',
    job: '간호 상담사',
    experience: '',
    blog_style: '',
    additional_info: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          setProfile(data.data);
        }
      }
    } catch (error) {
      console.error('프로필 불러오기 실패:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage('프로필이 저장되었습니다.');
        if (onSave && data.data) {
          onSave(data.data);
        }
      } else {
        setMessage('저장 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('프로필 저장 실패:', error);
      setMessage('저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          이름 *
        </label>
        <input
          type="text"
          name="name"
          value={profile.name}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="홍길동"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          직업
        </label>
        <input
          type="text"
          name="job"
          value={profile.job}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="간호 상담사"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          경력
        </label>
        <textarea
          name="experience"
          value={profile.experience}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="예: 종합병원 10년 근무, 현재 개인 상담소 운영"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          블로그 스타일
        </label>
        <textarea
          name="blog_style"
          value={profile.blog_style}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="예: 친근하고 따뜻한 말투, 전문용어는 쉽게 풀어서 설명, 독자에게 공감과 위로를 주는 글"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          추가 정보
        </label>
        <textarea
          name="additional_info"
          value={profile.additional_info}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="글 작성 시 참고할 추가 정보"
        />
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg ${
            message.includes('오류')
              ? 'bg-red-100 text-red-700'
              : 'bg-green-100 text-green-700'
          }`}
        >
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
      >
        {loading ? '저장 중...' : '프로필 저장'}
      </button>
    </form>
  );
}
