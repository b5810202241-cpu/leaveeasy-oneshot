// ─────────────────────────────────────────────────────────────
// js/login.js — เข้าสู่ระบบ (US-08)
// ─────────────────────────────────────────────────────────────

(function () {
  if (window.auth) {
    เริ่มทำงาน();
  } else {
    window.addEventListener("firebase-พร้อมใช้", เริ่มทำงาน);
  }

  function เริ่มทำงาน() {
    var ฟอร์ม = document.getElementById("ฟอร์มเข้า");
    if (!ฟอร์ม) return;

    var กล่องเตือน = document.getElementById("เตือนข้อผิดพลาด");

    ฟอร์ม.addEventListener("submit", function (e) {
      e.preventDefault();
      ซ่อนเตือน();

      var อีเมล = document.getElementById("อีเมล").value.trim();
      var รหัสผ่าน = document.getElementById("รหัสผ่าน").value;

      if (!อีเมล || !รหัสผ่าน) {
        แสดงเตือน("กรุณากรอกอีเมลและรหัสผ่าน");
        return;
      }

      var ปุ่ม = ฟอร์ม.querySelector("button[type=submit]");
      if (ปุ่ม) ปุ่ม.disabled = true;

      window.fb
        .signInWithEmailAndPassword(window.auth, อีเมล, รหัสผ่าน)
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
      if (
        รหัส === "auth/invalid-credential" ||
        รหัส === "auth/wrong-password" ||
        รหัส === "auth/user-not-found" ||
        รหัส === "auth/invalid-email"
      ) {
        return "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
      }
      if (รหัส === "auth/too-many-requests") return "ลองผิดหลายครั้งเกินไป กรุณารอสักครู่แล้วลองใหม่";
      return "เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง";
    }
  }
})();
