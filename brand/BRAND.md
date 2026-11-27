# Village Market brand rules (use on every document Claude creates for VM)

Source: VM-brand_guidelines.pdf (Boycott Inc., 2021) in Operations > 07 Brand & Logos > Village Market.

- **Colours:** black and white only. Never recolour the logo.
- **Headings:** Futura Bold. **Body:** Futura PT Book.
  - Google Docs/Sheets: use **Jost** (free Futura look-alike built into Google). Headings Jost 700, body Jost 400, black text.
  - PDFs Claude generates: Poppins (closest available here) until Futura/Jost font files are added to `brand/`.
- **Logo:** use the supplied files only (`VM_horizontal-lockup.svg`, `VM_horizontal-lockup-black-crop.png`; full set in Drive > 07 Brand & Logos > Village Market > Logos).
  - Horizontal lockup for page headers; vertical lockup for tight wide spaces; logomark alone only where the name already appears.
  - Keep clear space around it (at least the height of the circle). No stretching, outlines, effects, flipping, overlapping, or using pieces on their own.
- File types: PNG/JPG for screen, PDF/SVG/EPS for print.
- How Claude makes branded Google Docs: build a .docx with font "Jost" and the logo image (tools/build_sops_201127.js), then upload with conversion. Google keeps Jost, bold and the logo. (Restyling an existing Doc through the API resets bold - avoid.)
- Excel forms: font "Century Gothic" (Futura-style, installed with Office) + logo (tools/build_forms.py).
