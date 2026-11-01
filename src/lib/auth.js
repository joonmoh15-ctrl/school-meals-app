'use client';

// Privacy-First Local User Profile (No password, no email, no account registration)
const DEFAULT_PROFILE = {
  name: '익명의 학생',
  avatar: '🧑‍🎓',
  schoolInfo: '',
  bio: '',
  createdAt: new Date().toISOString()
};

// Clean up any legacy sensitive credentials from localStorage for privacy & security
const cleanLegacyCredentials = () => {
  if (typeof window === 'undefined') return;
  try {
    if (localStorage.getItem('app_users')) {
      localStorage.removeItem('app_users');
    }
  } catch (e) {}
};

export const getLocalProfile = () => {
  if (typeof window === 'undefined') return DEFAULT_PROFILE;
  cleanLegacyCredentials();

  try {
    const saved = localStorage.getItem('app_local_profile');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!parsed.name || parsed.name !== '익명의 학생') {
        parsed.name = '익명의 학생';
        localStorage.setItem('app_local_profile', JSON.stringify(parsed));
      }
      return parsed;
    }

    localStorage.setItem('app_local_profile', JSON.stringify(DEFAULT_PROFILE));
    return DEFAULT_PROFILE;
  } catch (e) {
    return DEFAULT_PROFILE;
  }
};

export const getCurrentUser = () => {
  return getLocalProfile();
};

export const updateUserProfile = (updates) => {
  if (typeof window === 'undefined') return { success: false, message: '브라우저 환경이 아닙니다.' };
  
  const current = getLocalProfile();
  const updated = {
    ...current,
    name: updates.name !== undefined ? updates.name.trim() : current.name,
    avatar: updates.avatar !== undefined ? updates.avatar : (current.avatar || '🧑‍🎓'),
    schoolInfo: updates.schoolInfo !== undefined ? updates.schoolInfo.trim() : (current.schoolInfo || ''),
    bio: updates.bio !== undefined ? updates.bio.trim() : (current.bio || '')
  };

  try {
    localStorage.setItem('app_local_profile', JSON.stringify(updated));
    window.dispatchEvent(new Event('auth_change'));
    window.dispatchEvent(new Event('storage'));
    return { success: true, message: '프로필 정보가 저장되었습니다!', user: updated };
  } catch (e) {
    return { success: false, message: '저장 중 오류가 발생했습니다.' };
  }
};

// Activity summary (favorites, reviews, allergies)
export const getUserActivitySummary = () => {
  if (typeof window === 'undefined') {
    return { schoolsCount: 0, mealsCount: 0, allergiesCount: 0, reviewsCount: 0 };
  }

  let schoolsCount = 0;
  try {
    const keys = ['school_favorites_local', 'school_favorites_guest', 'school_favorites'];
    for (const k of keys) {
      const s = localStorage.getItem(k);
      if (s) {
        schoolsCount = Math.max(schoolsCount, JSON.parse(s).length);
      }
    }
    // Also scan any school_favorites_*
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('school_favorites_')) {
        const val = localStorage.getItem(key);
        if (val) schoolsCount = Math.max(schoolsCount, JSON.parse(val).length);
      }
    }
  } catch (e) {}

  let mealsCount = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key === 'meal_favorites' || key.startsWith('meal_favorites_'))) {
        const val = localStorage.getItem(key);
        if (val) mealsCount = Math.max(mealsCount, JSON.parse(val).length);
      }
    }
  } catch (e) {}

  let allergiesCount = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key === 'my_allergies' || key.startsWith('my_allergies_'))) {
        const val = localStorage.getItem(key);
        if (val) allergiesCount = Math.max(allergiesCount, JSON.parse(val).length);
      }
    }
  } catch (e) {}

  let reviewsCount = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('meal_reviews_')) {
        const list = JSON.parse(localStorage.getItem(key));
        if (Array.isArray(list)) reviewsCount += list.length;
      }
    }
  } catch (e) {}

  return { schoolsCount, mealsCount, allergiesCount, reviewsCount };
};

// Dummy backward-compatible helpers (no passwords/accounts stored)
export const registerUser = () => ({ success: true, message: '회원가입이 불필요합니다.' });
export const loginUser = () => ({ success: true, message: '로그인이 불필요합니다.' });
export const logoutUser = () => {};
export const changePassword = () => ({ success: true, message: '비밀번호를 사용하지 않습니다.' });
