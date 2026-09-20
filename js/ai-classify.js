// ─────────────────────────────────────────────────────────────
// js/ai-classify.js — US-09 ปุ่ม "ให้ AI ช่วยจัดประเภทการลา"
// สัปดาห์ที่ 8: เรียก OpenRouter ตรงจาก browser (ไม่มี backend)
// ความเป็นส่วนตัว (หัวข้อ 9): ส่งเฉพาะข้อความเหตุผลการลา + รายชื่อประเภทการลาเท่านั้น
// ห้ามส่ง requesterName / email / ข้อมูลระบุตัวตนอื่นใดไปกับ request
// ─────────────────────────────────────────────────────────────

(function () {
  var ปุ่มAI = document.getElementById("ปุ่มAI");
  var ป้ายAI = document.getElementById("ป้ายAI");
  var ช่องเหตุผล = document.getElementById("reason");
  var ช่องประเภท = document.getElementById("leaveTypeId");

  if (!ปุ่มAI || !ช่องเหตุผล || !ช่องประเภท) { return; }

  var ข้อความปุ่มปกติ = ปุ่มAI.textContent;
  var ข้อความจัดให้ไม่ได้ = "จัดประเภทให้ไม่ได้ในตอนนี้ — เลือกประเภทการลาได้ตามปกติ";

  ปุ่มAI.addEventListener("click", กดปุ่มAI);

  function กดปุ่มAI() {
    var เหตุผล = ช่องเหตุผล.value.trim();
    if (!เหตุผล) {
      alert("พิมพ์เหตุผลการลาก่อน จึงจะให้ AI ช่วยจัดประเภทได้");
      return;
    }

    var ตั้งค่า = window.AI_CONFIG || {};
    if (!ตั้งค่า.apiKey || ตั้งค่า.apiKey === "sk-or-xxxxxxxx") {
      แสดงป้าย("ยังไม่ได้ตั้งค่า AI — ใส่คีย์จริงในไฟล์ js/ai-config.js");
      return;
    }

    var รายชื่อประเภท = อ่านรายชื่อประเภทจากDOM();
    if (รายชื่อประเภท.length === 0) {
      แสดงป้าย(ข้อความจัดให้ไม่ได้);
      return;
    }

    เริ่มโหลด();

    var ตัวควบคุม = new AbortController();
    var ตัวจับเวลา = setTimeout(function () { ตัวควบคุม.abort(); }, 15000);

    var รายชื่อ = รายชื่อประเภท.map(function (t) { return t.name; });
    var systemPrompt =
      "คุณเป็นผู้ช่วยจัดประเภทการลาให้ระบบขอลาออนไลน์ " +
      "คุณต้องเลือกชื่อประเภทการลาจากรายการที่กำหนดให้เท่านั้น: [" + รายชื่อ.join(", ") + "] " +
      "ตอบกลับเป็นชื่อประเภทนั้นเป๊ะ ๆ ตัวเดียว ห้ามสร้างชื่อใหม่ ห้ามเพิ่มคำอธิบายหรือเครื่องหมายใด ๆ " +
      "ถ้าไม่มั่นใจว่าควรเลือกประเภทไหน ให้ตอบคำว่า \"ไม่ทราบ\" เท่านั้น";
    var userPrompt = "เหตุผลการลา: " + เหตุผล;

    fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + ตั้งค่า.apiKey
      },
      body: JSON.stringify({
        model: ตั้งค่า.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ]
      }),
      signal: ตัวควบคุม.signal
    })
      .then(function (การตอบกลับ) {
        if (!การตอบกลับ.ok) { throw new Error("API ตอบ error: " + การตอบกลับ.status); }
        return การตอบกลับ.json();
      })
      .then(function (ข้อมูล) {
        var ข้อความตอบ = ข้อมูล && ข้อมูล.choices && ข้อมูล.choices[0] &&
          ข้อมูล.choices[0].message && ข้อมูล.choices[0].message.content;
        ข้อความตอบ = (ข้อความตอบ || "").trim();

        var ประเภทที่ตรง = รายชื่อประเภท.find(function (t) {
          return t.name.trim() === ข้อความตอบ;
        });

        if (!ประเภทที่ตรง) {
          แสดงป้าย(ข้อความจัดให้ไม่ได้);
          return;
        }

        ช่องประเภท.value = ประเภทที่ตรง.value;
        แสดงป้าย(
          "🤖 ข้อเสนอจาก AI — โปรดตรวจสอบก่อนยืนยัน: จัดเป็น \"" + ประเภทที่ตรง.name + "\""
        );
      })
      .catch(function () {
        แสดงป้าย(ข้อความจัดให้ไม่ได้);
      })
      .finally(function () {
        clearTimeout(ตัวจับเวลา);
        เลิกโหลด();
      });
  }

  // อ่านรายชื่อประเภทการลาที่มีอยู่จริงจาก option ใน #leaveTypeId (ไม่ query Firestore ซ้ำ)
  function อ่านรายชื่อประเภทจากDOM() {
    var รายการ = [];
    var ตัวเลือกทั้งหมด = ช่องประเภท.querySelectorAll("option");
    ตัวเลือกทั้งหมด.forEach(function (ตัวเลือก) {
      if (ตัวเลือก.value) {
        รายการ.push({ value: ตัวเลือก.value, name: ตัวเลือก.textContent });
      }
    });
    return รายการ;
  }

  function เริ่มโหลด() {
    ปุ่มAI.disabled = true;
    ปุ่มAI.textContent = "กำลังวิเคราะห์…";
  }

  function เลิกโหลด() {
    ปุ่มAI.disabled = false;
    ปุ่มAI.textContent = ข้อความปุ่มปกติ;
  }

  function แสดงป้าย(ข้อความ) {
    if (!ป้ายAI) { return; }
    ป้ายAI.textContent = ข้อความ;
    ป้ายAI.classList.remove("hidden");
  }
})();
