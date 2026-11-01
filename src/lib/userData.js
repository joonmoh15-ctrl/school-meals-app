'use client';

import { getCurrentUser } from './auth';

// Helper to get active user scope ID (email or 'guest')
export const getActiveUserKey = () => {
  if (typeof window === 'undefined') return 'guest';
  const cur = getCurrentUser();
  if (cur && cur.email) {
    return cur.email.trim().toLowerCase();
  }
  return 'guest';
};

// -------------------------------------------------------------
// FAVORITE SCHOOLS (즐겨찾는 학교)
// -------------------------------------------------------------
export const getFavoriteSchools = () => {
  if (typeof window === 'undefined') return [];
  const userKey = getActiveUserKey();
  const scopedKey = `school_favorites_${userKey}`;
  const saved = localStorage.getItem(scopedKey);
  
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  // Migrate legacy global favorites for the first active user
  const legacy = localStorage.getItem('school_favorites');
  if (legacy && userKey !== 'guest') {
    try {
      const parsed = JSON.parse(legacy);
      localStorage.setItem(scopedKey, legacy);
      localStorage.removeItem('school_favorites');
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {}
  }

  return [];
};

export const saveFavoriteSchools = (schools) => {
  if (typeof window === 'undefined') return;
  const userKey = getActiveUserKey();
  const scopedKey = `school_favorites_${userKey}`;
  localStorage.setItem(scopedKey, JSON.stringify(schools));
  window.dispatchEvent(new Event('school_favorites_change'));
  window.dispatchEvent(new Event('storage'));
};

export const isSchoolFavorite = (schoolCode) => {
  if (!schoolCode) return false;
  const favs = getFavoriteSchools();
  return favs.some((s) => s.schoolCode === schoolCode);
};

export const toggleFavoriteSchool = (school) => {
  if (!school || !school.schoolCode) return false;
  const favs = getFavoriteSchools();
  const exists = favs.some((s) => s.schoolCode === school.schoolCode);
  let updated;

  if (exists) {
    updated = favs.filter((s) => s.schoolCode !== school.schoolCode);
  } else {
    updated = [
      ...favs,
      {
        schoolCode: school.schoolCode,
        schoolName: school.schoolName,
        officeCode: school.officeCode,
        address: school.address || ''
      }
    ];
  }

  saveFavoriteSchools(updated);
  return !exists;
};

// -------------------------------------------------------------
// FAVORITE MEALS (하트 표시한 급식 음식)
// -------------------------------------------------------------
export const getFavoriteMeals = () => {
  if (typeof window === 'undefined') return [];
  const userKey = getActiveUserKey();
  const scopedKey = `meal_favorites_${userKey}`;
  const saved = localStorage.getItem(scopedKey);

  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  // Migrate legacy global meals for the first active user
  const legacy = localStorage.getItem('meal_favorites');
  if (legacy && userKey !== 'guest') {
    try {
      const parsed = JSON.parse(legacy);
      localStorage.setItem(scopedKey, legacy);
      localStorage.removeItem('meal_favorites');
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {}
  }

  return [];
};

export const saveFavoriteMeals = (dishes) => {
  if (typeof window === 'undefined') return;
  const userKey = getActiveUserKey();
  const scopedKey = `meal_favorites_${userKey}`;
  localStorage.setItem(scopedKey, JSON.stringify(dishes));
  window.dispatchEvent(new Event('meal_favorites_change'));
  window.dispatchEvent(new Event('storage'));
};

export const isMealFavorite = (dishName) => {
  if (!dishName) return false;
  const favs = getFavoriteMeals();
  return favs.includes(dishName);
};

export const toggleFavoriteMeal = (dishName) => {
  if (!dishName) return false;
  const favs = getFavoriteMeals();
  const exists = favs.includes(dishName);
  let updated;

  if (exists) {
    updated = favs.filter((d) => d !== dishName);
  } else {
    updated = [...favs, dishName];
  }

  saveFavoriteMeals(updated);
  return !exists;
};

// -------------------------------------------------------------
// MEAL REVIEWS (급식 리뷰 - 급식별 유지 및 사용자별 작성자 관리)
// -------------------------------------------------------------
export const getMealReviewsKey = (schoolCode, date, mealType) => {
  return `meal_reviews_${schoolCode}_${date}_${mealType}`;
};

export const getMealReviews = (schoolCode, date, mealType) => {
  if (typeof window === 'undefined') return [];
  const key = getMealReviewsKey(schoolCode, date, mealType);
  const saved = localStorage.getItem(key);
  let reviews = [];

  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      reviews = Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      reviews = [];
    }
  }

  // Auto-migration from legacy review keys if none found in new key
  if (reviews.length === 0) {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k === `review_${schoolCode}_${date}_${mealType}` || (k.startsWith('review_') && k.endsWith(`_${schoolCode}_${date}_${mealType}`)))) {
          try {
            const val = JSON.parse(localStorage.getItem(k));
            if (val && !reviews.some(r => r.legacyKey === k)) {
              const parts = k.split('_');
              const authorId = val.authorId || val.userKey || (parts.length >= 5 ? parts[1] : 'guest');
              reviews.push({
                id: 'migrated_' + k,
                legacyKey: k,
                schoolCode,
                date,
                mealType,
                authorId,
                authorName: val.authorName || (authorId !== 'guest' ? authorId : '익명 학생'),
                authorAvatar: val.authorAvatar || '🧑‍🎓',
                rating: val.rating || 0,
                comment: val.comment || '',
                createdAt: val.date || new Date().toISOString()
              });
            }
          } catch(e) {}
        }
      }
      if (reviews.length > 0) {
        localStorage.setItem(key, JSON.stringify(reviews));
      }
    } catch(e) {}
  }

  return reviews;
};

export const saveMealReview = (schoolCode, date, mealType, reviewData) => {
  if (typeof window === 'undefined') return null;
  const key = getMealReviewsKey(schoolCode, date, mealType);
  const curUser = getCurrentUser();
  const authorId = curUser?.email?.trim()?.toLowerCase() || 'guest';
  const authorName = curUser?.name || '익명 학생';
  const authorAvatar = curUser?.avatar || '🧑‍🎓';

  const reviews = getMealReviews(schoolCode, date, mealType);
  const existingIndex = reviews.findIndex(r => r.authorId === authorId);

  const newReview = {
    id: existingIndex >= 0 ? reviews[existingIndex].id : 'rev_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
    schoolCode,
    date,
    mealType,
    authorId,
    authorName,
    authorAvatar,
    rating: reviewData.rating,
    comment: reviewData.comment || '',
    createdAt: reviewData.date || new Date().toISOString()
  };

  if (existingIndex >= 0) {
    reviews[existingIndex] = newReview;
  } else {
    reviews.push(newReview);
  }

  localStorage.setItem(key, JSON.stringify(reviews));
  window.dispatchEvent(new Event('review_change'));
  window.dispatchEvent(new Event('storage'));
  return newReview;
};

export const deleteMealReview = (schoolCode, date, mealType, reviewId) => {
  if (typeof window === 'undefined') return;
  const key = getMealReviewsKey(schoolCode, date, mealType);
  const curUser = getCurrentUser();
  const curUserId = curUser?.email?.trim()?.toLowerCase() || 'guest';
  let reviews = getMealReviews(schoolCode, date, mealType);

  if (reviewId) {
    reviews = reviews.filter(r => r.id !== reviewId);
  } else {
    reviews = reviews.filter(r => r.authorId !== curUserId);
  }

  localStorage.setItem(key, JSON.stringify(reviews));
  window.dispatchEvent(new Event('review_change'));
  window.dispatchEvent(new Event('storage'));
};

export const getUserReviews = () => {
  if (typeof window === 'undefined') return [];
  const curUser = getCurrentUser();
  const userKey = curUser?.email?.trim()?.toLowerCase();
  if (!userKey) return [];

  const userReviews = [];

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('meal_reviews_')) {
        try {
          const list = JSON.parse(localStorage.getItem(key));
          if (Array.isArray(list)) {
            list.forEach(rev => {
              if (rev.authorId === userKey) {
                userReviews.push(rev);
              }
            });
          }
        } catch(e) {}
      }
    }
  } catch (e) {}

  // Also check legacy keys if any
  try {
    const prefix = `review_${userKey}_`;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        try {
          const val = JSON.parse(localStorage.getItem(key));
          const parts = key.substring(prefix.length).split('_');
          if (val && !userReviews.some(r => r.schoolCode === parts[0] && r.date === parts[1])) {
            userReviews.push({
              id: key,
              schoolCode: parts[0] || '',
              date: parts[1] || '',
              mealType: parts[2] || '중식',
              authorId: userKey,
              authorName: curUser?.name || '나',
              rating: val.rating || 0,
              comment: val.comment || '',
              createdAt: val.date || ''
            });
          }
        } catch(e) {}
      }
    }
  } catch(e) {}

  return userReviews;
};

// -------------------------------------------------------------
// ALLERGIES (관심 알레르기)
// -------------------------------------------------------------
export const getMyAllergies = () => {
  if (typeof window === 'undefined') return [];
  const userKey = getActiveUserKey();
  const scopedKey = `my_allergies_${userKey}`;
  const saved = localStorage.getItem(scopedKey);

  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  const legacy = localStorage.getItem('my_allergies');
  if (legacy && userKey !== 'guest') {
    try {
      const parsed = JSON.parse(legacy);
      localStorage.setItem(scopedKey, legacy);
      localStorage.removeItem('my_allergies');
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {}
  }

  return [];
};

export const saveMyAllergies = (allergies) => {
  if (typeof window === 'undefined') return;
  const userKey = getActiveUserKey();
  const scopedKey = `my_allergies_${userKey}`;
  localStorage.setItem(scopedKey, JSON.stringify(allergies));
  window.dispatchEvent(new Event('allergy_change'));
  window.dispatchEvent(new Event('storage'));
};
