// ─────────────────────────────────────────────────────────────
// js/leave-types.js — หน้าที่ 4 จัดการประเภทการลา
// สัปดาห์ที่ 7: CRUD ครบทั้ง 4 ตัวกับ collection leaveTypes จริงบน Firestore
// ─────────────────────────────────────────────────────────────

(function () {
  var ที่วางตาราง = document.getElementById("ตารางประเภท");
  var ช่องชื่อใหม่ = document.getElementById("ชื่อประเภทใหม่");
  var กล่องเตือน = document.getElementById("เตือนประเภท");
  var จุดอ้างอิงคอลเลกชัน = null;

  // firebase-init.js เป็น module โหลดแบบ async ต้องรอให้พร้อมก่อนถึงจะใช้ window.db ได้
  if (window.db) { เริ่มทำงาน(); }
  else { window.addEventListener("firebase-พร้อมใช้", เริ่มทำงาน); }

  function เริ่มทำงาน() {
    จุดอ้างอิงคอลเลกชัน = window.fb.collection(window.db, "leaveTypes");
    วาดตาราง();
    document.getElementById("ปุ่มเพิ่ม").addEventListener("click", เพิ่มประเภท);
    ตรวจสิทธิ์();
  }

  // หัวข้อ 2: จัดการประเภทการลาได้เฉพาะฝ่ายบุคคล (hr) เท่านั้น — คนอื่นไม่เห็นฟอร์มเพิ่มเลย
  // window.currentUser อาจยังไม่พร้อมตอนโหลดหน้าครั้งแรก (auth-guard.js อ่าน role มาแบบ async)
  function ตรวจสิทธิ์() {
    if (!window.currentUser) return;
    var เป็นฝ่ายบุคคล = window.currentUser.role === "hr";
    var การ์ดเพิ่ม = ช่องชื่อใหม่.closest(".card");
    if (การ์ดเพิ่ม) การ์ดเพิ่ม.classList.toggle("hidden", !เป็นฝ่ายบุคคล);
    วาดตาราง();
  }
  window.addEventListener("ผู้ใช้พร้อมใช้", ตรวจสิทธิ์);

  function โหลดรายการ() {
    return window.fb.getDocs(จุดอ้างอิงคอลเลกชัน).then(function (สแนปช็อต) {
      var รายการ = [];
      สแนปช็อต.forEach(function (เอกสาร) {
        รายการ.push({ id: เอกสาร.id, name: เอกสาร.data().name });
      });
      return รายการ;
    });
  }

  // โหลดข้อมูลใหม่จาก Firestore แล้ววาดตาราง — เรียกซ้ำได้หลังทุกการแก้ไข
  function วาดตาราง() {
    โหลดรายการ()
      .then(function (รายการ) {
        if (รายการ.length === 0) {
          ที่วางตาราง.innerHTML = "<p>ยังไม่มีประเภทการลาในระบบ</p>";
          return;
        }

        // หัวข้อ 2: แก้/ลบประเภทการลาได้เฉพาะฝ่ายบุคคล (hr) — คนอื่นเห็นแค่ชื่อ ไม่เห็นปุ่ม
        var เป็นฝ่ายบุคคล = window.currentUser && window.currentUser.role === "hr";

        var html = "<table><thead><tr><th>ชื่อประเภทการลา</th>" +
          (เป็นฝ่ายบุคคล ? "<th>จัดการ</th>" : "") + "</tr></thead><tbody>";
        รายการ.forEach(function (ประเภท) {
          html += "<tr><td>" + esc(ประเภท.name) + "</td>";
          if (เป็นฝ่ายบุคคล) {
            html += "<td>" +
              '<button type="button" class="btn-ghost" data-edit="' + esc(ประเภท.id) + '">แก้ไข</button> ' +
              '<button type="button" class="btn-danger" data-del="' + esc(ประเภท.id) + '">ลบ</button>' +
              "</td>";
          }
          html += "</tr>";
        });
        html += "</tbody></table>";
        ที่วางตาราง.innerHTML = html;

        ที่วางตาราง.querySelectorAll("[data-edit]").forEach(function (ปุ่ม) {
          ปุ่ม.addEventListener("click", function () { แก้ประเภท(ปุ่ม.dataset.edit, รายการ); });
        });
        ที่วางตาราง.querySelectorAll("[data-del]").forEach(function (ปุ่ม) {
          ปุ่ม.addEventListener("click", function () { ลบประเภท(ปุ่ม.dataset.del, รายการ); });
        });
      })
      .catch(function (err) {
        ที่วางตาราง.innerHTML = "<p>โหลดข้อมูลไม่สำเร็จ: " + esc(err.message) + "</p>";
      });
  }

  function เพิ่มประเภท() {
    var ชื่อ = ช่องชื่อใหม่.value.trim();
    if (!ชื่อ) {
      กล่องเตือน.textContent = "⚠️ พิมพ์ชื่อประเภทการลาก่อน จึงจะเพิ่มได้";
      กล่องเตือน.classList.remove("hidden");
      return;
    }
    กล่องเตือน.classList.add("hidden");

    window.fb.addDoc(จุดอ้างอิงคอลเลกชัน, { name: ชื่อ })
      .then(function () {
        ช่องชื่อใหม่.value = "";
        วาดตาราง();
      })
      .catch(function (err) {
        กล่องเตือน.textContent = "⚠️ เพิ่มไม่สำเร็จ: " + err.message;
        กล่องเตือน.classList.remove("hidden");
      });
  }

  function แก้ประเภท(id, รายการ) {
    var ประเภท = รายการ.find(function (t) { return t.id === id; });
    var ชื่อใหม่ = prompt("แก้ชื่อประเภทการลา", ประเภท.name);
    if (ชื่อใหม่ === null) return;              // กดยกเลิก
    if (!ชื่อใหม่.trim()) { alert("ชื่อประเภทการลาว่างเปล่าไม่ได้"); return; }

    window.fb.updateDoc(window.fb.doc(window.db, "leaveTypes", id), { name: ชื่อใหม่.trim() })
      .then(วาดตาราง)
      .catch(function (err) { alert("แก้ไขไม่สำเร็จ: " + err.message); });
  }

  function ลบประเภท(id, รายการ) {
    var ประเภท = รายการ.find(function (t) { return t.id === id; });
    if (!confirm('ยืนยันการลบประเภท "' + ประเภท.name + '" หรือไม่')) return;

    window.fb.deleteDoc(window.fb.doc(window.db, "leaveTypes", id))
      .then(วาดตาราง)
      .catch(function (err) { alert("ลบไม่สำเร็จ: " + err.message); });
  }
})();
