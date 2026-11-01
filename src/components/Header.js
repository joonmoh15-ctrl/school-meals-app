'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCurrentUser, logoutUser } from '@/lib/auth';
import ThemeToggle from '@/components/ThemeToggle';

export default function Header() {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
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

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    setMenuOpen(false);
    logoutUser();
    router.push('/');
  };

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

        {user ? (
          <div ref={menuRef} style={{ position: 'relative', flexShrink: 0 }}>
            {/* User Avatar Button (Dropdown trigger on mobile & desktop) */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              type="button"
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
                outline: 'none',
                fontFamily: 'inherit'
              }}
              title="계정 메뉴 열기"
              aria-label="계정 메뉴 열기"
            >
              <span style={{ 
                fontSize: '1.15rem', 
                width: '30px', 
                height: '30px', 
                borderRadius: '50%', 
                background: 'rgba(249, 115, 22, 0.1)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {user.avatar || '🧑‍🎓'}
              </span>
              <span style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--text-main)', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                <strong style={{ color: 'var(--primary-color)' }}>{user.name}</strong>님
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: '1px' }}>▾</span>
            </button>

            {/* Dropdown Menu */}
            {menuOpen && (
              <div 
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: '180px',
                  background: 'var(--card-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '16px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                  padding: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  zIndex: 200,
                  backdropFilter: 'blur(10px)'
                }}
              >
                <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-color)', marginBottom: '4px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>로그인된 계정</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.name}
                  </div>
                </div>

                <Link 
                  href="/profile" 
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    color: 'var(--text-main)',
                    textDecoration: 'none',
                    fontWeight: '500',
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <span>👤</span>
                  <span>내 프로필 관리</span>
                </Link>

                <button 
                  onClick={handleLogout}
                  type="button"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    color: 'var(--secondary-color)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left',
                    fontWeight: '500',
                    transition: 'background 0.15s',
                    fontFamily: 'inherit'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <span>🚪</span>
                  <span>로그아웃</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
            <Link href="/login" className="btn-secondary" style={{ fontSize: '0.85rem', padding: '6px 12px', textDecoration: 'none', whiteSpace: 'nowrap' }}>로그인</Link>
            <Link href="/signup" className="btn-primary" style={{ fontSize: '0.85rem', padding: '6px 12px', textDecoration: 'none', whiteSpace: 'nowrap' }}>회원가입</Link>
          </div>
        )}
        
        {/* Dark/Light Mode Theme Toggle */}
        <div style={{ flexShrink: 0 }}>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
