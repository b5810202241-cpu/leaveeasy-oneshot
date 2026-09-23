# ผลการรันเทสต์ — LeaveEasy

**รันเมื่อ:** 2026-09-21 22:07:21 – 22:07:37 (เวลาเครื่อง, SE Asia Standard Time)
**รันกับ:** https://leaveeasy-nammon.web.app (prod Firestore จริง ไม่มี staging/emulator แยก)
**คำสั่งที่ใช้รัน:** `npx playwright test --reporter=list`
**ผลรวม:** 5 ผ่าน / 0 ไม่ผ่าน — ครบตามแผน (เส้นทางหลัก 2, กรอกไม่ครบ 1, ความปลอดภัย 2)

| # | ไฟล์เทสต์ | ทดสอบอะไร | ผล | เวลาที่ใช้ |
|---|---|---|---|---|
| 1 | `tests/case1-submit-and-see-in-list.spec.js` | เส้นทางหลัก: สมัคร/ล็อกอิน employee → ยื่นใบลาใหม่ครบทุกช่อง → กดบันทึก → ต้องเห็นแถวใหม่ในหน้ารายการพร้อมสถานะ "รอพิจารณา" → reload หน้าทั้งหน้าแล้วต้องยังเห็นอยู่ | ✅ ผ่าน | 6.7s |
| 2 | `tests/case2-approve-status-change.spec.js` | เส้นทางหลัก: employee ยื่นใบลา → ล็อกอินด้วยบัญชี **manager** ทดสอบ → เปิดใบลานั้น → ต้องเห็นปุ่ม "อนุมัติ" → กดอนุมัติ → สถานะเปลี่ยนเป็น "อนุมัติ" ทันที ปุ่มหายไป → reload หน้าทั้งหน้าแล้วยังเห็นสถานะเดิม (ยืนยันเขียนลง Firestore จริง) → กลับไปหน้ารายการ แถวเดิมก็ต้องแสดง "อนุมัติ" ด้วย | ✅ ผ่าน | 10.3s |
| 3 | `tests/case3-empty-title-blocked.spec.js` | Validation: กรอกฟอร์มยื่นใบลาครบทุกช่อง**ยกเว้นหัวข้อ**แล้วกดบันทึก → ต้องไม่ถูกบันทึก (ไม่ redirect ออกจากหน้า) และต้องมีข้อความเตือนแสดงให้เห็น | ✅ ผ่าน | 5.0s |
| 4 | `tests/case4-unauthenticated-list-blocked.spec.js` | ความปลอดภัย: เปิดหน้ารายการใบลาโดย**ไม่ได้ล็อกอิน** → ต้องถูกเด้งไปหน้า login ทันที และต้องไม่มีตาราง/ข้อมูลใบลาหลุดออกมาให้เห็นก่อนเด้ง | ✅ ผ่าน | 1.4s |
| 5 | `tests/case5-cross-user-detail-blocked.spec.js` | ความปลอดภัย: สมัครบัญชี A ยื่นใบลา 1 ใบ → ออกจากระบบ → สมัครบัญชี B → บัญชี B พยายามเปิดใบลาของบัญชี A ตรงๆ ผ่าน URL → ต้องเปิดไม่ได้ (ไม่มีเนื้อหาใบลาของ A รั่วออกมาให้เห็นเลย) | ✅ ผ่าน | 7.4s |

## เคสที่ไม่ผ่าน
รอบนี้ไม่มีเคสไหนไม่ผ่านครับ ทุกเคสผ่านหมด

## Precondition พิเศษของ case2
case2 ต้องใช้บัญชี **manager** ที่ตั้ง role ไว้ล่วงหน้าแล้วเท่านั้น (สมัครผ่านหน้าเว็บได้แค่ role `employee` — ต้องไปแก้ field `role` ตรงใน Firestore Console ด้วยมือ):
- email: `autotest-manager-1790002274120@leaveeasy-nammon.test`
- password: `123456`
- uid: `i5bEGkGrAOaMqL4qGU1SDXxE3Cw1`

มีบัญชี hr ทดสอบเตรียมไว้ด้วยเช่นกัน (ยังไม่มีเทสต์ที่ใช้):
- email: `autotest-hr-1790002274120@leaveeasy-nammon.test`
- password: `123456`
- uid: `lUIHjSVKPbacDTFsS4eHylcUpt23`

## หมายเหตุ
- ทุกเทสต์ (ยกเว้นการล็อกอินด้วยบัญชี manager คงที่ใน case2) จะสมัครบัญชี employee ใหม่ทุกครั้งที่รัน ทำให้มีข้อมูลทดสอบสะสมอยู่ใน prod Firestore/Auth จริง (อีเมลขึ้นต้นด้วย `autotest-...@leaveeasy-nammon.test`, ใบลาขึ้นต้นด้วย `[AUTOTEST...]`) — ยังไม่ได้ลบออก
- ระหว่างทางพบบั๊กจริงในแอป (หน้ารายการใบลาอ่านไม่ได้สำหรับ employee เพราะ query ไม่กรอง `requesterId`) ได้แก้และ deploy ไปแล้วก่อนหน้านี้ — ดู commit `9401299`

## ยืนยันซ้ำ — 2026-09-23 (checkpoint สัปดาห์ 9)

**รันเมื่อ:** 2026-09-23 (เวลาเครื่อง, SE Asia Standard Time)
**รันเฉพาะ:** เคสความปลอดภัย 2 ตัว (case4, case5) — เพื่อยืนยันว่ายัง block ได้ถูกต้องกับ prod ปัจจุบัน ก่อนปักหมุดเป็น checkpoint ส่งมอบ
**คำสั่งที่ใช้รัน:** `npx playwright test tests/case4-unauthenticated-list-blocked.spec.js tests/case5-cross-user-detail-blocked.spec.js --reporter=list`
**ผลรวม:** 2 ผ่าน / 0 ไม่ผ่าน

| # | ไฟล์เทสต์ | ผล | เวลาที่ใช้ |
|---|---|---|---|
| 4 | `tests/case4-unauthenticated-list-blocked.spec.js` | ✅ ผ่าน | 8.6s |
| 5 | `tests/case5-cross-user-detail-blocked.spec.js` | ✅ ผ่าน | 15.5s |

สรุปสะสม ณ checkpoint นี้: **5/5 เคสผ่าน** (case1–3 ยืนยันล่าสุดเมื่อ 2026-09-21 ด้านบน, case4–5 ยืนยันซ้ำวันนี้) — ปักหมุดเป็น git tag `security-tests-passing-20260923`
