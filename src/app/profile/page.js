'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  getCurrentUser, 
  updateUserProfile, 
  changePassword, 
  getUserActivitySummary, 
  logoutUser 
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
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'favorites' | 'reviews' | 'security'
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('🧑‍🎓');
  const [schoolInfo, setSchoolInfo] = useState('');
  const [bio, setBio] = useState('');

  // Password change states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status messages
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [pwMsg, setPwMsg] = useState({ type: '', text: '' });

  // Activity data
  const [stats, setStats] = useState({ schoolsCount: 0, mealsCount: 0, allergiesCount: 0, reviewsCount: 0 });
  const [favSchools, setFavSchools] = useState([]);
  const [favMeals, setFavMeals] = useState([]);
  const [userReviews, setUserReviews] = useState([]);

  const router = useRouter();

  // Load user data
  const loadUserData = () => {
    const cur = getCurrentUser();
    if (!cur) {
      setUser(null);
      return;
    }
    setUser(cur);
    setName(cur.name || '');
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
    loadUserData();

    const handleAuth = () => loadUserData();
    window.addEventListener('auth_change', handleAuth);
    window.addEventListener('school_favorites_change', handleAuth);
    window.addEventListener('meal_favorites_change', handleAuth);
    window.addEventListener('review_change', handleAuth);
    window.addEventListener('allergy_change', handleAuth);
    window.addEventListener('storage', handleAuth);

    return () => {
      window.removeEventListener('auth_change', handleAuth);
      window.removeEventListener('school_favorites_change', handleAuth);
      window.removeEventListener('meal_favorites_change', handleAuth);
      window.removeEventListener('review_change', handleAuth);
      window.removeEventListener('allergy_change', handleAuth);
      window.removeEventListener('storage', handleAuth);
    };
  }, []);

  // Save profile changes
  const handleSaveProfile = (e) => {
    e.preventDefault();
    setProfileMsg({ type: '', text: '' });

    if (!name.trim()) {
      setProfileMsg({ type: 'error', text: '이름(닉네임)을 입력해주세요.' });
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

  // Change password
  const handleChangePassword = (e) => {
    e.preventDefault();
    setPwMsg({ type: '', text: '' });

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPwMsg({ type: 'error', text: '모든 비밀번호 항목을 입력해주세요.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwMsg({ type: 'error', text: '새 비밀번호와 확인이 일치하지 않습니다.' });
      return;
    }

    if (newPassword.length < 4) {
      setPwMsg({ type: 'error', text: '새 비밀번호는 4자 이상이어야 합니다.' });
      return;
    }

    const res = changePassword(oldPassword, newPassword);
    if (res.success) {
      setPwMsg({ type: 'success', text: res.message });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPwMsg({ type: '', text: '' }), 3000);
    } else {
      setPwMsg({ type: 'error', text: res.message });
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
      if (rev.key) localStorage.removeItem(rev.key);
      const updated = userReviews.filter((r) => (r.id ? r.id !== rev.id : r.key !== rev.key));
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

  if (!user) {
    return (
      <main className="layout-wrapper" style={{ justifyContent: 'center' }}>
        <div className="glass-container" style={{ width: '100%', maxWidth: '440px', textAlign: 'center', padding: '3rem 2rem' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🔒</div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 'bold', marginBottom: '0.8rem', color: 'var(--text-main)' }}>
            로그인이 필요합니다
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.95rem', lineHeight: '1.5' }}>
            내 프로필과 활동 통계, 찜한 급식 메뉴를 관리하려면 먼저 로그인해주세요.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <Link href="/login" className="btn-primary" style={{ textDecoration: 'none', padding: '0.8rem 1.8rem' }}>
              로그인하기
            </Link>
            <Link href="/signup" className="btn-secondary" style={{ textDecoration: 'none', padding: '0.8rem 1.8rem' }}>
              회원가입
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="layout-wrapper" style={{ maxWidth: '850px', paddingTop: '5.5rem' }}>
      
      {/* Back button */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <Link 
          href="/" 
          className="btn-secondary" 
          style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem', padding: '0.5rem 1.2rem' }}
        >
          &larr; 홈으로 돌아가기
        </Link>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          가입일: {formatDate(user.createdAt)}
        </span>
      </div>

      {/* Hero Profile Banner */}
      <div 
        className="glass-container" 
        style={{ 
          width: '100%', 
          marginBottom: '2rem', 
          padding: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.08), rgba(244, 63, 94, 0.05))',
          flexWrap: 'wrap'
        }}
      >
        <div style={{
          fontSize: '3.5rem',
          width: '84px',
          height: '84px',
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

        <div style={{ flex: 1, minWidth: '220px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-main)', margin: 0 }}>
              {name || user.name}
            </h1>
            <span style={{ 
              fontSize: '0.8rem', 
              background: 'rgba(249, 115, 22, 0.15)', 
              color: 'var(--primary-color)', 
              padding: '2px 10px', 
              borderRadius: '9999px',
              fontWeight: '600'
            }}>
              @{user.email}
            </span>
          </div>
          
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: '6px 0 0 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>🏫 {schoolInfo || '소속 학교 미설정'}</span>
          </p>
          {bio && (
            <p style={{ color: 'var(--text-main)', fontSize: '0.9rem', marginTop: '6px', fontStyle: 'italic', opacity: 0.9 }}>
              &ldquo;{bio}&rdquo;
            </p>
          )}
        </div>
      </div>

      {/* Summary Stats Grid */}
      <div style={{ 
        width: '100%', 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', 
        gap: '12px', 
        marginBottom: '2rem' 
      }}>
        <div 
          onClick={() => setActiveTab('favorites')}
          className="glass-container" 
          style={{ padding: '1.2rem', textAlign: 'center', cursor: 'pointer', transition: 'transform 0.2s' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ fontSize: '1.8rem', marginBottom: '4px' }}>⭐</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>{stats.schoolsCount}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>즐겨찾는 학교</div>
        </div>

        <div 
          onClick={() => setActiveTab('favorites')}
          className="glass-container" 
          style={{ padding: '1.2rem', textAlign: 'center', cursor: 'pointer', transition: 'transform 0.2s' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ fontSize: '1.8rem', marginBottom: '4px' }}>❤️</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#e11d48' }}>{stats.mealsCount}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>찜한 급식 음식</div>
        </div>

        <div 
          onClick={() => setActiveTab('reviews')}
          className="glass-container" 
          style={{ padding: '1.2rem', textAlign: 'center', cursor: 'pointer', transition: 'transform 0.2s' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ fontSize: '1.8rem', marginBottom: '4px' }}>✍️</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{stats.reviewsCount}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>작성한 리뷰</div>
        </div>

        <div 
          className="glass-container" 
          style={{ padding: '1.2rem', textAlign: 'center' }}
        >
          <div style={{ fontSize: '1.8rem', marginBottom: '4px' }}>⚠️</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--secondary-color)' }}>{stats.allergiesCount}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>관심 알레르기</div>
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
            padding: '8px 18px',
            borderRadius: '9999px',
            fontWeight: '600',
            fontSize: '0.95rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap'
          }}
        >
          👤 프로필 편집
        </button>

        <button
          onClick={() => setActiveTab('favorites')}
          style={{
            background: activeTab === 'favorites' ? 'var(--primary-color)' : 'transparent',
            color: activeTab === 'favorites' ? 'white' : 'var(--text-main)',
            border: 'none',
            padding: '8px 18px',
            borderRadius: '9999px',
            fontWeight: '600',
            fontSize: '0.95rem',
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
            padding: '8px 18px',
            borderRadius: '9999px',
            fontWeight: '600',
            fontSize: '0.95rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap'
          }}
        >
          ✍️ 내 리뷰 내역 ({stats.reviewsCount})
        </button>

        <button
          onClick={() => setActiveTab('security')}
          style={{
            background: activeTab === 'security' ? 'var(--primary-color)' : 'transparent',
            color: activeTab === 'security' ? 'white' : 'var(--text-main)',
            border: 'none',
            padding: '8px 18px',
            borderRadius: '9999px',
            fontWeight: '600',
            fontSize: '0.95rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap'
          }}
        >
          🔒 비밀번호 변경
        </button>
      </div>

      {/* Tab 1: Profile Edit */}
      {activeTab === 'profile' && (
        <div className="glass-container" style={{ width: '100%', padding: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '1.2rem', color: 'var(--text-main)' }}>
            내 정보 수정
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
              <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: '600', fontSize: '0.95rem' }}>
                프로필 캐릭터 (아바타)
              </label>
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '8px', 
                padding: '12px', 
                background: 'rgba(0,0,0,0.03)', 
                borderRadius: '16px' 
              }}>
                {AVATAR_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setAvatar(emoji)}
                    style={{
                      fontSize: '1.5rem',
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      border: avatar === emoji ? '2px solid var(--primary-color)' : '1px solid transparent',
                      background: avatar === emoji ? 'rgba(249, 115, 22, 0.15)' : 'var(--card-bg)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'transform 0.15s, background 0.15s',
                      transform: avatar === emoji ? 'scale(1.1)' : 'scale(1)'
                    }}
                    onMouseEnter={(e) => {
                      if (avatar !== emoji) e.currentTarget.style.transform = 'scale(1.08)';
                    }}
                    onMouseLeave={(e) => {
                      if (avatar !== emoji) e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Readonly ID */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.95rem' }}>
                아이디 (이메일)
              </label>
              <input 
                type="text" 
                value={user.email} 
                disabled 
                className="glass-input" 
                style={{ opacity: 0.7, cursor: 'not-allowed', background: 'rgba(0,0,0,0.05)' }} 
              />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                * 아이디는 변경할 수 없습니다.
              </span>
            </div>

            {/* Name */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.95rem' }}>
                이름 (닉네임)
              </label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="이름을 입력하세요" 
                className="glass-input" 
                required 
              />
            </div>

            {/* School / Class Info */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.95rem' }}>
                내 학교 및 학년/반 (선택)
              </label>
              <input 
                type="text" 
                value={schoolInfo} 
                onChange={(e) => setSchoolInfo(e.target.value)} 
                placeholder="예: 율하초등학교 4학년 2반" 
                className="glass-input" 
              />
            </div>

            {/* Bio */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.95rem' }}>
                한 줄 소개 (선택)
              </label>
              <input 
                type="text" 
                value={bio} 
                onChange={(e) => setBio(e.target.value)} 
                placeholder="예: 급식 메뉴 확인하는 걸 가장 좋아하는 학생입니다!" 
                className="glass-input" 
              />
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem', width: '100%', padding: '0.9rem' }}>
              프로필 저장하기
            </button>
          </form>
        </div>
      )}

      {/* Tab 2: Favorites & Heart Meals Management */}
      {activeTab === 'favorites' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
          
          {/* Favorite Schools */}
          <div className="glass-container" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ⭐ 즐겨찾는 학교 ({favSchools.length}개)
            </h3>
            
            {favSchools.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                등록된 즐겨찾는 학교가 없습니다. 홈 화면 검색창에서 학교를 검색한 뒤 별표를 눌러 등록해보세요!
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {favSchools.map((school) => (
                  <div
                    key={school.schoolCode}
                    style={{
                      background: 'rgba(255, 255, 255, 0.6)',
                      border: '1px solid var(--border-color)',
                      padding: '8px 14px',
                      borderRadius: '9999px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '0.95rem'
                    }}
                  >
                    <Link 
                      href={`/school?office=${school.officeCode}&code=${school.schoolCode}&name=${encodeURIComponent(school.schoolName)}`}
                      style={{ textDecoration: 'none', color: 'inherit', fontWeight: '600' }}
                    >
                      🏫 {school.schoolName}
                    </Link>
                    <button
                      onClick={() => removeSchool(school.schoolCode)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: 'none',
                        color: 'var(--secondary-color)',
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1rem'
                      }}
                      title="즐겨찾기 해제"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Favorited Dishes */}
          <div className="glass-container" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: '#e11d48', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ❤️ 내가 하트 표시한 급식 음식 ({favMeals.length}개)
            </h3>

            {favMeals.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                아직 하트를 누른 음식이 없습니다. 급식 상세 페이지에서 좋아하는 메뉴 옆의 하트(🤍)를 눌러보세요!
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {favMeals.map((dishName, i) => (
                  <div
                    key={`${dishName}-${i}`}
                    style={{
                      background: 'rgba(244, 63, 94, 0.08)',
                      border: '1px solid rgba(244, 63, 94, 0.25)',
                      padding: '8px 14px',
                      borderRadius: '9999px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.95rem',
                      fontWeight: '600'
                    }}
                  >
                    <span>❤️ {dishName}</span>
                    <button
                      onClick={() => removeMeal(dishName)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: 'none',
                        color: 'var(--secondary-color)',
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1rem'
                      }}
                      title="찜 해제"
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

      {/* Tab 3: Reviews History */}
      {activeTab === 'reviews' && (
        <div className="glass-container" style={{ width: '100%', padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.2rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ✍️ 내가 작성한 급식 리뷰 ({userReviews.length}개)
          </h3>

          {userReviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📝</div>
              <p style={{ fontWeight: '600', marginBottom: '0.3rem' }}>작성한 리뷰가 없습니다.</p>
              <p style={{ fontSize: '0.9rem' }}>학교 급식 페이지 하단에서 별점과 한줄평을 남겨보세요!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {userReviews.map((rev, idx) => (
                <div
                  key={rev.id || rev.key || idx}
                  style={{
                    background: 'rgba(255, 255, 255, 0.5)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '16px',
                    padding: '1.2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--primary-color)' }}>
                        {rev.date} ({rev.mealType})
                      </span>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star} style={{ color: star <= rev.rating ? '#fbbf24' : '#d1d5db', fontSize: '1rem' }}>
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
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        fontSize: '0.8rem',
                        cursor: 'pointer'
                      }}
                    >
                      삭제
                    </button>
                  </div>

                  {rev.comment ? (
                    <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-main)', background: 'rgba(0,0,0,0.02)', padding: '8px 12px', borderRadius: '8px' }}>
                      {rev.comment}
                    </p>
                  ) : (
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>작성된 한줄평 내용이 없습니다.</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Security (Password Change) */}
      {activeTab === 'security' && (
        <div className="glass-container" style={{ width: '100%', maxWidth: '500px', margin: '0 auto', padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.2rem', color: 'var(--text-main)' }}>
            비밀번호 변경
          </h3>

          {pwMsg.text && (
            <div style={{
              padding: '10px 16px',
              borderRadius: '8px',
              marginBottom: '1.2rem',
              fontSize: '0.9rem',
              textAlign: 'center',
              background: pwMsg.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: pwMsg.type === 'success' ? '#15803d' : 'var(--secondary-color)',
              fontWeight: '500'
            }}>
              {pwMsg.text}
            </div>
          )}

          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.9rem' }}>
                현재 비밀번호
              </label>
              <input 
                type="password" 
                value={oldPassword} 
                onChange={(e) => setOldPassword(e.target.value)} 
                placeholder="현재 비밀번호를 입력하세요" 
                className="glass-input" 
                required 
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.9rem' }}>
                새 비밀번호
              </label>
              <input 
                type="password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                placeholder="새 비밀번호 (4자 이상)" 
                className="glass-input" 
                required 
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.9rem' }}>
                새 비밀번호 확인
              </label>
              <input 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                placeholder="새 비밀번호를 다시 입력하세요" 
                className="glass-input" 
                required 
              />
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem', width: '100%', padding: '0.85rem' }}>
              비밀번호 변경 완료
            </button>
          </form>
        </div>
      )}

    </main>
  );
}
