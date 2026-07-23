import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom'; 
import Header from '../components/Header';
import { useSettings } from '../context/SettingsContext'; 
import { apiClient } from '../utils/api'; // 🌟 1. 새로 만든 API 통신 모듈 불러오기
import '../styles/AiChatMain.css';

function AiChatMain() {
  const location = useLocation(); 
  const { counselorTone } = useSettings(); 

  const [input, setInput] = useState(() => location.state?.draftText || ''); 
  const [isLoading, setIsLoading] = useState(false); 
  const messagesEndRef = useRef(null);

  const [sidebarOpen, setSidebarOpen] = useState(true);

  // 🌟 2. 변경: 동기식 초기화 제거, 빈 배열로 시작
  const [sessions, setSessions] = useState([]);
  // 🌟 3. 추가: 데이터 로딩 상태 관리 (비동기 통신 대비)
  const [isSessionsLoading, setIsSessionsLoading] = useState(true);

  const [activeSessionId, setActiveSessionId] = useState(() => location.state?.activeSessionId || null);
  const [messages, setMessages] = useState([]);

  /* =========================================================
     [🔄 비동기 데이터 로딩 및 상태 감지]
     ========================================================= */
  
  // 🌟 4. 추가: 비동기(async/await)로 세션 데이터를 불러오는 뼈대
  useEffect(() => {
    const fetchSessions = async () => {
      setIsSessionsLoading(true);
      try {
        // [AWS 연동 포인트] 나중에 이 부분을 const data = await apiClient('/api/sessions'); 로만 바꾸면 끝납니다!
        const saved = localStorage.getItem('chat_sessions');
        if (saved) {
          setSessions(JSON.parse(saved));
        }
      } catch (error) {
        console.error("세션 데이터 로딩 실패:", error);
      } finally {
        setIsSessionsLoading(false);
      }
    };

    fetchSessions();
  }, []);

  useEffect(() => {
    if (location.state?.activeSessionId) setActiveSessionId(location.state.activeSessionId);
    if (location.state?.draftText) setInput(location.state.draftText);
  }, [location.state]);

  // 🌟 5. 변경: 세션 데이터 로딩이 끝난 후에만 메시지를 세팅하도록 보호 장치 추가
  useEffect(() => {
    if (isSessionsLoading) return; // 데이터를 불러오는 중이면 대기

    if (activeSessionId) {
      const activeSession = sessions.find(s => s.id === activeSessionId);
      if (activeSession) setMessages(activeSession.messages);
    } else {
      const newWelcomeText = counselorTone === 'warm'
        ? '안녕하세요. 오늘 어떤 마음을 나누고 싶으신가요? 작은 고민이라도 편하게 말씀해 주세요. 당신의 이야기를 들을 준비가 되어 있습니다. 🌿'
        : '안녕하세요. 오늘 어떤 고민을 가지고 오셨나요? 문제의 상황과 고민 원인을 함께 차분히 분석하고, 명확하며 이성적인 해결책을 찾아보겠습니다. 🔍';
      
      setMessages([{ id: 'welcome', sender: 'ai', text: newWelcomeText }]);
    }
  }, [activeSessionId, counselorTone, sessions, isSessionsLoading]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


  /* =========================================================
     [💾 세션 저장, 신규 생성, 삭제 기능 함수]
     ========================================================= */
  const saveSession = (sessionId, updatedMsgs, initialTitle = null) => {
    setSessions((prevSessions) => {
      const existingIndex = prevSessions.findIndex(s => s.id === sessionId);
      let updated;

      if (existingIndex > -1) {
        updated = prevSessions.map((s, idx) => 
          idx === existingIndex ? { ...s, messages: updatedMsgs } : s
        );
      } else {
        const titleText = initialTitle || '새로운 상담';
        updated = [
          { id: sessionId, title: titleText, messages: updatedMsgs, createdAt: new Date().toISOString() },
          ...prevSessions
        ];
      }
      
      // [AWS 연동 포인트] 나중에 이 부분을 apiClient를 통한 서버 전송으로 수정
      localStorage.setItem('chat_sessions', JSON.stringify(updated));
      return updated;
    });
  };

  const generateAiSummary = async (sessionId, firstUserText) => {
    try {
      const summaryPrompt = `
너는 상담 대화 요약 전문가야.
다음 [내담자의 첫 고민 메시지]를 분석해서, 대화방 목록에 들어갈 2~3단어(공백 포함 10자 내외)의 직관적이고 깔끔한 제목을 만들어줘.
따옴표(""), 마침표(.), 수식어, 설명은 일체 배제하고 오직 요약된 제목만 딱 한 줄로 반환해줘.

[내담자의 첫 고민 메시지]
"${firstUserText}"

요약된 대화방 제목:`.trim();

      // 🌟 6. 변경: 복잡한 fetch 코드를 apiClient 단 한 줄로 압축!
      const data = await apiClient('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: summaryPrompt })
      });

      let aiTitle = data.reply || data.message;
      aiTitle = aiTitle.replace(/["'「」]/g, '').trim();

      setSessions((prevSessions) => {
        const updated = prevSessions.map(s => s.id === sessionId ? { ...s, title: aiTitle } : s);
        localStorage.setItem('chat_sessions', JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      console.error('AI 타이틀 요약 실패:', error);
      const fallbackTitle = firstUserText.length > 12 ? firstUserText.slice(0, 12) + '...' : firstUserText;
      setSessions((prevSessions) => {
        const updated = prevSessions.map(s => s.id === sessionId ? { ...s, title: fallbackTitle } : s);
        localStorage.setItem('chat_sessions', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const handleNewChat = () => setActiveSessionId(null);

  const handleDeleteSession = (sessionId, e) => {
    e.stopPropagation(); 
    if (window.confirm('이 대화 기록을 영구적으로 삭제하시겠습니까?')) {
      setSessions((prevSessions) => {
        const updated = prevSessions.filter(s => s.id !== sessionId);
        // [AWS 연동 포인트] 나중에 삭제 API 호출 추가
        localStorage.setItem('chat_sessions', JSON.stringify(updated));
        return updated;
      });
      if (activeSessionId === sessionId) setActiveSessionId(null);
    }
  };


  /* =========================================================
     [🚀 백엔드 통신 및 메시지 전송 함수]
     ========================================================= */
  const handleSendMessage = async (e) => {
    e.preventDefault(); 
    if (!input.trim() || isLoading) return; 

    const userText = input;
    setInput(''); 

    const userMessage = { id: `user-${Date.now()}`, sender: 'user', text: userText };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    let currentSessionId = activeSessionId;
    const isNewSession = !currentSessionId;
    if (isNewSession) {
      currentSessionId = `session-${Date.now()}`;
      setActiveSessionId(currentSessionId);
    }

    saveSession(currentSessionId, updatedMessages, isNewSession ? '요약 중...' : null);
    setIsLoading(true); 

    try {
      const warmInstruction = `너는 따뜻하고 공감 능력이 뛰어난 전문 심리 상담사야. \n[상담 원칙]\n1. 사용자(내담자)의 이야기를 주의 깊게 경청하고, 자상하고 부드러운 어조(존댓말)로 깊은 위로와 공감을 전해줘.\n2. 섣부르게 "이렇게 하세요" 같은 해결책을 제시하기보다는, 열린 질문을 통해 사용자가 자신의 감정을 더 깊이 들여다보고 스스로 답을 찾을 수 있도록 유도해줘.\n3. 답변은 너무 길지 않게, 실제 상담실에서 대화하듯 자연스럽고 호흡이 알맞게 작성해줘.\n4. 사용자가 극단적인 감정이나 위험한 이야기를 할 때는 부드럽게 전문 기관의 도움을 권유해줘.`;
      const logicalInstruction = `너는 이성적이고 분석 능력이 뛰어난 전문 해결형 상담사야.\n[상담 원칙]\n1. 사용자(내담자)의 고민과 상황을 논리적이고 객관적으로 분석해서, 명확하고 현실적인 해결책과 실천 가능한 조언을 제공해줘.\n2. 과장된 감정적 위로나 동정보다는, 차분하고 이성적인 어조(존댓말)로 문제의 핵심 원인을 짚고 생각의 정리를 도와줘.\n3. 답변은 불필요한 미사여구 없이 핵심 위주로, 명료하고 이해하기 쉽게 작성해줘.\n4. 사용자가 감정적으로 지나치게 흔들릴 때, 감정과 사실을 이성적으로 분리해서 바라볼 수 있게 가이드해줘.`;

      const systemInstruction = counselorTone === 'warm' ? warmInstruction : logicalInstruction;

      const historyText = updatedMessages
        .filter(msg => msg.id !== 'welcome' && !msg.id.startsWith('error'))
        .map(msg => `${msg.sender === 'user' ? '내담자' : '상담사'}: ${msg.text}`)
        .join('\n');

      const counselorPayload = `${systemInstruction}\n\n[지금까지 나누어 온 상담 기록]\n${historyText}\n\n상담사인 나의 다음 답변:`;

      // 🌟 7. 변경: 긴 fetch 대신 중앙 관리소(apiClient) 활용
      const data = await apiClient('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: counselorPayload }),
      });

      const aiMessage = { id: `ai-${Date.now()}`, sender: 'ai', text: data.reply || data.message };
      
      const finalMessages = [...updatedMessages, aiMessage];
      setMessages(finalMessages);
      saveSession(currentSessionId, finalMessages);

      if (isNewSession) {
        generateAiSummary(currentSessionId, userText);
      }

    } catch (error) {
      console.error('백엔드 통신 에러:', error);
      const errorMessage = { 
        id: `error-${Date.now()}`, 
        sender: 'ai', 
        text: '⚠️ 상담소 연결에 잠시 문제가 생겼습니다. 잠시 후 다시 마음을 들려주세요.' 
      };
      const errorMessages = [...updatedMessages, errorMessage];
      setMessages(errorMessages);
      saveSession(currentSessionId, errorMessages);
    } finally {
      setIsLoading(false); 
    }
  };

  return (
    <div className={`aichat-page-container ${sidebarOpen ? 'sidebar-opened' : 'sidebar-closed'}`}>
      
      {/* 🧭 왼쪽 사이드바 영역 */}
      <aside className="chat-sidebar">
        <div className="sidebar-header">
          <button className="new-chat-btn" onClick={handleNewChat}>
            <span className="plus-icon">+</span> 새로운 상담 시작
          </button>
        </div>

        <div className="sidebar-history-list">
          <p className="history-title">최근 대화 기록</p>
          
          {/* 🌟 8. 추가: 세션 데이터를 불러오는 중일 때의 UI 처리 */}
          {isSessionsLoading ? (
            <p className="no-history-msg">대화 기록을 불러오는 중... ⏳</p>
          ) : sessions.length === 0 ? (
            <p className="no-history-msg">이전 상담 기록이 없습니다. 🌿</p>
          ) : (
            sessions.map((session) => (
              <div 
                key={session.id} 
                className={`history-item ${activeSessionId === session.id ? 'active' : ''}`}
                onClick={() => setActiveSessionId(session.id)}
              >
                <span className="chat-icon-bubble">💬</span>
                <span className="session-title">{session.title}</span>
                <button 
                  className="delete-session-btn" 
                  onClick={(e) => handleDeleteSession(session.id, e)}
                  title="삭제"
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* 🖥️ 우측 메인 대화 영역 */}
      <div className="chat-main-wrapper">
        <Header />
        
        <button 
          type="button" 
          className="sidebar-toggle-btn" 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          title={sidebarOpen ? "사이드바 접기" : "사이드바 펼치기"}
        >
          {sidebarOpen ? '◀' : '▶'}
        </button>

        <main className="chat-main-content">
          <div className="full-chat-box">
            
            <div className="chat-messages-display">
              {messages.map((msg) => (
                <div key={msg.id} className={`chat-bubble-row ${msg.sender}`}>
                  <div className={`chat-bubble ${msg.sender}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="chat-bubble-row ai">
                  <div className="chat-bubble ai thinking">
                    {counselorTone === 'warm' 
                      ? "상담사가 당신의 마음을 귀 기울여 생각하고 있습니다... 🌿"
                      : "상담사가 전해주신 상황을 객관적으로 분석하는 중입니다... 🔍"}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="chat-input-wrapper">
              <div className="center-input-bar">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isLoading ? "당신의 마음을 깊이 생각하는 중입니다..." : "상담사에게 당신의 마음을 털어놓아 보세요"}
                  disabled={isLoading} 
                />
                <button type="submit" className="chat-icon-btn" disabled={isLoading}>↑</button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AiChatMain;