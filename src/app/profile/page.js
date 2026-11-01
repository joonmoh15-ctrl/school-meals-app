'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  getLocalProfile, 
  updateUserProfile, 
  getUserActivitySummary 
} from '@/lib/auth';
import { 
  getFavoriteSchools, 
  saveFavoriteSchools, 
  getFavoriteMeals, 
  saveFavoriteMeals, 
  getUserReviews,
  deleteMealReview
} from '@/lib/userData';

const AVATAR_OPTIONS = [
  '🧑‍🎓', '👩‍🎓', '🧑‍🍳', '🍱', '🍙', '🍛', 
  '🍕', '🥗', '🥞', '🥐', '🐱', '🐶', 
  '🦊', '🐻', '🌟', '⚡'
];

export default function ProfilePage() {
  const [profile, setProfile] = useState({ name: '익명의 학생', avatar: '🧑‍🎓', schoolInfo: '', bio: '' });
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'favorites' | 'reviews'
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('🧑‍🎓');
  const [schoolInfo, setSchoolInfo] = useState('');
  const [bio, setBio] = useState('');

  // Status message
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });

  // Activity data
  const [stats, setStats] = useState({ schoolsCount: 0, mealsCount: 0, allergiesCount: 0, reviewsCount: 0 });
  const [favSchools, setFavSchools] = useState([]);
  const [favMeals, setFavMeals] = useState([]);
  const [userReviews, setUserReviews] = useState([]);

  // Load profile data
  const loadProfileData = () => {
    const cur = getLocalProfile();
    setProfile(cur);
    setName(cur.name || '익명의 학생');
    setAvatar(cur.avatar || '🧑‍🎓');
    setSchoolInfo(cur.schoolInfo || '');
    setBio(cur.bio || '');

    // Load statistics & lists
    setStats(getUserActivitySummary());
    setFavSchools(getFavoriteSchools());
    setFavMeals(getFavoriteMeals());
    setUserReviews(getUserReviews());
  };

  useEffect(() => {
    loadProfileData();

    const handleDataChange = () => loadProfileData();
    window.addEventListener('auth_change', handleDataChange);
    window.addEventListener('school_favorites_change', handleDataChange);
    window.addEventListener('meal_favorites_change', handleDataChange);
    window.addEventListener('review_change', handleDataChange);
    window.addEventListener('allergy_change', handleDataChange);
    window.addEventListener('storage', handleDataChange);

    return () => {
      window.removeEventListener('auth_change', handleDataChange);
      window.removeEventListener('school_favorites_change', handleDataChange);
      window.removeEventListener('meal_favorites_change', handleDataChange);
      window.removeEventListener('review_change', handleDataChange);
      window.removeEventListener('allergy_change', handleDataChange);
      window.removeEventListener('storage', handleDataChange);
    };
  }, []);

  // Save profile changes
  const handleSaveProfile = (e) => {
    e.preventDefault();
    setProfileMsg({ type: '', text: '' });

    if (!name.trim()) {
      setProfileMsg({ type: 'error', text: '닉네임을 입력해주세요.' });
      return;
    }

    const res = updateUserProfile({ name, avatar, schoolInfo, bio });
    if (res.success) {
      setProfileMsg({ type: 'success', text: res.message });
      setTimeout(() => setProfileMsg({ type: '', text: '' }), 3000);
    } else {
      setProfileMsg({ type: 'error', text: res.message });
    }
  };

  // Remove a favorite school
  const removeSchool = (code) => {
    const updated = favSchools.filter((s) => s.schoolCode !== code);
    setFavSchools(updated);
    saveFavoriteSchools(updated);
    setStats((prev) => ({ ...prev, schoolsCount: updated.length }));
  };

  // Remove a favorite meal
  const removeMeal = (dishName) => {
    const updated = favMeals.filter((m) => m !== dishName);
    setFavMeals(updated);
    saveFavoriteMeals(updated);
    setStats((prev) => ({ ...prev, mealsCount: updated.length }));
  };

  // Delete a review
  const deleteReview = (rev) => {
    if (window.confirm('작성하신 리뷰를 삭제하시겠습니까?')) {
      deleteMealReview(rev.schoolCode, rev.date, rev.mealType, rev.id);
      const updated = userReviews.filter((r) => r.id !== rev.id);
      setUserReviews(updated);
      setStats((prev) => ({ ...prev, reviewsCount: updated.length }));
    }
  };

  // Format date helper
  const formatDate = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
  };

  return (
    <main className="layout-wrapper" style={{ maxWidth: '850px', paddingTop: '5.2rem' }}>
      
      {/* Back button */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '8px' }}>
        <Link 
          href="/" 
          className="btn-secondary" 
          style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', padding: '0.5rem 1.1rem' }}
        >
          &larr; 홈으로 돌아가기
        </Link>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          🔒 개인정보 수집 없는 안전한 로컬 보관함
        </span>
      </div>

      {/* Hero Profile Banner */}
      <div 
        className="glass-container" 
        style={{ 
          width: '100%', 
          marginBottom: '2rem', 
          padding: '1.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.08), rgba(244, 63, 94, 0.05))',
          flexWrap: 'wrap'
        }}
      >
        <div style={{
          fontSize: '3rem',
          width: '76px',
          height: '76px',
          borderRadius: '50%',
          background: 'var(--card-bg)',
          border: '3px solid var(--primary-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(249, 115, 22, 0.2)',
          flexShrink: 0
        }}>
          {avatar}
        </div>

        <div style={{ flex: 1, minWidth: '200px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 'bold', color: 'var(--text-main)', margin: 0 }}>
              {name || profile.name}
            </h1>
            <span style={{ 
              fontSize: '0.75rem', 
              background: 'rgba(34, 197, 94, 0.12)', 
              color: '#16a34a', 
              padding: '2px 10px', 
              borderRadius: '9999px',
              fontWeight: '600'
            }}>
              안전한 비회원 모드
            </span>
          </div>
          
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>🏫 {schoolInfo || '소속 학교 미설정'}</span>
          </p>
          {bio && (
            <p style={{ color: 'var(--text-main)', fontSize: '0.88rem', marginTop: '4px', fontStyle: 'italic', opacity: 0.9 }}>
              &ldquo;{bio}&rdquo;
            </p>
          )}
        </div>
      </div>

      {/* Summary Stats Grid */}
      <div style={{ 
        width: '100%', 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', 
        gap: '10px', 
        marginBottom: '2rem' 
      }}>
        <div 
          onClick={() => setActiveTab('favorites')}
          className="glass-container" 
          style={{ padding: '1rem', textAlign: 'center', cursor: 'pointer', transition: 'transform 0.2s' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ fontSize: '1.6rem', marginBottom: '3px' }}>⭐</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>{stats.schoolsCount}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>즐겨찾는 학교</div>
        </div>

        <div 
          onClick={() => setActiveTab('favorites')}
          className="glass-container" 
          style={{ padding: '1rem', textAlign: 'center', cursor: 'pointer', transition: 'transform 0.2s' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ fontSize: '1.6rem', marginBottom: '3px' }}>❤️</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#e11d48' }}>{stats.mealsCount}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>찜한 급식 음식</div>
        </div>

        <div 
          onClick={() => setActiveTab('reviews')}
          className="glass-container" 
          style={{ padding: '1rem', textAlign: 'center', cursor: 'pointer', transition: 'transform 0.2s' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ fontSize: '1.6rem', marginBottom: '3px' }}>✍️</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{stats.reviewsCount}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>작성한 리뷰</div>
        </div>

        <div 
          className="glass-container" 
          style={{ padding: '1rem', textAlign: 'center' }}
        >
          <div style={{ fontSize: '1.6rem', marginBottom: '3px' }}>⚠️</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--secondary-color)' }}>{stats.allergiesCount}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>관심 알레르기</div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        width: '100%', 
        borderBottom: '1px solid var(--border-color)', 
        paddingBottom: '12px',
        marginBottom: '1.5rem',
        overflowX: 'auto'
      }}>
        <button
          onClick={() => setActiveTab('profile')}
          style={{
            background: activeTab === 'profile' ? 'var(--primary-color)' : 'transparent',
            color: activeTab === 'profile' ? 'white' : 'var(--text-main)',
            border: 'none',
            padding: '7px 16px',
            borderRadius: '9999px',
            fontWeight: '600',
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap'
          }}
        >
          👤 닉네임 & 프로필 설정
        </button>

        <button
          onClick={() => setActiveTab('favorites')}
          style={{
            background: activeTab === 'favorites' ? 'var(--primary-color)' : 'transparent',
            color: activeTab === 'favorites' ? 'white' : 'var(--text-main)',
            border: 'none',
            padding: '7px 16px',
            borderRadius: '9999px',
            fontWeight: '600',
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap'
          }}
        >
          ⭐ 즐겨찾기 & 찜 관리
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          style={{
            background: activeTab === 'reviews' ? 'var(--primary-color)' : 'transparent',
            color: activeTab === 'reviews' ? 'white' : 'var(--text-main)',
            border: 'none',
            padding: '7px 16px',
            borderRadius: '9999px',
            fontWeight: '600',
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap'
          }}
        >
          ✍️ 내 리뷰 내역 ({stats.reviewsCount})
        </button>
      </div>

      {/* Tab 1: Profile Edit */}
      {activeTab === 'profile' && (
        <div className="glass-container" style={{ width: '100%' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.2rem', color: 'var(--text-main)' }}>
            내 닉네임 및 캐릭터 설정
          </h2>

          {profileMsg.text && (
            <div style={{
              padding: '10px 16px',
              borderRadius: '8px',
              marginBottom: '1.2rem',
              fontSize: '0.9rem',
              textAlign: 'center',
              background: profileMsg.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: profileMsg.type === 'success' ? '#15803d' : 'var(--secondary-color)',
              fontWeight: '500'
            }}>
              {profileMsg.text}
            </div>
          )}

          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            
            {/* Avatar Selector */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: '600', fontSize: '0.9rem' }}>
                캐릭터 아바타 선택
              </label>
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '8px', 
                padding: '10px', 
                background: 'rgba(0,0,0,0.03)', 
                borderRadius: '16px' 
              }}>
                {AVATAR_OPTIONS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setAvatar(item)}
                    style={{
                      fontSize: '1.6rem',
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      border: avatar === item ? '2px solid var(--primary-color)' : '1px solid transparent',
                      background: avatar === item ? 'rgba(249, 115, 22, 0.15)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'transform 0.15s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Nickname */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.9rem' }}>
                닉네임
              </label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="게시판과 리뷰에 표시될 닉네임" 
                className="glass-input" 
                required 
              />
            </div>

            {/* School Name */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.9rem' }}>
                나의 학교 이름 (선택)
              </label>
              <input 
                type="text" 
                value={schoolInfo} 
                onChange={(e) => setSchoolInfo(e.target.value)} 
                placeholder="예: 서울고등학교" 
                className="glass-input" 
              />
            </div>

            {/* Bio */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.9rem' }}>
                한 줄 소개 (선택)
              </label>
              <input 
                type="text" 
                value={bio} 
                onChange={(e) => setBio(e.target.value)} 
                placeholder="예: 맛있는 돈가스가 나오는 날이 가장 좋아요!" 
                className="glass-input" 
              />
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem', width: '100%', padding: '0.85rem' }}>
              프로필 설정 저장
            </button>
          </form>
        </div>
      )}

      {/* Tab 2: Favorites Management */}
      {activeTab === 'favorites' && (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Favorite Schools */}
          <div className="glass-container">
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ⭐ 즐겨찾는 학교 ({favSchools.length})
            </h3>
            {favSchools.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>아직 즐겨찾기에 등록된 학교가 없습니다. 홈 화면에서 학교를 검색하고 별표(⭐)를 눌러보세요!</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {favSchools.map((s) => (
                  <div 
                    key={s.schoolCode} 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      padding: '12px 16px', 
                      background: 'rgba(255, 255, 255, 0.4)', 
                      borderRadius: '12px',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    <div>
                      <Link 
                        href={`/school?office=${s.officeCode}&code=${s.schoolCode}&name=${encodeURIComponent(s.schoolName)}`}
                        style={{ fontWeight: '600', color: 'var(--text-main)', textDecoration: 'none', fontSize: '1.05rem' }}
                      >
                        {s.schoolName}
                      </Link>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.address}</div>
                    </div>
                    <button 
                      onClick={() => removeSchool(s.schoolCode)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--secondary-color)', fontSize: '0.85rem', cursor: 'pointer', padding: '4px 8px' }}
                    >
                      해제
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Favorite Meals */}
          <div className="glass-container">
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1rem', color: '#e11d48', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ❤️ 찜한 급식 메뉴 ({favMeals.length})
            </h3>
            {favMeals.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>아직 찜한 급식 메뉴가 없습니다. 식단표에서 하트(❤️) 버튼을 눌러보세요!</p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {favMeals.map((dish) => (
                  <div 
                    key={dish}
                    style={{ 
                      background: 'rgba(244, 63, 94, 0.1)', 
                      border: '1px solid rgba(244, 63, 94, 0.3)', 
                      color: '#e11d48', 
                      padding: '6px 12px', 
                      borderRadius: '9999px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.9rem',
                      fontWeight: '600'
                    }}
                  >
                    <span>{dish}</span>
                    <button 
                      onClick={() => removeMeal(dish)} 
                      style={{ background: 'none', border: 'none', color: '#e11d48', cursor: 'pointer', fontSize: '1rem', lineHeight: '1' }}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* Tab 3: Reviews List */}
      {activeTab === 'reviews' && (
        <div className="glass-container" style={{ width: '100%' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.2rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ✍️ 내가 남긴 급식 한줄평 ({userReviews.length})
          </h2>

          {userReviews.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '2rem 0' }}>
              아직 작성하신 급식 한줄평이 없습니다. 식단표 페이지에서 맛있는 급식 리뷰를 남겨보세요!
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {userReviews.map((rev, idx) => (
                <div 
                  key={rev.id || idx}
                  style={{ 
                    padding: '14px', 
                    borderRadius: '12px', 
                    background: 'rgba(255, 255, 255, 0.4)', 
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--primary-color)' }}>
                        {rev.date} {rev.mealType || '중식'}
                      </span>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star} style={{ color: star <= rev.rating ? '#fbbf24' : '#d1d5db', fontSize: '0.95rem' }}>
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteReview(rev)}
                      style={{
                        background: 'transparent',
                        border: '1px solid var(--border-color)',
                        color: 'var(--secondary-color)',
                        padding: '3px 10px',
                        borderRadius: '9999px',
                        fontSize: '0.78rem',
                        cursor: 'pointer'
                      }}
                    >
                      삭제
                    </button>
                  </div>

                  {rev.comment ? (
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)', background: 'rgba(0,0,0,0.02)', padding: '8px 10px', borderRadius: '8px' }}>
                      {rev.comment}
                    </p>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>작성된 한줄평 내용이 없습니다.</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </main>
  );
}
