# One-time setup (Jeff, ~20 minutes)

## 1. Apps Script (signed in as jeff@villagemarketatblue.com)
1. Go to script.google.com -> New project -> name it "Village Market Automations".
2. Project Settings (gear) -> Time zone: (GMT-05:00) Eastern Time - Toronto.
3. Create 3 files (+ next to Files -> Script) named VM_Email_Saver, VM_Move_Queue, VM_Alerts. Paste each file from `apps-script/`. Delete the empty Code.gs. Save.
4. Choose a function in the top bar and click Run (approve the permission screens the first time):
   - `previewInvoiceEmails` -> View > Logs: check it lists invoice emails, not personal mail.
   - `installEmailSaverTrigger` (starts the 15-minute email saver)
   - `installMoveQueueTriggers` (file mover + tab colours)
   - `previewCostAlertsToJeff` (does nothing until there are alerts - fine)
   - `installAlertTriggers` (Chrissan's emails)
5. Gmail: the script uses your existing "Invoices" and "Loblaws" labels (creates them if missing).

## 2. Claude scheduled tasks
All three are created (VM AP Invoice Processing trig_01BiVCRbg5R9VmaC7qrFD1Yd, VM Price & Margin Alerts, VM Labour Control).

## 3. Decisions before Dec 2
- Margin targets: reset from the PLU list + VM P&L (current drafts are too low).
- Labour: Labour Control > Settings - target sales per labour hour ($120 draft = ~15% labour) and minimum hours per day (16 draft).

## 4. Data Claude needs
- L-BOSS PLU export for Village Market (PLU #, vendor SKU, description, dept, retail, cost) saved to 00 Claude > Pricing & Margin as "YYMM DD PLU List".
- 7shifts Hours & Wages summary each pay period, saved as now (Employees > ... > 7Shifts > 2026).
