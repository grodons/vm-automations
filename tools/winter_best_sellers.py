import csv,collections,math
plu={x[0]:x for x in csv.reader(open('plu.csv',encoding='utf-8-sig')) if x and x[0]!='PLU #'}
S=list(csv.DictReader(open('sales_long.csv')))
days={'2512':31,'2601':31,'2602':28,'2603':31}
agg=collections.defaultdict(lambda:dict(q=0,amt=0,months={},dept=None,desc=None))
for r in S:
    a=agg[r['plu']];q=float(r['qty']);amt=float(r['amt'])
    a['q']+=q;a['amt']+=amt;a['months'][r['mon']]=a['months'].get(r['mon'],0)+q;a['dept']=r['dept'];a['desc']=r['desc']
tot=sum(a['amt'] for a in agg.values()); lot=sum(a['amt'] for a in agg.values() if a['dept']=='LOTTERY')
print('total',round(tot),'lottery',round(lot))
items=[(p,a) for p,a in agg.items() if a['dept']!='LOTTERY' and a['amt']>0]
items.sort(key=lambda x:-x[1]['amt'])
base=sum(a['amt'] for p,a in items); cum=0; out=[]
for i,(p,a) in enumerate(items,1):
    cum+=a['amt']; share=cum/base
    tier='A' if share<=0.5 or i==1 else ('B' if share<=0.8 else 'C')
    peak_wk=max(q/days[m]*7 for m,q in a['months'].items())
    avg_wk=a['q']/121*7
    cur=plu.get(p); desc=cur[2] if cur else a['desc']
    try: retail=float(cur[-1]) if cur else None
    except: retail=None
    lastavg=a['amt']/a['q'] if a['q'] else None
    note=[]
    if not cur: note.append('Not in current PLU list - check code changed')
    if retail and lastavg and retail < lastavg*0.98: note.append('Shelf price now LOWER than last winter')
    dec=a['months'].get('2512',0)/31*7
    if len(a['months'])>=2 and dec>1.8*avg_wk: note.append('Holiday spike (Dec)')
    out.append(dict(rank=i,tier=tier,dept=a['dept'],plu=p,item=desc,units=round(a['q']),sales=round(a['amt'],2),share=round(a['amt']/base,4),
      avg_wk=round(avg_wk,1),peak_wk=round(peak_wk,1),min_on_hand=math.ceil(peak_wk),months=len(a['months']),
      retail=retail,last_avg=round(lastavg,2) if lastavg else None,
      dec=round(a['months'].get('2512',0)),jan=round(a['months'].get('2601',0)),feb=round(a['months'].get('2602',0)),mar=round(a['months'].get('2603',0)),note='; '.join(note)))
c=collections.Counter(o['tier'] for o in out);print(c, len(out))
for t in 'AB': print(t, round(sum(o['sales'] for o in out if o['tier']==t)/base*100,1))
json=__import__('json');json.dump(out,open('best.json','w'))
for o in out[:40]: print(o['rank'],o['dept'][:10],o['item'][:28],o['units'],o['sales'],o['peak_wk'],o['retail'],o['last_avg'],o['note'])
# dept summary
d=collections.defaultdict(lambda:[0,0])
for o in out: d[o['dept']][0]+=o['sales']; d[o['dept']][1]+=o['units']
print(sorted(((k,round(v[0]),round(v[0]/base*100,1)) for k,v in d.items()),key=lambda x:-x[1]))
print('lower price count', sum(1 for o in out if 'LOWER' in o['note'] and o['tier'] in 'AB'))
print('missing', [ (o['rank'],o['item']) for o in out if 'Not in' in o['note'] and o['tier'] in 'AB'])
