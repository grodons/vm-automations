/**
 * VM Email Saver - Village Market (5044713 Ontario Inc.)
 * Runs in the jeff@villagemarketatblue.com Apps Script project "Village Market Automations".
 *
 * Every 15 minutes:
 *  1. Finds NEW (received on/after LIVE_DATE) inbox emails that look like vendor invoices/statements
 *     and have a PDF attached.
 *  2. Saves each PDF into 105 Village Market > 00 OWNER ONLY - Jeff > Email Inbox,
 *     named "EMAIL_YYYY-MM-DD_Sender_OriginalName.pdf". Claude reads them in the evening run.
 *  3. Then sorts the email in Gmail:  Loblaws emails -> label "Loblaws";  everything else -> label "Invoices".
 *     The email is taken out of the Inbox (archived) ONLY after every PDF was saved.
 *  4. Invoice-type emails with NO PDF (portal links) stay in the Inbox with label "VM-No-PDF" so Jeff sees them.
 *  5. Emails mentioning banking / payment-detail changes stay in the Inbox, starred, label "VM-CHECK-BANKING".
 *
 * FAIL-SAFES
 *  - Only looks at emails that match invoice words AND have a PDF, or come from a known vendor domain.
 *    Personal mail is never touched.
 *  - Never deletes or trashes anything. Never replies to or emails anyone. Never marks mail read.
 *  - Skips a PDF if a file with the same name is already saved (safe to re-run).
 *  - Adds label "VM-Saved" so an email is never processed twice.
 *  - Stops before Google's 6-minute limit.
 */

// ===== SETTINGS =====
const ES_FOLDER_ID = '1ndnJNlTW3HeZ3DgQ0jKKOKar7BvGTX5T';   // 105 VM > 00 OWNER ONLY - Jeff > Email Inbox
const ES_LIVE_DATE = '2026/11/27';                           // mail received on/after this date (YYYY/MM/DD)
const ES_LABEL_INVOICES = 'Invoices';                        // Jeff's existing Gmail folder
const ES_LABEL_LOBLAWS = 'Loblaws';                          // Jeff's existing Gmail folder
const ES_LABEL_SAVED = 'VM-Saved';
const ES_LABEL_NOPDF = 'VM-No-PDF';
const ES_LABEL_BANKING = 'VM-CHECK-BANKING';
const ES_MAX_THREADS = 40;
const ES_TIME_BUDGET_MS = 4.5 * 60 * 1000;

// Words that make an email look like a bill. Matched against subject + attachment names.
const ES_INVOICE_WORDS = ['invoice', 'inv#', 'inv ', 'statement', 'bill', 'credit memo', 'credit note',
  'receipt', 'facture', 'remittance', 'past due', 'account summary', 'order #', 'delivery'];
// Known vendor domains (any PDF from these is saved, whatever the subject). Add more as needed.
const ES_VENDOR_DOMAINS = ['loblaw', 'gfs.com', 'gfs.ca', 'fritolay', 'pepsico', 'core-mark', 'coremark',
  'cocacola', 'coke.com', 'olg.ca', 'imperialtobacco', 'bat.com', 'rbh.com', 'jti.com', 'redbull',
  'arcticglacier', 'enbridge', 'hydroone', 'rogers', 'bondi', 'scholtens', 'royalspecialty', 'wonderbrands',
  'cjrwholesale', 'dairycentral', 'abell', 'uline', 'bydem'];
// Never save from these (POS reports, our own mail, Jeff's other accounts).
const ES_IGNORE = ['mystore', 'logivision', 'globepos', '@gordonsmarket.ca', 'jeff@villagemarketatblue.com',
  'calendar-notification', 'noreply@google.com'];
const ES_BANKING_PHRASES = ['banking information', 'banking details', 'bank details', 'bank account',
  'change of bank', 'changed our bank', 'updated banking', 'update our banking', 'wire transfer',
  'direct deposit', 'void cheque', 'void check', 'payment instructions', 'remit to a new', 'new remittance'];

// ===== MAIN (trigger runs this) =====
function vmProcessInvoiceEmails() {
  const start = Date.now();
  const outOfTime = () => Date.now() - start > ES_TIME_BUDGET_MS;
  const L = {
    invoices: label_(ES_LABEL_INVOICES), loblaws: label_(ES_LABEL_LOBLAWS), saved: label_(ES_LABEL_SAVED),
    nopdf: label_(ES_LABEL_NOPDF), banking: label_(ES_LABEL_BANKING)
  };
  const folder = DriveApp.getFolderById(ES_FOLDER_ID);
  const threads = GmailApp.search('in:inbox after:' + dayBefore_(ES_LIVE_DATE) +
    ' -label:' + ES_LABEL_SAVED + ' -label:' + ES_LABEL_NOPDF, 0, ES_MAX_THREADS);

  threads.forEach(thread => {
    if (outOfTime()) return;
    try { handleThread_(thread, folder, L); } catch (e) { console.error('Thread ' + thread.getId() + ': ' + e.message); }
  });
}

function handleThread_(thread, folder, L) {
  const msgs = thread.getMessages();
  let savedAny = false, invoiceLike = false, banking = false, loblaws = false, allSaved = true;

  msgs.forEach(msg => {
    const from = (msg.getFrom() || '').toLowerCase();
    if (ES_IGNORE.some(x => from.indexOf(x) !== -1)) return;
    const pdfs = msg.getAttachments({ includeInlineImages: false }).filter(a =>
      (a.getContentType() || '').toLowerCase() === 'application/pdf' || (a.getName() || '').toLowerCase().endsWith('.pdf'));
    const subject = (msg.getSubject() || '').toLowerCase();
    const names = pdfs.map(p => (p.getName() || '').toLowerCase()).join(' ');
    const vendorDomain = ES_VENDOR_DOMAINS.some(d => from.indexOf(d) !== -1);
    const looksLikeBill = vendorDomain || ES_INVOICE_WORDS.some(w => (subject + ' ' + names).indexOf(w) !== -1);
    if (!looksLikeBill) return;
    invoiceLike = true;
    if (from.indexOf('loblaw') !== -1 || subject.indexOf('loblaw') !== -1) loblaws = true;
    const text = (subject + ' ' + msg.getPlainBody()).toLowerCase();
    if (ES_BANKING_PHRASES.some(p => text.indexOf(p) !== -1)) banking = true;

    const dateStr = Utilities.formatDate(msg.getDate(), 'America/Toronto', 'yyyy-MM-dd');
    const sender = cleanSender_(msg.getFrom());
    pdfs.forEach(pdf => {
      try {
        let original = (pdf.getName() || 'attachment').replace(/[\\\/:*?"<>|]/g, '-');
        if (!original.toLowerCase().endsWith('.pdf')) original += '.pdf';
        const fileName = 'EMAIL_' + dateStr + '_' + sender + '_' + original;
        if (!folder.getFilesByName(fileName).hasNext()) {
          folder.createFile(pdf.copyBlob().setContentType('application/pdf').setName(fileName));
        }
        savedAny = true;
      } catch (e) { allSaved = false; console.error('Save failed: ' + e.message); }
    });
  });

  if (!invoiceLike) return;                       // not a bill: leave it exactly as it is
  if (banking) { thread.addLabel(L.banking); thread.markImportant(); msgs[msgs.length - 1].star(); }
  if (!savedAny) { thread.addLabel(L.nopdf); return; }   // portal link etc: stays in Inbox for Jeff
  if (!allSaved) return;                           // retry next run; nothing moved
  thread.addLabel(L.saved);
  thread.addLabel(loblaws ? L.loblaws : L.invoices);
  if (!banking) thread.moveToArchive();            // banking-change emails stay in the Inbox
}

// ===== ONE-TIME SETUP =====
function installEmailSaverTrigger() {
  ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'vmProcessInvoiceEmails')
    .forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('vmProcessInvoiceEmails').timeBased().everyMinutes(15).create();
}

/** Dry run: logs what WOULD be saved/sorted. Changes nothing. Run this first. */
function previewInvoiceEmails() {
  const threads = GmailApp.search('in:inbox after:' + dayBefore_(ES_LIVE_DATE) + ' -label:' + ES_LABEL_SAVED, 0, ES_MAX_THREADS);
  threads.forEach(t => {
    const m = t.getMessages()[0];
    const pdfs = m.getAttachments({ includeInlineImages: false }).filter(a => (a.getName() || '').toLowerCase().endsWith('.pdf'));
    Logger.log(m.getDate() + ' | ' + m.getFrom() + ' | ' + m.getSubject() + ' | PDFs: ' + pdfs.length);
  });
}

// ===== HELPERS =====
function label_(name) { return GmailApp.getUserLabelByName(name) || GmailApp.createLabel(name); }
function dayBefore_(yyyyMmDd) {
  const p = yyyyMmDd.split('/');
  return Utilities.formatDate(new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]) - 1), 'America/Toronto', 'yyyy/MM/dd');
}
function cleanSender_(from) {
  let name = String(from).replace(/<.*>/, '').replace(/"/g, '').trim();
  if (!name) { const m = String(from).match(/@([^>.\s]+)/); name = m ? m[1] : 'Unknown'; }
  return name.replace(/[\\\/:*?"<>|]/g, '-').substring(0, 40);
}
