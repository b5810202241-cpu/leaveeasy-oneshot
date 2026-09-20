// ─────────────────────────────────────────────────────────────
// js/signup.js — สมัครสมาชิก (US-08)
// สมัครผ่าน Firebase Authentication แล้วสร้างไฟล์ใน users/{uid}
// role ตั้งเป็น "employee" เสมอ ห้ามให้ผู้ใช้เลือกเอง
// ─────────────────────────────────────────────────────────────

(function () {
  if (window.auth) {
    เริ่มทำงาน();
  } else {
    window.addEventListener("firebase-พร้อมใช้", เริ่มทำงาน);
  }

  function เริ่มทำงาน() {
    var ฟอร์ม = document.getElementById("ฟอร์มสมัคร");
    if (!ฟอร์ม) return;

    var กล่องเตือน = document.getElementById("เตือนข้อผิดพลาด");

    ฟอร์ม.addEventListener("submit", function (e) {
      e.preventDefault();
      ซ่อนเตือน();

      var ชื่อ = document.getElementById("ชื่อ").value.trim();
      var อีเมล = document.getElementById("อีเมล").value.trim();
      var รหัสผ่าน = document.getElementById("รหัสผ่าน").value;

      if (!ชื่อ || !อีเมล || !รหัสผ่าน) {
        แสดงเตือน("กรุณากรอกข้อมูลให้ครบทุกช่อง");
        return;
      }

      var ปุ่ม = ฟอร์ม.querySelector("button[type=submit]");
      if (ปุ่ม) ปุ่ม.disabled = true;

      window.fb
        .createUserWithEmailAndPassword(window.auth, อีเมล, รหัสผ่าน)
        .then(function (ผลลัพธ์) {
          var uid = ผลลัพธ์.user.uid;
          return window.fb.setDoc(window.fb.doc(window.db, "users", uid), {
            name: ชื่อ,
            email: อีเมล,
            role: "employee"
          });
        })
        .then(function () {
          location.href = "leave-requests.html";
        })
        .catch(function (err) {
          if (ปุ่ม) ปุ่ม.disabled = false;
          แสดงเตือน(แปลข้อผิดพลาด(err));
        });
    });

    function แสดงเตือน(ข้อความ) {
      if (!กล่องเตือน) return;
      กล่องเตือน.textContent = ข้อความ;
      กล่องเตือน.classList.remove("hidden");
    }

    function ซ่อนเตือน() {
      if (!กล่องเตือน) return;
      กล่องเตือน.classList.add("hidden");
      กล่องเตือน.textContent = "";
    }

    function แปลข้อผิดพลาด(err) {
      var รหัส = (err && err.code) || "";
      if (รหัส === "auth/email-already-in-use") return "อีเมลนี้มีผู้ใช้งานแล้ว";
      if (รหัส === "auth/invalid-email") return "รูปแบบอีเมลไม่ถูกต้อง";
      if (รหัส === "auth/weak-password") return "รหัสผ่านสั้นเกินไป ต้องมีอย่างน้อย 6 ตัวอักษร";
      return "สมัครสมาชิกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง";
    }
  }
})();
