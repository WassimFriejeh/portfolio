/**
 * Optional Google Sheet inbox (no database host needed).
 *
 * Setup:
 * 1. Create a Google Sheet with headers in row 1:
 *    Timestamp | Name | Email | Subject | Message
 * 2. Extensions → Apps Script → paste this file → Deploy → New deployment
 *    → Web app → Execute as: Me → Who has access: Anyone
 * 3. Copy the web app URL into frontend/.env.local as CONTACT_SHEET_WEBHOOK_URL
 *
 * Prefer free Neon DATABASE_URL when you can — this sheet path is the zero-DB fallback.
 */

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents || "{}");
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    const id = Utilities.getUuid();
    sheet.appendRow([
      data.createdAt || new Date().toISOString(),
      data.name || "",
      data.email || "",
      data.subject || "",
      data.message || "",
      id,
    ]);
    return ContentService.createTextOutput(JSON.stringify({ ok: true, id })).setMimeType(
      ContentService.MimeType.JSON,
    );
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: String(err) }),
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
