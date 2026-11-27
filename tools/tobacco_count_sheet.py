"""Build the VM tobacco item list (Min/Par from last winter's sales) and the printable weekly count sheet PDF.
Usage: python3 -I tobacco_count_sheet.py <plu.csv> <sales_long.csv> <out_dir>
Min = staff 'running low' flag (~3 days of peak winter sales, at least 2).
Par = order-up-to level for a weekly order (~1.5 weeks of peak winter sales, at least 4)."""
import csv, collections, math, json, sys, re
from reportlab.lib.pagesizes import letter, landscape
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import os
# Brand: Futura Bold headings / Futura PT Book body. Futura isn't licensed here, so Poppins (closest geometric sans) is used.
GF = '/usr/share/fonts/truetype/google-fonts/'
pdfmetrics.registerFont(TTFont('VM-Bold', GF + 'Poppins-Bold.ttf'))
pdfmetrics.registerFont(TTFont('VM-Book', GF + 'Poppins-Regular.ttf'))
pdfmetrics.registerFont(TTFont('VM-Med', GF + 'Poppins-Medium.ttf'))
LOGO = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'brand', 'VM_horizontal-lockup-black-crop.png')

plu_csv, sales_csv, out = sys.argv[1:4]
MAKERS = [('RBH', '0000619'), ('IMPERIAL', '0000593'), ('JTI', '0000601')]
SAIL = '000619000740'   # Sail singles (RBH)
FIX = {  # tidy truncated L-BOSS names
 '00005930000027':'DU MAURIER SMOOTH RG 20','00005930000029':'DU MAURIER MELLOW RG 20','00005930000030':'DU MAURIER DISTINCT RG 20',
 '00005930000031':'DU MAURIER SIGNATURE RG 20','00005930000070':'DU MAURIER DISTINCT RG 25','00005930000281':'DU MAURIER SIGNATURE KS 20',
 '00005930000287':'DU MAURIER SIGNATURE KS 25','00005930000081':'JOHN PLAYER SMOOTH RS 20','00005930000084':'JOHN PLAYER SMOOTH KS 20',
 '00005930006429':'JOHN PLAYER MELLOW KS 20','00005930006432':'JOHN PLAYER MELLOW RS 20','00005930005334':'PALL MALL SMOOTH EXTRA KS 20',
 '00006190010722':'NEXT PM SPECIAL KS 25','00006190010741':'PARLIAMENT BY BELMONT KS','00006190010743':'PARLIAMENT BY BELMONT',
 '00006190010744':'CANADIAN CLASSICS BY NEXT','00006190010747':'CANADIAN CLASSICS BY NEXT','00006190012630':'CANADIAN CLASSICS ORIGINAL',
 '00006190012635':'CANADIAN CLASSICS ORIGINAL','00006190012640':'CANADIAN CLASSICS ORIGINAL','00006190012830':'CANADIAN CLASSICS SELECT',
 '00006190049927':'VEEV NOW CLASSIC MINT 2ML','00006190049664':'VEEV NOW ICE MINT 18ML','00006190049919':'VEEV NOW SPEARMINT 18ML',
 '00006190049918':'VEEV NOW BLUE MINT 18ML',
}
sales = collections.defaultdict(lambda: collections.Counter())
for r in csv.DictReader(open(sales_csv)):
    sales[r['plu']][r['mon']] += float(r['qty'])
days = {'2512': 31, '2601': 31, '2602': 28, '2603': 31}
items = []
for x in csv.reader(open(plu_csv, encoding='utf-8-sig')):
    if len(x) < 4 or x[3] != '15': continue
    p = x[0]; maker = None
    for m, pre in MAKERS:
        if p.startswith(pre) or (m == 'RBH' and p.startswith(SAIL)): maker = m
    if not maker: continue
    name = FIX.get(p, re.sub(r'\s+', ' ', x[2]).strip())
    s = sales.get(p)
    if s:
        peak = max(q / days[m] * 7 for m, q in s.items()); avg = sum(s.values()) / 121 * 7
        mn = max(2, math.ceil(peak * 0.45)); par = max(4, math.ceil(peak * 1.5)); hist = 'winter 25/26'
    else:
        peak = avg = 0; mn, par, hist = 2, 4, 'no history - default'
    items.append(dict(maker=maker, plu=p, upc4=p[-4:], item=name, min=mn, par=par, avg_wk=round(avg, 1), peak_wk=round(peak, 1), basis=hist))
order = {'RBH': 0, 'IMPERIAL': 1, 'JTI': 2}
items.sort(key=lambda d: (order[d['maker']], d['item'], d['plu']))
json.dump(items, open(out + '/tobacco_items.json', 'w'), indent=1)

# ---------- PDF ----------
W, H = landscape(letter); M = 0.3 * inch
c = canvas.Canvas(out + '/VM Tobacco Count Sheet - PRINT.pdf', pagesize=(W, H))
c.setTitle('Village Market - Weekly Tobacco Count Sheet')
cols = [('ITEM', 2.75), ('UPC', 0.45), ('MIN', 0.38), ('PAR', 0.38)]
dayw = 0.43
DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
RH = 0.2 * inch; top_hdr = 1.3 * inch; foot = 0.95 * inch
rows = []
last = None
for it in items:
    if it['maker'] != last:
        rows.append(('H', {'RBH': 'RBH  (Rothmans, Benson & Hedges)', 'IMPERIAL': 'IMPERIAL TOBACCO', 'JTI': 'JTI-MACDONALD'}[it['maker']])); last = it['maker']
    rows.append(('I', it))
per = int((H - 2 * M - top_hdr - foot) // RH)
pages = []; cur = []; sec = None
for r in rows:
    if r[0] == 'H': sec = r[1]
    if len(cur) == per or (r[0] == 'H' and len(cur) >= per - 1):
        pages.append(cur); cur = []
        if r[0] == 'I': cur.append(('H', sec + '  (continued)'))
    cur.append(r)
pages.append(cur)
x0 = M
def grid_x():
    xs = [x0]
    for _, w in cols: xs.append(xs[-1] + w * inch)
    for _ in range(14): xs.append(xs[-1] + dayw * inch)
    return xs
xs = grid_x()
for pn, pg in enumerate(pages, 1):
    y = H - M
    lw = 1.25 * inch; lh = lw * 197 / 685
    c.drawImage(LOGO, x0, y - lh - 2, width=lw, height=lh, mask='auto')
    c.setFont('VM-Bold', 14); c.drawString(x0 + lw + 0.35 * inch, y - 18, 'TOBACCO COUNT')
    c.setFont('VM-Book', 10)
    c.drawString(x0 + 3.9 * inch, y - 18, 'Week starting MONDAY:  ______ / ______ / 20____   (month / day)')
    c.drawRightString(W - M, y - 18, f'Page {pn} of {len(pages)}')
    c.setFont('VM-Book', 6.8)
    c.drawString(x0, y - 46, 'Count EVERY pack on the wall AND in back stock.  Write the number of PACKS (20s and 25s are separate lines).  Full sealed carton: 20s = 10 packs, 25s = 8 packs.  Write 0 if none - never leave blank.')
    c.drawString(x0, y - 56, 'OPEN = before the first sale and before putting away any delivery.   CLOSE = after the last sale.   Count at or below MIN?  Circle it.   CLOSE does not match next OPEN?  Circle both and tell Chrissan.')
    # header rows
    hy = y - top_hdr + 2 * RH + 0.05 * inch
    c.setFont('VM-Bold', 8)
    for i, (n, w) in enumerate(cols):
        c.drawCentredString((xs[i] + xs[i + 1]) / 2, hy - RH + 4, n)
    for d in range(7):
        a = xs[4 + d * 2]; b = xs[6 + d * 2]
        c.setFillGray(0.85 if d % 2 == 0 else 0.93); c.rect(a, hy - 2 * RH, b - a, 2 * RH, fill=1, stroke=0); c.setFillGray(0)
        c.drawCentredString((a + b) / 2, hy - RH + 4, DAYS[d])
        c.setFont('VM-Book', 7)
        c.drawCentredString((xs[4 + d * 2] + xs[5 + d * 2]) / 2, hy - 2 * RH + 4, 'OPEN')
        c.drawCentredString((xs[5 + d * 2] + xs[6 + d * 2]) / 2, hy - 2 * RH + 4, 'CLOSE')
        c.setFont('VM-Bold', 8)
    yy = hy - 2 * RH
    c.setLineWidth(0.6); c.line(xs[0], hy, xs[-1], hy)
    for kind, v in pg:
        if kind == 'H':
            c.setFillGray(0.2); c.rect(xs[0], yy - RH, xs[-1] - xs[0], RH, fill=1, stroke=0); c.setFillGray(1)
            c.setFont('VM-Bold', 8.5); c.drawString(xs[0] + 3, yy - RH + 4.5, v); c.setFillGray(0)
        else:
            c.setFont('VM-Book', 8); c.drawString(xs[0] + 3, yy - RH + 4.5, v['item'][:34])
            c.setFont('VM-Book', 7); c.drawCentredString((xs[1] + xs[2]) / 2, yy - RH + 4.5, v['upc4'])
            c.setFont('VM-Bold', 8); c.drawCentredString((xs[2] + xs[3]) / 2, yy - RH + 4.5, str(v['min']))
            c.drawCentredString((xs[3] + xs[4]) / 2, yy - RH + 4.5, str(v['par']))
            for d in range(7):
                if d % 2 == 0:
                    c.setFillGray(0.95); c.rect(xs[4 + d * 2], yy - RH, xs[6 + d * 2] - xs[4 + d * 2], RH, fill=1, stroke=0); c.setFillGray(0)
        c.setLineWidth(0.4); c.line(xs[0], yy - RH, xs[-1], yy - RH)
        yy -= RH
    # footer rows: initials + delivery
    for label in ['Counted by (initials)', 'Delivery put away (initials)']:
        c.setFont('VM-Bold', 8); c.drawString(xs[0] + 3, yy - RH + 4.5, label)
        c.setLineWidth(0.4); c.line(xs[0], yy - RH, xs[-1], yy - RH); yy -= RH
    # vertical lines
    for i, xv in enumerate(xs):
        lw = 1.2 if i >= 4 and (i - 4) % 2 == 0 else 0.4
        c.setLineWidth(lw); c.line(xv, hy - (RH if i >= 5 and (i - 4) % 2 == 1 else 0) , xv, yy)
    c.setLineWidth(1); c.rect(xs[0], yy, xs[-1] - xs[0], hy - yy, fill=0)
    c.setFont('VM-Book', 7.5)
    c.drawString(x0, yy - 12, 'Notes (damaged, missing, returns):  ' + '_' * 92)
    c.drawString(x0, yy - 24, 'Sheets stay in the binder in the drawer under the OLG terminal.  Every MONDAY: scan last week\'s sheets (all pages) on the "Invoice" preset, then start a new sheet.')
    c.showPage()
c.save()
print(len(items), 'items', len(pages), 'pages', per, 'rows/page')
for m in order: print(m, sum(1 for i in items if i['maker'] == m))
