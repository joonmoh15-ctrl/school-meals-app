import SchoolSearch from '@/components/SchoolSearch';
import FavoriteSchools from '@/components/FavoriteSchools';
import FavoriteMeals from '@/components/FavoriteMeals';
import IntroScreen from '@/components/IntroScreen';
import AllergySettings from '@/components/AllergySettings';
import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: '오늘밥 - 학교 급식 알리미 & 급식 게시판',
  description: '전국 학교의 급식 식단을 쉽고 빠르게 확인하고 급식 게시판에서 식판 사진과 이야기를 나눠보세요.',
};

export default function Home() {
  return (
    <>
      <IntroScreen />
      <main className="layout-wrapper">
        <h1 className="title">
          <div style={{ background: 'var(--primary-color)', borderRadius: '24px', padding: '4px', display: 'flex' }}>
            <span style={{ fontSize: '2.5rem', background: '#fff', borderRadius: '20px', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🍚</span>
          </div>
          오늘밥
        </h1>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <AllergySettings />
        </div>

        {/* Board Banner Link */}
        <Link 
          href="/board"
          style={{
            textDecoration: 'none',
            width: '100%',
            maxWidth: '600px',
            marginBottom: '1.8rem',
            display: 'block'
          }}
        >
          <div 
            className="glass-container"
            style={{
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.12), rgba(244, 63, 94, 0.08))',
              border: '1px solid rgba(249, 115, 22, 0.25)',
              borderRadius: '20px',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span style={{ fontSize: '2rem' }}>💬</span>
              <div>
                <div style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--text-main)' }}>
                  급식 게시판 바로가기
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  오늘 먹은 급식 사진과 학생들의 생생한 리뷰를 확인해보세요!
                </div>
              </div>
            </div>
            <span style={{ fontSize: '1.3rem', color: 'var(--primary-color)', fontWeight: 'bold' }}>&rarr;</span>
          </div>
        </Link>

        <SchoolSearch />
        <FavoriteSchools />
        <FavoriteMeals />
      </main>
    </>
  );
}
