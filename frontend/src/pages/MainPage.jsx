import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import Header from '../components/Header';
import { useSettings } from '../context/SettingsContext';
import { apiClient } from '../utils/api'; // 🌟 1. API 중앙 관리소 불러오기
import '../styles/MainPage.css';

const EXTERNAL_LINKS = [
  { id: 1, name: "한국인 우울 척도 검사", url: "https://www.mentalhealth.go.kr/portal/mdexmnDtl/getMdexmnDtlJoin.do", imgSrc: "/img/men_01.png" },
  { id: 2, name: "한국인 불안 척도 검사", url: "https://www.mentalhealth.go.kr/portal/mdexmnDtl/getMdexmnDtlJoin.do", imgSrc: "/img/men_02.png" },
  { id: 3, name: "한국인 스트레스 검사", url: "https://www.mentalhealth.go.kr/portal/mdexmnDtl/getMdexmnDtlJoin.do", imgSrc: "/img/men_03.png" },
  { id: 4, name: "우울증 검사", url: "https://www.mentalhealth.go.kr/portal/mdexmnDtl/getMdexmnDtlJoin.do", imgSrc: "/img/men_04.png" },
  { id: 5, name: "범불안장애 검사", url: "https://www.mentalhealth.go.kr/portal/mdexmnDtl/getMdexmnDtlJoin.do", imgSrc: "/img/men_05.png" },
  { id: 6, name: "양극성장애 검사", url: "https://www.mentalhealth.go.kr/portal/mdexmnDtl/getMdexmnDtlJoin.do", imgSrc: "/img/men_06.png" },
  { id: 7, name: "강박장애 검사", url: "https://www.mentalhealth.go.kr/portal/mdexmnDtl/getMdexmnDtlJoin.do", imgSrc: "/img/men_07.png" },
  { id: 8, name: "게임 생활습관 검사", url: "https://www.mentalhealth.go.kr/portal/mdexmnDtl/getMdexmnDtlJoin.do", imgSrc: "/img/men_08.png" },
  { id: 9, name: "공황장애 검사", url: "https://www.mentalhealth.go.kr/portal/mdexmnDtl/getMdexmnDtlJoin.do", imgSrc: "/img/men_09.png" },
  { id: 10, name: "노인우울장애 검사", url: "https://www.mentalhealth.go.kr/portal/mdexmnDtl/getMdexmnDtlJoin.do", imgSrc: "/img/men_10.png" },
  { id: 11, name: "스마트폰 생활습관 검사", url: "https://www.mentalhealth.go.kr/portal/mdexmnDtl/getMdexmnDtlJoin.do", imgSrc: "/img/men_11.png" },
  { id: 12, name: "아동용 ADHD 검사", url: "https://www.mentalhealth.go.kr/portal/mdexmnDtl/getMdexmnDtlJoin.do", imgSrc: "/img/men_12.png" },
  { id: 13, name: "알코올 중독 검사", url: "https://www.mentalhealth.go.kr/portal/mdexmnDtl/getMdexmnDtlJoin.do", imgSrc: "/img/men_13.png" },
  { id: 14, name: "외상후 스트레스 장애 검사", url: "https://www.mentalhealth.go.kr/portal/mdexmnDtl/getMdexmnDtlJoin.do", imgSrc: "/img/men_14.png" },
  { id: 15, name: "인지장애(보호자) 검사", url: "https://www.mentalhealth.go.kr/portal/mdexmnDtl/getMdexmnDtlJoin.do", imgSrc: "/img/men_15.png" },
  { id: 16, name: "인지장애(치매) 검사", url: "https://www.mentalhealth.go.kr/portal/mdexmnDtl/getMdexmnDtlJoin.do", imgSrc: "/img/men_16.png" },
  { id: 17, name: "인터넷 생활습관 검사", url: "https://www.mentalhealth.go.kr/portal/mdexmnDtl/getMdexmnDtlJoin.do", imgSrc: "/img/men_17.png" },
  { id: 18, name: "자살 검사", url: "https://www.mentalhealth.go.kr/portal/mdexmnDtl/getMdexmnDtlJoin.do", imgSrc: "/img/men_18.png" },
  { id: 19, name: "정신장애 검사", url: "https://www.mentalhealth.go.kr/portal/mdexmnDtl/getMdexmnDtlJoin.do", imgSrc: "/img/men_19.png" },
  { id: 20, name: "조기정신증 검사", url: "https://www.mentalhealth.go.kr/portal/mdexmnDtl/getMdexmnDtlJoin.do", imgSrc: "/img/men_20.png" },
  { id: 21, name: "청소년 자해 검사", url: "https://www.mentalhealth.go.kr/portal/mdexmnDtl/getMdexmnDtlJoin.do", imgSrc: "/img/men_21.png" },
  { id: 22, name: "청소년 조울병(보호자) 검사", url: "https://www.mentalhealth.go.kr/portal/mdexmnDtl/getMdexmnDtlJoin.do", imgSrc: "/img/men_22.png" }
];

function MainPage({ diaryData = {} }) {
  const navigate = useNavigate();
  const { counselorTone } = useSettings();

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null); 
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const welcomeText = counselorTone === 'warm'
      ? '안녕하세요. 오늘 어떤 마음을 나누고 싶으신가요? 작은 고민이라도 편하게 말씀해 주세요. 당신의 이야기를 들을 준비가 되어 있습니다. 🌿'
      : '안녕하세요. 오늘 어떤 고민을 가지고 오셨나요? 문제의 상황과 고민 원인을 함께 차분히 분석하고, 명확하며 이성적인 해결책을 찾아보겠습니다. 🔍';
    
    setMessages([{ id: 'welcome', sender: 'ai', text: welcomeText }]);
  }, [counselorTone]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const saveMainSessionToStorage = (currSessionId, updatedMsgs) => {
    if (!currSessionId) return;

    const saved = localStorage.getItem('chat_sessions');
    let sessions = saved ? JSON.parse(saved) : [];
    const existingIndex = sessions.findIndex(s => s.id === currSessionId);

    if (existingIndex > -1) {
      sessions[existingIndex].messages = updatedMsgs;
    } else {
      sessions = [
        {
          id: currSessionId,
          title: '요약 중...', 
          messages: updatedMsgs,
          createdAt: new Date().toISOString()
        },
        ...sessions
      ];
    }
    localStorage.setItem('chat_sessions', JSON.stringify(sessions));
  };

  const handleExpandPage = () => {
    const isInputValueEmpty = !inputValue.trim();
    const hasNoChatHistory = messages.length <= 1;

    if (isInputValueEmpty && hasNoChatHistory) {
      navigate('/ai-chat', { 
        state: { 
          activeSessionId: null,
          draftText: ''
        } 
      });
      return;
    }

    let activeId = sessionId;

    if (!activeId) {
      activeId = `session-${Date.now()}`;
      setSessionId(activeId);
    }

    saveMainSessionToStorage(activeId, messages);

    navigate('/ai-chat', { 
      state: { 
        activeSessionId: activeId,
        draftText: inputValue
      } 
    });
  };

  const handleGoToDiary = () => {
    navigate('/diary'); 
  };

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const miniCalendarCells = [];

  for (let i = 0; i < firstDayOfMonth; i++) {
    miniCalendarCells.push({ id: `m-empty-${i}`, date: null });
  }
  for (let date = 1; date <= daysInMonth; date++) {
    miniCalendarCells.push({ id: `m-date-${date}`, date: date });
  }

  const [randomLinks, setRandomLinks] = useState([]);

  useEffect(() => {
    const shuffled = [...EXTERNAL_LINKS].sort(() => 0.5 - Math.random());
    setRandomLinks(shuffled.slice(0, 2));
  }, []); 

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue;
    setInputValue('');

    const newUserMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userText,
    };

    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);

    let currentSessionId = sessionId;
    if (!currentSessionId) {
      currentSessionId = `session-${Date.now()}`;
      setSessionId(currentSessionId);
    }

    saveMainSessionToStorage(currentSessionId, updatedMessages);
    setIsLoading(true);

    try {
      const warmInstruction = `
너는 따뜻하고 공감 능력이 뛰어난 전문 심리 상담사야. 
[상담 원칙]
1. 사용자(내담자)의 이야기를 주의 깊게 경청하고, 자상하고 부드러운 어조(존댓말)로 깊은 위로와 공감을 전해줘.
2. 섣부르게 "이렇게 하세요" 같은 해결책을 제시하기보다는, 열린 질문을 통해 사용자가 자신의 감정을 더 깊이 들여다보고 스스로 답을 찾을 수 있도록 유도해줘.
3. 답변은 너무 길지 않게, 실제 상담실에서 대화하듯 자연스럽고 호흡이 알맞게 작성해줘.
4. 사용자가 극단적인 감정이나 위험한 이야기를 할 때는 부드럽게 전문 기관의 도움을 권유해줘.
`.trim();

      const logicalInstruction = `
너는 이성적이고 분석 능력이 뛰어난 전문 해결형 상담사야.
[상담 원칙]
1. 사용자(내담자)의 고민과 상황을 논리적이고 객관적으로 분석해서, 명확하고 현실적인 해결책과 실천 가능한 조언을 제공해줘.
2. 과장된 감정적 위로나 동정보다는, 차분하고 이성적인 어조(존댓말)로 문제의 핵심 원인을 짚고 생각의 정리를 도와줘.
3. 답변은 불필요한 미사여구 없이 핵심 위주로, 명료하고 이해하기 쉽게 작성해줘.
4. 사용자가 감정적으로 지나치게 흔들릴 때, 감정과 사실을 이성적으로 분리해서 바라볼 수 있게 가이드해줘.
`.trim();

      const systemInstruction = counselorTone === 'warm' ? warmInstruction : logicalInstruction;

      const historyText = updatedMessages
        .filter(msg => msg.id !== 'welcome' && !msg.id.startsWith('error'))
        .map(msg => `${msg.sender === 'user' ? '내담자' : '상담사'}: ${msg.text}`)
        .join('\n');

      const counselorPayload = `${systemInstruction}\n\n[지금까지 나누어 온 상담 기록]\n${historyText}\n\n상담사인 나의 다음 답변:`;

      // 🌟 2. 기존의 복잡한 fetch 코드 대신 중앙 관리소(apiClient) 활용!
      const data = await apiClient('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: counselorPayload }),
      });

      const newAiMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.reply || data.message || '답변을 읽어오지 못했습니다.',
      };
      
      const finalMessages = [...updatedMessages, newAiMessage];
      setMessages(finalMessages);
      
      saveMainSessionToStorage(currentSessionId, finalMessages);

    } catch (error) {
      console.error('백엔드 통신 에러:', error);
      const errorMessage = { 
        id: `error-${Date.now()}`, 
        sender: 'ai', 
        text: '⚠️ 상담소 연결에 잠시 문제가 생겼습니다. 잠시 후 다시 마음을 들려주세요.' 
      };
      const finalMessages = [...updatedMessages, errorMessage];
      setMessages(finalMessages);
      saveMainSessionToStorage(currentSessionId, finalMessages);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-container">
      <Header />
      <main className="main-content">
        
        <section className="left-section">
          <div className="chat-box">
            
            <button className="expand-btn" onClick={handleExpandPage} title="크게 보기">⤢</button>
            
            <div className="chat-messages">
              {messages.map((msg) => (
                <div key={msg.id} className={`message-bubble ${msg.sender}`}>
                  <span>{msg.text}</span>
                </div>
              ))}
              
              {isLoading && (
                <div className="chat-loading">
                  상담사가 마음을 귀 기울여 생각하는 중... 🌿
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="input-bar-container">
              <div className="input-bar">
                <input 
                  type="text" 
                  placeholder={isLoading ? "당신의 마음을 깊이 생각하는 중입니다..." : "상담사에게 당신의 마음을 털어놓아 보세요..."} 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={isLoading} 
                />
                <button type="submit" className="icon-btn" disabled={isLoading}>↑</button>
              </div>
            </form>
          </div>
        </section>

        <section className="right-section">
          
          <div className="list-panel">
            {randomLinks.map((link) => (
              <a 
                key={link.id} 
                href={link.url} 
                target="_blank"      
                rel="noopener noreferrer" 
                className="list-item"
              >
                <img src={link.imgSrc} alt={link.name} className="link-thumbnail" />
                <div className="thumbnail-title-bar">
                  {link.name}
                </div>
              </a>
            ))}
          </div>

          <div className="mini-calendar-panel" onClick={handleGoToDiary}>
            <h3 className="calendar-title">{monthNames[month]}</h3>
            <div className="mini-calendar-grid">
              {miniCalendarCells.map((cell) => {
                const dateStr = cell.date ? `${year}-${String(month + 1).padStart(2, '0')}-${String(cell.date).padStart(2, '0')}` : null;
                const dayData = dateStr ? diaryData[dateStr] : null;

                return (
                  <div key={cell.id} className={`calendar-block ${!cell.date ? 'empty' : ''}`}>
                    {cell.date && <span className="mini-date-num">{cell.date}</span>}
                    {dayData && dayData.emoji && (
                      <span className="mini-emoji">{dayData.emoji}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </section>
      </main>
    </div>
  );
}

export default MainPage;