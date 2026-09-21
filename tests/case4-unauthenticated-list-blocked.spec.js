// เคส 4 (ความปลอดภัย): "ไม่ล็อกอินแล้วเปิดหน้ารายการ ต้องอ่านข้อมูลไม่ได้"
// ผ่านเมื่อ: เข้าไม่ได้ (auth-guard.js เด้งไป login.html และไม่มีตาราง/ข้อมูลใบลาหลุดออกมาให้เห็น)
// context ของแต่ละ test ใน Playwright เป็นของใหม่เสมอ (ไม่มี cookie/localStorage ค้าง) จึงเทียบเท่า "ไม่ได้ล็อกอิน" อยู่แล้ว

const { test, expect } = require('@playwright/test');

test('ไม่ล็อกอินแล้วเปิดหน้ารายการ ต้องอ่านข้อมูลไม่ได้', async ({ page }) => {
  await page.goto('/leave-requests.html');

  // auth-guard.js: onAuthStateChanged คืน user=null → เด้งไป login.html ทันที
  await page.waitForURL('**/login.html', { timeout: 15_000 });
  await expect(page).toHaveURL(/login\.html/);

  // ยืนยันว่าไม่มีตารางใบลาหลุดออกมาให้เห็นก่อนเด้ง (ไม่รั่วข้อมูล)
  await expect(page.locator('table')).toHaveCount(0);
});
