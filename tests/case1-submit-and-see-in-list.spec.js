// เคส 1: "ยื่นใบลาแล้วเห็นในรายการ"
// รันกับเว็บที่ deploy จริง (prod Firestore) — ไม่มี staging/emulator แยก
// เทสต์นี้สมัครสมาชิก employee ใหม่ทุกครั้งที่รัน (ไม่มีบัญชีทดสอบสำเร็จรูปให้ล็อกอินซ้ำ)
// title/email มี prefix AUTOTEST + timestamp กำกับไว้ เพื่อให้แยกจากข้อมูลจริงและลบทิ้งภายหลังได้ง่าย

const { test, expect } = require('@playwright/test');

const runId = Date.now();
const testEmail = `autotest-${runId}@leaveeasy-nammon.test`;
const testPassword = 'AutoTest123!';
const testTitle = `[AUTOTEST-${runId}] ลาทดสอบอัตโนมัติ`;

test('ยื่นใบลาแล้วเห็นในรายการ', async ({ page }) => {
  // ขั้น 1: "ล็อกอิน" — ไม่มีบัญชีพนักงานทดสอบสำเร็จรูป จึงสมัครสมาชิกใหม่
  // (สมัครเสร็จ Firebase Auth จะ sign-in ให้อัตโนมัติ ถือว่าล็อกอินแล้ว)
  await page.goto('/signup.html');
  await page.locator('#ชื่อ').fill('AUTOTEST พนักงานทดสอบ');
  await page.locator('#อีเมล').fill(testEmail);
  await page.locator('#รหัสผ่าน').fill(testPassword);
  await page.getByRole('button', { name: 'สมัครสมาชิก' }).click();
  await page.waitForURL('**/leave-requests.html', { timeout: 15_000 });

  // ขั้น 2: ไปหน้ายื่นใบลาใหม่
  await page.goto('/new-leave-request.html');

  // ขั้น 3: รอ dropdown ประเภทการลาโหลดจาก Firestore (ต้องมีอย่างน้อย 1 ตัวเลือกจริงนอกเหนือ placeholder)
  const leaveTypeSelect = page.locator('#leaveTypeId');
  await expect(async () => {
    const count = await leaveTypeSelect.locator('option').count();
    expect(count).toBeGreaterThan(1);
  }).toPass({ timeout: 15_000 });

  // ขั้น 4: กรอกฟอร์ม
  await page.locator('#title').fill(testTitle);
  await page.locator('#reason').fill('สร้างโดยเทสต์อัตโนมัติ (Playwright) — ลบทิ้งได้');
  await leaveTypeSelect.selectOption({ index: 1 });
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
  await page.locator('#startDate').fill(today);
  await page.locator('#endDate').fill(tomorrow);

  // ขั้น 5: กดบันทึก
  await page.getByRole('button', { name: 'บันทึก' }).click();

  // ขั้น 6: รอ redirect กลับหน้ารายการใบลา
  await page.waitForURL('**/leave-requests.html', { timeout: 15_000 });

  // ขั้น 7: assert ว่ามีแถวใหม่ + สถานะ "รอพิจารณา"
  const row = page.locator('table tbody tr', { hasText: testTitle });
  await expect(row).toBeVisible({ timeout: 15_000 });
  await expect(row).toContainText('รอพิจารณา');

  // ขั้น 8: reload หน้าทั้งหน้า (fresh navigation) แล้ว assert อีกครั้ง — ยืนยันว่าเขียนลง Firestore จริง
  await page.reload();
  const rowAfterReload = page.locator('table tbody tr', { hasText: testTitle });
  await expect(rowAfterReload).toBeVisible({ timeout: 15_000 });
  await expect(rowAfterReload).toContainText('รอพิจารณา');
});
