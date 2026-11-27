/**
 * VM Move Queue + bill-sheet tab colours - Village Market
 * Runs in the jeff@villagemarketatblue.com Apps Script project "Village Market Automations".
 *
 * Claude cannot rename/move files it did not create, so it writes one line per file in the
 * "VM AP Move Queue" sheet (file -> new name -> destination folder). Every 15 minutes this script
 * carries the lines out and writes Done / Refused + reason.
 *
 * FAIL-SAFES
 *  - Only moves files that currently sit in 11 VM SCANNED, the owner-only Email Inbox, or 12 VM NEEDS REVIEW.
 *  - Only moves INTO folders inside "1Purchase Invoices VM" (or Jeff's VM owner-only folder).
 *    Exception: tobacco count sheets ("YYMM DD Tobacco Count.pdf") may go into Operations > Tobacco Counts.
 *    Never into 00 ARCHIVED or 0 Accounts payable, and never back into an inbox folder.
 *  - New names must look like "YYMM DD ... .pdf" (or blank = keep name). No slashes.
 *  - Max 60 files per run; stops before the time limit; never deletes; never touches a line that has a Status.
 */

const MQ_SHEET_ID = '1uhBbGCocSJBFNFdJLVuDeWb-XwJVwMPVZAKbZNrDtfU';      // VM AP Move Queue (owner only)
const MQ_ROOT_ID = '1ddsXenQZvG2H7vPLoxSE7XnwCzs5nqV_';                    // 105 VM > 1Purchase Invoices VM
const MQ_PRIVATE_ROOT_ID = '17-np0sRUzD-lu0FwFWKjxZvWy5HuoytS';            // 105 VM > 00 OWNER ONLY - Jeff
const MQ_TOBACCO_ROOT_ID = '1AGfIbrTz7Tqg8t_F0ODc_2WwtR50JYX4';            // VM Operations > Tobacco Counts (count sheets only)
const MQ_SOURCE_IDS = ['1wuAOEPQcQ2fYCsiOpISRnJLIYefzEjQ8',                // 11 VM SCANNED
                       '1ndnJNlTW3HeZ3DgQ0jKKOKar7BvGTX5T'];               // OWNER ONLY > Email Inbox
const MQ_REVIEW_IDS = ['10Mf5s3dALwd7aB8IkokrA-ODnyQDTGM_'];               // 12 VM NEEDS REVIEW (resolved items may leave)
const MQ_BLOCKED_IDS = ['1MDKFx3RYKgvIHLvdxq0ABAj0xPZPLI1q',               // 00 ARCHIVED
                        '1RSqA2tdQY8Hnva99sIUCSLsBwQzuo0V7'];              // 0 Accounts payable
const MQ_MAX_PER_RUN = 60;
const MQ_TIME_BUDGET_MS = 4 * 60 * 1000;

// Bill entry sheets whose month tabs get coloured (yellow = rows not ticked, green = all ticked)
const TC_SHEET_IDS = ['1X976HJqrvGzCM4P0kqg9A6OKFMEr1jBZehveBigT6WA',      // VM 2026 QBO Bill Entries
                      '1byckuBPYhDHhnKnthJeIscrWlOk_CKIxtF6zWZ7M7Ss'];     // VM 2027 QBO Bill Entries

function vmProcessMoveQueue() {
  const start = Date.now();
  const sheet = SpreadsheetApp.openById(MQ_SHEET_ID).getSheets()[0];
  const last = sheet.getLastRow();
  if (last < 2) return;
  const rows = sheet.getRange(2, 1, last - 1, 9).getValues();
  let done = 0;
  for (let i = 0; i < rows.length; i++) {
    if (done >= MQ_MAX_PER_RUN || Date.now() - start > MQ_TIME_BUDGET_MS) break;
    const [fileId, , newName, destId, , , status] = rows[i];
    if (!fileId || status) continue;
    let result;
    try { result = moveOne_(String(fileId).trim(), String(newName || '').trim(), String(destId).trim()); }
    catch (e) { result = { status: 'Refused', note: 'Error: ' + e.message }; }
    sheet.getRange(i + 2, 7, 1, 3).setValues([[result.status, result.note, new Date()]]);
    done++;
  }
}

function moveOne_(fileId, newName, destId) {
  const file = DriveApp.getFileById(fileId);
  let inSource = false;
  const ps = file.getParents();
  while (ps.hasNext()) {
    const pid = ps.next().getId();
    if (MQ_SOURCE_IDS.indexOf(pid) !== -1 || MQ_REVIEW_IDS.indexOf(pid) !== -1) inSource = true;
  }
  if (!inSource) return { status: 'Refused', note: 'File is not in 11 VM SCANNED, Email Inbox or 12 VM NEEDS REVIEW (already moved?)' };
  if (MQ_SOURCE_IDS.indexOf(destId) !== -1) return { status: 'Refused', note: 'Destination is an inbox folder' };

  const check = checkDestination_(DriveApp.getFolderById(destId));
  if (!check.ok) return { status: 'Refused', note: check.reason };

  if (newName) {
    if (/[\/\\]/.test(newName)) return { status: 'Refused', note: 'New name contains a slash' };
    if (!/^\d{4} \d{2} .+\.pdf$/i.test(newName)) return { status: 'Refused', note: 'New name does not match "YYMM DD ... .pdf"' };
    if (newName.length > 150) return { status: 'Refused', note: 'New name too long' };
  }
  if (check.tobacco && !/^\d{4} \d{2} Tobacco Count( p\d+)?\.pdf$/i.test(newName || file.getName()))
    return { status: 'Refused', note: 'Only "YYMM DD Tobacco Count.pdf" files may go to Tobacco Counts' };
  if (newName) file.setName(newName);
  file.moveTo(DriveApp.getFolderById(destId));
  return { status: 'Done', note: 'Moved to ' + check.path };
}

function checkDestination_(folder) {
  const names = [];
  let cur = folder;
  for (let depth = 0; depth < 6; depth++) {
    if (MQ_BLOCKED_IDS.indexOf(cur.getId()) !== -1) return { ok: false, reason: 'Destination is a blocked folder (archived / AP)' };
    if (cur.getId() === MQ_ROOT_ID) return { ok: true, path: 'Purchase Invoices VM > ' + names.reverse().join(' > ') };
    if (cur.getId() === MQ_PRIVATE_ROOT_ID) return { ok: true, path: 'VM OWNER ONLY > ' + names.reverse().join(' > ') };
    if (cur.getId() === MQ_TOBACCO_ROOT_ID && names.length > 0) return { ok: true, tobacco: true, path: 'Tobacco Counts > ' + names.reverse().join(' > ') };
    names.push(cur.getName());
    const up = cur.getParents();
    if (!up.hasNext()) break;
    cur = up.next();
  }
  return { ok: false, reason: 'Destination is not inside 1Purchase Invoices VM, VM OWNER ONLY or a Tobacco Counts year folder' };
}

// ===== Tab colours on the VM QBO Bill Entries sheets =====
function vmColourBillTabs() {
  const monthTab = /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4}$/;
  TC_SHEET_IDS.forEach(id => {
    SpreadsheetApp.openById(id).getSheets().forEach(sh => {
      if (!monthTab.test(sh.getName())) return;
      const last = sh.getLastRow();
      let bills = 0, open = 0;
      if (last >= 2) sh.getRange(2, 1, last - 1, 2).getValues().forEach(r => {
        if (String(r[1]).trim() === '') return;
        bills++; if (r[0] !== true) open++;
      });
      const colour = bills === 0 ? null : (open > 0 ? '#FFD966' : '#93C47D');
      if (sh.getTabColor() !== colour) sh.setTabColor(colour);
    });
  });
}

// ===== ONE-TIME SETUP =====
function installMoveQueueTriggers() {
  ScriptApp.getProjectTriggers()
    .filter(t => ['vmProcessMoveQueue', 'vmColourBillTabs'].indexOf(t.getHandlerFunction()) !== -1)
    .forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('vmProcessMoveQueue').timeBased().everyMinutes(15).create();
  ScriptApp.newTrigger('vmColourBillTabs').timeBased().everyMinutes(30).create();
  vmProcessMoveQueue();
  vmColourBillTabs();
}
