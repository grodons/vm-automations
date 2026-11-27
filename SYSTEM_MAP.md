# Village Market Automations - System Map (rebuild guide)

Village Market (5044713 Ontario Inc.), 156 Jozo Weider Blvd, Blue Mountain Village. Owner: Jeff Meakings. Manager: Chrissan.
Fiscal year: Dec 1 - Nov 30. Kept separate from Gordon's ("Charlie", repo grodons/gordons-charlie).
Asset sale planned: these automations are NOT transferred to a buyer. On closing, turn off the Apps Script triggers and the three VM scheduled tasks.
Last updated: 2026-11-27.

## 1. What runs, when (America/Toronto)

| When | What | Where | Source |
|---|---|---|---|
| Every 15 min | Save invoice PDFs from jeff@villagemarketatblue.com to OWNER ONLY > Email Inbox; sort email to Gmail "Loblaws" or "Invoices" | Apps Script, jeff@villagemarketatblue.com, project "Village Market Automations" | `apps-script/VM_Email_Saver.gs` |
| Every 15 min | Carry out the VM AP Move Queue (rename + file PDFs) | same project | `apps-script/VM_Move_Queue.gs` |
| Every 30 min | Colour VM QBO Bill Entries month tabs (yellow/green) | same project | `apps-script/VM_Move_Queue.gs` |
| Daily 6:13 pm | **VM AP Invoice Processing** | Claude scheduled task trig_01BiVCRbg5R9VmaC7qrFD1Yd | `scheduled-tasks/VM AP Invoice Processing.md` |
| Daily 7:16 pm | **VM Price & Margin Alerts** | Claude scheduled task trig_014fvHQa6CU6pbf721tiNuKp | `scheduled-tasks/VM Price & Margin Alerts.md` |
| Daily ~8 pm | Email new cost increases to Chrissan | Apps Script | `apps-script/VM_Alerts.gs` |
| Mon ~7 am | Margin Check email to Chrissan | Apps Script | `apps-script/VM_Alerts.gs` |
| Tue 5:47 am | **VM Labour Control** (actuals + 2-week forecast) | Claude scheduled task trig_01BF8EmAd615yeEqremA3QUr | `scheduled-tasks/VM Labour Control.md` |
| Tue ~9 am | Labour recap email to Chrissan | Apps Script | `apps-script/VM_Alerts.gs` |
| Wed ~9 am | Next week's hours budget email to Chrissan | Apps Script | `apps-script/VM_Alerts.gs` |
| Fri ~2 pm | Schedule check (over budget / missing hours) to Chrissan | Apps Script | `apps-script/VM_Alerts.gs` |
| Daily 9:47 pm | **VM Tobacco Count Review** (only works when new count sheets are filed) | Claude scheduled task trig_01XpAq5oADN14iwiqpLXfZTa | `scheduled-tasks/VM Tobacco Count Review.md` |
| Daily ~7 am | Tobacco count review email to Chrissan (only when New rows) | Apps Script | `apps-script/VM_Alerts.gs` |

Jeff is copied on every Chrissan email (VA_CC_JEFF in VM_Alerts.gs).

## 2. Google Drive (all under 105 Village Market, owner jeff@gordonsmarket.ca)

| Item | ID |
|---|---|
| 105 Village Market | 1nnPj96-ely8YOIoRDdBNzoc-JJkTeloT |
| Operations | 112zuOaweRp10K-ltDeq-NLvqtj5wLLGv |
| Operations > 00 Claude | 16LT_fUbVvqbo92N3h6y68q4qjtQIuKFh |
| 00 Claude > Claude Rules | 1czKfIOGA6efcs0Bagu4D3xUbcW7WzRWD |
| 00 Claude > Pricing & Margin | 1tGzv-5XsI7X6Jzm4yVKl4zAh4rZO1sRq |
| 00 Claude > Labour | 1MHe_js_wazk4XH_pmQdRgW3kn8WkFOPF |
| 00 OWNER ONLY - Jeff (inherited sharing OFF: jeff@gordonsmarket.ca + jeff@villagemarketatblue.com) | 17-np0sRUzD-lu0FwFWKjxZvWy5HuoytS |
| OWNER ONLY > Email Inbox | 1ndnJNlTW3HeZ3DgQ0jKKOKar7BvGTX5T |
| OWNER ONLY > QBO Bill Entries | 1Oiyg6ooBcP4qN2PlpZsZPM4Gm5FKzfBR |
| OWNER ONLY > Breakeven & Margin Model (P&L CSVs in P&L's; model sheet 1Fpp3BKVkD7LZXo47IKZMIBgNcawMNce3Sqylm2IVyRo) | 1OHQbgDq_Odtlimj2bq60YaDrgHYkLINO |
| Operations > 01 Daily Counts & Logs | 16CBaRRZxsVdAegSNDJmkvLsdGb8z9pwh |
| Operations > 03 Policies & Training | 1GUlYU-D8Y4KKBmF9wYmDK7NMe4krx-8H |
| Operations > 04 Health, Safety & Licences | 1Fe1Ktjrcso01kOEBTor6oxQHgPDndUmw |
| Operations > 05 Forms & Templates (was Templates) | 15R-ujTn3BHzU37yUWN51MfzB71K0x6vH |
| Operations > 06 Inventory, Suppliers & POS | 1APvuJlxq-6fqY0Dxbl-VdvsCH2ZhGV6E |
| Operations > 07 Brand & Logos (was Logos) | 10NrOmsCqrTIJ2tYzBss8ey0ty6uDX9yy |
| Operations > 99 Archive (nothing is ever deleted) | 14q8zC70zt3NFBQ3wcp7Z0XRsSb4e-3oo |
| Operations > 00 READ ME - Operations Folder Guide (Doc) | 1p1khs08yALzBdwpCciPhJM82NIItJ22lwcxCxHSxkMg |
| OWNER ONLY > Company & Banking Records | 1kP_tFeYYHRWH9ibJmBc_SzL81k9Ots1A |
| OWNER ONLY > VM Operations Reorg Plan (sheet, run by VM_Ops_Reorg.gs) | 1faiunA3zCFb_HUcKYgHOJM0VU2uF12v28tk_JWj6pT4 |
| 1Purchase Invoices VM | 1ddsXenQZvG2H7vPLoxSE7XnwCzs5nqV_ |
| 11 VM SCANNED (paper scans inbox) | 1wuAOEPQcQ2fYCsiOpISRnJLIYefzEjQ8 |
| 12 VM NEEDS REVIEW | 10Mf5s3dALwd7aB8IkokrA-ODnyQDTGM_ |
| 13 VM DUPLICATES - REVIEW | 1eQ2ENowb_KnS_ggTPGkN06_4nJ7cRIP- |
| Loblaws vendor / Loblaws > Statements | 1Cp_VC81qtwRAFg6nhmmLW8Fd-kx7YcUM / 17QRqmCB9YeGhcEEv0UIwvB6qPe71lZEs |
| VM Sales Invoices (daily GL Financial PDFs by year) | 1b9AQ2CVszdUXEmOmDO2BcK6bpkdVoFej |
| VM Employees > Payroll > 2026 > 7Shifts | 1waZC0dx69Y8zsXyQBAUjgxlrznzqEtFN |
| Operations > 01 Daily Counts & Logs > Tobacco Counts (print PDF 1aNHjnSggOuX48WwLrEn32hV4-NhoRwAy) | 1AGfIbrTz7Tqg8t_F0ODc_2WwtR50JYX4 |
| Tobacco Counts > 2026 / 2027 (filed count sheets) | 15sO4o5viC6k65V_2HFJv-kutwljJR1eZ / 1v7X0FSpnZYPiq1_0w7cjo-VaeEZ3Yl9O |
| Tobacco Counts > L-BOSS Tobacco Sales (Chrissan's weekly sub-dept 15 export) | 16Ar1slPCH1jhJkmWumnj3WLqNLQ2WuXM |

## 3. Sheets and docs

| File | ID | Who sees it |
|---|---|---|
| VM 2026 QBO Bill Entries | 1X976HJqrvGzCM4P0kqg9A6OKFMEr1jBZehveBigT6WA | Jeff only |
| VM 2027 QBO Bill Entries | 1byckuBPYhDHhnKnthJeIscrWlOk_CKIxtF6zWZ7M7Ss | Jeff only |
| VM AP Move Queue | 1uhBbGCocSJBFNFdJLVuDeWb-XwJVwMPVZAKbZNrDtfU | Jeff only |
| VM Labour Rate (OWNER ONLY) | 1vIhbk_ecPNYQMWp2aLTdL4OW8H1kN9OoyDJcc3pD8pw | Jeff only |
| VM Price & Margin Log (Alerts, Ledger, PLU, Targets, Margin Check) | 1i10aLUd2dx0Me5aWImdDcB6nzc_8d2O56Rl3sJBhu6A | Operations (Chrissan) |
| VM Labour Control (Days, Weeks, Settings) | 1kdP-EtyQPTVL8sSA6hiH9UZGyXQl37T-Twq__zQUcyI | Operations (Chrissan edits "Scheduled hours") |
| Rules: VM AP Invoice Processing | 1Qct2mI3Rae9ThsKeu9Shjsdh18G9ijJq4_LqDMn3K6A | |
| Rules: VM Price & Margin Alerts | 1e1lS5d5PhDKNxK0bbYd7PJPgsVvPJ1fMFl-edqdEB8g | |
| Rules: VM Labour Control | 12qGQBxO8zAxbQd8k69l6gYyWDJGbo_PMmNWLixC_XBM | |
| Rules: VM Tobacco Count Review | 1_KQ3SWcHp75ZpTgf0ktyqxnGISA-lmX6WFX3iv9tMy4 | |
| VM Tobacco Count Log (Items / Weekly Review / Counts) | 1o2Qv8yl7dHdN2NNJlQjGwEJlqlFADKQs1u8BJViyGcU | Chrissan |
| SOP - Tobacco Counts - Operations > 02 Instructions & Job Aids (print for staff) | 19gJeQxDdh54WalgbGpGzajrKQTdehZR9awi3B2z_ts8 | All staff (printed), Chrissan |
| SOP - Pricing & Margin (Chrissan) - Operations > 02 Instructions & Job Aids | 1wh9mb4ooeMwWvlwLj54jMacQ3RVtCKBgHdLVITwsfDc | Chrissan |
| SOP - Scanning Invoices - Operations > 02 Instructions & Job Aids (print for staff) | 15S9MqRNuW8HfZw1ZQcJyhJPaOZAPxjIBy2DWtDq9J0A | All staff (printed), Chrissan |
| SOP - Daily Floor Checks (02) | 1Kd_-3ZrHPTIbd5DaOsqpmLhmeGFuifE3zufTpkhZP-I | All staff (printed) |
| SOP - OLG Scratch Ticket Weekly Reconciliation (02) | 1WeDMfkfJFOlW1iFppKokUNu0zVodx0VLeCQZKZ6uXvc | Chrissan |
| SOP - Daily Store Tasks (02) | 1oI7hH7jLP23SdRUzxDw8SgiYNhefv2jVKS3HwLqZ6vY | All staff (printed) |
| Forms (05): VM Daily Floor Check Log / VM Daily Task Sheet (weekly) / VM OLG Scratch Weekly Reconciliation / VM Sweep Log / VM Washroom Check Log (xlsx) | 1yN556t70gDniio15pZVyTCfGxuhKdsyr / 1lyC595MH7BZqxUcF1Xrq3hf8Sa-W0yS7 / 1sync_sARsCZOGxNWzMDtb0VXyKejzuEm / 1stVBspChp62GQNw_DPwaFKcSCxmS1Qff / 1A1e9yX18jZ_X2GV4tzu2Ri2MVPx-6hVQ | old task sheet archived |
| 09 Equipment: VM Equipment Inventory / VM Equipment Repair Log (Sheets) | 19btcGlfX7TB8OAk89f93TBzH3EkCaIOJT0usS-XCiqg / 1a01gDrU6UWUoD_APCGKYdAQcm4OFPRMfwHbtSF2-s4Q | folder 1D-WO_qSYiyePqILbc7AkjE1SgPXTjAIx |
| VM Winter Best Sellers (NEVER OUT list) | 1UgUYumdm0URGqIdgFKHo_KdOY39FBqZTb0GZVakRXvE | Chrissan |

## 4. Accounts

- **jeff@villagemarketatblue.com** - receives emailed invoices; owns the Apps Script project (email saver, move queue, tab colours, Chrissan emails). Has writer access to 105 Village Market and the VM owner-only folder.
- **jeff@gordonsmarket.ca** - owns every Drive file and folder; Claude's Drive connector.
- **chrissan@villagemarketatblue.com** - the only staff recipient (fixed in code).

## 5. Rebuild

1. script.google.com signed in as jeff@villagemarketatblue.com -> New project "Village Market Automations" -> paste the 3 files from `apps-script/` -> Project Settings: time zone America/Toronto.
2. Run once each (approve permissions): `previewInvoiceEmails` (check the log), `installEmailSaverTrigger`, `installMoveQueueTriggers`, `previewCostAlertsToJeff`, `installAlertTriggers`.
3. Create the 3 Claude scheduled tasks from `scheduled-tasks/*.md` (name, schedule, exact prompt).
4. Lost a rules doc? Recreate it in Claude Rules from `rules/*.md` and update the doc ID in the task prompt.

## 6. Fail-safes (summary)

- No AI pays, emails vendors, changes POS prices, or deletes files. Unclear -> 12 VM NEEDS REVIEW.
- Claude only adds rows; never edits ticked rows, checkboxes or formula columns.
- File moves only through the move queue script, which checks source + destination and blocks 00 ARCHIVED / 0 Accounts payable.
- Email recipients are fixed in code (Chrissan, Jeff). No wages, rates, labour $ or P&L ever go to staff.
- Financials (bill sheets, move queue, labour rate) live only in 00 OWNER ONLY - Jeff.
- Email saver only touches emails that look like bills; banking-change emails stay in the Inbox, starred.

| Forms (05): VM Temperature Log / VM Cash Count Slip (xlsx) | 1j-YwiijhXxhmQaTXMourmFB1Z78UlAmg / 1_KamNi5XYxqZKw1KFMdMH1Gs95VDFDYD | |
| SOPs (02): 2611 27 SOP - Daily Close-Out & Cash Drop / Temperature Log / Daily Store Tasks (v2) | 1nJ4DzST3Mo7TYutOseWKwpHdCm7Ahqc-FHmmzDvnQ9M / 1_W9oSkiUK_z5R1iofqMgv1zBZ34MFZsvMGeJt4M1bgQ / 1DSg5n_Rcy6VgR42n0JhhiV0xQuYNWIVFozjNpLiwt-8 | old Daily Store Tasks in 99 Archive |
| Scheduled task: VM Waste Journal Entry (days 2-10, 7:23 am) | trig_01NyUh1maJsLZaKfDpTLqoWS | rules doc 1bIiEqBznB693yL0bC-8WLfSmdN8lhXxQ7pW1y5Xqwx8 |
| VM Waste JE Log (OWNER ONLY) | 1ze4KhcUDYYZhn1ZVff-bTkls4dh2fNZlGB7pRjfQqdA | 105 VM > 00 OWNER ONLY - Jeff; emails by vmSendWasteJE 8 am |
| Monthly Waste Report 2026 / 2025 (Chrissan, read only) | 1eycerCiHTcjb0HUlLyRIW4rBNAWeoyv6-8_5YxVuaR8 / 14z7XWnK9speZrPgZ2hfQlwDp2DBjbt-5trIw7HOw7oE | |
| (Not used) VM Statement Reconciliation - task DISABLED | trig_01Lfpb8vYzRHAfPm1cw4qCXH | rules doc moved to 99 Archive |
| (Not used) VM Statement Reconciliation (OWNER ONLY), empty | 1H1qaCUFxtetxwcAqSc2kcdp4O1NTXXFuv_8OAvhBIwc | |
| OWNER ONLY > Reports / QBO AP Aging folders | 1xlAaa5S67wVvN_Zfmvi2sRS5iU9FCEnx / 1Kng5Kr9YmnuptEPdo2TrxydSAOJ_Lvx9 | empty, not used |
| VM Never Out & Best Sellers (was VM Winter Best Sellers) | 1UgUYumdm0URGqIdgFKHo_KdOY39FBqZTb0GZVakRXvE | tab 'NEVER OUT - All year' (208 items, no Red Bull) |
| 2611 27 VM PLU Clean-up & Best Sellers.xlsx | 14oOFfek0yQgjirYQVmpE0Xp7bqq4Q_Xt | 00 Claude > Pricing & Margin |
| Scheduled task: VM Weekly Checks (Mon 5:41 am) | trig_01LJg6cTniHPcFtEqDwFzs1b | rules doc 135dL3Y-K94BsoE49s8iG5BpBFwGxVaqEDMkaPrOBBTM |
| VM Weekly Checks sheet | 1da0hI395uHx1ADlg2JxWEiTXlZ6E7vwFcjvw4Q_PYhM | Operations > 00 Claude; email vmSendWeeklyChecks Mon 8 am |
| 00 Manager Task Manager - Chrissan (Google Sheet) | 1JrewoP2dVrbCATSpKOjkfGoInLNLDZ1o4je92sok1Sc | Operations top level; tabs Tasks (17 seeded) + Recurring (17 routines) |
| VM Debt & Free Cash Flow (OWNER ONLY) | 1gat57yK1fX10ZsHGgdHgHf-Y1KJIuV5er7q6qevfYd8 | 105 VM > 00 OWNER ONLY - Jeff; Payoff Plan / Debt Register / FCF Weekly; no automation (Jeff fills) |
