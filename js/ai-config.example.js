// js/ai-config.example.js — เทมเพลตค่าตั้งค่าเรียก AI ผ่าน OpenRouter
// วิธีใช้: คัดลอกไฟล์นี้เป็น js/ai-config.js (ชื่อไฟล์นั้นถูก .gitignore กันไว้แล้ว จึงไม่หลุดขึ้น GitHub)
// แล้วแทนที่ apiKey ด้วยคีย์จริงของคุณ
// ⚠️ คีย์นี้ฝังไว้ฝั่ง client เพราะสเปคกำหนดห้ามมีเซิร์ฟเวอร์ของตัวเอง (หัวข้อ 0.2)
// ก่อน deploy จริง ควรจำกัดสิทธิ์คีย์ที่ฝั่ง OpenRouter dashboard (ตั้งวงเงิน/โดเมนที่อนุญาต)
window.AI_CONFIG = {
  apiKey: "sk-or-xxxxxxxx",           // แทนที่ด้วยคีย์จริงของคุณ
  model: "google/gemini-2.5-flash-lite"
};
