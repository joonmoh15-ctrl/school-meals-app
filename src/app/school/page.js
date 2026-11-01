import Link from 'next/link';
import MealDisplay from '@/components/MealDisplay';
import SchoolBookmarkButton from '@/components/SchoolBookmarkButton';

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  return {
    title: `${params.name || '학교'} 급식 정보`,
  };
}

export default async function SchoolPage({ searchParams }) {
  const params = await searchParams;
  const { office, code, name } = params;

  if (!office || !code) {
    return (
      <main className="layout-wrapper">
        <h1 className="title">잘못된 접근입니다</h1>
        <Link href="/" className="btn-primary" style={{ textDecoration: 'none' }}>메인으로 돌아가기</Link>
      </main>
    );
  }

  return (
    <main className="layout-wrapper">
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '12px' }}>
        <Link 
          href="/" 
          className="btn-primary"
          style={{ 
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '1rem',
            padding: '0.7rem 1.5rem',
            borderRadius: '9999px',
            boxShadow: '0 4px 15px rgba(249, 115, 22, 0.3)'
          }}
        >
          &larr; 홈으로 돌아가기
        </Link>

        <SchoolBookmarkButton 
          officeCode={office} 
          schoolCode={code} 
          schoolName={name} 
        />
      </div>
      
      <h1 className="title" style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>{name}</h1>
      
      <MealDisplay 
        officeCode={office} 
        schoolCode={code} 
        initialName={name} 
        initialDate={params.date}
      />
    </main>
  );
}
