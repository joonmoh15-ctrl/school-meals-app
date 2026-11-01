'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { searchSchools } from '@/lib/neis';
import { getFavoriteSchools, toggleFavoriteSchool } from '@/lib/userData';

export default function SchoolSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [favoriteCodes, setFavoriteCodes] = useState([]);
  const router = useRouter();

  const loadFavorites = () => {
    const favs = getFavoriteSchools();
    setFavoriteCodes(favs.map((s) => s.schoolCode));
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

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    const schools = await searchSchools(query);
    setResults(schools || []);
    setLoading(false);
  };

  const handleSelect = (school) => {
    router.push(`/school?office=${school.officeCode}&code=${school.schoolCode}&name=${encodeURIComponent(school.schoolName)}`);
  };

  const handleToggleFavorite = (school, e) => {
    e.stopPropagation();
    toggleFavoriteSchool(school);
    loadFavorites();
  };

  return (
    <div className="glass-container" style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
      <p style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.1rem', color: 'var(--text-muted)' }}>
        학교 이름을 검색하여 급식 식단을 확인하고 즐겨찾기(⭐)에 등록하세요
      </p>
      
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="예: 서울고등학교" 
          className="glass-input"
        />
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? '검색 중...' : '검색'}
        </button>
      </form>

      {results.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0, marginTop: '20px' }}>
          {results.map((school, i) => {
            const isFav = favoriteCodes.includes(school.schoolCode);

            return (
              <li 
                key={`${school.schoolCode}-${i}`}
                onClick={() => handleSelect(school)}
                style={{
                  padding: '14px 18px',
                  borderBottom: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease, transform 0.15s',
                  borderRadius: '14px',
                  marginBottom: '8px',
                  background: 'rgba(255,255,255,0.3)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.6)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div>
                  <div style={{ fontWeight: '600', fontSize: '1.1rem', marginBottom: '4px', color: 'var(--text-main)' }}>
                    {school.schoolName}
                  </div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                    {school.address}
                  </div>
                </div>

                <button
                  onClick={(e) => handleToggleFavorite(school, e)}
                  style={{
                    background: isFav ? 'rgba(249, 115, 22, 0.15)' : 'rgba(0, 0, 0, 0.04)',
                    border: isFav ? '1px solid var(--primary-light)' : '1px solid var(--border-color)',
                    color: isFav ? '#f59e0b' : 'var(--text-muted)',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.3rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    flexShrink: 0
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  title={isFav ? "즐겨찾기 해제" : "즐겨찾는 학교로 추가"}
                  aria-label={isFav ? `${school.schoolName} 즐겨찾기 해제` : `${school.schoolName} 즐겨찾기 추가`}
                >
                  {isFav ? '⭐' : '☆'}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
