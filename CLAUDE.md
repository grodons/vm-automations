# Instructions for Claude working in this repo

- This repo is the master copy of the Village Market automations. After ANY change to a script, scheduled-task prompt or rules doc, update the matching file here, add a dated line to `CHANGELOG.md`, update `SYSTEM_MAP.md` if IDs/schedules changed, and commit + push to `main` with a short plain-English message.
- The Google Docs in 105 Village Market > Operations > 00 Claude > Claude Rules are the live authority; `rules/` holds copies. Each rules doc is titled exactly like its scheduled task.
- Keep VM separate from Gordon's: never point a VM automation at Gordon's folders/sheets (reading the VM MyStore POS copies in Gordon's 12 NEEDS REVIEW is the only exception).
- Never commit passwords, API keys, staff personal info (SIN, banking, addresses, DOB, pay), customer data or invoice PDFs.
- PRIVACY: financial information (bill totals, statements, aging, pay, wage rates, P&L, debt) is for Jeff only and lives in 105 VM > 00 OWNER ONLY - Jeff. Chrissan may see item costs/margins, sales and HOURS (never wages or labour $).
- Every automation needs fail-safes so no AI can make a costly mistake. Keep docs plain-language for Jeff (non-technical owner).
- Asset sale planned: nothing here transfers to a buyer.
- BRAND (Jeff, 2026-11-27): every document Claude creates for VM follows `brand/BRAND.md` (black & white, Futura look - Jost in Google Docs, VM logo with clear space).
