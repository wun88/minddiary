import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  // 1. 초기값은 localStorage에서 가져옵니다 (새로고침해도 유지되도록)
  const [counselorTone, setCounselorTone] = useState(() => localStorage.getItem('ai_tone') || 'warm');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('ui_dark_mode') === 'true');
  const [fontSize, setFontSize] = useState(() => Number(localStorage.getItem('ui_font_size') || '16'));
  const [profileName, setProfileName] = useState(() => localStorage.getItem('user_profile_name') || '사용자');
  const [profileImage, setProfileImage] = useState(() => localStorage.getItem('user_profile_img') || null);

  // 2. 다크 모드 실제 적용 (body 태그에 class 토글)
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('ui_dark_mode', darkMode);
  }, [darkMode]);

  // 3. 글자 크기 실제 적용 (CSS 변수 활용)
  useEffect(() => {
    document.documentElement.style.setProperty('--global-font-size', `${fontSize}px`);
    localStorage.setItem('ui_font_size', fontSize);
  }, [fontSize]);

  return (
    <SettingsContext.Provider value={{
      counselorTone, setCounselorTone,
      darkMode, setDarkMode,
      fontSize, setFontSize,
      profileName, setProfileName,
      profileImage, setProfileImage
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

// 다른 컴포넌트에서 쉽게 꺼내 쓰기 위한 Custom Hook
export function useSettings() {
  return useContext(SettingsContext);
}