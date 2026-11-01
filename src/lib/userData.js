'use client';

import { getCurrentUser } from './auth';

// Helper to get persistent anonymous client ID for review authorship without login
export const getClientId = () => {
  if (typeof window === 'undefined') return 'client_guest';
  let cid = localStorage.getItem('app_client_id');
  if (!cid) {
    cid = 'client_' + Math.random().toString(36).substring(2, 10);
    localStorage.setItem('app_client_id', cid);
  }
  return cid;
};

export const getActiveUserKey = () => 'local';

// -------------------------------------------------------------
// FAVORITE SCHOOLS (즐겨찾는 학교)
// -------------------------------------------------------------
export const getFavoriteSchools = () => {
  if (typeof window === 'undefined') return [];
  const primaryKey = 'school_favorites_local';
  const saved = localStorage.getItem(primaryKey);
  
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  // Migrate any previous favorite schools (from legacy user keys or global)
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k === 'school_favorites' || k.startsWith('school_favorites_'))) {
        const val = localStorage.getItem(k);
        if (val) {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed) && parsed.length > 0) {
            localStorage.setItem(primaryKey, JSON.stringify(parsed));
            return parsed;
          }
        }
      }
    }
  } catch (e) {}

  return [];
};

export const saveFavoriteSchools = (schools) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('school_favorites_local', JSON.stringify(schools));
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
  const primaryKey = 'meal_favorites_local';
  const saved = localStorage.getItem(primaryKey);

  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  // Migrate any previous favorite meals
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k === 'meal_favorites' || k.startsWith('meal_favorites_'))) {
        const val = localStorage.getItem(k);
        if (val) {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed) && parsed.length > 0) {
            localStorage.setItem(primaryKey, JSON.stringify(parsed));
            return parsed;
          }
        }
      }
    }
  } catch (e) {}

  return [];
};

export const saveFavoriteMeals = (dishes) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('meal_favorites_local', JSON.stringify(dishes));
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
// MEAL REVIEWS (급식 리뷰 - 별도 회원가입 없이 누구나 작성)
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

  return reviews;
};

export const saveMealReview = (schoolCode, date, mealType, reviewData) => {
  if (typeof window === 'undefined') return null;
  const key = getMealReviewsKey(schoolCode, date, mealType);
  const curUser = getCurrentUser();
  const authorId = getClientId();
  const authorName = curUser?.name || '익명의 학생';
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
  const curClientId = getClientId();
  let reviews = getMealReviews(schoolCode, date, mealType);

  if (reviewId) {
    reviews = reviews.filter(r => r.id !== reviewId);
  } else {
    reviews = reviews.filter(r => r.authorId !== curClientId);
  }

  localStorage.setItem(key, JSON.stringify(reviews));
  window.dispatchEvent(new Event('review_change'));
  window.dispatchEvent(new Event('storage'));
};

export const getUserReviews = () => {
  if (typeof window === 'undefined') return [];
  const curClientId = getClientId();
  const userReviews = [];

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('meal_reviews_')) {
        try {
          const list = JSON.parse(localStorage.getItem(key));
          if (Array.isArray(list)) {
            list.forEach(rev => {
              // Match reviews created by this device / client
              if (rev.authorId === curClientId || rev.authorId === 'guest' || rev.authorId === 'local') {
                userReviews.push(rev);
              }
            });
          }
        } catch(e) {}
      }
    }
  } catch (e) {}

  return userReviews;
};

// -------------------------------------------------------------
// ALLERGIES (관심 알레르기)
// -------------------------------------------------------------
export const getMyAllergies = () => {
  if (typeof window === 'undefined') return [];
  const primaryKey = 'my_allergies_local';
  const saved = localStorage.getItem(primaryKey);

  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  // Migrate any previous allergies
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k === 'my_allergies' || k.startsWith('my_allergies_'))) {
        const val = localStorage.getItem(k);
        if (val) {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed) && parsed.length > 0) {
            localStorage.setItem(primaryKey, JSON.stringify(parsed));
            return parsed;
          }
        }
      }
    }
  } catch (e) {}

  return [];
};

export const saveMyAllergies = (allergies) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('my_allergies_local', JSON.stringify(allergies));
  window.dispatchEvent(new Event('allergy_change'));
  window.dispatchEvent(new Event('storage'));
};
