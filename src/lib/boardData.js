'use client';

import { getCurrentUser } from './auth';

export const INITIAL_POSTS = [
  {
    id: 'post-1',
    category: '✨ 급식 자랑',
    schoolName: '천안불무초등학교',
    authorId: 'user_minwoo',
    authorName: '급식대장 민우',
    authorAvatar: '🧑‍🍳',
    title: '오늘 우리 학교 치즈돈가스 역대급 바삭함 실화냐?! 🍱🔥',
    content: '오늘 나온 수제 치즈 돈가스 튀김옷 진짜 대박 바삭하고 소스도 달콤해서 밥 두 그릇 비웠습니다 ㅋㅋㅋ 칼칼한 김치찌개랑 마카로니 콘샐러드에 딸기우유까지 완벽한 조합 인정? 다들 오늘 급식 뭐 나왔나요??',
    image: '/images/meal_tonkatsu.jpg',
    likes: 28,
    likedBy: [],
    views: 245,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    comments: [
      {
        id: 'c-1',
        authorId: 'user_jiyu',
        authorName: '지유',
        authorAvatar: '👩‍🎓',
        comment: '와 우리 학교는 오늘 생선까스 나왔는데 진짜 부럽네요 ㅠㅠㅠ',
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString()
      },
      {
        id: 'c-2',
        authorId: 'user_teacher',
        authorName: '영양사 썬생님',
        authorAvatar: '🌟',
        comment: '학생들이 맛있게 먹어주니 새벽부터 준비한 보람이 있네요! 골고루 먹고 항상 건강하세요~^^',
        createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString()
      },
      {
        id: 'c-3',
        authorId: 'user_choko',
        authorName: '초코송이',
        authorAvatar: '🍫',
        comment: '딸기우유까지 나왔다고? 전학 가고 싶다 ㅋㅋㅋ',
        createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString()
      }
    ]
  },
  {
    id: 'post-2',
    category: '🍚 오늘의 급식',
    schoolName: '율하초등학교',
    authorId: 'user_seoyun',
    authorName: '맛잘알 서윤이',
    authorAvatar: '👩‍🎓',
    title: '비빔밥의 날! 반숙 계란후라이에 국물 떡볶이 조합 미쳤다 😋',
    content: '나물도 듬뿍 들어가고 볶음 소고기랑 참기름 고소한 냄새가 복도 끝까지 났어요! 거기에 사이드로 나온 떡볶이랑 바삭한 군만두까지 배 터지게 먹었음 ㅎㅎ 후식으로 달콤한 수박까지 완벽한 식단이었습니다!',
    image: '/images/meal_bibimbap.jpg',
    likes: 42,
    likedBy: [],
    views: 380,
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    comments: [
      {
        id: 'c-4',
        authorId: 'user_taeho',
        authorName: '축구왕 태호',
        authorAvatar: '⚽',
        comment: '비빔밥 비빌 때 참기름이랑 고추장 넉넉하게 넣으면 진짜 꿀맛 인정!',
        createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString()
      },
      {
        id: 'c-5',
        authorId: 'user_minjung',
        authorName: '민정이',
        authorAvatar: '🐱',
        comment: '저희 학교도 다음 주에 비빔밥 나오던데 벌써부터 기대돼요 ㅎㅎ',
        createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString()
      }
    ]
  },
  {
    id: 'post-3',
    category: '🥗 영양사 꿀팁',
    schoolName: '서울교육지원청 영양교실',
    authorId: 'user_nutritionist',
    authorName: '행복영양사 박쌤',
    authorAvatar: '👩‍🍳',
    title: '[영양 꿀팁] 오늘 급식에 나온 잡곡밥과 제철 채소의 비밀! 🌱',
    content: '학생 여러분 안녕하세요! 오늘 식단에 사용된 현미와 흑미는 집중력을 높여주는 비타민 B군이 풍부하답니다. 알레르기 식품 표시(1~19번)도 꼭 확인하고, 잔반 줄이기 챌린지에도 많은 참여 부탁해요! 여러분이 학교 급식에서 가장 좋아하는 국 메뉴는 무엇인가요? 댓글로 편하게 알려주세요~!',
    image: null,
    likes: 67,
    likedBy: [],
    views: 512,
    createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    comments: [
      {
        id: 'c-6',
        authorId: 'user_eunwoo',
        authorName: '은우',
        authorAvatar: '🧑‍🎓',
        comment: '선생님 저는 쇠고기미역국이랑 어묵탕이 제일 맛있어요!',
        createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString()
      },
      {
        id: 'c-7',
        authorId: 'user_dohyun',
        authorName: '도현',
        authorAvatar: '⚡',
        comment: '오늘 잔반 안 남기고 다 먹어서 스티커 2개 받았어요 ㅎㅎ',
        createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString()
      }
    ]
  },
  {
    id: 'post-4',
    category: '💬 수다방',
    schoolName: '온양중학교',
    authorId: 'user_junhyeok',
    authorName: '급식러버 준혁',
    authorAvatar: '🍱',
    title: '솔직히 금요일 급식이 항상 제일 맛있는 거 국룰 맞죠? ㅋㅋㅋ',
    content: '월화수목도 맛있지만 금요일만 되면 스파게티나 치킨마요덮밥이나 수제버거 같은 특별 메뉴 자주 나오는 거 같아요 ㅋㅋ 이번 주 금요일 메뉴 스포 좀 해주실 분 계신가요??',
    image: null,
    likes: 31,
    likedBy: [],
    views: 290,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    comments: [
      {
        id: 'c-8',
        authorId: 'user_sieun',
        authorName: '시은',
        authorAvatar: '🌸',
        comment: '인정 ㅋㅋㅋ 금요일은 4교시 종 치자마자 식당으로 뛰어감',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString()
      },
      {
        id: 'c-9',
        authorId: 'user_chan',
        authorName: '찬이',
        authorAvatar: '🎮',
        comment: '우리 학교 이번 주 금요일은 잔치국수에 닭꼬치 나온대요 대박!',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 16).toISOString()
      }
    ]
  }
];

export const getBoardPosts = () => {
  if (typeof window === 'undefined') return INITIAL_POSTS;
  const saved = localStorage.getItem('board_posts');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {}
  }

  // Initialize with seed posts
  localStorage.setItem('board_posts', JSON.stringify(INITIAL_POSTS));
  return INITIAL_POSTS;
};

export const saveBoardPosts = (posts) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('board_posts', JSON.stringify(posts));
  window.dispatchEvent(new Event('board_posts_change'));
  window.dispatchEvent(new Event('storage'));
};

export const createBoardPost = ({ title, content, category, schoolName, image }) => {
  const posts = getBoardPosts();
  const curUser = getCurrentUser();
  const authorId = curUser?.email?.trim()?.toLowerCase() || 'guest_' + Math.random().toString(36).slice(2, 6);
  const authorName = curUser?.name || '익명 학생';
  const authorAvatar = curUser?.avatar || '🧑‍🎓';
  const userSchool = schoolName || curUser?.schoolInfo || '학교 미설정';

  const newPost = {
    id: 'post_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    category: category || '💬 수다방',
    schoolName: userSchool,
    authorId,
    authorName,
    authorAvatar,
    title: title.trim(),
    content: content.trim(),
    image: image || null,
    likes: 0,
    likedBy: [],
    views: 1,
    createdAt: new Date().toISOString(),
    comments: []
  };

  const updated = [newPost, ...posts];
  saveBoardPosts(updated);
  return newPost;
};

export const toggleLikePost = (postId) => {
  const posts = getBoardPosts();
  const curUser = getCurrentUser();
  const userId = curUser?.email?.trim()?.toLowerCase() || 'guest';

  const updated = posts.map((post) => {
    if (post.id === postId) {
      const likedBy = Array.isArray(post.likedBy) ? post.likedBy : [];
      const alreadyLiked = likedBy.includes(userId);
      const newLikedBy = alreadyLiked
        ? likedBy.filter((id) => id !== userId)
        : [...likedBy, userId];

      return {
        ...post,
        likes: alreadyLiked ? Math.max(0, post.likes - 1) : post.likes + 1,
        likedBy: newLikedBy
      };
    }
    return post;
  });

  saveBoardPosts(updated);
};

export const addPostComment = (postId, commentText) => {
  const posts = getBoardPosts();
  const curUser = getCurrentUser();
  const authorId = curUser?.email?.trim()?.toLowerCase() || 'guest';
  const authorName = curUser?.name || '익명 학생';
  const authorAvatar = curUser?.avatar || '🧑‍🎓';

  const newComment = {
    id: 'c_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    authorId,
    authorName,
    authorAvatar,
    comment: commentText.trim(),
    createdAt: new Date().toISOString()
  };

  const updated = posts.map((post) => {
    if (post.id === postId) {
      const comments = Array.isArray(post.comments) ? post.comments : [];
      return {
        ...post,
        comments: [...comments, newComment]
      };
    }
    return post;
  });

  saveBoardPosts(updated);
  return newComment;
};

export const deleteBoardPost = (postId) => {
  const posts = getBoardPosts();
  const updated = posts.filter((p) => p.id !== postId);
  saveBoardPosts(updated);
};
