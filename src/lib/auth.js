'use client';

// Helper to get users from localStorage
const getUsers = () => {
  if (typeof window === 'undefined') return [];
  const users = localStorage.getItem('app_users');
  return users ? JSON.parse(users) : [];
};

// Helper to save users
const saveUsers = (users) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('app_users', JSON.stringify(users));
  }
};

export const registerUser = (email, password, name) => {
  const users = getUsers();
  const cleanId = (email || '').trim();
  const cleanPassword = (password || '').trim();
  const cleanName = (name || '').trim();
  
  if (!cleanId || !cleanPassword || !cleanName) {
    return { success: false, message: '모든 항목을 입력해주세요.' };
  }

  if (users.find(u => (u.email || '').trim().toLowerCase() === cleanId.toLowerCase())) {
    return { success: false, message: '이미 존재하는 아이디(이메일)입니다.' };
  }

  const newUser = { 
    email: cleanId, 
    password: cleanPassword, 
    name: cleanName, 
    createdAt: new Date().toISOString() 
  };
  users.push(newUser);
  saveUsers(users);
  
  return { success: true, message: '회원가입 성공!' };
};

export const loginUser = (email, password) => {
  const users = getUsers();
  const cleanId = (email || '').trim().toLowerCase();
  const cleanPassword = (password || '').trim();

  const user = users.find(u => 
    (u.email || '').trim().toLowerCase() === cleanId && 
    (u.password || '').trim() === cleanPassword
  );
  
  if (user) {
    if (typeof window !== 'undefined') {
      // Omit password from session
      const sessionUser = { ...user };
      delete sessionUser.password;
      localStorage.setItem('current_user', JSON.stringify(sessionUser));
      // Dispatch events so components update immediately for the new user
      window.dispatchEvent(new Event('auth_change'));
      window.dispatchEvent(new Event('school_favorites_change'));
      window.dispatchEvent(new Event('meal_favorites_change'));
      window.dispatchEvent(new Event('review_change'));
      window.dispatchEvent(new Event('allergy_change'));
      window.dispatchEvent(new Event('storage'));
    }
    return { success: true, message: '로그인 성공!', user };
  }
  
  return { success: false, message: '아이디(이메일) 또는 비밀번호가 일치하지 않습니다.' };
};

export const logoutUser = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('current_user');
    window.dispatchEvent(new Event('auth_change'));
    window.dispatchEvent(new Event('school_favorites_change'));
    window.dispatchEvent(new Event('meal_favorites_change'));
    window.dispatchEvent(new Event('review_change'));
    window.dispatchEvent(new Event('allergy_change'));
    window.dispatchEvent(new Event('storage'));
  }
};

export const getCurrentUser = () => {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('current_user');
  return user ? JSON.parse(user) : null;
};

export const updateUserProfile = (updates) => {
  if (typeof window === 'undefined') return { success: false, message: '브라우저 환경이 아닙니다.' };
  const current = getCurrentUser();
  if (!current) return { success: false, message: '로그인이 필요합니다.' };

  const users = getUsers();
  const currentId = (current.email || '').trim().toLowerCase();
  const index = users.findIndex(u => (u.email || '').trim().toLowerCase() === currentId);

  if (index === -1) {
    return { success: false, message: '사용자 정보를 찾을 수 없습니다.' };
  }

  const updatedUser = {
    ...users[index],
    name: updates.name !== undefined ? updates.name.trim() : users[index].name,
    avatar: updates.avatar !== undefined ? updates.avatar : (users[index].avatar || '🧑‍🎓'),
    schoolInfo: updates.schoolInfo !== undefined ? updates.schoolInfo.trim() : (users[index].schoolInfo || ''),
    bio: updates.bio !== undefined ? updates.bio.trim() : (users[index].bio || ''),
  };

  users[index] = updatedUser;
  saveUsers(users);

  // Update session
  const sessionUser = { ...updatedUser };
  delete sessionUser.password;
  localStorage.setItem('current_user', JSON.stringify(sessionUser));
  window.dispatchEvent(new Event('auth_change'));

  return { success: true, message: '프로필이 성공적으로 변경되었습니다!', user: sessionUser };
};

export const changePassword = (oldPassword, newPassword) => {
  if (typeof window === 'undefined') return { success: false, message: '브라우저 환경이 아닙니다.' };
  const current = getCurrentUser();
  if (!current) return { success: false, message: '로그인이 필요합니다.' };

  if (!newPassword || newPassword.length < 4) {
    return { success: false, message: '새 비밀번호는 최소 4자 이상이어야 합니다.' };
  }

  const users = getUsers();
  const currentId = (current.email || '').trim().toLowerCase();
  const index = users.findIndex(u => (u.email || '').trim().toLowerCase() === currentId);

  if (index === -1) {
    return { success: false, message: '사용자를 찾을 수 없습니다.' };
  }

  if (users[index].password !== oldPassword) {
    return { success: false, message: '현재 비밀번호가 일치하지 않습니다.' };
  }

  users[index].password = newPassword.trim();
  saveUsers(users);

  return { success: true, message: '비밀번호가 안전하게 변경되었습니다!' };
};

export const getUserActivitySummary = () => {
  if (typeof window === 'undefined') {
    return { schoolsCount: 0, mealsCount: 0, allergiesCount: 0, reviewsCount: 0 };
  }
  
  const current = getCurrentUser();
  const userKey = current?.email?.trim()?.toLowerCase() || 'guest';

  let schoolsCount = 0;
  try {
    const s = localStorage.getItem(`school_favorites_${userKey}`);
    if (s) schoolsCount = JSON.parse(s).length;
  } catch(e) {}

  let mealsCount = 0;
  try {
    const m = localStorage.getItem(`meal_favorites_${userKey}`);
    if (m) mealsCount = JSON.parse(m).length;
  } catch(e) {}

  let allergiesCount = 0;
  try {
    const a = localStorage.getItem(`my_allergies_${userKey}`);
    if (a) allergiesCount = JSON.parse(a).length;
  } catch(e) {}

  let reviewsCount = 0;
  try {
    const prefix = `review_${userKey}_`;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) reviewsCount++;
    }
  } catch(e) {}

  return { schoolsCount, mealsCount, allergiesCount, reviewsCount };
};
