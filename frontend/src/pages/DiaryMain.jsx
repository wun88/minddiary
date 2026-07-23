import React, { useState } from 'react';
import Header from '../components/Header';
import { apiClient } from '../utils/api'; // 🌟 1. API 중앙 관리소 불러오기
import '../styles/DiaryMain.css';

function DiaryMain({ diaryData = {}, onSaveDiary }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // 모달(팝업) 관련 상태들
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDateStr, setSelectedDateStr] = useState('');
  const [diaryText, setDiaryText] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('😀');

  // AI 감정 분석 중임을 나타내는 로딩 상태
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const calendarCells = [];

  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarCells.push({ id: `empty-${i}`, date: null });
  }
  for (let date = 1; date <= daysInMonth; date++) {
    calendarCells.push({ id: `date-${date}`, date: date });
  }

  // 날짜 클릭 시 모달 열기
  const handleDateClick = (date) => {
    if (!date) return;
    
    const formattedDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
    setSelectedDateStr(formattedDateStr);
    
    setDiaryText(diaryData?.[formattedDateStr]?.text || '');
    setSelectedEmoji(diaryData?.[formattedDateStr]?.emoji || '😀');
    setIsModalOpen(true);
  };

  /* =========================================================
     [🚀 백엔드 통신: Gemini 감정 분석 적용 (apiClient 활용)]
     ========================================================= */
  const handleSave = async () => {
    if (!onSaveDiary) {
      console.warn("onSaveDiary 함수가 부모(App.jsx)로부터 전달되지 않았습니다.");
      setIsModalOpen(false);
      return;
    }

    // 일기 텍스트가 비어있다면 AI 분석을 거치지 않고 즉시 저장
    if (!diaryText.trim()) {
      onSaveDiary(selectedDateStr, diaryText, selectedEmoji);
      setIsModalOpen(false);
      return;
    }

    // 로딩 시작
    setIsAnalyzing(true);

    try {
      const aiPrompt = `너는 일기 감정 분석 전문가야. 아래의 일기 내용을 깊이 읽고, 오늘 하루의 기분과 감정을 가장 잘 대변하는 딱 한 개의 이모티콘만 반환해줘.\n\n⚠️ [절대 주의사항]\n1. 다른 설명, 인사말, 문장, 혹은 마크다운 기호(예: **😊**)는 일절 붙이지 마.\n2. 오직 이모티콘 '딱 1글자'만 텍스트 형태로 응답해야 해.\n\n일기 내용:\n"${diaryText}"`;

      // 🌟 2. 기존의 긴 fetch 코드 대신 통일된 apiClient 함수 사용!
      const data = await apiClient('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: aiPrompt }),
      });

      const aiEmoji = (data.reply || data.message || '').trim();

      // AI가 말을 안 듣고 문장으로 수다를 떨었을 때를 대비한 필터링 (4글자 이하일 때만 채택)
      const finalEmoji = (aiEmoji && aiEmoji.length <= 4) ? aiEmoji : selectedEmoji;

      onSaveDiary(selectedDateStr, diaryText, finalEmoji);

    } catch (error) {
      console.error('Gemini 이모지 추천 실패:', error);
      // 에러 시 유저가 직접 선택했던 이모지로 안전하게 저장 (Failsafe)
      onSaveDiary(selectedDateStr, diaryText, selectedEmoji);
    } finally {
      setIsAnalyzing(false);
      setIsModalOpen(false);
    }
  };

  return (
    <div className="page-container">
      <Header showSettings={true} />
      <main className="diary-main-content">
        <div className="large-calendar-card">
          <div className="large-calendar-header">
            <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="month-nav-btn">◀</button>
            <h2>{monthNames[month]} {year}</h2>
            <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="month-nav-btn">▶</button>
          </div>

          <div className="large-calendar-inner">
            <div className="day-of-week-grid">
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => <div key={day}>{day}</div>)}
            </div>

            <div className="large-calendar-grid">
              {calendarCells.map((cell) => {
                const dateStr = cell.date ? `${year}-${String(month + 1).padStart(2, '0')}-${String(cell.date).padStart(2, '0')}` : null;
                const dayData = dateStr ? diaryData?.[dateStr] : null;

                return (
                  <div
                    key={cell.id}
                    className={`diary-block ${!cell.date ? 'empty-block' : ''}`}
                    onClick={() => handleDateClick(cell.date)}
                  >
                    {cell.date && <span className="date-number">{cell.date}</span>}
                    {dayData && <span className="diary-emoji">{dayData.emoji}</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* 일기 작성 모달창 */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{selectedDateStr} 일기 쓰기</h3>

            <textarea 
              value={diaryText} 
              onChange={(e) => setDiaryText(e.target.value)}
              placeholder="오늘 하루는 어땠나요?"
              disabled={isAnalyzing}
            />

            <div className="modal-actions">
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="cancel-btn" 
                disabled={isAnalyzing}
              >
                취소
              </button>
              
              <button 
                onClick={handleSave} 
                className="save-btn" 
                disabled={isAnalyzing}
                style={{ backgroundColor: isAnalyzing ? '#999' : '#4a82db' }}
              >
                {isAnalyzing ? 'AI 분석 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DiaryMain;