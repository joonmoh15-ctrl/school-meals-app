'use server';

const BASE_URL = 'https://open.neis.go.kr/hub';
const KEY = process.env.NEXT_PUBLIC_NEIS_API_KEY || ''; 

export async function searchSchools(schoolName) {
  if (!schoolName) return [];
  
  try {
    const params = new URLSearchParams({
      Type: 'json',
      pIndex: 1,
      pSize: 20,
      SCHUL_NM: schoolName
    });
    
    if (KEY) params.append('KEY', KEY);

    const res = await fetch(`${BASE_URL}/schoolInfo?${params.toString()}`);
    const data = await res.json();

    if (data.schoolInfo && data.schoolInfo[1] && data.schoolInfo[1].row) {
      return data.schoolInfo[1].row.map(school => ({
        officeCode: school.ATPT_OFCDC_SC_CODE,
        schoolCode: school.SD_SCHUL_CODE,
        schoolName: school.SCHUL_NM,
        address: school.ORG_RDNMA,
        type: school.SCHUL_KND_SC_NM, // e.g. 초등학교, 중학교, 고등학교
      }));
    }
    return [];
  } catch (error) {
    console.error("Error fetching schools:", error);
    return [];
  }
}

export async function fetchMeals(officeCode, schoolCode, fromDate, toDate) {
  // fromDate, toDate should be in YYYYMMDD format
  try {
    const params = new URLSearchParams({
      Type: 'json',
      pIndex: 1,
      pSize: 100, // Increased size for monthly data
      ATPT_OFCDC_SC_CODE: officeCode,
      SD_SCHUL_CODE: schoolCode,
    });
    
    if (fromDate && toDate) {
      params.append('MLSV_FROM_YMD', fromDate);
      params.append('MLSV_TO_YMD', toDate);
    } else if (fromDate) {
      params.append('MLSV_YMD', fromDate);
    }
    
    if (KEY) params.append('KEY', KEY);

    const res = await fetch(`${BASE_URL}/mealServiceDietInfo?${params.toString()}`);
    const data = await res.json();

    if (data.mealServiceDietInfo && data.mealServiceDietInfo[1] && data.mealServiceDietInfo[1].row) {
      return data.mealServiceDietInfo[1].row.map(meal => ({
        date: meal.MLSV_YMD,
        mealType: meal.MMEAL_SC_NM, // 조식, 중식, 석식
        dishName: meal.DDISH_NM, // 급식 식단 (html br tags included)
        calories: meal.CAL_INFO,
        nutrients: meal.NTR_INFO
      }));
    }
    return [];
  } catch (error) {
    console.error("Error fetching meals:", error);
    return [];
  }
}
