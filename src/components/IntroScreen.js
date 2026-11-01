'use client';

import { useState, useEffect } from 'react';

export default function IntroScreen() {
  const [show, setShow] = useState(true);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    // Check if intro has been shown in this session
    const hasShown = sessionStorage.getItem('intro_shown');
    if (hasShown) {
      setShow(false);
      return;
    }

    // Trigger fade out after 2 seconds
    const fadeTimer = setTimeout(() => {
      setFade(true);
    }, 2000);

    // Unmount after 2.5 seconds (allowing 0.5s for fade transition)
    const hideTimer = setTimeout(() => {
      setShow(false);
      sessionStorage.setItem('intro_shown', 'true');
    }, 2500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!show) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'var(--card-bg)', // match the new theme
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      opacity: fade ? 0 : 1,
      transition: 'opacity 0.5s ease-out'
    }}>
      <div style={{
        background: 'var(--primary-color)', 
        borderRadius: '32px', 
        padding: '8px', 
        marginBottom: '20px',
        animation: 'slideUp 0.6s ease-out'
      }}>
        <span style={{ 
          fontSize: '4rem', 
          background: '#fff', 
          borderRadius: '24px', 
          width: '80px', 
          height: '80px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>🍚</span>
      </div>
      <h1 style={{
        fontSize: '3.5rem',
        fontWeight: 'bold',
        marginBottom: '1rem',
        color: 'var(--primary-color)',
        textShadow: '0 4px 10px rgba(249,115,22,0.1)',
        animation: 'slideUp 0.8s ease-out'
      }}>
        오늘밥
      </h1>
      <p style={{
        fontSize: '1.2rem',
        color: 'var(--text-main)',
        fontWeight: '500',
        opacity: 0.8,
        animation: 'slideUp 1s ease-out'
      }}>
        전국 학교의 급식 식단을 쉽고 빠르게 확인하세요.
      </p>

      <style jsx>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @media (prefers-color-scheme: dark) {
          div {
            background: linear-gradient(-45deg, #1e1b4b, #312e81, #0f172a, #172554) !important;
          }
          p {
            color: #f8fafc !important;
          }
        }
      `}</style>
    </div>
  );
}
