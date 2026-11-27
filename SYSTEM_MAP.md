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
| 1Purchase Invoices VM | 1ddsXenQZvG2H7vPLoxSE7XnwCzs5nqV_ |
| 11 VM SCANNED (paper scans inbox) | 1wuAOEPQcQ2fYCsiOpISRnJLIYefzEjQ8 |
| 12 VM NEEDS REVIEW | 10Mf5s3dALwd7aB8IkokrA-ODnyQDTGM_ |
| 13 VM DUPLICATES - REVIEW | 1eQ2ENowb_KnS_ggTPGkN06_4nJ7cRIP- |
| Loblaws vendor / Loblaws > Statements | 1Cp_VC81qtwRAFg6nhmmLW8Fd-kx7YcUM / 17QRqmCB9YeGhcEEv0UIwvB6qPe71lZEs |
| VM Sales Invoices (daily GL Financial PDFs by year) | 1b9AQ2CVszdUXEmOmDO2BcK6bpkdVoFej |
| VM Employees > Payroll > 2026 > 7Shifts | 1waZC0dx69Y8zsXyQBAUjgxlrznzqEtFN |

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
| SOP - Pricing & Margin (Chrissan) - Operations > 02 Instructions & Job Aids | 1wh9mb4ooeMwWvlwLj54jMacQ3RVtCKBgHdLVITwsfDc | Chrissan |
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
