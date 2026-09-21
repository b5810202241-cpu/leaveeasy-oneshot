// เคส 5 (ความปลอดภัย): "ล็อกอินด้วยบัญชีที่สอง แล้วเปิดใบลาของบัญชีแรก ต้องเปิดไม่ได้"
// ผ่านเมื่อ: เข้าไม่ได้ (Firestore rules: employee อ่านได้เฉพาะใบของตัวเอง → get() ของบัญชี B ต่อใบของ A ต้องถูกปฏิเสธ
// และหน้าเว็บต้องไม่แสดงเนื้อหาใบลาของ A ให้ B เห็นเลย)

const { test, expect } = require('@playwright/test');

const runId = Date.now();
const password = 'AutoTest123!';
const emailA = `autotest-case5a-${runId}@leaveeasy-nammon.test`;
const emailB = `autotest-case5b-${runId}@leaveeasy-nammon.test`;
const titleA = `[AUTOTEST-CASE5-${runId}] ใบลาลับของบัญชี A`;

test('ล็อกอินด้วยบัญชีที่สอง แล้วเปิดใบลาของบัญชีแรก ต้องเปิดไม่ได้', async ({ page }) => {
  // ── เตรียมข้อมูล: สมัครบัญชี A แล้วยื่นใบลา 1 ใบ เพื่อเอา id ไปทดสอบ ──
  await page.goto('/signup.html');
  await page.locator('#ชื่อ').fill('AUTOTEST บัญชี A เคส5');
  await page.locator('#อีเมล').fill(emailA);
  await page.locator('#รหัสผ่าน').fill(password);
  await page.getByRole('button', { name: 'สมัครสมาชิก' }).click();
  await page.waitForURL('**/leave-requests.html', { timeout: 15_000 });

  await page.goto('/new-leave-request.html');
  const leaveTypeSelect = page.locator('#leaveTypeId');
  await expect(async () => {
    const count = await leaveTypeSelect.locator('option').count();
    expect(count).toBeGreaterThan(1);
  }).toPass({ timeout: 15_000 });

  await page.locator('#title').fill(titleA);
  await page.locator('#reason').fill('สร้างโดยเทสต์ความปลอดภัยเคส 5 — ลบทิ้งได้');
  await leaveTypeSelect.selectOption({ index: 1 });
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
  await page.locator('#startDate').fill(today);
  await page.locator('#endDate').fill(tomorrow);
  await page.getByRole('button', { name: 'บันทึก' }).click();
  await page.waitForURL('**/leave-requests.html', { timeout: 15_000 });

  const row = page.locator('table tbody tr', { hasText: titleA });
  await expect(row).toBeVisible({ timeout: 15_000 });
  const leaveRequestId = await row.getAttribute('data-id');
  expect(leaveRequestId, 'ต้องอ่าน id ของใบลาที่เพิ่งสร้างได้').toBeTruthy();

  // ── ออกจากระบบบัญชี A ──
  await page.getByRole('button', { name: 'ออกจากระบบ' }).click();
  await page.waitForURL('**/login.html', { timeout: 15_000 });

  // ── สมัครบัญชี B (คนละคนกับ A) ──
  await page.goto('/signup.html');
  await page.locator('#ชื่อ').fill('AUTOTEST บัญชี B เคส5');
  await page.locator('#อีเมล').fill(emailB);
  await page.locator('#รหัสผ่าน').fill(password);
  await page.getByRole('button', { name: 'สมัครสมาชิก' }).click();
  await page.waitForURL('**/leave-requests.html', { timeout: 15_000 });

  // ── บัญชี B พยายามเปิดใบลาของบัญชี A ตรงๆ ผ่าน URL ──
  await page.goto('/leave-request-detail.html?id=' + leaveRequestId);

  const กล่องใบลา = page.locator('#กล่องใบลา');
  await expect(กล่องใบลา).toBeVisible({ timeout: 15_000 });

  // ต้องเปิดไม่ได้: ไม่มีข้อความ/เนื้อหาของใบลา A รั่วออกมาให้เห็นเลย
  await expect(page.getByText(titleA)).toHaveCount(0);
  await expect(กล่องใบลา).not.toContainText(titleA);
});
