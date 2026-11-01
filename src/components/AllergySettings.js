'use client';
import { useState, useEffect } from 'react';
import { ALLERGY_MAP } from '@/lib/allergy';
import { getMyAllergies, saveMyAllergies } from '@/lib/userData';

export default function AllergySettings() {
  const [isOpen, setIsOpen] = useState(false);
  const [myAllergies, setMyAllergies] = useState([]);

  const loadAllergies = () => {
    setMyAllergies(getMyAllergies());
  };

  useEffect(() => {
    loadAllergies();

    window.addEventListener('allergy_change', loadAllergies);
    window.addEventListener('auth_change', loadAllergies);
    window.addEventListener('storage', loadAllergies);

    return () => {
      window.removeEventListener('allergy_change', loadAllergies);
      window.removeEventListener('auth_change', loadAllergies);
      window.removeEventListener('storage', loadAllergies);
    };
  }, []);

  const toggleAllergy = (code) => {
    let updated;
    if (myAllergies.includes(code)) {
      updated = myAllergies.filter(c => c !== code);
    } else {
      updated = [...myAllergies, code];
    }
    setMyAllergies(updated);
    saveMyAllergies(updated);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          background: 'rgba(239, 68, 68, 0.1)',
          color: 'var(--secondary-color)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          padding: '8px 16px',
          borderRadius: '9999px',
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.95rem'
        }}
      >
        ⚠️ 알레르기 설정
      </button>

      {isOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div className="glass-container" style={{ width: '90%', maxWidth: '500px', maxHeight: '80vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-main)' }}>내 알레르기 정보 설정</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
              체크한 알레르기 식품이 급식 메뉴에 포함되어 있으면 빨간색으로 경고해 드립니다.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px', marginBottom: '2rem' }}>
              {Object.entries(ALLERGY_MAP).map(([code, name]) => {
                const numCode = parseInt(code, 10);
                const isSelected = myAllergies.includes(numCode);
                return (
                  <label key={code} style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px', borderRadius: '8px',
                    background: isSelected ? 'rgba(249, 115, 22, 0.1)' : 'transparent',
                    border: isSelected ? '1px solid var(--primary-color)' : '1px solid var(--border-color)',
                    cursor: 'pointer', fontSize: '0.95rem'
                  }}>
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      onChange={() => toggleAllergy(numCode)}
                      style={{ accentColor: 'var(--primary-color)' }}
                    />
                    {name}
                  </label>
                );
              })}
            </div>
            
            <button className="btn-primary" style={{ width: '100%' }} onClick={() => setIsOpen(false)}>
              완료
            </button>
          </div>
        </div>
      )}
    </>
  );
}
