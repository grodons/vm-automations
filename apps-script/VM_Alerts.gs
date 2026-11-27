/**
 * VM Alerts - emails to Chrissan (Village Market manager)
 * Runs in the jeff@villagemarketatblue.com Apps Script project "Village Market Automations".
 *
 *  Daily ~8 pm   vmSendCostAlerts    New supplier cost increases (Price & Margin Log > Alerts, Status "New")
 *  Mon ~7 am     vmSendMarginCheck   POS items below their department target margin (Margin Check tab)
 *  Wed ~9 am     vmSendHoursBudget   Next week's hours budget by day (Labour Control > Days)
 *  Fri ~2 pm     vmScheduleCheck     Next week's scheduled hours vs budget (or a reminder if not entered)
 *  Tue ~9 am     vmLabourRecap       Last week: actual hours vs hours earned by actual sales
 *
 * FAIL-SAFES
 *  - Recipients are fixed below. Nothing in a sheet (or any AI) can add or change a recipient.
 *  - No wages, pay rates, labour $ or P&L figures are ever emailed - hours and sales only.
 *  - Cost alerts are re-checked (new cost must really be higher) and capped at 100 lines; more = held, Jeff warned.
 *  - Only sends email and updates Status/Sent columns on the Alerts tab. Never changes prices, never contacts vendors.
 */

const VA_PRICE_ID = '1i10aLUd2dx0Me5aWImdDcB6nzc_8d2O56Rl3sJBhu6A';   // VM Price & Margin Log
const VA_LABOUR_ID = '1kdP-EtyQPTVL8sSA6hiH9UZGyXQl37T-Twq__zQUcyI';  // VM Labour Control
const VA_CHRISSAN = 'chrissan@villagemarketatblue.com';
const VA_JEFF = 'jeff@gordonsmarket.ca';                              // copies + warnings
const VA_CC_JEFF = true;                                              // Jeff copied on every Chrissan email
const VA_ALLOWED = [VA_CHRISSAN, VA_JEFF];
const VA_MAX_LINES = 100;
const VA_NAME = 'Village Market Alerts';
const VA_TZ = 'America/Toronto';

// ---------- 1. Cost increases (daily) ----------
function vmSendCostAlerts() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) return;
  try { costAlerts_(false); } finally { lock.releaseLock(); }
}
/** Sends Jeff what Chrissan would get. Marks nothing. */
function previewCostAlertsToJeff() { costAlerts_(true); }

function costAlerts_(preview) {
  const sh = SpreadsheetApp.openById(VA_PRICE_ID).getSheetByName('Alerts');
  const data = sh.getDataRange().getValues();
  if (data.length < 2) return;
  const h = data[0].map(String);
  const c = n => { const i = h.indexOf(n); if (i < 0) throw new Error('Missing column ' + n); return i; };
  const C = { vendor: c('Vendor'), code: c('Item code'), desc: c('Description'), pack: c('Pack size'), unit: c('Unit'),
    prev: c('Previous cost'), cost: c('New cost'), inv: c('Invoice #'), invDate: c('Invoice date'), link: c('Invoice'),
    note: c('Check note'), status: c('Status'), sentTo: c('Sent to'), sentAt: c('Sent at'), pos: c('POS item'),
    dept: c('Dept'), retail: c('Retail'), mNow: c('Margin now'), target: c('Target margin'), price: c('Price for target'),
    check: c('Margin check') };
  const items = [], skipped = [];
  for (let r = 1; r < data.length; r++) {
    const row = data[r];
    if (String(row[C.status]).trim() !== 'New') continue;
    const prev = Number(row[C.prev]), cost = Number(row[C.cost]);
    if (!(prev > 0) || !(cost > prev)) { skipped.push(r); continue; }
    items.push({ r: r, row: row, prev: prev, cost: cost });
  }
  if (!preview) skipped.forEach(r => sh.getRange(r + 1, C.status + 1).setValue('Skipped - not an increase'));
  if (!items.length) return;
  if (items.length > VA_MAX_LINES) {
    send_(VA_JEFF, 'VM price alerts HELD - ' + items.length + ' lines', '<p>More than ' + VA_MAX_LINES +
      ' cost increases were queued, so nothing was sent to Chrissan (likely a misread or backfill). Check the Alerts tab.</p>', false);
    return;
  }
  // Worst first: CRITICAL, BELOW TARGET, then the rest
  const rank = it => { const v = String(it.row[C.check]); return v === 'CRITICAL' ? 0 : (v === 'BELOW TARGET' ? 1 : 2); };
  items.sort((a, b) => rank(a) - rank(b));

  const money = n => (n === '' || n == null || isNaN(Number(n))) ? '' : '$' + Number(n).toFixed(2);
  const pct = n => (n === '' || n == null || isNaN(Number(n))) ? '' : (Number(n) * 100).toFixed(1) + '%';
  const rows = items.map(it => {
    const row = it.row, chg = it.cost - it.prev;
    const target = row[C.target];
    const tCell = target === '' ? '<span style="color:#777">Not matched to a POS item</span>'
      : (String(target) === 'Excluded' ? '<span style="color:#777">' + esc_(row[C.dept]) + ' - no margin target (price sensitive / OLG)</span>'
        : esc_(row[C.pos]) + '<br>Shelf ' + money(row[C.retail]) + ' &middot; margin <b>' + pct(row[C.mNow]) + '</b> (target ' + pct(target) + ')' +
          (String(row[C.check]) !== 'OK' && row[C.price] !== '' ? '<br><b style="color:#b00">' + esc_(row[C.check]) + ': price at ' + money(row[C.price]) + '</b>' : ''));
    return '<tr><td>' + esc_(row[C.vendor]) + '</td><td>' + esc_(row[C.desc]) + '<br><span style="color:#777">' + esc_(row[C.code]) + ' &middot; ' +
      esc_(row[C.pack]) + ' ' + esc_(row[C.unit]) + '</span>' + (row[C.note] ? '<br><i>Check: ' + esc_(row[C.note]) + '</i>' : '') + '</td>' +
      '<td align="right">' + money(it.prev) + '</td><td align="right"><b>' + money(it.cost) + '</b></td>' +
      '<td align="right" style="color:#b00">+' + money(chg) + '<br>+' + (chg / it.prev * 100).toFixed(1) + '%</td>' +
      '<td>' + (row[C.link] ? '<a href="' + esc_(row[C.link]) + '">' + esc_(row[C.inv]) + '</a>' : esc_(row[C.inv])) + '</td><td>' + tCell + '</td></tr>';
  }).join('');
  const html = '<div style="font-family:Arial;font-size:14px">Hi Chrissan,<br><br>These items cost us more on the latest invoice. ' +
    'We are a resort store with high costs, so every item must hit its department target margin. ' +
    'If you have already raised the price, delete this email. If not, please update the shelf price in L-BOSS today.<br><br>' +
    table_(['Vendor', 'Item', 'Was', 'Now', 'Change', 'Invoice', 'Shelf price / margin'], rows) +
    '<br><span style="color:#777;font-size:12px">Automatic email. Costs are read from vendor invoices; nothing has been changed in the POS.</span></div>';
  const subject = 'Cost increases to review - ' + items.length + ' item' + (items.length > 1 ? 's' : '') + ' - ' + Utilities.formatDate(new Date(), VA_TZ, 'MMM d');
  if (preview) { send_(VA_JEFF, '[PREVIEW] ' + subject, html, false); return; }
  send_(VA_CHRISSAN, subject, html, VA_CC_JEFF);
  const now = new Date();
  items.forEach(it => sh.getRange(it.r + 1, C.status + 1, 1, 3).setValues([['Emailed', VA_CHRISSAN, now]]));
}

// ---------- 2. Margin check (Monday) ----------
function vmSendMarginCheck() {
  const sh = SpreadsheetApp.openById(VA_PRICE_ID).getSheetByName('Margin Check');
  const data = sh.getDataRange().getValues();
  if (data.length < 2 || String(data[1][0]).indexOf('Nothing') === 0 || String(data[1][0]) === '') return;  // nothing below target
  const list = data.slice(1).filter(r => r[0] !== '').slice(0, 40);
  const money = n => isNaN(Number(n)) || n === '' ? '' : '$' + Number(n).toFixed(2);
  const pct = n => isNaN(Number(n)) || n === '' ? '' : (Number(n) * 100).toFixed(1) + '%';
  const rows = list.map(r => '<tr><td>' + esc_(r[1]) + '<br><span style="color:#777">PLU ' + esc_(r[0]) + '</span></td><td>' + esc_(r[2]) +
    '</td><td align="right">' + money(r[3]) + '</td><td align="right">' + money(r[4]) + '</td><td align="right" style="color:#b00"><b>' + pct(r[5]) +
    '</b></td><td align="right">' + pct(r[6]) + '</td><td align="right"><b>' + money(r[7]) + '</b></td></tr>').join('');
  const total = data.slice(1).filter(r => r[0] !== '').length;
  const html = '<div style="font-family:Arial;font-size:14px">Hi Chrissan,<br><br>Weekly margin check: these items sell below their department target margin. ' +
    'Please re-price them this week (lowest margin first). Tobacco and lottery are not included.<br><br>' +
    table_(['Item', 'Dept', 'Shelf', 'Cost', 'Margin', 'Target', 'New price'], rows) +
    (total > list.length ? '<br>Showing the worst ' + list.length + ' of ' + total + '. The full list is on the Margin Check tab.' : '') +
    '<br><span style="color:#777;font-size:12px">Automatic email from the Village Market Price & Margin Log.</span></div>';
  send_(VA_CHRISSAN, 'Margin check - ' + total + ' item' + (total > 1 ? 's' : '') + ' below target', html, VA_CC_JEFF);
}

// ---------- 3-5. Labour ----------
function vmSendHoursBudget() {
  const wk = weekRows_(nextMonday_(new Date()));
  if (!wk.rows.length || wk.rows.some(r => r.budget === '')) {
    send_(VA_JEFF, 'VM hours budget NOT sent - forecast missing', '<p>The Labour Control sheet has no hours budget for the week of ' + wk.label +
      '. Check the VM Labour Control scheduled task.</p>', false);
    return;
  }
  const rows = wk.rows.map(r => '<tr><td>' + r.day + ' ' + r.label + '</td><td align="right">$' + Math.round(r.forecast).toLocaleString() +
    '</td><td align="right"><b>' + r.budget + '</b></td></tr>').join('');
  const total = wk.rows.reduce((s, r) => s + Number(r.budget), 0);
  const html = '<div style="font-family:Arial;font-size:14px">Hi Chrissan,<br><br>Here is the hours budget for the week of <b>' + wk.label +
    '</b>. Please build the 7shifts schedule to these hours, then type your scheduled hours for each day into the yellow column of the Labour Control sheet by <b>Friday noon</b>.<br><br>' +
    table_(['Day', 'Forecast sales (ex-lottery)', 'Hours budget'], rows) + '<p><b>Week total: ' + total.toFixed(1) + ' hours</b></p>' +
    '<p>Tip: schedule to the budget, then flex - send people home early when it is quiet, call in when it is busy.</p>' +
    '<p><a href="https://docs.google.com/spreadsheets/d/' + VA_LABOUR_ID + '/edit">Open VM Labour Control</a></p></div>';
  send_(VA_CHRISSAN, 'Hours budget - week of ' + wk.label + ' (' + total.toFixed(0) + ' hrs)', html, VA_CC_JEFF);
}

function vmScheduleCheck() {
  const s = settings_();
  const wk = weekRows_(nextMonday_(new Date()));
  if (!wk.rows.length) return;
  const missing = wk.rows.filter(r => r.scheduled === '');
  if (missing.length) {
    send_(VA_CHRISSAN, 'Reminder: enter next week\'s scheduled hours', '<div style="font-family:Arial;font-size:14px">Hi Chrissan,<br><br>Scheduled hours are missing for ' +
      missing.map(r => r.day + ' ' + r.label).join(', ') + ' (week of ' + wk.label + '). Please add them to the yellow column today so we can check the schedule against the budget.<br><br>' +
      '<a href="https://docs.google.com/spreadsheets/d/' + VA_LABOUR_ID + '/edit">Open VM Labour Control</a></div>', VA_CC_JEFF);
    return;
  }
  const budget = wk.rows.reduce((t, r) => t + Number(r.budget || 0), 0);
  const sched = wk.rows.reduce((t, r) => t + Number(r.scheduled || 0), 0);
  const overDays = wk.rows.filter(r => r.budget !== '' && Number(r.scheduled) - Number(r.budget) > s.dayTol);
  if (!overDays.length && sched <= budget * (1 + s.weekPct)) return;   // on budget: no email
  const rows = wk.rows.map(r => { const d = Number(r.scheduled) - Number(r.budget);
    return '<tr><td>' + r.day + ' ' + r.label + '</td><td align="right">' + r.budget + '</td><td align="right">' + r.scheduled + '</td><td align="right"' +
      (d > s.dayTol ? ' style="color:#b00"><b>+' + d.toFixed(1) + '</b>' : '>' + (d > 0 ? '+' : '') + d.toFixed(1)) + '</td></tr>'; }).join('');
  const html = '<div style="font-family:Arial;font-size:14px">Hi Chrissan,<br><br>Next week\'s schedule (week of ' + wk.label + ') is <b>' + (sched - budget).toFixed(1) +
    ' hours over budget</b>. Please trim the red days before the schedule is published, or reply to Jeff with the reason (event, training, etc.).<br><br>' +
    table_(['Day', 'Budget', 'Scheduled', 'Over / under'], rows) + '<p>Week: ' + sched.toFixed(1) + ' scheduled vs ' + budget.toFixed(1) + ' budget.</p></div>';
  send_(VA_CHRISSAN, 'Schedule over budget - week of ' + wk.label, html, VA_CC_JEFF);
}

function vmLabourRecap() {
  const mon = nextMonday_(new Date()); mon.setDate(mon.getDate() - 14);   // Tuesday run -> last Monday
  const wk = weekRows_(mon);
  if (!wk.rows.length || wk.rows.some(r => r.actualHrs === '' || r.earned === '')) {
    send_(VA_JEFF, 'VM labour recap NOT sent - actuals missing', '<p>Actual sales or hours are missing for the week of ' + wk.label +
      '. Save the 7shifts export and check the VM Labour Control task.</p>', false);
    return;
  }
  const act = wk.rows.reduce((t, r) => t + Number(r.actualHrs), 0), earned = wk.rows.reduce((t, r) => t + Number(r.earned), 0);
  const sales = wk.rows.reduce((t, r) => t + Number(r.actualSales || 0), 0);
  const rows = wk.rows.map(r => { const d = Number(r.actualHrs) - Number(r.earned);
    return '<tr><td>' + r.day + ' ' + r.label + '</td><td align="right">$' + Math.round(r.actualSales).toLocaleString() + '</td><td align="right">' + r.earned +
      '</td><td align="right">' + r.actualHrs + '</td><td align="right"' + (d > 0.5 ? ' style="color:#b00"><b>+' + d.toFixed(1) + '</b>' : '>' + d.toFixed(1)) + '</td></tr>'; }).join('');
  const html = '<div style="font-family:Arial;font-size:14px">Hi Chrissan,<br><br>Last week (' + wk.label + '): we worked <b>' + act.toFixed(1) + ' hours</b>; our sales earned <b>' +
    earned.toFixed(1) + ' hours</b> (' + (act - earned >= 0 ? '+' : '') + (act - earned).toFixed(1) + '). Sales per labour hour: <b>$' + (sales / act).toFixed(0) + '</b>.<br><br>' +
    table_(['Day', 'Sales (ex-lottery)', 'Earned hrs', 'Actual hrs', 'Over / under'], rows) + '</div>';
  send_(VA_CHRISSAN, 'Labour recap - week of ' + wk.label + ': ' + (act - earned >= 0 ? '+' : '') + (act - earned).toFixed(0) + ' hrs vs earned', html, VA_CC_JEFF);
}

// ---------- helpers ----------
function weekRows_(monday) {
  const key = d => Utilities.formatDate(d, VA_TZ, 'yyyy-MM-dd');
  const start = key(monday);
  const end = new Date(monday); end.setDate(end.getDate() + 6);
  const data = SpreadsheetApp.openById(VA_LABOUR_ID).getSheetByName('Days').getDataRange().getValues();
  const h = data[0].map(String), c = n => h.indexOf(n);
  const rows = [];
  data.slice(1).forEach(r => {
    if (!(r[0] instanceof Date)) return;
    const k = key(r[0]);
    if (k < start || k > key(end)) return;
    rows.push({ day: r[c('Day')], label: Utilities.formatDate(r[0], VA_TZ, 'MMM d'), forecast: r[c('Forecast sales ex-lottery')],
      budget: r[c('Hours budget')], scheduled: r[c('Scheduled hours')], actualSales: r[c('Actual sales ex-lottery')],
      actualHrs: r[c('Actual hours')], earned: r[c('Earned hours')] });
  });
  return { rows: rows, label: Utilities.formatDate(monday, VA_TZ, 'MMM d') };
}
function nextMonday_(d) { const x = new Date(d); x.setHours(12, 0, 0, 0); x.setDate(x.getDate() + ((8 - x.getDay()) % 7 || 7)); return x; }
function settings_() {
  const v = SpreadsheetApp.openById(VA_LABOUR_ID).getSheetByName('Settings').getRange('B4:B5').getValues();
  return { dayTol: Number(v[0][0]) || 2, weekPct: Number(v[1][0]) || 0.05 };
}
function table_(heads, rowsHtml) {
  return '<table cellpadding="6" cellspacing="0" border="1" style="border-collapse:collapse;font-family:Arial;font-size:13px;border-color:#ddd">' +
    '<tr style="background:#1F3864;color:#fff">' + heads.map(x => '<th align="left">' + x + '</th>').join('') + '</tr>' + rowsHtml + '</table>';
}
function esc_(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function send_(to, subject, html, ccJeff) {
  if (VA_ALLOWED.indexOf(to) === -1) throw new Error('Recipient not allowed: ' + to);
  const opts = { to: to, subject: subject, htmlBody: html, name: VA_NAME };
  if (ccJeff && to !== VA_JEFF) opts.cc = VA_JEFF;
  MailApp.sendEmail(opts);
}

// ---------- ONE-TIME SETUP ----------
function installAlertTriggers() {
  const fns = ['vmSendCostAlerts', 'vmSendMarginCheck', 'vmSendHoursBudget', 'vmScheduleCheck', 'vmLabourRecap'];
  ScriptApp.getProjectTriggers().filter(t => fns.indexOf(t.getHandlerFunction()) !== -1).forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('vmSendCostAlerts').timeBased().everyDays(1).atHour(20).create();
  ScriptApp.newTrigger('vmSendMarginCheck').timeBased().onWeekDay(ScriptApp.WeekDay.MONDAY).atHour(7).create();
  ScriptApp.newTrigger('vmLabourRecap').timeBased().onWeekDay(ScriptApp.WeekDay.TUESDAY).atHour(9).create();
  ScriptApp.newTrigger('vmSendHoursBudget').timeBased().onWeekDay(ScriptApp.WeekDay.WEDNESDAY).atHour(9).create();
  ScriptApp.newTrigger('vmScheduleCheck').timeBased().onWeekDay(ScriptApp.WeekDay.FRIDAY).atHour(14).create();
}
