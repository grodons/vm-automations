import openpyxl, datetime
from openpyxl.styles import Font, Alignment, Border, Side, PatternFill
from openpyxl.drawing.image import Image
from openpyxl.formatting.rule import FormulaRule
from openpyxl.worksheet.page import PageMargins
F='Century Gothic'   # Futura-style font that ships with Office/Windows (brand: Futura)
thin=Side(style='thin',color='000000'); B=Border(left=thin,right=thin,top=thin,bottom=thin)
GREY=PatternFill('solid',fgColor='E6E6E6'); BLACK=PatternFill('solid',fgColor='000000')
def f(sz=10,b=False,c='000000',i=False): return Font(name=F,size=sz,bold=b,color=c,italic=i)
def logo(ws,anchor='A1',w=150):
    im=Image('logo.png'); im.width=w; im.height=int(w*197/685); ws.add_image(im,anchor)
def setup(ws,land=True):
    ws.page_setup.orientation='landscape' if land else 'portrait'; ws.page_setup.paperSize=ws.PAPERSIZE_LETTER
    ws.page_setup.fitToWidth=1; ws.page_setup.fitToHeight=1; ws.sheet_properties.pageSetUpPr.fitToPage=True
    ws.page_margins=PageMargins(left=0.4,right=0.4,top=0.4,bottom=0.4); ws.sheet_view.showGridLines=False
    ws.print_options.horizontalCentered=True
def box(ws,rng,fill=None,font=None,align=None):
    for row in ws[rng]:
        for c in row:
            c.border=B
            if fill: c.fill=fill
            if font: c.font=font
            if align: c.alignment=align
CEN=Alignment(horizontal='center',vertical='center',wrap_text=True); LEFT=Alignment(horizontal='left',vertical='center',wrap_text=True)

# ---------- 1. Daily Floor Check Log ----------
wb=openpyxl.Workbook(); ws=wb.active; ws.title='Floor Check Log'; setup(ws)
logo(ws); ws.row_dimensions[1].height=26; ws.row_dimensions[2].height=16
ws['D1']='DAILY FLOOR CHECK LOG'; ws['D1'].font=f(16,True)
ws['J1']='MONTH: ______________  YEAR: ________'; ws['J1'].font=f(10)
ws['A3']=('Walk the whole store at OPEN, MIDDAY and CLOSE (and every hour when it is snowing or raining). Check: entrance mats flat and dry, '
          'snow/water at the door, spills, aisles and fire exits clear, boxes and cords off the floor, back room and stairs, washroom.')
ws.merge_cells('A3:N3'); ws['A3'].font=f(8.5); ws['A3'].alignment=LEFT; ws.row_dimensions[3].height=26
ws['A4']=('Found a hazard? Fix it right away (mop, wet-floor sign, move it), write what you did in NOTES. Anyone falls or is hurt: help them, tell the manager, '
          'fill in the Incident / Slip and Fall Report the same day and attach this log.')
ws.merge_cells('A4:N4'); ws['A4'].font=f(8.5,True); ws['A4'].alignment=LEFT; ws.row_dimensions[4].height=26
hdr=['DAY','OPEN','','','MIDDAY','','','CLOSE','','','NOTES - what you found and what you did']
r=6
for i,h in enumerate(['DAY','OPEN','MIDDAY','CLOSE']): pass
ws.merge_cells('B6:D6'); ws.merge_cells('E6:G6'); ws.merge_cells('H6:J6'); ws.merge_cells('K6:N7'); ws.merge_cells('A6:A7')
ws['A6']='DAY'; ws['B6']='OPEN'; ws['E6']='MIDDAY'; ws['H6']='CLOSE'; ws['K6']='NOTES - what you found and what you did'
for col in 'BEH':
    i=openpyxl.utils.column_index_from_string(col)
    for j,t in enumerate(['TIME','INITIALS','ALL CLEAR ✓\nor ISSUE ✗']): ws.cell(7,i+j,t)
box(ws,'A6:N7',fill=BLACK,font=f(8.5,True,'FFFFFF'),align=CEN); ws.row_dimensions[7].height=24
for d in range(1,32):
    rr=7+d; ws.cell(rr,1,d); ws.row_dimensions[rr].height=17
    ws.merge_cells(start_row=rr,start_column=11,end_row=rr,end_column=14)
box(ws,'A8:N38',font=f(9),align=CEN)
for rr in range(8,39):
    if rr%2==0: 
        for cc in range(1,11): ws.cell(rr,cc).fill=GREY
ws['A40']='Manager check (initial when reviewed at month end): ________     Keep each month in the Health & Safety binder (required if there is ever a slip-and-fall claim).'
ws['A40'].font=f(8.5,i=True)
for col,w in zip('ABCDEFGHIJKLMN',[6,7,9,9,7,9,9,7,9,9,14,14,14,14]): ws.column_dimensions[col].width=w
ws.print_area='A1:N40'
wb.save('VM Daily Floor Check Log.xlsx')

# ---------- 2. OLG Weekly Scratch Reconciliation ----------
wb=openpyxl.Workbook(); ws=wb.active; ws.title='Weekly Reconciliation'; setup(ws)
logo(ws); ws.row_dimensions[1].height=26; ws.row_dimensions[2].height=16
ws['D1']='OLG SCRATCH TICKET - WEEKLY RECONCILIATION'; ws['D1'].font=f(15,True)
ws['A3']=('Done every SUNDAY morning for the week Sunday to Saturday. Fill in the white boxes only - the grey boxes calculate. '
          'Should have = Beginning + Activations - POS scratch sales - Returns pulled - Free tickets.  Difference = Actual count - Should have (should be $0.00).')
ws.merge_cells('A3:M3'); ws['A3'].font=f(8.5); ws['A3'].alignment=LEFT; ws.row_dimensions[3].height=28
heads=['COUNT DATE\n(Sunday)','WEEK FROM\n(Sun)','WEEK TO\n(Sat)','BEGINNING\nINVENTORY $\n(last week\'s count)','PLUS\nACTIVATIONS $\n(OLG terminal)','LESS POS\nSCRATCH SALES $\n(L-BOSS Lottery)','LESS RETURNS $\n(pulled, not\npicked up)','LESS FREE\nTICKETS $\n(OLG daily\nreports)','SHOULD\nHAVE $','ACTUAL\nCOUNT $','DIFFERENCE $','COUNTED BY','NOTES']
for i,h in enumerate(heads,1): ws.cell(5,i,h)
box(ws,'A5:M5',fill=BLACK,font=f(8,True,'FFFFFF'),align=CEN); ws.row_dimensions[5].height=56
start=datetime.date(2026,11,29); N=53
for k in range(N):
    r=6+k
    if k==0: ws.cell(r,1,start)
    else: ws.cell(r,1,f'=A{r-1}+7')
    ws.cell(r,2,f'=A{r}-7'); ws.cell(r,3,f'=A{r}-1')
    if k>0: ws.cell(r,4,f'=IF(J{r-1}="","",J{r-1})')
    ws.cell(r,9,f'=IF(OR(D{r}="",J{r}=""),"",D{r}+N(E{r})-N(F{r})-N(G{r})-N(H{r}))')
    ws.cell(r,11,f'=IF(I{r}="","",ROUND(J{r}-I{r},2))')
    ws.row_dimensions[r].height=17
last=5+N
box(ws,f'A6:M{last}',font=f(9),align=CEN)
for r in range(6,last+1):
    for c in (1,2,3): ws.cell(r,c).number_format='mmm d, yyyy'
    for c in range(4,12): ws.cell(r,c).number_format='$#,##0.00;[Red]-$#,##0.00'
    for c in (1,2,3,9,11): ws.cell(r,c).fill=GREY
    if r>6: ws.cell(r,4).fill=GREY
ws.conditional_formatting.add(f'K6:K{last}',FormulaRule(formula=[f'AND(K6<>"",ABS(K6)>=0.01)'],fill=PatternFill('solid',fgColor='FFC7CE'),font=Font(name=F,bold=True,color='9C0006')))
ws['A4']='First row only: type last week\'s actual count in BEGINNING INVENTORY. After that it fills in by itself.'; ws['A4'].font=f(8.5,i=True)
for col,w in zip('ABCDEFGHIJKLM',[12,11,11,14,13,13,12,11,12,12,12,11,24]): ws.column_dimensions[col].width=w
ws.freeze_panes='A6'
ws.page_setup.fitToHeight=0; ws.print_title_rows='5:5'; ws.print_area=f'A1:M{last}'
wb.save('VM OLG Scratch Weekly Reconciliation.xlsx')

# ---------- 3. Daily Task Sheet (one sheet per week) ----------
T=[('OPENING',[
 'Tobacco OPEN count done before the first sale (Tobacco Count binder)',
 'Count float into till ($200)',
 'OLG and EXIT signs out; OLG signs updated',
 'Fridge & freezer temps logged (Temp Log)',
 'Floor check done (Floor Check Log) - entrance mats flat',
 'Washroom checked and clean',
 'Face all products; rotate perishables (first in, first out)',
 'Stock impulse areas (checkout, entrance)',
 'Highlight Tobacco List',
 'Sweep floor and entrance']),
('CASH AREA - during shift',[
 'Fill scratch tickets as needed',
 'Refill bags and receipt rolls',
 'Refill lighters and tobacco wall from back stock',
 'Fill cash area products (sunglasses, candy, etc.)',
 'Fill water cooler at front',
 'Clean, organize and sanitize cash area and lotto kiosk',
 'Empty cash area and lotto kiosk garbage']),
('STORE - during shift',[
 'Scan every delivery invoice the same day ("Invoice" preset)',
 'Check shelf tags - every item priced, tags match',
 'Check best-before dates; pull expired, log on Waste Report',
 'Midday temps logged and midday floor check',
 'Pull pop rack; refill coolers (2L Coke, water)',
 'Refill and face chip aisles and bread rack',
 'Work overstock: backroom, frozen, back cooler',
 'Refill CTG / souvenir and H&B (pharmacy) overstock',
 'Refill Grab n Go',
 'Break down boxes; clean and tidy backroom',
 'Clean microwave; wipe cooler and freezer doors']),
('CLOSING',[
 'Tobacco CLOSE count after last sale; binder back in drawer',
 'Close temps logged and close floor check',
 'Wipe Tobacco List',
 'Face and block shelves and back wall',
 'Report stock-outs, breakage and issues to manager',
 'Scale and equipment off for the night',
 'Creamers away; empty garbages and coffee bin',
 'Garbage taken down to the garbage room',
 'Clean floors; clean and stock staff washroom',
 'Back room fans off',
 'OLG and EXIT signs in; garage door locked',
 'Print OLG terminal daily report and L-BOSS end-of-day report',
 'Count cash; return float(s) to $200',
 'ATM cassette removed and locked in safe',
 'All drawers locked; screens down; lights out',
 'All doors locked'])]
wb=openpyxl.Workbook(); ws=wb.active; ws.title='Daily Tasks'; setup(ws,land=False)
logo(ws,w=130); ws.row_dimensions[1].height=24; ws.row_dimensions[2].height=12
ws['C1']='DAILY TASK SHEET'; ws['C1'].font=f(15,True)
ws['C2']='Week starting MONDAY: ____ / ____ / 20__'; ws['C2'].font=f(9)
ws['A3']='Initial each task when done. Write N/A if it does not apply that day. Leave nothing blank. Manager reviews every Monday.'
ws.merge_cells('A3:I3'); ws['A3'].font=f(8.5,i=True); ws['A3'].alignment=LEFT
days=['MON','TUE','WED','THU','FRI','SAT','SUN']
ws.cell(4,1,'TASK'); ws.merge_cells('A4:B4')
for j,d in enumerate(days): ws.cell(4,3+j,d)
box(ws,'A4:I4',fill=BLACK,font=f(9,True,'FFFFFF'),align=CEN)
r=5
for sec,items in T:
    ws.cell(r,1,sec); ws.merge_cells(start_row=r,start_column=1,end_row=r,end_column=9)
    box(ws,f'A{r}:I{r}',fill=GREY,font=f(8.5,True)); ws.row_dimensions[r].height=14; r+=1
    for it in items:
        ws.cell(r,1,it); ws.merge_cells(start_row=r,start_column=1,end_row=r,end_column=2)
        box(ws,f'A{r}:I{r}',font=f(8)); ws.cell(r,1).alignment=LEFT; ws.row_dimensions[r].height=14.5; r+=1
for lab in ['Opener (initials)','Closer (initials)']:
    ws.cell(r,1,lab); ws.merge_cells(start_row=r,start_column=1,end_row=r,end_column=2); box(ws,f'A{r}:I{r}',font=f(8.5,True)); r+=1
ws.cell(r+1,1,'Manager reviewed: __________  Date: __________').font=f(8.5)
ws.column_dimensions['A'].width=40; ws.column_dimensions['B'].width=17
for c in 'CDEFGHI': ws.column_dimensions[c].width=6.3
ws.print_area=f'A1:I{r+1}'
wb.save('VM Daily Task Sheet (weekly).xlsx')
print('ok')

# ---------- 4. Sweep Log ----------
wb=openpyxl.Workbook(); ws=wb.active; ws.title='Sweep Log'; setup(ws)
logo(ws); ws.row_dimensions[1].height=26; ws.row_dimensions[2].height=16
ws['D1']='SWEEP LOG'; ws['D1'].font=f(16,True)
ws['I1']='MONTH: ______________  YEAR: ________'; ws['I1'].font=f(10)
ws['A3']=('Sweep (and dry-mop if wet) the ENTRANCE, every AISLE, the CASH AREA and the BACK ROOM at OPEN and CLOSE, plus MIDDAY and any time snow, slush or a spill is tracked in. '
          'Write the actual time you finished - never fill in times ahead. This log is our proof of care if someone slips.')
ws.merge_cells('A3:L3'); ws['A3'].font=f(8.5); ws['A3'].alignment=LEFT; ws.row_dimensions[3].height=28
ws.merge_cells('A5:A6'); ws['A5']='DAY'
for col,lab in zip(['B','E','H'],['OPEN','MIDDAY','CLOSE']):
    i=openpyxl.utils.column_index_from_string(col); ws.merge_cells(start_row=5,start_column=i,end_row=5,end_column=i+2); ws.cell(5,i,lab)
    for j,t in enumerate(['TIME DONE','INITIALS','WET-FLOOR\nSIGN OUT?']): ws.cell(6,i+j,t)
ws.merge_cells('K5:L6'); ws['K5']='EXTRA SWEEPS (time + initials) / NOTES'
box(ws,'A5:L6',fill=BLACK,font=f(8.5,True,'FFFFFF'),align=CEN); ws.row_dimensions[6].height=24
for d in range(1,32):
    rr=6+d; ws.cell(rr,1,d); ws.row_dimensions[rr].height=17; ws.merge_cells(start_row=rr,start_column=11,end_row=rr,end_column=12)
box(ws,'A7:L37',font=f(9),align=CEN)
for rr in range(7,38):
    if rr%2: 
        for cc in range(1,11): ws.cell(rr,cc).fill=GREY
ws['A39']='Manager check at month end: ________   File in the Health & Safety binder. Keep every month - never throw a sweep log away.'; ws['A39'].font=f(8.5,i=True)
for col,w in zip('ABCDEFGHIJKL',[6,9,9,10,9,9,10,9,9,10,26,26]): ws.column_dimensions[col].width=w
ws.print_area='A1:L39'
wb.save('VM Sweep Log.xlsx')

# ---------- 5. Bathroom Check Log (one sheet per day, posted on the washroom door) ----------
wb=openpyxl.Workbook(); ws=wb.active; ws.title='Bathroom Check'; setup(ws,land=False)
logo(ws,w=130); ws.row_dimensions[1].height=24; ws.row_dimensions[2].height=14
ws['D1']='WASHROOM CHECK LOG'; ws['D1'].font=f(15,True)
ws['D2']='DATE: ______ / ______ / 20____'; ws['D2'].font=f(10)
ws['A3']='Check at least every 2 hours while open, and right away if a guest reports a problem. ✓ = OK / done.  ✗ = problem - write what you did in NOTES and tell the manager.'
ws.merge_cells('A3:I3'); ws['A3'].font=f(8.5); ws['A3'].alignment=LEFT; ws.row_dimensions[3].height=26
heads=['TIME','INITIALS','TOILET\nCLEAN','SINK &\nMIRROR','FLOOR\nDRY & CLEAN','TOILET\nPAPER','SOAP &\nPAPER TOWEL','GARBAGE\nEMPTIED','NOTES']
for i,h in enumerate(heads,1): ws.cell(5,i,h)
box(ws,'A5:I5',fill=BLACK,font=f(8,True,'FFFFFF'),align=CEN); ws.row_dimensions[5].height=32
for k in range(14):
    rr=6+k; ws.row_dimensions[rr].height=30
box(ws,'A6:I19',font=f(9),align=CEN)
for rr in range(6,20):
    if rr%2==0:
        for cc in range(1,9): ws.cell(rr,cc).fill=GREY
ws['A21']='Out of supplies? Spares are in the back room. Clog or leak: put up the "Out of Order" sign, tell the manager, log it in the VM Equipment Repair Log.'; ws['A21'].font=f(8.5,i=True)
ws.merge_cells('A21:I21'); ws['A21'].alignment=LEFT; ws.row_dimensions[21].height=24
ws['A23']='Manager check: ________   Keep with the Health & Safety binder.'; ws['A23'].font=f(8.5,i=True)
for col,w in zip('ABCDEFGHI',[9,9,8,8,10,8,11,9,30]): ws.column_dimensions[col].width=w
ws.print_area='A1:I23'
wb.save('VM Washroom Check Log.xlsx')
print('ok2')
