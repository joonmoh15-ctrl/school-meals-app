'use client';

import { useState, useEffect } from 'react';
import { getFavoriteMeals, saveFavoriteMeals } from '@/lib/userData';

export default function FavoriteMeals() {
  const [favorites, setFavorites] = useState([]);

  const loadFavorites = () => {
    setFavorites(getFavoriteMeals());
  };

  useEffect(() => {
    loadFavorites();

    window.addEventListener('meal_favorites_change', loadFavorites);
    window.addEventListener('auth_change', loadFavorites);
    window.addEventListener('storage', loadFavorites);

    return () => {
      window.removeEventListener('meal_favorites_change', loadFavorites);
      window.removeEventListener('auth_change', loadFavorites);
      window.removeEventListener('storage', loadFavorites);
    };
  }, []);

  const removeFavorite = (dishName, e) => {
    if (e) e.stopPropagation();
    const updated = favorites.filter((f) => f !== dishName);
    setFavorites(updated);
    saveFavoriteMeals(updated);
  };

  const clearAllFavorites = () => {
    if (window.confirm('하트 표시한 모든 급식 메뉴를 삭제하시겠습니까?')) {
      setFavorites([]);
      saveFavoriteMeals([]);
    }
  };

  return (
    <section 
      className="glass-container" 
      style={{ 
        width: '100%', 
        maxWidth: '640px', 
        margin: '2rem auto 0 auto', 
        border: '1px solid var(--border-color)',
        borderRadius: '24px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #f43f5e, #ec4899)',
            color: 'white',
            width: '36px',
            height: '36px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            boxShadow: '0 4px 12px rgba(244, 63, 94, 0.3)'
          }}>
            ❤️
          </div>
          <div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              내가 하트 표시한 급식 음식
              {favorites.length > 0 && (
                <span style={{ 
                  fontSize: '0.8rem', 
                  padding: '2px 8px', 
                  borderRadius: '9999px', 
                  background: 'rgba(244, 63, 94, 0.1)', 
                  color: '#e11d48',
                  fontWeight: '600'
                }}>
                  {favorites.length}개
                </span>
              )}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              급식 식단에서 하트(❤️)를 누른 메뉴 목록입니다
            </p>
          </div>
        </div>

        {favorites.length > 0 && (
          <button 
            onClick={clearAllFavorites}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-color)',
              color: 'var(--text-muted)',
              fontSize: '0.8rem',
              padding: '6px 12px',
              borderRadius: '9999px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--secondary-color)';
              e.currentTarget.style.borderColor = 'var(--secondary-color)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-muted)';
              e.currentTarget.style.borderColor = 'var(--border-color)';
            }}
          >
            전체 비우기
          </button>
        )}
      </div>

      {/* Content */}
      {favorites.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '2.5rem 1.5rem',
          background: 'rgba(255, 255, 255, 0.3)',
          borderRadius: '16px',
          border: '1px dashed var(--border-color)'
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🍲</div>
          <div style={{ fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.3rem', fontSize: '1.05rem' }}>
            아직 하트 표시한 음식이 없습니다
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            학교 급식 식단에서 좋아하는 메뉴 옆의 🤍 버튼을 눌러보세요!
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {favorites.map((dishName, idx) => (
            <div
              key={`${dishName}-${idx}`}
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.4))',
                border: '1px solid rgba(244, 63, 94, 0.25)',
                padding: '8px 14px',
                borderRadius: '9999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                color: 'var(--text-main)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                transition: 'all 0.2s ease',
                cursor: 'default'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(244, 63, 94, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
              }}
            >
              <span style={{ fontSize: '1.1rem' }}>❤️</span>
              <span>{dishName}</span>
              <button
                onClick={(e) => removeFavorite(dishName, e)}
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--secondary-color)',
                  fontSize: '1.1rem',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: '2px',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                }}
                title="찜 해제"
                aria-label={`${dishName} 찜 해제`}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
