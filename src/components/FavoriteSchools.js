'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getFavoriteSchools, saveFavoriteSchools } from '@/lib/userData';

export default function FavoriteSchools() {
  const [favorites, setFavorites] = useState([]);
  const router = useRouter();

  const loadFavorites = () => {
    setFavorites(getFavoriteSchools());
  };

  useEffect(() => {
    loadFavorites();
    
    window.addEventListener('school_favorites_change', loadFavorites);
    window.addEventListener('auth_change', loadFavorites);
    window.addEventListener('storage', loadFavorites);

    return () => {
      window.removeEventListener('school_favorites_change', loadFavorites);
      window.removeEventListener('auth_change', loadFavorites);
      window.removeEventListener('storage', loadFavorites);
    };
  }, []);

  const removeFavorite = (schoolCode, e) => {
    e.stopPropagation();
    const newFavs = favorites.filter(f => f.schoolCode !== schoolCode);
    setFavorites(newFavs);
    saveFavoriteSchools(newFavs);
  };

  const handleSelect = (school) => {
    router.push(`/school?office=${school.officeCode}&code=${school.schoolCode}&name=${encodeURIComponent(school.schoolName)}`);
  };

  if (favorites.length === 0) return null;

  return (
    <div className="glass-container" style={{ width: '100%', maxWidth: '600px', margin: '2rem auto 0 auto' }}>
      <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
        ⭐ 즐겨찾는 학교
      </h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
        {favorites.map((fav, i) => (
          <div 
            key={fav.schoolCode || i} 
            onClick={() => handleSelect(fav)}
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.6), rgba(255,255,255,0.2))',
              border: '1px solid var(--primary-light)',
              padding: '10px 16px',
              borderRadius: '9999px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '1.1rem',
              fontWeight: '500',
              boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
              cursor: 'pointer',
              transition: 'transform 0.2s, background 0.2s'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.background = 'rgba(255,255,255,0.8)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.6), rgba(255,255,255,0.2))';
            }}
          >
            <span>🏫 {fav.schoolName}</span>
            <button 
              onClick={(e) => removeFavorite(fav.schoolCode, e)}
              style={{
                background: 'rgba(239, 68, 68, 0.1)', border: 'none', cursor: 'pointer',
                color: 'var(--secondary-color)', fontSize: '1.2rem',
                width: '28px', height: '28px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
              title="삭제"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
