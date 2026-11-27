import pdfplumber,re,csv,glob,collections
out=[];checks=[]
for f in sorted(glob.glob('2[56]*.pdf')):
    mon=f[:4]; dept=None; total=None
    with pdfplumber.open(f) as pdf:
        for page in pdf.pages:
            words=page.extract_words(keep_blank_chars=False,use_text_flow=False)
            lines=collections.defaultdict(list)
            for w in words: lines[round(w['top']/3)].append(w)
            for k in sorted(lines):
                ws=sorted(lines[k],key=lambda w:w['x0'])
                txt=' '.join(w['text'] for w in ws)
                m=re.match(r'^(\d{1,3}) ([A-Z&\'()/ .\-]+)$',txt)
                if m and not txt.startswith('Total'): dept=m.group(2).strip(); continue
                m=re.search(r'Total sales \$([\d,]+\.\d\d)',txt)
                if m: total=float(m.group(1).replace(',',''))
                if re.match(r'^\d{14} ',txt):
                    plu=ws[0]['text']
                    nums=[w for w in ws[1:] if re.fullmatch(r'-?[\d,]*\.?\d+',w['text']) and w['x0']>250]
                    desc=' '.join(w['text'] for w in ws[1:] if w['x0']<=250)
                    vals=[float(w['text'].replace(',','')) for w in nums]
                    if len(vals)<7: print('SHORT',f,txt); continue
                    q,avg,amt=vals[-7],vals[-6],vals[-5]
                    out.append(dict(mon=mon,dept=dept,plu=plu,desc=desc,qty=q,avg=avg,amt=amt))
    s=sum(r['amt'] for r in out if r['mon']==mon); checks.append((mon,round(s,2),total))
print(checks)
w=csv.DictWriter(open('sales_long.csv','w'),fieldnames=out[0].keys());w.writeheader();w.writerows(out)
print(len(out))
