// เคส 2: "กดอนุมัติแล้วสถานะเปลี่ยน" (เส้นทางหลักตัวที่ 2)
// รันกับเว็บที่ deploy จริง (prod Firestore) — ใช้บัญชี manager ทดสอบที่ตั้งไว้ล่วงหน้า (แก้ role ตรงใน Firestore)
// เพราะสมัครผ่านหน้าเว็บได้แค่ role employee เท่านั้น ไม่มีทางสร้างบัญชี manager ผ่าน UI ได้เอง

const { test, expect } = require('@playwright/test');

const runId = Date.now();
const employeePassword = 'AutoTest123!';
const employeeEmail = `autotest-case2-employee-${runId}@leaveeasy-nammon.test`;
const requestTitle = `[AUTOTEST-CASE2-${runId}] ใบลารออนุมัติ`;

// บัญชี manager ทดสอบที่ตั้ง role ไว้ล่วงหน้าแล้ว (ไม่ได้สร้างในเทสต์นี้)
const managerEmail = 'autotest-manager-1790002274120@leaveeasy-nammon.test';
const managerPassword = '123456';

test('กดอนุมัติแล้วสถานะเปลี่ยน', async ({ page }) => {
  // ── เตรียมข้อมูล: สมัคร employee ใหม่ แล้วยื่นใบลา 1 ใบ เพื่อเอาไปให้ manager อนุมัติ ──
  await page.goto('/signup.html');
  await page.locator('#ชื่อ').fill('AUTOTEST พนักงานทดสอบเคส2');
  await page.locator('#อีเมล').fill(employeeEmail);
  await page.locator('#รหัสผ่าน').fill(employeePassword);
  await page.getByRole('button', { name: 'สมัครสมาชิก' }).click();
  await page.waitForURL('**/leave-requests.html', { timeout: 15_000 });

  await page.goto('/new-leave-request.html');
  const leaveTypeSelect = page.locator('#leaveTypeId');
  await expect(async () => {
    const count = await leaveTypeSelect.locator('option').count();
    expect(count).toBeGreaterThan(1);
  }).toPass({ timeout: 15_000 });

  await page.locator('#title').fill(requestTitle);
  await page.locator('#reason').fill('สร้างโดยเทสต์ case2 — รออนุมัติ');
  await leaveTypeSelect.selectOption({ index: 1 });
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
  await page.locator('#startDate').fill(today);
  await page.locator('#endDate').fill(tomorrow);
  await page.getByRole('button', { name: 'บันทึก' }).click();
  await page.waitForURL('**/leave-requests.html', { timeout: 15_000 });

  const row = page.locator('table tbody tr', { hasText: requestTitle });
  await expect(row).toBeVisible({ timeout: 15_000 });
  const leaveRequestId = await row.getAttribute('data-id');
  expect(leaveRequestId, 'ต้องอ่าน id ของใบลาที่เพิ่งสร้างได้').toBeTruthy();

  await page.getByRole('button', { name: 'ออกจากระบบ' }).click();
  await page.waitForURL('**/login.html', { timeout: 15_000 });

  // ── ขั้น 1: ล็อกอินด้วยบัญชี manager ทดสอบ ──
  await page.locator('#อีเมล').fill(managerEmail);
  await page.locator('#รหัสผ่าน').fill(managerPassword);
  await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
  await page.waitForURL('**/leave-requests.html', { timeout: 15_000 });

  // ── ขั้น 2-3: เข้าไปที่ใบลาที่รออนุมัติ แล้วรอโหลดรายละเอียด ──
  await page.goto('/leave-request-detail.html?id=' + leaveRequestId);
  const กล่องใบลา = page.locator('#กล่องใบลา');
  await expect(กล่องใบลา).toContainText(requestTitle, { timeout: 15_000 });
  await expect(กล่องใบลา).toContainText('รอพิจารณา');

  // ── ขั้น 4: assert เห็นปุ่ม "อนุมัติ" (ยืนยัน role-gate ทำงานถูก) ──
  const ปุ่มอนุมัติ = page.getByRole('button', { name: 'อนุมัติ', exact: true });
  await expect(ปุ่มอนุมัติ).toBeVisible({ timeout: 10_000 });

  // ── ขั้น 5: กดปุ่มอนุมัติ ──
  await ปุ่มอนุมัติ.click();

  // ── ขั้น 6: assert สถานะเปลี่ยนเป็น "อนุมัติ" ทันที และปุ่มหายไป ──
  await expect(กล่องใบลา).toContainText('พิจารณาแล้ว', { timeout: 10_000 });
  await expect(page.getByRole('button', { name: 'อนุมัติ', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'ไม่อนุมัติ', exact: true })).toHaveCount(0);

  // ── ขั้น 7: reload หน้าทั้งหน้า แล้ว assert อีกครั้ง — ยืนยันว่าเขียนลง Firestore จริง ──
  await page.reload();
  await expect(กล่องใบลา).toContainText(requestTitle, { timeout: 15_000 });
  await expect(กล่องใบลา).toContainText('พิจารณาแล้ว');
  await expect(page.getByRole('button', { name: 'อนุมัติ', exact: true })).toHaveCount(0);

  // ── ขั้น 8: กลับไปหน้ารายการ แถวเดิมต้องแสดงสถานะ "อนุมัติ" ด้วย ──
  await page.goto('/leave-requests.html');
  const rowAfterApprove = page.locator('table tbody tr', { hasText: requestTitle });
  await expect(rowAfterApprove).toBeVisible({ timeout: 15_000 });
  await expect(rowAfterApprove).not.toContainText('รอพิจารณา');
  await expect(rowAfterApprove).toContainText('อนุมัติ');
});
