'use client';
import { useState, useEffect } from 'react';
import { fetchMeals } from '@/lib/neis';

export default function CustomCalendar({ selectedDate, onSelect, onClose, officeCode, schoolCode }) {
  // selectedDate is a string "YYYY-MM-DD"
  const [viewDate, setViewDate] = useState(() => {
    const [y, m, d] = selectedDate.split('-');
    return new Date(y, m - 1, d);
  });
  const [mealDates, setMealDates] = useState(new Set());
  const [loading, setLoading] = useState(false);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  useEffect(() => {
    const loadMonthlyMeals = async () => {
      setLoading(true);
      const fromDate = `${year}${String(month + 1).padStart(2, '0')}01`;
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const toDate = `${year}${String(month + 1).padStart(2, '0')}${daysInMonth}`;
      
      const data = await fetchMeals(officeCode, schoolCode, fromDate, toDate);
      const datesWithMeals = new Set(data.map(m => {
        const yStr = m.date.slice(0, 4);
        const mStr = m.date.slice(4, 6);
        const dStr = m.date.slice(6, 8);
        return `${yStr}-${mStr}-${dStr}`;
      }));
      setMealDates(datesWithMeals);
      setLoading(false);
    };
    
    if (officeCode && schoolCode) {
      loadMonthlyMeals();
    }
  }, [year, month, officeCode, schoolCode]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sunday

  const days = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    setViewDate(new Date(year, month - 1, 1));
  };
  const handleNextMonth = (e) => {
    e.stopPropagation();
    setViewDate(new Date(year, month + 1, 1));
  };

  const formatDate = (dateObj) => {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const todayStr = formatDate(new Date());

  return (
    <div 
      className="glass-container" 
      style={{ 
        padding: '1.2rem 1rem', 
        width: 'min(330px, calc(100vw - 24px))', 
        position: 'absolute', 
        zIndex: 100, 
        marginTop: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
        boxSizing: 'border-box'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <button onClick={handlePrevMonth} style={{ background: 'rgba(255,255,255,0.3)', border: 'none', cursor: 'pointer', fontSize: '1rem', padding: '0.5rem 0.8rem', borderRadius: '8px' }}>&larr;</button>
        <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--primary-color)' }}>
          {year}년 {month + 1}월
          {loading && <span style={{ fontSize: '0.8rem', marginLeft: '8px', color: 'var(--text-muted)' }}>...</span>}
        </div>
        <button onClick={handleNextMonth} style={{ background: 'rgba(255,255,255,0.3)', border: 'none', cursor: 'pointer', fontSize: '1rem', padding: '0.5rem 0.8rem', borderRadius: '8px' }}>&rarr;</button>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', gap: '5px', marginBottom: '0.8rem', fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600' }}>
        <div style={{ color: '#ef4444' }}>일</div><div>월</div><div>화</div><div>수</div><div>목</div><div>금</div><div style={{ color: '#3b82f6' }}>토</div>
      </div>
      
      <div className="calendar-grid">
        {days.map((d, i) => {
          if (!d) return <div key={`empty-${i}`} />;
          
          const dStr = formatDate(d);
          const isSelected = selectedDate === dStr;
          const isToday = todayStr === dStr;
          const hasMeal = mealDates.has(dStr);

          return (
            <div 
              key={i} 
              className={`calendar-day ${isSelected ? 'selected' : ''} ${hasMeal ? 'has-meal' : ''}`}
              onClick={() => {
                onSelect(dStr);
                onClose();
              }}
              style={{
                border: isToday && !isSelected ? '1px solid var(--primary-light)' : '1px solid transparent'
              }}
            >
              <span className="day-number" style={{ 
                color: isSelected ? '#fff' : (d.getDay() === 0 ? '#ef4444' : d.getDay() === 6 ? '#3b82f6' : 'inherit'),
                fontWeight: isSelected || isToday ? 'bold' : '500'
              }}>
                {d.getDate()}
              </span>
            </div>
          );
        })}
      </div>
      
      <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
        <button 
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '0.9rem',
            textDecoration: 'underline'
          }}
        >
          닫기
        </button>
      </div>
    </div>
  );
}
