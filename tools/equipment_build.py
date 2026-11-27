import openpyxl
from openpyxl.styles import Font, Alignment, PatternFill, Border, Side
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.formatting.rule import FormulaRule
F='Jost'; thin=Side(style='thin',color='BFBFBF')
def hdr(ws,heads,widths):
    for i,(h,w) in enumerate(zip(heads,widths),1):
        c=ws.cell(1,i,h); c.font=Font(name=F,bold=True,color='FFFFFF',size=10); c.fill=PatternFill('solid',fgColor='000000')
        c.alignment=Alignment(wrap_text=True,vertical='center',horizontal='center')
        ws.column_dimensions[openpyxl.utils.get_column_letter(i)].width=w
    ws.row_dimensions[1].height=34; ws.freeze_panes='B2'
def body(ws,ncols,nrows=300):
    for r in range(2,nrows+2):
        for c in range(1,ncols+1):
            cell=ws.cell(r,c); cell.font=Font(name=F,size=10); cell.alignment=Alignment(vertical='top',wrap_text=True)
def dv(ws,col,opts,nrows=300):
    d=DataValidation(type='list',formula1='"'+','.join(opts)+'"',allow_blank=True); ws.add_data_validation(d); d.add(f'{col}2:{col}{nrows+1}')
def howto(wb,title,lines):
    ws=wb.create_sheet('How to use',0); ws.column_dimensions['A'].width=120; ws.sheet_view.showGridLines=False
    ws['A1']=title; ws['A1'].font=Font(name=F,bold=True,size=16)
    for i,l in enumerate(lines,3):
        ws.cell(i,1,l).font=Font(name=F,size=11,bold=l.endswith(':')); ws.cell(i,1).alignment=Alignment(wrap_text=True)

# ---------- Inventory ----------
wb=openpyxl.Workbook(); ws=wb.active; ws.title='Equipment'
H=['Asset #','Equipment','Category','Location','Make','Model','Serial #','Ownership','Owned by / supplier (if not ours)','Purchase / install date','Purchase cost $','Warranty until','Service company & phone','Last service / inspection','Next service due','Condition','Status','Notes']
W=[9,26,16,16,14,14,16,13,24,13,12,13,26,14,14,11,15,34]
hdr(ws,H,W); body(ws,len(H))
dv(ws,'C',['Refrigeration','Freezer','Food service','POS & IT','Scales','Cleaning','Safety','Fixtures & shelving','Signage','Vehicle / forklift','Other'])
dv(ws,'H',['Owned','Leased','Rented','Supplier-owned'])
dv(ws,'P',['Good','Fair','Poor'])
dv(ws,'Q',['In use','Out of service','In storage','Retired'])
seed=[
 ['VM-001','Computing scale','Scales','Front cash','Magellan','8400','MJ0103913','Owned','','','','','Matrix Scale Service Inc. 905-712-8987','2025-05-21','2030-05-21','Good','In use','Measurement Canada certificate 10592815 (04 Health, Safety & Licences > Weigh Scales)'],
 ['VM-002','Computing scale','Scales','Front cash','Magellan','8400','MJ0103918','Owned','','','','','Matrix Scale Service Inc. 905-712-8987','2025-05-21','2030-05-21','Good','In use','Same certificate as VM-001'],
 ['VM-003','Forklift (propane)','Vehicle / forklift','','Caterpillar','GP18K','AT31B50478','Owned','','','','','(inspection company on 2025-06-30 report - customer no. M101995)','2025-06-30','2026-06-30','Good','In use','Annual PM inspection - report in 04 > Forklift. 8,578 hrs at last PM. Next due date is an estimate.'],
 ['VM-004','Document scanner','POS & IT','Office','Epson','WorkForce ES-C380W','','Owned','','','','','','','','','In use','Scans invoices and count sheets to 11 VM SCANNED ("Invoice" preset). Fill in serial + purchase date when it arrives.'],
 ['VM-005','Security camera recorder','POS & IT','','Uniview (Provision Cam2 / UNV-Link app)','','Device ID NDE29163P714','Owned','','','','','','','','','In use','Remote viewing instructions in 02 Instructions & Job Aids. Never write the password here.'],
 ['VM-006','OLG lottery terminal','POS & IT','Cash','OLG','','','Supplier-owned','OLG','','','','OLG retailer support','','','','In use','OLG owns it - report faults to OLG.'],
 ['VM-007','ATM','POS & IT','Front','','','','Supplier-owned','(ATM provider - pays commission)','','','','','','','','In use','Fill in provider name and service number.'],
 ['VM-008','Beverage cooler(s)','Refrigeration','','Coca-Cola','','','Supplier-owned','Coca-Cola (CCCBL)','','','','Coca-Cola equipment service','','','','In use','One row per cooler - add serials from the cooler plate.'],
]
for r,row in enumerate(seed,2):
    for c,v in enumerate(row,1): ws.cell(r,c,v)
howto(wb,'VM Equipment Inventory',['Every piece of equipment in the store, one row each. Chrissan keeps it up to date.','',
 'How to add equipment:','1. Next Asset # (VM-009, VM-010 ...). Write the same number on a sticker on the equipment.','2. Make, model and serial # come from the metal plate on the back or inside the door - take a photo.','3. Ownership: Coke coolers, OLG terminal, ATM etc. belong to the supplier - pick "Supplier-owned" and who to call.','4. Keep service dates current: scales every 5 years (Measurement Canada), forklift yearly, fire extinguishers yearly (in the fire plan).','',
 'Start with: every cooler and freezer, ice machine, ice merchandiser, hot dog roller / food equipment, POS registers, printers, card terminals, scanner, cameras, fire extinguishers, ladders, shelving, signs.','',
 'Never remove a row - set Status to "Retired" when equipment leaves. Repairs go in the VM Equipment Repair Log (same folder).','Never write passwords or alarm codes in this sheet.'])
wb.save('VM Equipment Inventory.xlsx')

# ---------- Repair log ----------
wb=openpyxl.Workbook(); ws=wb.active; ws.title='Repair Log'
H=['Date broke / reported','Asset #','Equipment','What is wrong','Reported by','Product at risk / moved?','Company contacted','Contact name & phone','Date contacted','Ticket / work order #','Date tech came','Scope of repair (work done)','Parts replaced','Invoice #','Cost before tax $','Who pays','Date fixed','Days down','Status','Notes / follow-up']
W=[12,9,22,30,12,22,22,22,12,14,12,32,20,12,12,14,12,9,16,30]
hdr(ws,H,W); body(ws,len(H))
for r in range(2,302):
    ws.cell(r,18,f'=IF(A{r}="","",IF(Q{r}="",TODAY()-A{r},Q{r}-A{r}))')
    for c in (1,9,11,17): ws.cell(r,c).number_format='yyyy-mm-dd'
    ws.cell(r,15).number_format='$#,##0.00'
dv(ws,'P',['Village Market','Warranty','Supplier (their equipment)','Landlord','Insurance'])
dv(ws,'S',['Open','Waiting for tech','Waiting for parts','Fixed','Replaced','Retired'])
ws.conditional_formatting.add('A2:T301',FormulaRule(formula=['AND($A2<>"",OR($S2="Open",$S2="Waiting for tech",$S2="Waiting for parts"),$R2>=3)'],fill=PatternFill('solid',fgColor='FFC7CE')))
howto(wb,'VM Equipment Repair Log',['One row per breakdown. Start the row the day it breaks - even if it gets fixed the same day.','',
 'When something breaks:','1. Protect the product first: move food out of a failing cooler or freezer and log the temperatures.','2. Add a row: date, Asset # (from the VM Equipment Inventory), what is wrong, who found it, and what product was moved or lost (lost product also goes on the Waste Report).','3. Call the right company. If the equipment is supplier-owned (Coke cooler, OLG terminal, ATM), call them - they pay.','4. Fill in who you called, the ticket number and the date. Set Status.','5. When fixed: scope of work, parts, invoice #, cost before tax, who pays, date fixed, Status = Fixed. Scan the repair invoice like any other invoice.','',
 'Rows turn red when equipment has been down 3+ days and is still open - chase the company.','Days down counts itself.','Tell Jeff the same day about any repair over $500 or anything down more than 2 days.'])
wb.save('VM Equipment Repair Log.xlsx')
print('ok')
