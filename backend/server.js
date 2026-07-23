const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');

// backend 폴더 기준으로 한 칸 위(..)로 올라가서 최상단의 .env를 읽어오도록 설정
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5001; // 에어플레이와 충돌 없는 5001번 포트 사용

// 🌟 미들웨어 설정
app.use(cors()); // 프론트엔드 React 앱과의 통신 허용
app.use(express.json()); // JSON 형태의 요청 데이터 해석

// 🌟 Gemini AI 초기화 (.env의 API 키 로드)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 🌟 [추가] 백엔드 생존 확인용 테스트 페이지 (GET http://127.0.0.1:5001)
// 이제 브라우저에 주소를 치면 'Cannot GET /' 대신 이 이쁜 문구가 반겨줍니다!
app.get('/', (req, res) => {
  res.send('🚀 백엔드 서버가 5001번 포트에서 정상적으로 살아있습니다! 프론트엔드와 통신할 준비 완료!');
});

// 🌟 AI 채팅 API 엔드포인트 (POST http://127.0.0.1:5001/api/chat)
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body; // 프론트엔드가 보낸 유저의 메시지

    if (!message) {
      return res.status(400).json({ error: '메시지 내용이 없습니다.' });
    }

    // 가장 빠르고 효율적인 gemini-1.5-flash 모델 장착
    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });
    
    // Gemini에게 질문을 던지고 답변을 받아옵니다 (불필요한 중복 await 제거로 최적화)
    const result = await model.generateContent(message);
    const aiResponse = result.response.text();

    // 결과를 다시 프론트엔드로 리턴
    res.json({ reply: aiResponse });

  } catch (error) {
    console.error('Gemini API 연동 중 에러 발생:', error);
    res.status(500).json({ error: '서버 내부 에러가 발생했습니다.' });
  }
});

// 🌟 서버 가동
// 맥 환경의 IPv4 경로 인식을 위해 '0.0.0.0' 주소를 명시하여 대기합니다.
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 백엔드 서버가 http://127.0.0.1:${PORT} 에서 완벽하게 대기 중입니다!`);
});