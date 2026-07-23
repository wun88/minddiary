import React, { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext'; // 👈 1. 전역 설정 Hook 가져오기
import Header from '../components/Header'; 
import '../styles/Setting.css';

export default function Setting() {
  // 👈 2. 전역 창고에서 상태(State)와 변경 함수(Setter)들 꺼내오기
  const {
    counselorTone, setCounselorTone,
    darkMode, setDarkMode,
    fontSize, setFontSize,
    profileName, setProfileName,       
    profileImage, setProfileImage      
  } = useSettings();

  // --- [프로필 전용] 편집 중인 임시 상태 (Draft State) ---
  const [draftName, setDraftName] = useState('NAME');
  const [draftImage, setDraftImage] = useState(null);

  // --- 3. 컴포넌트가 켜질 때, 전역 프로필 정보를 임시 보관함(Draft)에 동기화 ---
  useEffect(() => {
    setDraftName(profileName);
    setDraftImage(profileImage);
  }, [profileName, profileImage]);

  // --- 4. 왼쪽 서비스 설정 저장 제어 ---
  const handleSaveSettings = () => {
    localStorage.setItem('ai_tone', counselorTone);
    localStorage.setItem('ui_dark_mode', darkMode);
    localStorage.setItem('ui_font_size', fontSize);
    alert('서비스 설정이 저장되었습니다 💾');
  };

  // --- 5. 왼쪽 대화내역 지우기 제어 ---
  const handleResetChatHistory = () => {
    if (window.confirm('AI 상담사와의 대화 기록을 초기화하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) {
      localStorage.removeItem('chat_history');
      localStorage.removeItem('chat_sessions');
      alert('초기화가 완료되었습니다.');
    }
  };

  // --- 🌟 추가: 대화 및 일기 백업(JSON 다운로드) 기능 ---
  const handleExportData = () => {
    try {
      const chatSessions = localStorage.getItem('chat_sessions') || '[]';
      const diaryData = localStorage.getItem('diaryData') || '{}';

      const backupObject = {
        chatSessions: JSON.parse(chatSessions),
        diaryData: JSON.parse(diaryData),
        exportDate: new Date().toISOString()
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupObject, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `mind_care_backup_${new Date().toISOString().slice(0,10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      alert('데이터 백업 파일이 성공적으로 다운로드되었습니다! 📥');
    } catch (error) {
      console.error('백업 실패:', error);
      alert('데이터 백업 중 오류가 발생했습니다.');
    }
  };

  // --- 6. 오른쪽 프로필 변경사항 최종 저장 ---
  const handleSaveProfile = () => {
    localStorage.setItem('user_profile_name', draftName);
    if (draftImage) {
      localStorage.setItem('user_profile_img', draftImage);
    } else {
      localStorage.removeItem('user_profile_img');
    }

    setProfileName(draftName);
    setProfileImage(draftImage);
    
    alert('프로필 설정이 저장되었습니다.');
  };

  // --- 7. 오른쪽 프로필 초기 디폴트 세팅으로 리셋 ---
  const handleResetProfile = () => {
    if (window.confirm('프로필 정보(사진, 이름)를 기본 설정값으로 되돌리시겠습니까?')) {
      setDraftName('사용자');
      setDraftImage(null);

      localStorage.removeItem('user_profile_name');
      localStorage.removeItem('user_profile_img');

      setProfileName('사용자');
      setProfileImage(null);
      
      alert('초기화 완료되었습니다.');
    }
  };

  // --- 8. 로컬 파일 선택을 통한 아바타 갱신 ---
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDraftImage(reader.result); 
      };
      reader.readAsDataURL(file);
    }
  };

  // --- 9. 사진 제거 제어 ---
  const handleRemoveImage = () => {
    setDraftImage(null); 
  };

  return (
    <div className="setting-page-container">
      <Header showSettings={true} />

      <div className="setting-main-content">
        
        {/* [왼쪽] 설정 옵션 박스 */}
        <div className="setting-left-box">
          <h2 className="setting-main-title">⚙️ 설정</h2>

          <section className="setting-section">
            <h3 className="setting-section-title">🌿 AI 상담사 설정</h3>
            <hr className="setting-divider" />
            
            <div className="setting-item">
              <span className="setting-label">상담사 기본 어조 선택</span>
              <div className="radio-group">
                <label className="radio-label">
                  <input 
                    type="radio" 
                    name="counselorTone" 
                    value="warm" 
                    checked={counselorTone === 'warm'} 
                    onChange={() => setCounselorTone('warm')} 
                  />
                  따뜻하고 공감해주는 위로형
                </label>
                <label className="radio-label">
                  <input 
                    type="radio" 
                    name="counselorTone" 
                    value="logical" 
                    checked={counselorTone === 'logical'} 
                    onChange={() => setCounselorTone('logical')} 
                  />
                  명확하고 이성적인 해결형
                </label>
              </div>
            </div>
            
            <button className="btn-danger" onClick={handleResetChatHistory}>
              🗑️ 상담 대화 기록 초기화
            </button>
          </section>

          <section className="setting-section">
            <h3 className="setting-section-title">🎨 화면 및 가독성</h3>
            <hr className="setting-divider" />
            
            <div className="setting-item flex-row">
              <span className="setting-label">다크 모드</span>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={darkMode} 
                  onChange={(e) => setDarkMode(e.target.checked)} 
                />
                <span className="slider round"></span>
              </label>
            </div>
            
            <div className="setting-item">
              <span className="setting-label">글자 크기 ({fontSize}px)</span>
              <div className="slider-container">
                <span className="slider-desc">작게</span>
                <input 
                  type="range" 
                  min="14" 
                  max="20" 
                  value={fontSize} 
                  onChange={(e) => setFontSize(Number(e.target.value))} 
                  className="range-slider" 
                />
                <span className="slider-desc">크게</span>
              </div>
            </div>
          </section>

          <section className="setting-section">
            <h3 className="setting-section-title">💾 데이터 관리</h3>
            <hr className="setting-divider" />
            <p className="setting-desc">
              그동안 작성한 소중한 감정 일기와 AI 상담사와의 대화 기록을 텍스트(JSON) 파일로 안전하게 개인 PC에 다운로드합니다.
            </p>
            {/* 🌟 백업 기능 연결 완료 */}
            <button className="btn-secondary" onClick={handleExportData}>📥 대화 및 일기 백업하기</button>
          </section>

          <button className="btn-save" onClick={handleSaveSettings}>
            저장하기
          </button>
        </div>

        {/* [오른쪽] 프로필 관리 박스 */}
        <div className="setting-right-box">
          <h2 className="profile-main-title">👤 프로필 관리</h2>
          
          <div className="profile-container">
            
            <div className="avatar-section-wrapper">
              <div className="avatar-circle">
                {draftImage ? ( 
                  <img src={draftImage} alt="Profile" className="profile-img-preview" />
                ) : (
                  <div className="avatar-placeholder" />
                )}
                
                <label htmlFor="profile-pic-upload" className="avatar-hover-overlay">
                  <svg className="camera-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                  <span>사진 선택</span>
                </label>
              </div>

              <input 
                id="profile-pic-upload" 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange} 
                className="hidden-file-input"
              />

              {draftImage && (
                <button type="button" className="btn-profile-pic-delete" onClick={handleRemoveImage}>
                  기본 이미지로 변경
                </button>
              )}
            </div>

            <div className="profile-details-form">
              <div className="profile-form-group">
                <label className="profile-form-label">이름</label>
                <div className="name-box-wrapper">
                  <input 
                    type="text" 
                    className="name-input" 
                    value={draftName} 
                    onChange={(e) => setDraftName(e.target.value)}
                    placeholder="NAME"
                    maxLength={10}
                  />
                </div>
              </div>
            </div>

            <div className="profile-action-btn-group">
              <button type="button" className="btn-profile-reset" onClick={handleResetProfile}>
                초기화
              </button>
              <button type="button" className="btn-profile-save" onClick={handleSaveProfile}>
                저장하기
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}