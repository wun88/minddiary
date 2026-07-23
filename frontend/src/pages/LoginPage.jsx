import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../utils/api'; // 🌟 1. API 중앙 관리소 불러오기
import '../styles/LoginPage.css';

function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      alert('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    setIsLoading(true);

    // 🌟 [임시 테스트 모드] 백엔드 연결 전 테스트를 위한 설정 (개발 완료 후 false로 변경)
    const IS_MOCK_MODE = true;

    if (IS_MOCK_MODE) {
      setTimeout(() => {
        alert('로그인 성공! 메인 화면으로 이동합니다.');
        setIsLoading(false);
        navigate('/diary');
      }, 500);
      return;
    }

    try {
      // 🌟 2. 기존의 복잡한 fetch 코드를 apiClient 단 한 줄로 대체!
      // (apiClient 내부에서 에러 처리 및 기본 URL 처리를 모두 전담합니다)
      const data = await apiClient('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      // 성공 시 토큰 저장 및 페이지 이동
      localStorage.setItem('token', data.token);
      alert('로그인 성공!');
      navigate('/diary');

    } catch (error) {
      console.error('로그인 통신 오류:', error);
      alert('이메일 또는 비밀번호가 올바르지 않거나 서버와 연결할 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    alert('구글 로그인 연동 영역입니다. (AWS OAuth 설정 연동 예정)');
    navigate('/diary');
  };

  return (
    <div className="auth-split-container">
      {/* 왼쪽 영역: 입력 폼 */}
      <div className="auth-left-section">
        <div className="auth-form-wrapper">
          <h2>어서오세요!</h2>

          <form onSubmit={handleLoginSubmit} className="auth-form">
            <div className="input-group">
              <label>이메일 주소</label>
              <input 
                type="email" 
                name="email" 
                placeholder="example@email.com" 
                value={formData.email} 
                onChange={handleChange}
                required 
              />
            </div>

            <div className="input-group">
              <label>비밀번호</label>
              <input 
                type="password" 
                name="password" 
                placeholder="password" 
                value={formData.password} 
                onChange={handleChange}
                required 
              />
            </div>

            <button type="submit" className="action-btn" disabled={isLoading}>
              {isLoading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          {/* 구글 로그인 버튼 (왼쪽에 구글 로고 포함) */}
          <button type="button" className="google-btn" onClick={handleGoogleLogin}>
            <svg className="google-logo" viewBox="0 0 24 24" width="16" height="16">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.13 0-5.78-2.11-6.73-4.96H1.18v3.15C3.15 21.32 7.24 24 12 24z"/>
              <path fill="#FBBC05" d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.18C.43 8.13 0 9.87 0 12s.43 3.87 1.18 5.39l4.09-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.24 0 3.15 2.68 1.18 6.61l4.09 3.15c.95-2.85 3.6-4.96 6.73-4.96z"/>
            </svg>
            구글 로그인
          </button>

          <div className="auth-switch-text">
            계정이 없으신가요? <Link to="/signup">회원가입</Link>
          </div>
        </div>
      </div>

      {/* 오른쪽 영역: 사진 배치 공간 */}
      <div className="auth-right-section">
        <div className="image-placeholder">
          {/* 나중에 이 위치에 실제 이미지 태그(<img src="..." alt="..." />)를 넣으시면 됩니다 */}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;