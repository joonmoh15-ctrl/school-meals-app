'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerUser } from '@/lib/auth';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleSignup = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!email || !name || !password || !confirmPassword) {
      setError('모든 항목을 입력해주세요.');
      return;
    }

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (password.length < 4) {
      setError('비밀번호는 최소 4자 이상이어야 합니다.');
      return;
    }

    const result = registerUser(email, password, name);
    if (result.success) {
      setSuccess('가입이 완료되었습니다! 로그인 페이지로 이동합니다...');
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } else {
      setError(result.message);
    }
  };

  return (
    <main className="layout-wrapper" style={{ justifyContent: 'center' }}>
      <div className="glass-container" style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>회원가입</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>오늘밥의 새로운 멤버가 되어주세요!</p>
        </div>

        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {error && (
            <div style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--secondary-color)', borderRadius: '8px', fontSize: '0.9rem', textAlign: 'center' }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ padding: '10px', background: 'rgba(34, 197, 94, 0.1)', color: '#15803d', borderRadius: '8px', fontSize: '0.9rem', textAlign: 'center' }}>
              {success}
            </div>
          )}
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-main)' }}>이름</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="홍길동"
              className="glass-input"
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-main)' }}>아이디 (또는 이메일)</label>
            <input 
              type="text" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="아이디 또는 이메일 입력"
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

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-main)' }}>비밀번호 확인</label>
            <input 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="비밀번호를 다시 입력하세요"
              className="glass-input"
              style={{ width: '100%' }}
            />
          </div>
          
          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={!!success}>
            가입하기
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          이미 계정이 있으신가요?{' '}
          <Link href="/login" style={{ color: 'var(--primary-color)', fontWeight: 'bold', textDecoration: 'none' }}>
            로그인하기
          </Link>
        </div>
      </div>
    </main>
  );
}
