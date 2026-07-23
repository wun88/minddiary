// 나중에 .env 파일에 AWS 주소를 넣으면 알아서 적용됩니다.
//const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

export const apiClient = async (endpoint, options = {}) => {
  // 1. 브라우저에 저장된 로그인 토큰(증명서)을 가져옵니다.
  const token = localStorage.getItem('token'); 

  // 2. 기본 헤더 설정 (토큰이 있으면 자동으로 헤더에 쏙 끼워 넣습니다)
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`; // AWS 백엔드가 요구할 기본 인증 규격
  }

  // 3. 실제 통신 실행
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API 에러: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API 통신 실패:', error);
    throw error;
  }
};