// ─────────────────────────────────────────────────────────────
// js/new-leave-request.js — หน้าที่ 2 ยื่นใบลาใหม่
// สัปดาห์ที่ 7: โหลดประเภทการลาจาก Firestore จริง และบันทึกใบลาใหม่ลง Firestore จริง
// ─────────────────────────────────────────────────────────────

(function () {
  var ฟอร์ม = document.getElementById("ฟอร์มใบลา");
  var ช่องประเภท = document.getElementById("leaveTypeId");
  var กล่องเตือน = document.getElementById("ข้อความเตือน");
  var รายการประเภท = [];   // เก็บไว้ใช้หาชื่อประเภทตอนบันทึก (denormalize)

  // firebase-init.js เป็น module โหลดแบบ async ต้องรอให้พร้อมก่อนถึงจะใช้ window.db ได้
  if (window.db) { เริ่มทำงาน(); }
  else { window.addEventListener("firebase-พร้อมใช้", เริ่มทำงาน); }

  function เริ่มทำงาน() {
    โหลดประเภทการลา();
    ฟอร์ม.addEventListener("submit", บันทึกใบลา);
  }

  // เติมรายการเลื่อนลงด้วยประเภทการลาจาก collection leaveTypes
  function โหลดประเภทการลา() {
    window.fb.getDocs(window.fb.collection(window.db, "leaveTypes"))
      .then(function (สแนปช็อต) {
        สแนปช็อต.forEach(function (เอกสาร) {
          var ข้อมูล = เอกสาร.data();
          รายการประเภท.push({ id: เอกสาร.id, name: ข้อมูล.name });

          var ตัวเลือก = document.createElement("option");
          ตัวเลือก.value = เอกสาร.id;
          ตัวเลือก.textContent = ข้อมูล.name;
          ช่องประเภท.appendChild(ตัวเลือก);
        });
      })
      .catch(function (err) {
        เตือน("โหลดประเภทการลาไม่สำเร็จ: " + err.message);
      });
  }

  function บันทึกใบลา(e) {
    e.preventDefault();

    var ค่า = {
      title: document.getElementById("title").value.trim(),
      reason: document.getElementById("reason").value.trim(),
      leaveTypeId: ช่องประเภท.value,
      startDate: document.getElementById("startDate").value,
      endDate: document.getElementById("endDate").value
    };

    // ตรวจว่ากรอกครบก่อนบันทึก
    if (!ค่า.title || !ค่า.reason || !ค่า.leaveTypeId || !ค่า.startDate || !ค่า.endDate) {
      เตือน("กรอกไม่ครบ — ต้องกรอกทุกช่องก่อนกดบันทึก");
      return;
    }
    if (ค่า.endDate < ค่า.startDate) {
      เตือน("วันที่สิ้นสุดต้องไม่มาก่อนวันที่เริ่มลา");
      return;
    }

    var ประเภท = รายการประเภท.find(function (t) { return t.id === ค่า.leaveTypeId; });

    // auth-guard.js (ทีมอื่นกำลังทำแยกต่างหาก) จะตั้งค่า window.currentUser = {uid, name, role}
    // เมื่อผู้ใช้ล็อกอินแล้ว — ถ้ายังไม่มี (ยังไม่ต่อสาย auth) ให้ fallback เป็นสมชาย ใจดี ชั่วคราว
    var ผู้ขอลา = window.currentUser
      ? { id: window.currentUser.uid, name: window.currentUser.name }
      : { id: "u001", name: "สมชาย ใจดี" };

    var ใบใหม่ = {
      title: ค่า.title,
      reason: ค่า.reason,
      status: "รอพิจารณา",                       // ใบใหม่เริ่มที่ รอพิจารณา เสมอ
      requesterId: ผู้ขอลา.id, requesterName: ผู้ขอลา.name,
      approverId: "",          approverName: "",
      leaveTypeId: ประเภท.id,  leaveTypeName: ประเภท.name,
      startDate: ค่า.startDate,
      endDate: ค่า.endDate,
      createdAt: เวลาตอนนี้()
    };

    window.fb.addDoc(window.fb.collection(window.db, "leaveRequests"), ใบใหม่)
      .then(function () {
        location.href = "leave-requests.html";
      })
      .catch(function (err) {
        เตือน("บันทึกไม่สำเร็จ: " + err.message);
      });
  }

  function เตือน(ข้อความ) {
    กล่องเตือน.textContent = "⚠️ " + ข้อความ;
    กล่องเตือน.classList.remove("hidden");
  }
})();
