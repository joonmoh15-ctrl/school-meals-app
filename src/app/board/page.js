'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  getBoardPosts, 
  createBoardPost, 
  toggleLikePost, 
  addPostComment, 
  deleteBoardPost 
} from '@/lib/boardData';
import { getCurrentUser } from '@/lib/auth';

const CATEGORIES = ['전체', '✨ 급식 자랑', '🍚 오늘의 급식', '🥗 영양사 꿀팁', '💬 수다방'];

export default function BoardPage() {
  const [posts, setPosts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('전체');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  // Write modal state
  const [isWriteOpen, setIsWriteOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('✨ 급식 자랑');
  const [newSchool, setNewSchool] = useState('');
  const [selectedImage, setSelectedImage] = useState('/images/meal_tonkatsu.jpg');
  const [customImageUrl, setCustomImageUrl] = useState('');

  // Expanded comments state (map of postId -> boolean)
  const [expandedComments, setExpandedComments] = useState({ 'post-1': true });
  const [commentInputs, setCommentInputs] = useState({});

  const loadData = () => {
    setCurrentUser(getCurrentUser());
    setPosts(getBoardPosts());
  };

  useEffect(() => {
    loadData();

    window.addEventListener('board_posts_change', loadData);
    window.addEventListener('auth_change', loadData);
    window.addEventListener('storage', loadData);

    return () => {
      window.removeEventListener('board_posts_change', loadData);
      window.removeEventListener('auth_change', loadData);
      window.removeEventListener('storage', loadData);
    };
  }, []);

  // Filter posts by category & search query
  const filteredPosts = posts.filter((post) => {
    const matchesCategory = activeCategory === '전체' || post.category === activeCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      post.title?.toLowerCase().includes(q) || 
      post.content?.toLowerCase().includes(q) ||
      post.schoolName?.toLowerCase().includes(q) ||
      post.authorName?.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      alert('제목과 내용을 모두 입력해주세요!');
      return;
    }

    const imgToUse = customImageUrl.trim() ? customImageUrl.trim() : (selectedImage === 'none' ? null : selectedImage);

    createBoardPost({
      title: newTitle,
      content: newContent,
      category: newCategory,
      schoolName: newSchool.trim() || currentUser?.schoolInfo || '학교 미설정',
      image: imgToUse
    });

    setIsWriteOpen(false);
    setNewTitle('');
    setNewContent('');
    setCustomImageUrl('');
    setSelectedImage('/images/meal_tonkatsu.jpg');
  };

  const handleLike = (postId) => {
    toggleLikePost(postId);
  };

  const handleCommentSubmit = (postId) => {
    const text = commentInputs[postId] || '';
    if (!text.trim()) return;

    addPostComment(postId, text);
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
    setExpandedComments((prev) => ({ ...prev, [postId]: true }));
  };

  const toggleComments = (postId) => {
    setExpandedComments((prev) => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleDeletePost = (postId) => {
    if (window.confirm('이 게시글을 삭제하시겠습니까?')) {
      deleteBoardPost(postId);
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      const now = new Date();
      const diffMs = now - d;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 5) return '방금 전';
      if (diffMins < 60) return `${diffMins}분 전`;
      if (diffHours < 24) return `${diffHours}시간 전`;
      if (diffDays < 7) return `${diffDays}일 전`;
      return `${d.getMonth() + 1}월 ${d.getDate()}일`;
    } catch (e) {
      return '';
    }
  };

  const curUserId = currentUser?.email?.trim()?.toLowerCase();

  return (
    <main className="layout-wrapper" style={{ maxWidth: '850px', paddingTop: '5.5rem' }}>
      
      {/* Top Header & Breadcrumb */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '12px' }}>
        <Link 
          href="/" 
          className="btn-secondary" 
          style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem', padding: '0.5rem 1.2rem' }}
        >
          &larr; 홈으로 돌아가기
        </Link>

        <button 
          onClick={() => setIsWriteOpen(true)}
          className="btn-primary"
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '0.65rem 1.4rem', 
            fontSize: '0.95rem',
            boxShadow: '0 4px 15px rgba(249, 115, 22, 0.3)'
          }}
        >
          <span>✏️</span>
          <span>글쓰기</span>
        </button>
      </div>

      {/* Community Hero Card */}
      <div 
        className="glass-container" 
        style={{ 
          width: '100%', 
          marginBottom: '2rem', 
          padding: '2.2rem',
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(244, 63, 94, 0.08))',
          borderRadius: '24px'
        }}
      >
        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🍱 💬</div>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
          오늘의 급식 게시판
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '560px', margin: '0 auto' }}>
          오늘 먹은 맛있는 급식 사진을 공유하고, 전국의 학생 & 영양사 선생님들과 급식 이야기를 나눠보세요!
        </p>
      </div>

      {/* Category Filter Pills & Search */}
      <div style={{ width: '100%', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                background: activeCategory === cat ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.5)',
                color: activeCategory === cat ? '#ffffff' : 'var(--text-main)',
                border: activeCategory === cat ? '1px solid var(--primary-color)' : '1px solid var(--border-color)',
                padding: '8px 16px',
                borderRadius: '9999px',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
                boxShadow: activeCategory === cat ? '0 2px 10px rgba(249, 115, 22, 0.25)' : 'none'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', width: '100%' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="게시글 제목, 내용, 학교 이름으로 검색..."
            className="glass-input"
            style={{ width: '100%', paddingLeft: '2.8rem', fontSize: '0.95rem' }}
          />
          <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1.1rem', opacity: 0.6 }}>
            🔍
          </span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: 'var(--text-muted)' }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Posts Feed */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {filteredPosts.length === 0 ? (
          <div className="glass-container" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.8rem' }}>🍃</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
              조건에 맞는 게시글이 없습니다
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              새로운 글을 작성하여 첫 번째 이야기를 시작해보세요!
            </p>
            <button onClick={() => setIsWriteOpen(true)} className="btn-primary" style={{ padding: '0.6rem 1.4rem' }}>
              ✏️ 글 작성하기
            </button>
          </div>
        ) : (
          filteredPosts.map((post) => {
            const isLiked = curUserId ? (post.likedBy || []).includes(curUserId) : false;
            const isAuthor = curUserId && post.authorId === curUserId;
            const commentsOpen = !!expandedComments[post.id];
            const commentsCount = (post.comments || []).length;

            return (
              <article 
                key={post.id}
                className="glass-container"
                style={{ 
                  padding: '1.8rem', 
                  borderRadius: '20px', 
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
                  transition: 'transform 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                {/* Post Header: Author info & Category */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ 
                      fontSize: '1.4rem', 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '50%', 
                      background: 'rgba(249, 115, 22, 0.1)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      border: '1px solid var(--border-color)'
                    }}>
                      {post.authorAvatar || '🧑‍🎓'}
                    </span>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <strong style={{ fontSize: '1rem', color: 'var(--text-main)' }}>{post.authorName}</strong>
                        {post.schoolName && (
                          <span style={{ fontSize: '0.8rem', color: 'var(--primary-color)', background: 'rgba(249, 115, 22, 0.08)', padding: '2px 8px', borderRadius: '9999px', fontWeight: '600' }}>
                            🏫 {post.schoolName}
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {formatTime(post.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ 
                      fontSize: '0.82rem', 
                      padding: '4px 10px', 
                      borderRadius: '9999px', 
                      background: 'rgba(0,0,0,0.05)', 
                      color: 'var(--text-main)', 
                      fontWeight: '600' 
                    }}>
                      {post.category}
                    </span>

                    {isAuthor && (
                      <button 
                        onClick={() => handleDeletePost(post.id)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--secondary-color)', fontSize: '0.85rem', cursor: 'pointer', padding: '4px 6px' }}
                        title="게시글 삭제"
                      >
                        삭제
                      </button>
                    )}
                  </div>
                </div>

                {/* Post Title & Content */}
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', margin: '4px 0 8px 0', lineHeight: '1.4' }}>
                    {post.title}
                  </h2>
                  <p style={{ fontSize: '0.98rem', color: 'var(--text-main)', opacity: 0.9, lineHeight: '1.6', whiteSpace: 'pre-line', margin: 0 }}>
                    {post.content}
                  </p>
                </div>

                {/* Post Image */}
                {post.image && (
                  <div style={{ marginTop: '8px', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-color)', position: 'relative', width: '100%', maxHeight: '420px', background: '#000' }}>
                    <img 
                      src={post.image} 
                      alt={post.title} 
                      style={{ width: '100%', height: 'auto', maxHeight: '420px', objectFit: 'cover', display: 'block' }}
                      loading="lazy"
                    />
                  </div>
                )}

                {/* Action Buttons: Like, Comment count, Views */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border-color)', marginTop: '4px' }}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => handleLike(post.id)}
                      style={{
                        background: isLiked ? 'rgba(244, 63, 94, 0.12)' : 'rgba(0, 0, 0, 0.04)',
                        border: isLiked ? '1px solid rgba(244, 63, 94, 0.3)' : '1px solid var(--border-color)',
                        color: isLiked ? '#e11d48' : 'var(--text-main)',
                        padding: '6px 14px',
                        borderRadius: '9999px',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s'
                      }}
                    >
                      <span>{isLiked ? '❤️' : '🤍'}</span>
                      <span>좋아요 {post.likes || 0}</span>
                    </button>

                    <button
                      onClick={() => toggleComments(post.id)}
                      style={{
                        background: commentsOpen ? 'rgba(249, 115, 22, 0.12)' : 'rgba(0, 0, 0, 0.04)',
                        border: commentsOpen ? '1px solid var(--primary-light)' : '1px solid var(--border-color)',
                        color: commentsOpen ? 'var(--primary-color)' : 'var(--text-main)',
                        padding: '6px 14px',
                        borderRadius: '9999px',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s'
                      }}
                    >
                      <span>💬</span>
                      <span>댓글 {commentsCount}</span>
                    </button>
                  </div>

                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    조회수 {post.views || 0}
                  </span>
                </div>

                {/* Comments Section */}
                {commentsOpen && (
                  <div style={{ marginTop: '10px', paddingTop: '14px', borderTop: '1px dashed var(--border-color)' }}>
                    {/* Comments list */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                      {commentsCount === 0 ? (
                        <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', textAlign: 'center', padding: '12px' }}>
                          아직 작성된 댓글이 없습니다. 첫 번째 댓글을 남겨보세요!
                        </div>
                      ) : (
                        post.comments.map((comm) => (
                          <div 
                            key={comm.id} 
                            style={{ 
                              background: 'rgba(255, 255, 255, 0.4)', 
                              padding: '10px 14px', 
                              borderRadius: '12px',
                              border: '1px solid var(--border-color)',
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '10px'
                            }}
                          >
                            <span style={{ fontSize: '1.2rem', marginTop: '2px' }}>
                              {comm.authorAvatar || '🧑‍🎓'}
                            </span>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <strong style={{ fontSize: '0.88rem', color: 'var(--text-main)' }}>{comm.authorName}</strong>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                  {formatTime(comm.createdAt)}
                                </span>
                              </div>
                              <p style={{ margin: '3px 0 0 0', fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.4' }}>
                                {comm.comment}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Add comment input */}
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.3rem' }}>
                        {currentUser?.avatar || '🧑‍🎓'}
                      </span>
                      <input
                        type="text"
                        value={commentInputs[post.id] || ''}
                        onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleCommentSubmit(post.id);
                        }}
                        placeholder="따뜻한 댓글을 남겨보세요..."
                        className="glass-input"
                        style={{ flex: 1, padding: '8px 14px', fontSize: '0.9rem' }}
                      />
                      <button
                        onClick={() => handleCommentSubmit(post.id)}
                        className="btn-primary"
                        style={{ padding: '8px 16px', fontSize: '0.88rem' }}
                      >
                        등록
                      </button>
                    </div>
                  </div>
                )}

              </article>
            );
          })
        )}
      </div>

      {/* Write Post Modal */}
      {isWriteOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.55)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div 
            className="glass-container" 
            style={{ 
              width: '100%', 
              maxWidth: '560px', 
              maxHeight: '90vh', 
              overflowY: 'auto', 
              padding: '2rem',
              position: 'relative',
              borderRadius: '24px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                ✏️ 새 급식 이야기 작성
              </h2>
              <button 
                onClick={() => setIsWriteOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreatePost} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              
              {/* Category selector */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.9rem' }}>
                  카테고리 선택
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {CATEGORIES.filter(c => c !== '전체').map((cat) => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setNewCategory(cat)}
                      style={{
                        background: newCategory === cat ? 'var(--primary-color)' : 'rgba(0,0,0,0.05)',
                        color: newCategory === cat ? 'white' : 'var(--text-main)',
                        border: 'none',
                        padding: '6px 14px',
                        borderRadius: '9999px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.9rem' }}>
                  제목
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="예: 오늘 나온 수제 와플 진짜 역대급!"
                  className="glass-input"
                  required
                />
              </div>

              {/* School Name */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.9rem' }}>
                  학교 이름 (선택)
                </label>
                <input
                  type="text"
                  value={newSchool}
                  onChange={(e) => setNewSchool(e.target.value)}
                  placeholder={currentUser?.schoolInfo || "예: 천안불무초등학교"}
                  className="glass-input"
                />
              </div>

              {/* Content */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.9rem' }}>
                  내용
                </label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="오늘 급식 메뉴의 맛, 추천 포인트, 에피소드를 자유롭게 적어보세요..."
                  className="glass-input"
                  style={{ minHeight: '120px', resize: 'vertical', borderRadius: '16px' }}
                  required
                />
              </div>

              {/* Image attachment options */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.9rem' }}>
                  식판 사진 첨부
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '8px' }}>
                  <div
                    onClick={() => { setSelectedImage('/images/meal_tonkatsu.jpg'); setCustomImageUrl(''); }}
                    style={{
                      border: selectedImage === '/images/meal_tonkatsu.jpg' ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      position: 'relative',
                      aspectRatio: '4/3'
                    }}
                  >
                    <img src="/images/meal_tonkatsu.jpg" alt="돈가스 식판" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <span style={{ position: 'absolute', bottom: 2, left: 4, background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '0.7rem', padding: '1px 4px', borderRadius: '4px' }}>돈가스</span>
                  </div>

                  <div
                    onClick={() => { setSelectedImage('/images/meal_bibimbap.jpg'); setCustomImageUrl(''); }}
                    style={{
                      border: selectedImage === '/images/meal_bibimbap.jpg' ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      position: 'relative',
                      aspectRatio: '4/3'
                    }}
                  >
                    <img src="/images/meal_bibimbap.jpg" alt="비빔밥 식판" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <span style={{ position: 'absolute', bottom: 2, left: 4, background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '0.7rem', padding: '1px 4px', borderRadius: '4px' }}>비빔밥</span>
                  </div>

                  <div
                    onClick={() => { setSelectedImage('none'); setCustomImageUrl(''); }}
                    style={{
                      border: selectedImage === 'none' && !customImageUrl ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                      borderRadius: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      background: 'rgba(0,0,0,0.02)',
                      aspectRatio: '4/3',
                      fontSize: '0.8rem',
                      color: 'var(--text-muted)'
                    }}
                  >
                    <span style={{ fontSize: '1.4rem' }}>🚫</span>
                    <span>사진 없음</span>
                  </div>
                </div>

                <input
                  type="url"
                  value={customImageUrl}
                  onChange={(e) => {
                    setCustomImageUrl(e.target.value);
                    if (e.target.value) setSelectedImage('custom');
                  }}
                  placeholder="또는 외부 이미지 웹 주소(URL) 직접 입력"
                  className="glass-input"
                  style={{ fontSize: '0.85rem', padding: '8px 12px' }}
                />
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsWriteOpen(false)}
                  className="btn-secondary"
                  style={{ padding: '0.7rem 1.4rem' }}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '0.7rem 1.8rem' }}
                >
                  게시글 올리기
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </main>
  );
}
