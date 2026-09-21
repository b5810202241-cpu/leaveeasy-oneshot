// ─────────────────────────────────────────────────────────────
// js/leave-requests.js — หน้าที่ 1 รายการใบลา
// สัปดาห์ที่ 6: อ่านข้อมูลจริงจาก Firestore (collection leaveRequests)
// ─────────────────────────────────────────────────────────────

(function () {
  var กล่อง = document.getElementById("ผลลัพธ์");

  // auth-guard.js อ่าน role ของผู้ใช้มาตั้ง window.currentUser แบบ async (หลัง firebase-พร้อมใช้)
  // ต้องรอ role ให้พร้อมก่อน ถึงจะรู้ว่าควร query แบบกรองเฉพาะใบของตัวเอง (employee) หรืออ่านได้ทุกใบ (manager/hr)
  // — ถ้า query แบบไม่กรองทั้งที่เป็น employee, กฎความปลอดภัยของ Firestore จะปฏิเสธทั้ง query ทันที
  //   เพราะ collection มีใบลาของคนอื่นปนอยู่ด้วย (rules อนุญาตแค่ resource.data.requesterId == auth.uid)
  if (window.currentUser) { เริ่มทำงาน(); }
  else { window.addEventListener("ผู้ใช้พร้อมใช้", เริ่มทำงาน); }

  function เริ่มทำงาน() {
    var เป็นผู้อนุมัติหรือฝ่ายบุคคล = window.currentUser &&
      (window.currentUser.role === "manager" || window.currentUser.role === "hr");

    var คำสั่ง = เป็นผู้อนุมัติหรือฝ่ายบุคคล
      ? window.fb.collection(window.db, "leaveRequests")
      : window.fb.query(
          window.fb.collection(window.db, "leaveRequests"),
          window.fb.where("requesterId", "==", window.currentUser.uid)
        );

    window.fb.getDocs(คำสั่ง)
      .then(function (สแนปช็อต) {
        var ใบลาทั้งหมด = [];
        สแนปช็อต.forEach(function (เอกสาร) {
          var ข้อมูล = เอกสาร.data();
          ข้อมูล.id = เอกสาร.id;
          ใบลาทั้งหมด.push(ข้อมูล);
        });

        // ถ้ามีสถานะติดมาท้าย URL ให้กรองเฉพาะสถานะนั้น (กรองฝั่ง client)
        var สถานะที่กรอง = ค่าจากURL("status");
        if (สถานะที่กรอง) {
          ใบลาทั้งหมด = ใบลาทั้งหมด.filter(function (ใบ) { return ใบ.status === สถานะที่กรอง; });
          document.querySelector(".subtitle").textContent =
            "กำลังแสดงเฉพาะใบลาที่สถานะ " + สถานะที่กรอง + " · กดเมนู รายการใบลา เพื่อดูทั้งหมด";
        }

        แสดงตาราง(ใบลาทั้งหมด);
      })
      .catch(function (err) {
        กล่อง.innerHTML = "<p>โหลดข้อมูลไม่สำเร็จ: " + esc(err.message) + "</p>";
      });
  }

  function แสดงตาราง(รายการ) {
    if (รายการ.length === 0) {
      กล่อง.innerHTML = "<p>ยังไม่มีใบขอลาในระบบ</p>";
      return;
    }

    var html =
      "<table><thead><tr>" +
      "<th>หัวข้อ</th>" +
      "<th>ประเภทการลา</th>" +
      "<th>สถานะ</th>" +
      '<th class="hide-mobile">ผู้ขอลา</th>' +
      '<th class="hide-mobile">วันที่ลา</th>' +
      "</tr></thead><tbody>";

    รายการ.forEach(function (ใบ) {
      html +=
        '<tr class="clickable" data-id="' + esc(ใบ.id) + '">' +
        "<td>" + esc(ใบ.title) + "</td>" +
        "<td>" + esc(ใบ.leaveTypeName) + "</td>" +
        "<td>" + ป้ายสถานะ(ใบ.status) + "</td>" +
        '<td class="hide-mobile">' + esc(ใบ.requesterName) + "</td>" +
        '<td class="hide-mobile">' + esc(ใบ.startDate) + " ถึง " + esc(ใบ.endDate) + "</td>" +
        "</tr>";
    });

    html += "</tbody></table>";
    กล่อง.innerHTML = html;

    // กดที่แถวไหน ไปหน้ารายละเอียดของใบนั้น
    กล่อง.querySelectorAll("tr.clickable").forEach(function (แถว) {
      แถว.addEventListener("click", function () {
        location.href = "leave-request-detail.html?id=" + แถว.dataset.id;
      });
    });
  }
})();
