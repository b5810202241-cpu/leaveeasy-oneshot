// ─────────────────────────────────────────────────────────────
// js/auth-guard.js — เฝ้าทุกหน้า (US-08)
// - ไม่ได้ล็อกอิน → เด้งไป login.html ทันที (ยกเว้นอยู่ที่ login.html/signup.html อยู่แล้ว)
// - ล็อกอินแล้ว → อ่าน users/{uid} มาตั้ง window.currentUser แล้วยิง event "ผู้ใช้พร้อมใช้"
//   แล้วเติมชื่อ + ปุ่มออกจากระบบใน #navUser (ถ้าหน้านั้นมี #nav/nav.js)
// โหลดอยู่แทบทุกหน้า ยกเว้น login.html และ signup.html
// ─────────────────────────────────────────────────────────────

(function () {
  if (window.auth) {
    เริ่มทำงาน();
  } else {
    window.addEventListener("firebase-พร้อมใช้", เริ่มทำงาน);
  }

  var ชื่อไฟล์หน้าปัจจุบัน = location.pathname.split("/").pop() || "index.html";
  var เป็นหน้าล็อกอินหรือสมัคร =
    ชื่อไฟล์หน้าปัจจุบัน === "login.html" || ชื่อไฟล์หน้าปัจจุบัน === "signup.html";

  var บทบาทภาษาไทย = { employee: "ผู้ขอลา", manager: "ผู้อนุมัติ", hr: "ฝ่ายบุคคล" };

  function เริ่มทำงาน() {
    window.fb.onAuthStateChanged(window.auth, function (user) {
      if (!user) {
        window.currentUser = null;
        if (!เป็นหน้าล็อกอินหรือสมัคร) {
          location.href = "login.html";
        }
        return;
      }

      window.fb
        .getDoc(window.fb.doc(window.db, "users", user.uid))
        .then(function (snap) {
          var ข้อมูล = snap.exists() ? snap.data() : {};
          var currentUser = {
            uid: user.uid,
            name: ข้อมูล.name || user.email || "ผู้ใช้",
            role: ข้อมูล.role || "employee"
          };
          window.currentUser = currentUser;
          window.dispatchEvent(new CustomEvent("ผู้ใช้พร้อมใช้", { detail: currentUser }));
          แสดงชื่อผู้ใช้ใน_navbar(currentUser);
          ซ่อนเมนูประเภทการลาถ้าไม่ใช่ฝ่ายบุคคล(currentUser);
        })
        .catch(function () {
          // อ่านไฟล์ users ไม่สำเร็จ (เช่น ยังไม่ถูกสร้าง) — ยังให้ใช้งานต่อได้แบบข้อมูลขั้นต่ำ
          var currentUser = { uid: user.uid, name: user.email || "ผู้ใช้", role: "employee" };
          window.currentUser = currentUser;
          window.dispatchEvent(new CustomEvent("ผู้ใช้พร้อมใช้", { detail: currentUser }));
          แสดงชื่อผู้ใช้ใน_navbar(currentUser);
          ซ่อนเมนูประเภทการลาถ้าไม่ใช่ฝ่ายบุคคล(currentUser);
        });
    });
  }

  // #navUser ถูกสร้างโดย nav.js ซึ่งอาจรันก่อนหรือหลัง callback ด้านบนก็ได้
  // (ปกติ nav.js จะรันเสร็จก่อน เพราะ onAuthStateChanged เป็น async เสมอ
  //  แต่กันเหนียวด้วยการรอ/ลองซ้ำสั้นๆ เผื่อกรณีอื่น)
  function แสดงชื่อผู้ใช้ใน_navbar(currentUser) {
    var จำนวนครั้งที่ลองแล้ว = 0;
    var ตัวจับเวลา = setInterval(function () {
      จำนวนครั้งที่ลองแล้ว++;
      var navUser = document.getElementById("navUser");
      if (navUser) {
        clearInterval(ตัวจับเวลา);
        var บทบาท = บทบาทภาษาไทย[currentUser.role] || currentUser.role;
        navUser.innerHTML =
          "<span>" +
          currentUser.name +
          " (" +
          บทบาท +
          ")</span> " +
          '<button type="button" id="ปุ่มออกจากระบบ" class="btn btn-ghost">ออกจากระบบ</button>';
      } else if (จำนวนครั้งที่ลองแล้ว > 40) {
        // ลองประมาณ 2 วินาทีแล้วยังไม่มี #navUser (หน้านี้ไม่มี nav.js/ไม่มี #nav) — เลิกลอง
        clearInterval(ตัวจับเวลา);
      }
    }, 50);
  }

  // หัวข้อ 4 (หน้าที่ 4): "ซ่อนหน้านี้จากผู้ที่ไม่ใช่ฝ่ายบุคคล" — เอาลิงก์เมนูออกเลยถ้าไม่ใช่ hr
  // (ตัวหน้ายังเปิดได้ถ้าพิมพ์ URL ตรงๆ เพราะยังต้องอ่าน leaveTypes ได้ปกติ แต่ไม่มีทางเดินไปเจอจากเมนู)
  function ซ่อนเมนูประเภทการลาถ้าไม่ใช่ฝ่ายบุคคล(currentUser) {
    if (currentUser.role === "hr") return;
    var จำนวนครั้งที่ลองแล้ว = 0;
    var ตัวจับเวลา = setInterval(function () {
      จำนวนครั้งที่ลองแล้ว++;
      var ลิงก์ทั้งหมด = document.querySelectorAll('a[href="leave-types.html"]');
      if (ลิงก์ทั้งหมด.length > 0) {
        clearInterval(ตัวจับเวลา);
        ลิงก์ทั้งหมด.forEach(function (ลิงก์) { ลิงก์.remove(); });
      } else if (จำนวนครั้งที่ลองแล้ว > 40) {
        clearInterval(ตัวจับเวลา);
      }
    }, 50);
  }

  // ใช้ event delegation กับปุ่มออกจากระบบ เพราะปุ่มถูกสร้างขึ้นทีหลังด้วย innerHTML
  document.addEventListener("click", function (e) {
    var ปุ่ม = e.target.closest && e.target.closest("#ปุ่มออกจากระบบ");
    if (!ปุ่ม) return;
    window.fb.signOut(window.auth).then(function () {
      location.href = "login.html";
    });
  });
})();
