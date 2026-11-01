'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCurrentUser, logoutUser } from '@/lib/auth';
import ThemeToggle from '@/components/ThemeToggle';

export default function Header() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  const loadUser = () => {
    setUser(getCurrentUser());
  };

  useEffect(() => {
    loadUser();
    
    // Listen for custom auth events
    window.addEventListener('auth_change', loadUser);
    
    // Fallback for multi-tab
    window.addEventListener('storage', (e) => {
      if (e.key === 'current_user') {
        loadUser();
      }
    });

    return () => {
      window.removeEventListener('auth_change', loadUser);
      window.removeEventListener('storage', loadUser);
    };
  }, []);

  const handleLogout = () => {
    logoutUser();
    router.push('/');
  };

  return (
    <header style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '0.8rem 2rem', 
      position: 'absolute',
      top: 0, right: 0, left: 0,
      zIndex: 100
    }}>
      <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '1.25rem', color: 'var(--primary-color)' }}>
        <span>🍚</span> <span>오늘밥</span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Link 
          href="/board" 
          className="btn-secondary" 
          style={{ 
            textDecoration: 'none', 
            fontSize: '0.88rem', 
            padding: '6px 14px', 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '6px',
            background: 'var(--card-bg)'
          }}
        >
          <span>💬</span>
          <span>급식 게시판</span>
        </Link>

        {user ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--card-bg)', padding: '6px 12px 6px 16px', borderRadius: '9999px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid var(--border-color)' }}>
          <Link 
            href="/profile" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              textDecoration: 'none', 
              color: 'inherit',
              transition: 'opacity 0.2s'
            }}
            title="프로필 페이지로 이동"
          >
            <span style={{ 
              fontSize: '1.25rem', 
              width: '32px', 
              height: '32px', 
              borderRadius: '50%', 
              background: 'rgba(249, 115, 22, 0.1)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              {user.avatar || '🧑‍🎓'}
            </span>
            <span style={{ fontSize: '0.95rem', fontWeight: '500' }}>
              <strong style={{ color: 'var(--primary-color)' }}>{user.name}</strong>님
            </span>
          </Link>
          <div style={{ width: '1px', height: '18px', background: 'var(--border-color)' }}></div>
          <Link href="/profile" className="btn-secondary" style={{ fontSize: '0.82rem', padding: '5px 10px', textDecoration: 'none' }}>
            프로필
          </Link>
          <button onClick={handleLogout} className="btn-secondary" style={{ fontSize: '0.82rem', padding: '5px 10px' }}>
            로그아웃
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link href="/login" className="btn-secondary" style={{ fontSize: '0.9rem', padding: '8px 16px', textDecoration: 'none' }}>로그인</Link>
          <Link href="/signup" className="btn-primary" style={{ fontSize: '0.9rem', padding: '8px 16px', textDecoration: 'none' }}>회원가입</Link>
        </div>
      )}
      
      {/* Moved ThemeToggle into header flow instead of fixed absolute to avoid overlap */}
        <div style={{ position: 'relative', top: 'auto', right: 'auto' }}>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
