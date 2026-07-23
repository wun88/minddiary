import React, { useState } from 'react';
// 🌟 react-router-dom에서 페이지 관리에 필요한 핵심 도구들을 가져옵니다.
import { BrowserRouter, Routes, Route } from 'react-router-dom'; // 사용하지 않는 Link는 제거했습니다.
import MainPage from './pages/MainPage.jsx';
import AiChatMain from './pages/AiChatMain';
import DiaryMain from './pages/DiaryMain';
import Setting from './pages/Setting';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

function App() {
  // 전역으로 관리할 일기 데이터 주머니
  const [diaryData, setDiaryData] = useState({});

  // 일기를 작성하고 [저장]을 눌렀을 때 데이터를 주머니에 넣는 함수
  const handleSaveDiary = (dateStr, text, emoji) => {
    setDiaryData((prevData) => ({
      ...prevData,
      [dateStr]: { text, emoji }
    }));
    console.log("일기 저장 완료:", dateStr, { text, emoji });
  };

  return (
    <BrowserRouter>
      <div>
        {/* 🌟 기존에 있던 상단 검은색 임시 탭 바 영역(<div style={{ background: '#333' }}>)을 깨끗하게 삭제했습니다. */}

        {/* 주소창의 경로(Path)에 따라 알맞은 컴포넌트를 매핑하여 렌더링합니다. */}
        <Routes>
          {/* 메인 페이지 (홈 기본 경로 '/') — 일기 데이터 전달 */}
          <Route path="/" element={<MainPage diaryData={diaryData} />} />
          
          {/* AI 채팅 페이지 ('/ai-chat') — MainPage에서 확장 버튼 누르면 여기로 이동함 */}
          <Route path="/ai-chat" element={<AiChatMain />} />
          
          {/* 일기 작성 페이지 ('/diary') — 일기 데이터와 저장 함수 전달 */}
          <Route path="/diary" element={<DiaryMain diaryData={diaryData} onSaveDiary={handleSaveDiary} />} />

          {/* 설정 페이지 */}
          <Route path="/setting" element={<Setting />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/Signup" element={<SignupPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;