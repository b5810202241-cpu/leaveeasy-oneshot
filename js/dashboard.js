// ─────────────────────────────────────────────────────────────
// js/dashboard.js — แดชบอร์ด Module 2
// ข้อมูลตัวอย่างแบบ hardcode ตรงตามหัวข้อ 7.3 ของสเปค
// ─────────────────────────────────────────────────────────────

(function () {
  // ข้อมูลตัวอย่าง 5 รายการล่าสุด
  var ข้อมูลใบลา = [
    {
      id: "lr001",
      title: "ลาพักร้อนไปเที่ยวกับครอบครัว",
      status: "รอพิจารณา",
      requesterName: "สมชาย ใจดี",
      leaveTypeName: "ลาพักร้อน",
      startDate: "2026-09-07",
      endDate: "2026-09-09"
    },
    {
      id: "lr002",
      title: "ลาป่วยไข้หวัดใหญ่",
      status: "อนุมัติ",
      requesterName: "สมชาย ใจดี",
      leaveTypeName: "ลาป่วย",
      startDate: "2026-08-24",
      endDate: "2026-08-25"
    },
    {
      id: "lr003",
      title: "ลากิจไปทำบัตรประชาชน",
      status: "รอพิจารณา",
      requesterName: "สมศรี ตั้งใจ",
      leaveTypeName: "ลากิจ",
      startDate: "2026-09-15",
      endDate: "2026-09-15"
    },
    {
      id: "lr004",
      title: "ลาพักร้อนช่วงวันหยุดยาว",
      status: "ไม่อนุมัติ",
      requesterName: "สมศรี ตั้งใจ",
      leaveTypeName: "ลาพักร้อน",
      startDate: "2026-10-12",
      endDate: "2026-10-16"
    },
    {
      id: "lr005",
      title: "ลาป่วยไปพบแพทย์ตามนัด",
      status: "รอพิจารณา",
      requesterName: "สมชาย ใจดี",
      leaveTypeName: "ลาป่วย",
      startDate: "2026-09-22",
      endDate: "2026-09-22"
    }
  ];

  function esc(ข้อความ) {
    return String(ข้อความ == null ? "" : ข้อความ)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function ป้ายสถานะ(สถานะ) {
    return '<span class="badge badge-' + esc(สถานะ) + '">' + esc(สถานะ) + "</span>";
  }

  // นับตามสถานะ
  function นับสถานะ() {
    var รอพิจารณา = 0, อนุมัติ = 0, ไม่อนุมัติ = 0;
    ข้อมูลใบลา.forEach(function (ใบลา) {
      if (ใบลา.status === "รอพิจารณา") รอพิจารณา++;
      else if (ใบลา.status === "อนุมัติ") อนุมัติ++;
      else if (ใบลา.status === "ไม่อนุมัติ") ไม่อนุมัติ++;
    });
    return { รอพิจารณา: รอพิจารณา, อนุมัติ: อนุมัติ, ไม่อนุมัติ: ไม่อนุมัติ };
  }

  // สร้างตาราง 5 รายการล่าสุด
  function สร้างตาราง() {
    var html = '<table>';
    html += '<thead><tr><th>หัวข้อ</th><th>ประเภทการลา</th><th>สถานะ</th><th>ผู้ขอลา</th><th>วันที่ลา</th></tr></thead>';
    html += '<tbody>';
    ข้อมูลใบลา.forEach(function (ใบลา) {
      html += '<tr class="clickable" onclick="location.href=\'leave-request-detail.html?id=' + esc(ใบลา.id) + '\'">';
      html += '<td>' + esc(ใบลา.title) + '</td>';
      html += '<td>' + esc(ใบลา.leaveTypeName) + '</td>';
      html += '<td>' + ป้ายสถานะ(ใบลา.status) + '</td>';
      html += '<td>' + esc(ใบลา.requesterName) + '</td>';
      html += '<td>' + esc(ใบลา.startDate) + ' ถึง ' + esc(ใบลา.endDate) + '</td>';
      html += '</tr>';
    });
    html += '</tbody></table>';
    return html;
  }

  // แสดงผลเมื่อโหลดหน้าเสร็จ
  document.addEventListener("DOMContentLoaded", function () {
    // แสดงสถิติ
    var สถิติ = นับสถานะ();
    var สถิติรอพิจารณา = document.getElementById("สถิติรอพิจารณา");
    var สถิติอนุมัติ = document.getElementById("สถิติอนุมัติ");
    var สถิติไม่อนุมัติ = document.getElementById("สถิติไม่อนุมัติ");

    if (สถิติรอพิจารณา) สถิติรอพิจารณา.textContent = สถิติ.รอพิจารณา;
    if (สถิติอนุมัติ) สถิติอนุมัติ.textContent = สถิติ.อนุมัติ;
    if (สถิติไม่อนุมัติ) สถิติไม่อนุมัติ.textContent = สถิติ.ไม่อนุมัติ;

    // แสดงตาราง
    var ตารางใบลา = document.getElementById("ตารางใบลา");
    if (ตารางใบลา) ตารางใบลา.innerHTML = สร้างตาราง();
  });
})();
