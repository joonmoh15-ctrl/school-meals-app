'use client';

import { useState, useEffect, useRef } from 'react';
import { fetchMeals } from '@/lib/neis';
import { parseDish, ALLERGY_MAP } from '@/lib/allergy';
import { getFavoriteMeals, toggleFavoriteMeal, getMyAllergies } from '@/lib/userData';
import CustomCalendar from '@/components/CustomCalendar';
import AllergySettings from '@/components/AllergySettings';
import MealReview from '@/components/MealReview';

export default function MealDisplay({ officeCode, schoolCode, initialName, initialDate }) {
  const [date, setDate] = useState(() => {
    if (initialDate) return initialDate;
    const today = new Date();
    const kst = new Date(today.getTime() + (9 * 60 * 60 * 1000));
    return kst.toISOString().split('T')[0];
  });
  
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [myAllergies, setMyAllergies] = useState([]);

  useEffect(() => {
    const loadFavsAndAllergies = () => {
      setFavorites(getFavoriteMeals());
      setMyAllergies(getMyAllergies());
    };
    
    loadFavsAndAllergies();
    
    const handleFavChange = () => loadFavsAndAllergies();
    window.addEventListener('meal_favorites_change', handleFavChange);
    window.addEventListener('allergy_change', handleFavChange);
    window.addEventListener('auth_change', handleFavChange);
    window.addEventListener('storage', handleFavChange);
    return () => {
      window.removeEventListener('meal_favorites_change', handleFavChange);
      window.removeEventListener('allergy_change', handleFavChange);
      window.removeEventListener('auth_change', handleFavChange);
      window.removeEventListener('storage', handleFavChange);
    };
  }, []);

  useEffect(() => {
    const loadMeals = async () => {
      setLoading(true);
      try {
        const formattedDate = date.replace(/-/g, '');
        const data = await fetchMeals(officeCode, schoolCode, formattedDate);
        setMeals(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (officeCode && schoolCode) {
      loadMeals();
    }
  }, [date, officeCode, schoolCode]);

  const toggleFavorite = (dishName) => {
    toggleFavoriteMeal(dishName);
    setFavorites(getFavoriteMeals());
  };

  const handlePrevDay = () => {
    const current = new Date(date);
    current.setDate(current.getDate() - 1);
    setDate(current.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const current = new Date(date);
    current.setDate(current.getDate() + 1);
    setDate(current.toISOString().split('T')[0]);
  };

  const getFormattedDisplayDate = () => {
    const [y, m, d] = date.split('-');
    const dateObj = new Date(y, m - 1, d);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return `${y}년 ${m}월 ${d}일 (${days[dateObj.getDay()]})`;
  };

  // Detect if any meal has user's allergies
  let detectedAllergyNames = new Set();
  meals.forEach(meal => {
    const dishes = meal.dishName.split('<br/>').filter(Boolean).map(parseDish);
    dishes.forEach(dish => {
      dish.allergyCodes.forEach(code => {
        if (myAllergies.includes(code)) {
          detectedAllergyNames.add(ALLERGY_MAP[code]);
        }
      });
    });
  });
  detectedAllergyNames = Array.from(detectedAllergyNames);

  return (
    <div style={{ width: '100%', maxWidth: '900px', margin: '0 auto' }}>
      
      {/* Date Navigation & Allergy Settings */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginBottom: '20px', position: 'relative' }}>
        <button onClick={handlePrevDay} className="btn-secondary" style={{ padding: '0.6rem 1.2rem', fontSize: '1rem' }}>&larr; 이전</button>
        
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowCalendar(!showCalendar)}
            style={{ 
              background: 'transparent',
              border: '2px solid var(--primary-light)',
              borderRadius: '9999px',
              padding: '0.6rem 1.5rem',
              color: 'var(--primary-color)',
              fontWeight: '700',
              fontSize: '1.1rem',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            📅 {getFormattedDisplayDate()} ▾
          </button>
          
          {showCalendar && (
            <CustomCalendar 
              selectedDate={date} 
              onSelect={(newDate) => setDate(newDate)} 
              onClose={() => setShowCalendar(false)} 
              officeCode={officeCode}
              schoolCode={schoolCode}
            />
          )}
        </div>

        <button onClick={handleNextDay} className="btn-secondary" style={{ padding: '0.6rem 1.2rem', fontSize: '1rem' }}>다음 &rarr;</button>

        {/* Always visible allergy settings button */}
        <div style={{ position: 'absolute', right: 0 }}>
          <AllergySettings />
        </div>
      </div>

      {/* Allergy Warning Banner */}
      {detectedAllergyNames.length > 0 && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: '16px',
          padding: '1rem 1.5rem',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ color: 'var(--secondary-color)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ background: 'var(--secondary-color)', color: 'white', width: '24px', height: '24px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>!</span>
              내 알레르기 관심 식품 감지!
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', opacity: 0.8 }}>
              오늘 급식 식단에 설정하신 관심 식품 <strong style={{ color: 'var(--secondary-color)' }}>{detectedAllergyNames.join(', ')}</strong> 성분이 포함되어 있습니다.
            </div>
          </div>
        </div>
      )}

      {/* Meals List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-muted)' }}>급식 정보를 불러오는 중...</div>
      ) : meals.length > 0 ? (
        <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: '1fr' }}>
          {meals.map((meal, index) => {
            const dishes = meal.dishName.split('<br/>').filter(Boolean).map(parseDish);

            return (
              <div key={index} className="glass-container" style={{ padding: '0', overflow: 'hidden' }}>
                {/* Header */}
                <div style={{ 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '1.5rem 2rem', borderBottom: '1px solid var(--border-color)',
                  background: 'rgba(255,255,255,0.4)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: 'var(--primary-color)', color: 'white', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                      🍽️
                    </div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', margin: 0 }}>
                      {meal.mealType}
                    </h2>
                  </div>
                  {/* Mock Origin Info */}
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ background: '#dcfce7', color: '#166534', padding: '2px 6px', borderRadius: '4px' }}>원산지</span> 
                    상세 원산지는 학교 공지를 참고하세요
                  </div>
                </div>
                
                {/* Body */}
                <div style={{ padding: '2rem' }}>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {dishes.map((dish, i) => {
                      const isFav = favorites.includes(dish.name);
                      const hasMyAllergy = dish.allergyCodes.some(c => myAllergies.includes(c));

                      return (
                        <li key={i} style={{ 
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '12px 0', 
                          borderBottom: i < dishes.length - 1 ? '1px solid var(--border-color)' : 'none'
                        }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <span style={{ fontSize: '1.15rem', fontWeight: '600' }}>{dish.name}</span>
                              {dish.allergyCodes.length > 0 && !hasMyAllergy && (
                                <span className="pill-tag" style={{ background: 'rgba(0,0,0,0.05)', color: 'var(--text-muted)' }}>
                                  알레르기: {dish.allergyNames.join(', ')}
                                </span>
                              )}
                            </div>
                            
                            {hasMyAllergy && (
                              <div style={{ marginTop: '4px' }}>
                                <span className="pill-tag danger">
                                  ⚠️ 내 관심 알레르기: {dish.allergyCodes.filter(c => myAllergies.includes(c)).map(c => ALLERGY_MAP[c]).join(', ')}
                                </span>
                              </div>
                            )}
                          </div>

                          <button 
                            onClick={() => toggleFavorite(dish.name)}
                            style={{ 
                              background: isFav ? 'rgba(244, 63, 94, 0.12)' : 'rgba(0, 0, 0, 0.04)', 
                              border: isFav ? '1px solid rgba(244, 63, 94, 0.3)' : '1px solid rgba(0, 0, 0, 0.08)', 
                              cursor: 'pointer', 
                              fontSize: '1.25rem',
                              width: '38px',
                              height: '38px',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                              boxShadow: isFav ? '0 2px 10px rgba(244, 63, 94, 0.2)' : 'none',
                              flexShrink: 0
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.transform = 'scale(1.15)';
                              if (!isFav) e.currentTarget.style.background = 'rgba(244, 63, 94, 0.08)';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.transform = 'scale(1)';
                              if (!isFav) e.currentTarget.style.background = 'rgba(0, 0, 0, 0.04)';
                            }}
                            title={isFav ? "찜 해제" : "하트 찜하기"}
                            aria-label={isFav ? `${dish.name} 찜 해제` : `${dish.name} 하트 찜하기`}
                          >
                            {isFav ? '❤️' : '🤍'}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                
                {/* Footer / Calories & Nutrition */}
                <div style={{ 
                  padding: '1.5rem 2rem', background: 'rgba(249, 115, 22, 0.05)', 
                  borderTop: '1px solid rgba(249, 115, 22, 0.1)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                    <span style={{ color: 'var(--primary-color)', fontSize: '1.2rem' }}>⚡</span>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>총 열량 (칼로리)</span>
                      <strong style={{ fontSize: '1.1rem', color: 'var(--primary-color)' }}>{meal.calories}</strong>
                    </div>
                  </div>
                  
                  {meal.nutrients && (() => {
                    const lines = meal.nutrients.split('<br/>');
                    let carbs = 0, protein = 0, fat = 0;
                    lines.forEach(l => {
                      if (l.includes('탄수화물')) carbs = parseFloat(l.split(':')[1]) || 0;
                      if (l.includes('단백질')) protein = parseFloat(l.split(':')[1]) || 0;
                      if (l.includes('지방')) fat = parseFloat(l.split(':')[1]) || 0;
                    });
                    
                    const maxMacro = Math.max(carbs, protein, fat, 1);
                    
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px', color: 'var(--text-main)' }}>
                            <span>🍚 탄수화물</span><span>{carbs}g</span>
                          </div>
                          <div className="progress-bar-container">
                            <div className="progress-bar-fill" style={{ width: `${(carbs / maxMacro) * 100}%`, background: '#3b82f6' }}></div>
                          </div>
                        </div>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px', color: 'var(--text-main)' }}>
                            <span>🥩 단백질</span><span>{protein}g</span>
                          </div>
                          <div className="progress-bar-container">
                            <div className="progress-bar-fill" style={{ width: `${(protein / maxMacro) * 100}%`, background: '#ef4444' }}></div>
                          </div>
                        </div>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px', color: 'var(--text-main)' }}>
                            <span>🥑 지방</span><span>{fat}g</span>
                          </div>
                          <div className="progress-bar-container">
                            <div className="progress-bar-fill" style={{ width: `${(fat / maxMacro) * 100}%`, background: '#f59e0b' }}></div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                  
                  <MealReview schoolCode={schoolCode} date={date} mealType={meal.mealType} />
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-container" style={{ textAlign: 'center', padding: '3rem', marginTop: '20px' }}>
          해당 날짜의 급식 정보가 없습니다. (주말이나 방학일 수 있습니다)
        </div>
      )}
    </div>
  );
}
