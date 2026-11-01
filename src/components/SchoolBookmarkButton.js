'use client';

import { useState, useEffect } from 'react';
import { isSchoolFavorite, toggleFavoriteSchool } from '@/lib/userData';

export default function SchoolBookmarkButton({ officeCode, schoolCode, schoolName }) {
  const [isFav, setIsFav] = useState(false);

  const checkFavorite = () => {
    setIsFav(isSchoolFavorite(schoolCode));
  };

  useEffect(() => {
    checkFavorite();
    window.addEventListener('school_favorites_change', checkFavorite);
    window.addEventListener('auth_change', checkFavorite);
    window.addEventListener('storage', checkFavorite);

    return () => {
      window.removeEventListener('school_favorites_change', checkFavorite);
      window.removeEventListener('auth_change', checkFavorite);
      window.removeEventListener('storage', checkFavorite);
    };
  }, [schoolCode]);

  const handleToggle = () => {
    const nextState = toggleFavoriteSchool({ officeCode, schoolCode, schoolName });
    setIsFav(nextState);
  };

  return (
    <button
      onClick={handleToggle}
      style={{
        background: isFav ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'rgba(255, 255, 255, 0.6)',
        color: isFav ? '#ffffff' : 'var(--text-main)',
        border: isFav ? '1px solid #d97706' : '1px solid var(--border-color)',
        padding: '8px 18px',
        borderRadius: '9999px',
        fontSize: '0.95rem',
        fontWeight: '600',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        boxShadow: isFav ? '0 4px 14px rgba(245, 158, 11, 0.35)' : '0 2px 8px rgba(0,0,0,0.04)',
        transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
      }}
      title={isFav ? "즐겨찾기 해제" : "내 즐겨찾는 학교로 등록"}
    >
      <span style={{ fontSize: '1.2rem' }}>{isFav ? '⭐' : '☆'}</span>
      <span>{isFav ? '즐겨찾는 학교' : '즐겨찾기 추가'}</span>
    </button>
  );
}
