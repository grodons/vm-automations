/**
 * VM Operations Reorg - one-time clean-up of 105 Village Market > Operations
 * Runs in the jeff@villagemarketatblue.com Apps Script project "Village Market Automations".
 *
 * Reads the "VM Operations Reorg Plan (OWNER ONLY)" sheet: one row per file/folder to move and/or rename.
 *
 * HOW TO USE
 *   1. Run vmReorgCheck   -> every row gets Status "Ready" or "Problem: ...". Nothing is moved.
 *   2. Look over the sheet. Delete or fix any row you don't want.
 *   3. Run vmReorgRun     -> only "Ready" rows are carried out; each becomes "Done" (or "Failed: ...").
 *   4. Changed your mind? vmReorgUndo puts every "Done" row back where it was, with its old name.
 *
 * FAIL-SAFES
 *  - Never deletes or trashes anything. "To delete" items only go to Operations > 98 TO DELETE for you to review.
 *  - Only touches items that are inside Operations or Jeff's VM OWNER ONLY folder.
 *  - Only moves INTO Operations or VM OWNER ONLY. Never anywhere else.
 *  - Checks the item is still in the folder the plan expects. If someone moved it, the row is skipped.
 *  - Remembers each item's original folder and name so Undo can put it back.
 *  - Max 100 rows; stops safely before the Apps Script time limit (just run again to continue).
 */

const RG_SHEET_ID = '1faiunA3zCFb_HUcKYgHOJM0VU2uF12v28tk_JWj6pT4';   // VM Operations Reorg Plan (OWNER ONLY)
const RG_OPS_ID = '112zuOaweRp10K-ltDeq-NLvqtj5wLLGv';                  // 105 VM > Operations
const RG_OWNER_ID = '17-np0sRUzD-lu0FwFWKjxZvWy5HuoytS';                // 105 VM > 00 OWNER ONLY - Jeff
const RG_MAX_ROWS = 100;
const RG_TIME_MS = 4.5 * 60 * 1000;
// Columns: A # | B Item ID | C Item name | D From folder ID | E To folder ID | F To | G New name | H Why | I Original parent ID | J Status | K Note | L When

function vmReorgCheck() { rgLoop_('check'); }
function vmReorgRun()   { rgLoop_('run'); }
function vmReorgUndo()  { rgLoop_('undo'); }

function rgLoop_(mode) {
  const start = Date.now();
  const sh = SpreadsheetApp.openById(RG_SHEET_ID).getSheets()[0];
  const last = sh.getLastRow();
  if (last < 2) return;
  if (last - 1 > RG_MAX_ROWS) throw new Error('More than ' + RG_MAX_ROWS + ' rows - stopping for safety.');
  const rows = sh.getRange(2, 1, last - 1, 12).getValues();
  const order = mode === 'undo' ? rows.map((r, i) => i).reverse() : rows.map((r, i) => i);
  for (const i of order) {
    if (Date.now() - start > RG_TIME_MS) { Logger.log('Time limit - run again to continue.'); break; }
    const r = rows[i];
    const id = String(r[1]).trim(); if (!id) continue;
    const status = String(r[9]);
    let out = null;
    try {
      if (mode === 'check' && status !== 'Done') out = rgCheckRow_(r);
      else if (mode === 'run' && status === 'Ready') out = rgRunRow_(r);
      else if (mode === 'undo' && status === 'Done') out = rgUndoRow_(r);
    } catch (e) { out = { status: (mode === 'check' ? 'Problem: ' : 'Failed: ') + e.message }; }
    if (out) {
      if (out.parent) sh.getRange(i + 2, 9).setValue(out.parent);
      sh.getRange(i + 2, 10, 1, 3).setValues([[out.status, out.note || '', new Date()]]);
      SpreadsheetApp.flush();
    }
  }
}

function rgItem_(id) {
  try { return DriveApp.getFolderById(id); } catch (e) {}
  return DriveApp.getFileById(id);
}
function rgParentId_(item) { const p = item.getParents(); return p.hasNext() ? p.next().getId() : ''; }
function rgInside_(folderId, rootIds) {           // folder is a root or below one (max 8 levels)
  let cur = DriveApp.getFolderById(folderId);
  for (let d = 0; d < 8; d++) {
    if (rootIds.indexOf(cur.getId()) !== -1) return true;
    const up = cur.getParents(); if (!up.hasNext()) return false; cur = up.next();
  }
  return false;
}

function rgCheckRow_(r) {
  const item = rgItem_(String(r[1]).trim());
  if (item.isTrashed()) return { status: 'Problem: item is in the trash' };
  const parent = rgParentId_(item);
  if (parent !== String(r[3]).trim()) return { status: 'Problem: item is no longer in the expected folder (someone moved it)' };
  if (!rgInside_(parent, [RG_OPS_ID, RG_OWNER_ID])) return { status: 'Problem: item is not inside Operations / OWNER ONLY' };
  const dest = String(r[4]).trim();
  if (!rgInside_(dest, [RG_OPS_ID, RG_OWNER_ID])) return { status: 'Problem: destination is outside Operations / OWNER ONLY' };
  if (dest === String(r[1]).trim()) return { status: 'Problem: cannot move a folder into itself' };
  const newName = String(r[6]).trim();
  if (/[\/\\]/.test(newName)) return { status: 'Problem: new name has a slash' };
  return { status: 'Ready', note: 'Will ' + (dest !== parent ? 'move to ' + r[5] : 'stay') + (newName ? ' and be renamed "' + newName + '"' : '') };
}

function rgRunRow_(r) {
  const chk = rgCheckRow_(r);                     // re-check right before acting
  if (chk.status !== 'Ready') return chk;
  const item = rgItem_(String(r[1]).trim());
  const parent = rgParentId_(item);
  const oldName = item.getName();
  const dest = String(r[4]).trim();
  const newName = String(r[6]).trim();
  if (dest !== parent) item.moveTo(DriveApp.getFolderById(dest));
  if (newName && newName !== oldName) item.setName(newName);
  return { status: 'Done', parent: parent, note: 'Old name: ' + oldName };
}

function rgUndoRow_(r) {
  const item = rgItem_(String(r[1]).trim());
  const orig = String(r[8]).trim();
  if (!orig) return { status: 'Failed: no original folder recorded' };
  if (!rgInside_(orig, [RG_OPS_ID, RG_OWNER_ID])) return { status: 'Failed: original folder is outside Operations / OWNER ONLY' };
  const m = String(r[10]).match(/^Old name: (.*)$/);
  if (rgParentId_(item) !== orig) item.moveTo(DriveApp.getFolderById(orig));
  if (m && m[1] && item.getName() !== m[1]) item.setName(m[1]);
  return { status: 'Undone', note: 'Back in its original folder' };
}
