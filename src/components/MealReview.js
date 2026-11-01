'use client';

import { useState, useEffect } from 'react';
import { getMealReviews, saveMealReview, deleteMealReview } from '@/lib/userData';
import { getCurrentUser } from '@/lib/auth';

export default function MealReview({ schoolCode, date, mealType }) {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const loadAll = () => {
    setCurrentUser(getCurrentUser());
    const allReviews = getMealReviews(schoolCode, date, mealType);
    setReviews(allReviews);
  };

  useEffect(() => {
    loadAll();

    window.addEventListener('review_change', loadAll);
    window.addEventListener('auth_change', loadAll);
    window.addEventListener('storage', loadAll);

    return () => {
      window.removeEventListener('review_change', loadAll);
      window.removeEventListener('auth_change', loadAll);
      window.removeEventListener('storage', loadAll);
    };
  }, [schoolCode, date, mealType]);

  const curUserId = currentUser?.email?.trim()?.toLowerCase();
  const myReview = curUserId ? reviews.find((r) => r.authorId === curUserId) : null;

  const handleStartEdit = () => {
    if (myReview) {
      setRating(myReview.rating || 0);
      setComment(myReview.comment || '');
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setRating(0);
    setComment('');
  };

  const handleSave = () => {
    if (rating === 0) {
      alert('별점을 1점 이상 선택해주세요!');
      return;
    }

    saveMealReview(schoolCode, date, mealType, {
      rating,
      comment: comment.trim(),
      date: new Date().toISOString()
    });

    setIsEditing(false);
    setRating(0);
    setComment('');
  };

  const handleDelete = (reviewId) => {
    if (window.confirm('리뷰를 삭제하시겠습니까?')) {
      deleteMealReview(schoolCode, date, mealType, reviewId);
      setIsEditing(false);
      setRating(0);
      setComment('');
    }
  };

  // Calculate average rating
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : null;

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    const m = d.getMonth() + 1;
    const day = d.getDate();
    const h = d.getHours();
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${m}월 ${day}일 ${h}:${min}`;
  };

  return (
    <div style={{ marginTop: '20px', padding: '20px', background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <h4 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-main)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
          ⭐ 급식 한줄평 & 리뷰
        </h4>

        {avgRating && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(251, 191, 36, 0.15)', padding: '4px 12px', borderRadius: '9999px', fontSize: '0.9rem', fontWeight: '600', color: '#b45309' }}>
            <span>⭐ {avgRating}</span>
            <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>({reviews.length}명 참여)</span>
          </div>
        )}
      </div>

      {/* Reviews List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
        {reviews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '1.5rem', background: 'rgba(0,0,0,0.02)', borderRadius: '12px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            아직 작성된 리뷰가 없습니다. 이 급식의 첫 번째 리뷰어가 되어보세요!
          </div>
        ) : (
          reviews.map((rev) => {
            const isMine = curUserId && rev.authorId === curUserId;

            return (
              <div 
                key={rev.id || `${rev.authorId}-${rev.createdAt}`}
                style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: isMine ? 'rgba(249, 115, 22, 0.06)' : 'rgba(255, 255, 255, 0.5)',
                  border: isMine ? '1px solid rgba(249, 115, 22, 0.3)' : '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ 
                      fontSize: '1.1rem', 
                      width: '28px', 
                      height: '28px', 
                      borderRadius: '50%', 
                      background: 'rgba(0,0,0,0.05)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      {rev.authorAvatar || '🧑‍🎓'}
                    </span>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>
                      {rev.authorName}
                    </strong>
                    {isMine && (
                      <span style={{ 
                        fontSize: '0.75rem', 
                        background: 'var(--primary-color)', 
                        color: 'white', 
                        padding: '1px 6px', 
                        borderRadius: '9999px',
                        fontWeight: '600'
                      }}>
                        내 리뷰
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} style={{ color: star <= rev.rating ? '#fbbf24' : '#d1d5db', fontSize: '0.95rem' }}>
                          ★
                        </span>
                      ))}
                    </div>
                    {rev.createdAt && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {formatDate(rev.createdAt)}
                      </span>
                    )}
                  </div>
                </div>

                {rev.comment ? (
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.92rem', color: 'var(--text-main)', lineHeight: '1.4' }}>
                    {rev.comment}
                  </p>
                ) : null}

                {/* Edit / Delete actions for author */}
                {isMine && !isEditing && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px', justifyContent: 'flex-end' }}>
                    <button
                      onClick={handleStartEdit}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--primary-color)',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        padding: '2px 6px'
                      }}
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(rev.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--secondary-color)',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        padding: '2px 6px'
                      }}
                    >
                      삭제
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Input / Edit Form */}
      {(!myReview || isEditing) ? (
        <div style={{
          padding: '16px',
          background: 'rgba(255, 255, 255, 0.4)',
          borderRadius: '12px',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-main)' }}>
              {isEditing ? '✏️ 내 리뷰 수정하기' : '✍️ 리뷰 남기기'}
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span 
                  key={star} 
                  className="review-star"
                  style={{ color: star <= rating ? '#fbbf24' : '#d1d5db', cursor: 'pointer', fontSize: '1.4rem' }}
                  onClick={() => setRating(star)}
                  title={`${star}점`}
                >
                  ★
                </span>
              ))}
            </div>
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="오늘 급식에 대한 솔직한 한줄평을 남겨주세요 (선택)"
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              background: 'var(--card-bg)',
              resize: 'vertical',
              minHeight: '60px',
              marginBottom: '10px',
              fontFamily: 'inherit',
              fontSize: '0.9rem',
              color: 'var(--text-main)',
              outline: 'none'
            }}
          />

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            {isEditing && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="btn-secondary"
                style={{ fontSize: '0.85rem', padding: '6px 14px' }}
              >
                취소
              </button>
            )}
            <button 
              type="button"
              onClick={handleSave} 
              className="btn-primary" 
              style={{ fontSize: '0.85rem', padding: '6px 18px' }}
            >
              {isEditing ? '수정 완료' : '리뷰 등록'}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={handleStartEdit}
            className="btn-secondary"
            style={{ fontSize: '0.85rem', padding: '6px 16px' }}
          >
            ✏️ 내 리뷰 수정하기
          </button>
        </div>
      )}
    </div>
  );
}
