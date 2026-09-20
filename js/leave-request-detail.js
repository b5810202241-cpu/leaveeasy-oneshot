// ─────────────────────────────────────────────────────────────
// js/leave-request-detail.js — หน้าที่ 3 รายละเอียดใบลา
// สัปดาห์ที่ 7: อ่าน/แก้/ลบใบลาจริงใน Firestore
// ความเห็นการอนุมัติเก็บใน subcollection leaveRequests/{id}/approvals
// ─────────────────────────────────────────────────────────────

(function () {
  var รหัสใบลา = ค่าจากURL("id");
  var กล่องใบลา = document.getElementById("กล่องใบลา");
  var กล่องความเห็น = document.getElementById("กล่องความเห็น");

  var เอกสารอ้างอิง = null;   // doc ref ของใบลานี้ใน collection leaveRequests
  var ใบ = null;
  var ความเห็น = [];

  // firebase-init.js เป็น module โหลดแบบ async ต้องรอให้พร้อมก่อนถึงจะใช้ window.db ได้
  if (window.db) { เริ่มทำงาน(); }
  else { window.addEventListener("firebase-พร้อมใช้", เริ่มทำงาน); }

  function เริ่มทำงาน() {
    if (!รหัสใบลา) {
      กล่องใบลา.innerHTML = "<p>ไม่พบใบขอลาที่ต้องการ — อาจถูกลบไปแล้ว หรือลิงก์ไม่ถูกต้อง</p>";
      return;
    }

    เอกสารอ้างอิง = window.fb.doc(window.db, "leaveRequests", รหัสใบลา);

    window.fb.getDoc(เอกสารอ้างอิง)
      .then(function (สแนป) {
        if (!สแนป.exists()) {
          กล่องใบลา.innerHTML = "<p>ไม่พบใบขอลาที่ต้องการ — อาจถูกลบไปแล้ว หรือลิงก์ไม่ถูกต้อง</p>";
          return null;
        }
        ใบ = สแนป.data();
        ใบ.id = สแนป.id;
        return โหลดความเห็น();
      })
      .then(function () {
        if (!ใบ) return;
        วาดใบลา();
        วาดความเห็น();
        กล่องความเห็น.classList.remove("hidden");
        document.getElementById("ปุ่มส่งความเห็น").addEventListener("click", ส่งความเห็น);
      })
      .catch(function (err) {
        กล่องใบลา.innerHTML = "<p>เกิดข้อผิดพลาดในการโหลดข้อมูล: " + esc(err.message) + "</p>";
      });
  }

  // อ่านความเห็นจาก subcollection approvals ของใบลานี้ เรียงจากเก่าไปใหม่
  function โหลดความเห็น() {
    var จุดอ้างอิง = window.fb.collection(เอกสารอ้างอิง, "approvals");
    var คำสั่ง = window.fb.query(จุดอ้างอิง, window.fb.orderBy("createdAt", "asc"));
    return window.fb.getDocs(คำสั่ง).then(function (สแนปช็อต) {
      ความเห็น = [];
      สแนปช็อต.forEach(function (เอกสาร) {
        var ข้อมูล = เอกสาร.data();
        ข้อมูล.id = เอกสาร.id;
        ความเห็น.push(ข้อมูล);
      });
    });
  }

  // ── วาดข้อมูลใบลาลงหน้าจอ ──
  function วาดใบลา() {
    var แถว = [
      ["หัวข้อ", esc(ใบ.title)],
      ["เหตุผลการลา", esc(ใบ.reason)],
      ["ประเภทการลา", esc(ใบ.leaveTypeName)],
      ["วันที่ลา", esc(ใบ.startDate) + " ถึง " + esc(ใบ.endDate)],
      ["ผู้ขอลา", esc(ใบ.requesterName)],
      ["ผู้อนุมัติ", ใบ.approverName ? esc(ใบ.approverName) : "ยังไม่ได้กำหนดผู้อนุมัติ"],
      ["สถานะ", ป้ายสถานะ(ใบ.status)],
      ["วันที่ยื่น", esc(ใบ.createdAt)]
    ];

    var html = แถว.map(function (r) {
      return '<div class="field-row"><span class="k">' + r[0] + "</span><span>" + r[1] + "</span></div>";
    }).join("");

    // หัวข้อ 2: เปลี่ยนสถานะได้เฉพาะ manager/hr เท่านั้น — employee ไม่เห็นปุ่มนี้เลย
    var เป็นผู้อนุมัติหรือฝ่ายบุคคล = window.currentUser &&
      (window.currentUser.role === "manager" || window.currentUser.role === "hr");
    // หัวข้อ 2: ลบได้เฉพาะเจ้าของใบเท่านั้น — คนอื่นไม่เห็นปุ่มนี้เลย
    var เป็นเจ้าของใบ = window.currentUser && window.currentUser.uid === ใบ.requesterId;

    if (ใบ.status === "รอพิจารณา" && เป็นผู้อนุมัติหรือฝ่ายบุคคล) {
      html +=
        '<div class="btn-row">' +
        '<button type="button" class="btn-ok" id="ปุ่มอนุมัติ">อนุมัติ</button>' +
        '<button type="button" class="btn-danger" id="ปุ่มไม่อนุมัติ">ไม่อนุมัติ</button>' +
        "</div>";
    } else if (ใบ.status !== "รอพิจารณา") {
      html += '<p class="hint">ใบนี้พิจารณาแล้ว จึงเปลี่ยนสถานะต่อไม่ได้</p>';
    }

    // ปุ่มลบ — แสดงเฉพาะเจ้าของใบ และเฉพาะตอนยังรอพิจารณาเท่านั้น (US-07)
    if (ใบ.status === "รอพิจารณา" && เป็นเจ้าของใบ) {
      html += '<div class="btn-row"><button type="button" class="btn-danger" id="ปุ่มลบ">ลบใบขอลานี้</button></div>';
    }

    กล่องใบลา.innerHTML = html;

    if (ใบ.status === "รอพิจารณา" && เป็นผู้อนุมัติหรือฝ่ายบุคคล) {
      document.getElementById("ปุ่มอนุมัติ").addEventListener("click", function () { เปลี่ยนสถานะ("อนุมัติ"); });
      document.getElementById("ปุ่มไม่อนุมัติ").addEventListener("click", function () { เปลี่ยนสถานะ("ไม่อนุมัติ"); });
    }
    if (ใบ.status === "รอพิจารณา" && เป็นเจ้าของใบ) {
      document.getElementById("ปุ่มลบ").addEventListener("click", ลบใบลา);
    }
  }

  // window.currentUser อาจยังไม่พร้อมตอนวาดครั้งแรก (auth-guard.js อ่าน role มาแบบ async)
  // พอพร้อมแล้ววาดปุ่มใหม่อีกครั้งให้ตรงสิทธิ์จริง
  window.addEventListener("ผู้ใช้พร้อมใช้", function () { if (ใบ) วาดใบลา(); });

  // ── เปลี่ยนสถานะ: แก้เฉพาะช่อง status เท่านั้น ห้ามเขียนทับช่องอื่น ──
  function เปลี่ยนสถานะ(สถานะใหม่) {
    // กฎ: จะกด "ไม่อนุมัติ" ได้ ต้องมีความเห็นอย่างน้อย 1 รายการก่อน
    if (สถานะใหม่ === "ไม่อนุมัติ" && ความเห็น.length === 0) {
      alert("ต้องเขียนความเห็นอย่างน้อย 1 รายการก่อน จึงจะกดไม่อนุมัติได้");
      return;
    }

    window.fb.updateDoc(เอกสารอ้างอิง, { status: สถานะใหม่ })
      .then(function () {
        ใบ.status = สถานะใหม่;
        วาดใบลา();
      })
      .catch(function (err) {
        alert("เปลี่ยนสถานะไม่สำเร็จ: " + err.message);
      });
  }

  // ── ลบใบลา: ต้องยืนยันก่อนเสมอ ลบได้เฉพาะตอนรอพิจารณา (ปุ่มโผล่เฉพาะตอนนั้นอยู่แล้ว) ──
  function ลบใบลา() {
    if (!confirm('ยืนยันการลบใบขอลา "' + ใบ.title + '" หรือไม่ — ลบแล้วกู้คืนไม่ได้')) return;

    window.fb.deleteDoc(เอกสารอ้างอิง)
      .then(function () {
        location.href = "leave-requests.html";
      })
      .catch(function (err) {
        alert("ลบไม่สำเร็จ: " + err.message);
      });
  }

  // ── รายการความเห็น เรียงจากเก่าไปใหม่ (query โหลดมาเรียงแล้ว) ──
  function วาดความเห็น() {
    var ที่วาง = document.getElementById("รายการความเห็น");
    if (ความเห็น.length === 0) {
      ที่วาง.innerHTML = "<p>ยังไม่มีความเห็นในใบนี้</p>";
      return;
    }
    ที่วาง.innerHTML = ความเห็น
      .map(function (c) {
        return '<div class="comment"><div class="meta">' + esc(c.authorName) + " · " + esc(c.createdAt) +
               "</div><div>" + esc(c.message) + "</div></div>";
      }).join("");
  }

  // ── ส่งความเห็นใหม่ ──
  function ส่งความเห็น() {
    var ช่อง = document.getElementById("ข้อความความเห็น");
    var เตือน = document.getElementById("เตือนความเห็น");
    var ข้อความ = ช่อง.value.trim();

    if (!ข้อความ) {
      เตือน.textContent = "⚠️ พิมพ์ข้อความก่อน จึงจะส่งความเห็นได้";
      เตือน.classList.remove("hidden");
      return;
    }
    เตือน.classList.add("hidden");

    // auth-guard.js (ทีมอื่นกำลังทำแยกต่างหาก) จะตั้งค่า window.currentUser = {uid, name, role}
    // เมื่อผู้ใช้ล็อกอินแล้ว — ถ้ายังไม่มี ให้ fallback เป็นสมหญิง รักงาน ชั่วคราว
    var ผู้เขียน = window.currentUser
      ? { id: window.currentUser.uid, name: window.currentUser.name }
      : { id: "u002", name: "สมหญิง รักงาน" };

    var ความเห็นใหม่ = {
      authorId: ผู้เขียน.id,
      authorName: ผู้เขียน.name,
      message: ข้อความ,
      createdAt: เวลาตอนนี้()
    };

    window.fb.addDoc(window.fb.collection(เอกสารอ้างอิง, "approvals"), ความเห็นใหม่)
      .then(function () {
        ความเห็น.push(ความเห็นใหม่);
        ช่อง.value = "";
        วาดความเห็น();
      })
      .catch(function (err) {
        เตือน.textContent = "⚠️ ส่งความเห็นไม่สำเร็จ: " + err.message;
        เตือน.classList.remove("hidden");
      });
  }
})();
