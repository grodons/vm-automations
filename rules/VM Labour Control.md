# VM Labour Control

**Scheduled task name:** VM Labour Control
**Runs:** Every Tuesday at 5:47 am (America/Toronto). Emails to Chrissan are sent by the VM Alerts script (Tue recap 9 am, Wed hours budget 9 am, Fri schedule check 2 pm).
**Business:** Village Market only.
**Owner:** Jeff Meakings. All rule changes are made in this document.

## 1. Purpose

Chrissan builds the 7shifts schedule. She gets an hours budget for every day of the coming week, set by forecast sales, so labour stays in line with sales through the holidays and ski season. Everything she sees is in HOURS and SALES. Wage rates and labour dollars stay owner-only.

## 2. Locations

- "VM Labour Control" (ID 1kdP-EtyQPTVL8sSA6hiH9UZGyXQl37T-Twq__zQUcyI), Operations > 00 Claude > Labour. Tabs: How it works, Weeks, Days, Settings.
  - Days columns: A Date | B Day | C Week of | D Forecast sales ex-lottery (Claude) | E Forecast basis (Claude) | F Hours budget (formula) | G Scheduled hours (CHRISSAN) | H Over/under (formula) | I Actual sales ex-lottery (Claude) | J Actual hours (Claude) | K Earned hours (formula) | L Actual over/under (formula) | M Sales per labour hour (formula).
  - Settings: B2 target sales per labour hour (SPLH), B3 minimum hours per day, B4 day tolerance (hours), B5 week tolerance (%).
- Owner-only: "VM Labour Rate (OWNER ONLY)" (ID 1vIhbk_ecPNYQMWp2aLTdL4OW8H1kN9OoyDJcc3pD8pw) in 105 VM > 00 OWNER ONLY - Jeff.
- Daily sales: L-BOSS "GL Financial Village Market" daily PDFs:
  - 105 VM > Sales Invoices > year folder, named "YYMM DD GL Financial.pdf" (2026 folder ID 1RUGZYuMug9da2aHGM7jE7F9WsCGi3cKq; parent Sales Invoices 1b9AQ2CVszdUXEmOmDO2BcK6bpkdVoFej - check 2025 and 2027 folders too)
  - MyStore email copies: "EMAIL_YYYY-MM-DD_MyStore_*.pdf" in Gordon's 12 NEEDS REVIEW > MyStore POS reports (Village Market) (1CZcXZypTqjesqpj_hnERZdzVtJ3akVfU) and Gordon's 11 SCANNED. The email dated D reports sales for D-1 (read the "From:" date on the report). Read only; never move them.
- Actual hours: 7shifts "Hours & Wages Summary" exports, all stored in 105 Village Market > Employees > Payroll > YYYY > 7Shifts (2026 folder 1waZC0dx69Y8zsXyQBAUjgxlrznzqEtFN; Payroll folder 1GeL7mLSqZk786BJABc6axWNuoEPkOlXo). Named "YYMM DD Payroll Report" (older ones "YYMM DD 7Shifts Summary"). From January use the 2027 > 7Shifts folder. Read hours only.

## 3. Definitions

- Sales ex-lottery = "Net Sales" minus the LOTTERY department line on the GL Financial report. Lottery is a pass-through and does not pay for labour.
- Hours budget = MAX(minimum hours, forecast sales ex-lottery / target SPLH). Earned hours = same with actual sales.
- Target SPLH = blended hourly rate / target labour %. The rate and the % live only in the owner-only sheet; Claude writes only the resulting SPLH to Settings!B2 and only when Jeff changes the target.
- How the target is set (profit first, then checked against industry): target labour % = actual gross margin % (VM P&L) - occupancy % - other operating costs % - debt service % - target profit %. Sanity check against the NACS State of the Industry benchmark (2023 average inside sales per labour hour about US$147). Use whichever is leaner unless it drops below one-person coverage.
- Minimum hours per day = one person open to close (the store cannot run with less). In shoulder season this floor, not the sales budget, drives labour; the lever there is opening hours, which is Jeff's call - report it, never change it.

## 4. Each Tuesday run

1. Actual sales: for each day of last week (Mon-Sun) and any earlier blank days back to 2026-11-30, read the GL Financial report and write Sales ex-lottery to column I (number, 2 decimals). Missing report: leave blank and list the date.
2. Actual hours: if a 7shifts summary covering those days exists, total the hours per date (all staff, incl. manager) and write to column J. Never write names, wages or pay anywhere in this sheet. Missing: leave blank and say so (the recap email is then held and Jeff is told).
3. Owner-only rate: when a new 7shifts summary is found, add one row to "VM Labour Rate (OWNER ONLY)" (pay period, file, total hours, total pay, pay/hours). Report the rolling average of the last 4 rows to Jeff; do NOT change Settings!B2 unless Jeff has asked for it in the rules change log.
4. Forecast: for the next 14 days (rows for next week and the week after), write column D and a short basis in E.
   - Base = sales ex-lottery for the same weekday of the same ISO week last year (from last year's GL Financial reports).
   - Holidays use last year's matching DATE instead: Dec 20 - Jan 3, Family Day weekend, March Break weeks.
   - Trend factor = (last 4 weeks this year) / (same 4 weeks last year), capped between 0.75 and 1.25. Forecast = base x trend.
   - No last-year report for a day: use the average of the same weekday over the last 4 weeks, basis "4-week avg".
   - Never overwrite a forecast for a day that has already happened.
5. Never write columns F, H, K, L, M (formulas) or G (Chrissan's).

## 5. FAIL-SAFES

1. No wages, pay rates, labour $ or individual names in VM Labour Control (Chrissan can see it).
2. Claude never emails anyone. The VM Alerts script sends fixed emails to Chrissan (Jeff copied).
3. Only write columns D, E, I, J of Days (and B2 of Settings only on Jeff's instruction). Never delete rows.
4. If the Days tab header does not match section 2, or a forecast would be more than 2x or less than 0.5x last year's same day without a holiday reason, write nothing for that day and flag it.
5. Never move, rename or edit the GL Financial PDFs or 7shifts files.

## 6. Run summary

Bullets for Jeff: last week sales ex-lottery, actual hours, earned hours, over/under, SPLH; next week's forecast and hours budget total; missing reports; rolling hourly rate (owner-only line).

## 7. Change log

- 2026-11-27: Created. Draft settings: SPLH $120, minimum 16 hours/day.
- 2026-11-27 (2): Interim SPLH $150 (about 12.5% labour at the Nov 2026 blended rate) and minimum 13 hours/day (current one-person coverage). Final SPLH to be set from the VM P&L per section 3.
- 2026-11-27 (3, Jeff approved the plan): SPLH set to $200. The FY2027 profit plan keeps staff payroll at 9.57% of net sales (FY2026 actual, Jeff's own pay excluded); at the Nov 2026 blended rate plus payroll taxes that equals $200 of sales ex-lottery per staff hour. Jeff's hours are not part of this budget. 7shifts files live in Employees > Payroll > YYYY > 7Shifts.
