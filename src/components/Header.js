'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getLocalProfile } from '@/lib/auth';
import ThemeToggle from '@/components/ThemeToggle';

export default function Header() {
  const [profile, setProfile] = useState({ name: '익명의 학생', avatar: '🧑‍🎓' });

  const loadProfile = () => {
    setProfile(getLocalProfile());
  };

  useEffect(() => {
    loadProfile();
    window.addEventListener('auth_change', loadProfile);
    window.addEventListener('storage', loadProfile);
    return () => {
      window.removeEventListener('auth_change', loadProfile);
      window.removeEventListener('storage', loadProfile);
    };
  }, []);

  return (
    <header className="app-header">
      <Link 
        href="/" 
        style={{ 
          textDecoration: 'none', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '6px', 
          fontWeight: '800', 
          fontSize: '1.2rem', 
          color: 'var(--primary-color)',
          whiteSpace: 'nowrap',
          flexShrink: 0
        }}
      >
        <span style={{ fontSize: '1.3rem' }}>🍚</span>
        <span style={{ letterSpacing: '-0.5px' }}>오늘밥</span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        {/* Community Board Link */}
        <Link 
          href="/board" 
          className="btn-secondary" 
          style={{ 
            textDecoration: 'none', 
            fontSize: '0.85rem', 
            padding: '6px 12px', 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '5px',
            background: 'var(--card-bg)',
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}
        >
          <span>💬</span>
          <span>게시판</span>
        </Link>

        {/* Profile & Favorites Direct Link */}
        <Link 
          href="/profile" 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '6px', 
            background: 'var(--card-bg)', 
            border: '1px solid var(--border-color)', 
            borderRadius: '9999px', 
            padding: '4px 10px 4px 5px', 
            cursor: 'pointer', 
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)', 
            whiteSpace: 'nowrap', 
            flexShrink: 0,
            textDecoration: 'none',
            color: 'inherit'
          }}
          title="내 프로필 및 찜한 목록 보기"
          aria-label="내 프로필 및 찜한 목록 보기"
        >
          <span style={{ 
            fontSize: '1.15rem', 
            width: '28px', 
            height: '28px', 
            borderRadius: '50%', 
            background: 'rgba(249, 115, 22, 0.1)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexShrink: 0
          }}>
            {profile.avatar || '🧑‍🎓'}
          </span>
          <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-main)', maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <span style={{ color: 'var(--primary-color)' }}>{profile.name || '내 프로필'}</span>
          </span>
        </Link>
        
        {/* Dark/Light Mode Theme Toggle */}
        <div style={{ flexShrink: 0 }}>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
