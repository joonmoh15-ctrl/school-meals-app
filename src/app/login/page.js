'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginUser } from '@/lib/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('아이디와 비밀번호를 모두 입력해주세요.');
      return;
    }

    try {
      const result = loginUser(email, password);
      if (result.success) {
        router.push('/');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('로그인 처리 중 오류가 발생했습니다.');
    }
  };

  return (
    <main className="layout-wrapper" style={{ justifyContent: 'center' }}>
      <div className="glass-container" style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ background: 'var(--primary-color)', borderRadius: '24px', padding: '4px', display: 'inline-flex', marginBottom: '1rem' }}>
            <span style={{ fontSize: '2rem', background: '#fff', borderRadius: '20px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🍚</span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>오늘밥 로그인</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>환영합니다! 급식 정보를 확인하세요.</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {error && (
            <div style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--secondary-color)', borderRadius: '8px', fontSize: '0.9rem', textAlign: 'center' }}>
              {error}
            </div>
          )}
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-main)' }}>아이디 (또는 이메일)</label>
            <input 
              type="text" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="아이디 또는 이메일을 입력하세요"
              className="glass-input"
              style={{ width: '100%' }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-main)' }}>비밀번호</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              className="glass-input"
              style={{ width: '100%' }}
            />
          </div>
          
          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            로그인
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          계정이 없으신가요?{' '}
          <Link href="/signup" style={{ color: 'var(--primary-color)', fontWeight: 'bold', textDecoration: 'none' }}>
            회원가입하기
          </Link>
        </div>
      </div>
    </main>
  );
}
