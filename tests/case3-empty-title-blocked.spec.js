// เคส 3: "กรอกฟอร์มยื่นใบลาโดยเว้นช่องหัวข้อไว้ แล้วกดบันทึก"
// ต้อง: ไม่บันทึกลง Firestore (ไม่ redirect ออกจากหน้า) และต้องขึ้นข้อความเตือนให้เห็น
// รันกับเว็บที่ deploy จริง (prod Firestore) — สมัคร employee ใหม่ทุกครั้งที่รัน เหมือนเคส 1

const { test, expect } = require('@playwright/test');

const runId = Date.now();
const testEmail = `autotest-case3-${runId}@leaveeasy-nammon.test`;
const testPassword = 'AutoTest123!';

test('เว้นช่องหัวข้อไว้แล้วกดบันทึก ต้องไม่บันทึกและต้องขึ้นข้อความเตือน', async ({ page }) => {
  // ขั้น 1: สมัคร employee ใหม่แล้วล็อกอินอัตโนมัติ (ไม่มีบัญชีทดสอบสำเร็จรูป)
  await page.goto('/signup.html');
  await page.locator('#ชื่อ').fill('AUTOTEST พนักงานทดสอบเคส3');
  await page.locator('#อีเมล').fill(testEmail);
  await page.locator('#รหัสผ่าน').fill(testPassword);
  await page.getByRole('button', { name: 'สมัครสมาชิก' }).click();
  await page.waitForURL('**/leave-requests.html', { timeout: 15_000 });

  // ขั้น 2: ไปหน้ายื่นใบลาใหม่
  await page.goto('/new-leave-request.html');

  // ขั้น 3: รอ dropdown ประเภทการลาโหลดจาก Firestore
  const leaveTypeSelect = page.locator('#leaveTypeId');
  await expect(async () => {
    const count = await leaveTypeSelect.locator('option').count();
    expect(count).toBeGreaterThan(1);
  }).toPass({ timeout: 15_000 });

  // ขั้น 4: กรอกทุกช่อง "ยกเว้นหัวข้อ" (เว้น #title ไว้ว่าง)
  await page.locator('#reason').fill('เทสต์เว้นหัวข้อว่าง — ต้องบันทึกไม่ผ่าน');
  await leaveTypeSelect.selectOption({ index: 1 });
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
  await page.locator('#startDate').fill(today);
  await page.locator('#endDate').fill(tomorrow);

  // ขั้น 5: กดบันทึกทั้งที่หัวข้อว่าง
  await page.getByRole('button', { name: 'บันทึก' }).click();

  // ขั้น 6: assert ว่า "ไม่บันทึก" — ต้องยังอยู่หน้าเดิม ไม่ redirect ไป leave-requests.html
  await page.waitForTimeout(1000); // กันเคสที่ redirect ช้ากว่าปกติ ให้เวลาก่อนเช็ค URL
  await expect(page).toHaveURL(/new-leave-request\.html/);

  // ขั้น 7: assert ว่ามีข้อความเตือนแสดงให้เห็นจริง
  const กล่องเตือน = page.locator('#ข้อความเตือน');
  await expect(กล่องเตือน).toBeVisible({ timeout: 5_000 });
  await expect(กล่องเตือน).not.toBeEmpty();
});
