const fs=require('fs');
const {Document,Packer,Paragraph,TextRun,ImageRun,HeadingLevel,AlignmentType,LevelFormat,Table,TableRow,TableCell,WidthType,BorderStyle,ShadingType}=require('docx');
const FONT='Jost';
const logo=fs.readFileSync('logo.png');
function runs(t){ // **bold** markup
  return t.split(/(\*\*[^*]+\*\*)/).filter(Boolean).map(s=>s.startsWith('**')?new TextRun({text:s.slice(2,-2),bold:true,font:FONT}):new TextRun({text:s,font:FONT}));
}
const P=t=>new Paragraph({children:runs(t),spacing:{after:100}});
const H=t=>new Paragraph({heading:HeadingLevel.HEADING_2,children:[new TextRun({text:t,font:FONT,bold:true})]});
const B=(t,l=0)=>new Paragraph({numbering:{reference:'b',level:l},children:runs(t)});
let numN=0; const nums=[];
function N(items){const ref='n'+(numN++);nums.push(ref);return items.map(t=>new Paragraph({numbering:{reference:ref,level:0},children:runs(t)}));}
function info(rows){const w=[2200,7160];const bd={style:BorderStyle.SINGLE,size:4,color:'000000'};const borders={top:bd,bottom:bd,left:bd,right:bd};
  return new Table({width:{size:9360,type:WidthType.DXA},columnWidths:w,rows:rows.map(([a,b])=>new TableRow({children:[
    new TableCell({borders,width:{size:w[0],type:WidthType.DXA},shading:{fill:'000000',type:ShadingType.CLEAR,color:'auto'},margins:{top:60,bottom:60,left:100,right:100},children:[new Paragraph({children:[new TextRun({text:a,bold:true,color:'FFFFFF',font:FONT})]})]}),
    new TableCell({borders,width:{size:w[1],type:WidthType.DXA},margins:{top:60,bottom:60,left:100,right:100},children:[new Paragraph({children:runs(b)})]})]}))});}
function doc(title,body){
  const children=[new Paragraph({children:[new ImageRun({type:'png',data:logo,transformation:{width:170,height:Math.round(170*197/685)}})],spacing:{after:240}}),
    new Paragraph({heading:HeadingLevel.TITLE,children:[new TextRun({text:title,font:FONT,bold:true})]}),
    new Paragraph({children:[new TextRun({text:'Village Market  ·  Owner: Jeff Meakings  ·  Last updated: November 27, 2026',font:FONT,size:18})],spacing:{after:200}}),
    ...body];
  return new Document({styles:{default:{document:{run:{font:FONT,size:22}}},
    paragraphStyles:[{id:'Title',name:'Title',basedOn:'Normal',run:{font:FONT,size:40,bold:true},paragraph:{spacing:{before:0,after:80},keepNext:true}},
      {id:'Heading2',name:'Heading 2',basedOn:'Normal',next:'Normal',quickFormat:true,run:{font:FONT,size:28,bold:true},paragraph:{spacing:{before:280,after:100},keepNext:true,outlineLevel:1}}]},
    numbering:{config:[{reference:'b',levels:[{level:0,format:LevelFormat.BULLET,text:'•',alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:540,hanging:270}}}},{level:1,format:LevelFormat.BULLET,text:'–',alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:1080,hanging:270}}}}]},
      ...nums.map(r=>({reference:r,levels:[{level:0,format:LevelFormat.DECIMAL,text:'%1.',alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:540,hanging:360}}}}]}))]},
    sections:[{properties:{page:{size:{width:12240,height:15840},margin:{top:1080,bottom:1080,left:1080,right:1080}}},children}]});
}
const docs={};
// ---- Close-out & cash drop
docs['2611 27 SOP - Daily Close-Out & Cash Drop']=()=>doc('SOP: Daily Close-Out & Cash Drop',[
 info([['Who','**Closer** counts and drops. **Chrissan** counts the drop and records it. **Jeff** picks up from the safe.'],['When','Every night after the last sale. Chrissan records each day within 2 days.'],['Forms','**VM Cash Count Slip** (05 Forms & Templates, 4 per page) and the **VM Cash Count** sheet for the year (01 Daily Counts & Logs > Cash Counts)'],['Time','About 10 minutes at close']]),
 H('Why we do it'),
 P('Cash is the easiest thing in the store to lose. A count every night, a second count by the manager and a sealed safe mean any shortage shows up within days and can be traced to one shift.'),
 H('Closer - at the end of the night'),
 ...N(['Make sure the last sale is done. Lock the front door.',
  'Count the whole till on the counter, out of view of the windows and cameras pointing out.',
  'Fill in a **Cash Count Slip**: how many of each bill and coin, the **total counted**, minus the **$200 float**, = **cash in this drop**.',
  'Leave exactly **$200** in the till as tomorrow\'s float.',
  'Put the drop cash, the count slip and the L-BOSS close-out report together and put them in the **drop safe**.',
  'Never take cash home, leave it in a drawer or hold it for the next day. Never open sealed mail or envelopes.']),
 P('There is **no Z report and no card batch** to run - L-BOSS and the card terminal settle on their own.'),
 H('Chrissan - next day'),
 ...N(['Open the safe and **count each drop yourself**. Write your count and initials on the slip.',
  'In L-BOSS, run the **GL report** for that day and take the **cash in drawer** amount.',
  'In the **VM Cash Count** sheet for the year, enter the day\'s **COUNT** and **GL In-Drawer**. The sheet works out **Over/Short**.',
  'Put the cash and its count slip in a **new envelope/folder for that day** and back in the safe for Jeff\'s pickup.',
  'Never leave a day blank. A blank COUNT shows as a short for the full amount. If there was no drop that day, write the reason in the sheet.']),
 H('If it is over or short'),
 B('Under $5: note it and move on.'),
 B('$5 or more: recount, check for a voided or no-sale transaction in L-BOSS, and ask the closer the same day.'),
 B('$20 or more, or short two days in a row: **text Jeff the same day** with the date, amount and who closed.'),
 B('**Never fix a difference** by adding or taking cash from the float or another day.'),
 H('Jeff'),
 B('Picks up the envelopes from the safe and checks them against the VM Cash Count sheet.'),
 H('Questions'),P('Ask Chrissan. If she is not available, text Jeff.')]);
// ---- Temperature log
docs['2611 27 SOP - Temperature Log']=()=>doc('SOP: Temperature Log',[
 info([['Who','Opener and closer'],['When','At OPEN and at CLOSE, every day'],['Form','**VM Temperature Log** (one sheet per month) - 05 Forms & Templates. Keep it on the clipboard by the back wall.'],['Time','About 3 minutes']]),
 H('Why we do it'),
 P('Food kept too warm makes people sick and can get us fined or closed by the health inspector. The log shows the inspector we check every day, and it catches a failing fridge before we lose the stock.'),
 H('The 7 units'),
 B('Produce fridge 1 and 2 (back wall)'),B('Freezer 1 and 2'),B('Merchandising cooler 1 and 2'),B('Water cooler fridge (front)'),
 H('Safe temperatures'),
 B('Fridges and coolers: **0 to 4 °C**.'),B('Freezers: **-18 °C or colder**.'),
 H('Steps'),
 ...N(['Read the **thermometer inside** each unit (not the display on the outside).','Write the number in the OPEN or CLOSE box for today. Initial the row.',
  'If a number is out of range, **circle it**. Make sure the door is shut and nothing blocks the fan, then check again in 30 minutes.',
  'Still out of range: move the food to a working unit, tell Chrissan, and start a row in the **VM Equipment Repair Log**.',
  'Food that was above 4 °C for more than 2 hours, or thawed food from a freezer: put it aside, ask Chrissan, and log anything thrown out on the Waste Report.']),
 H('Manager'),
 B('Chrissan checks the log every week, initials it, and files it in the Health & Safety binder at month end. Keep every month.'),
 B('No thermometer in a unit? Buy one - every unit needs its own.'),
 H('Questions'),P('Ask Chrissan. If she is not available, text Jeff.')]);
// ---- Daily store tasks v2
docs['2611 27 SOP - Daily Store Tasks']=()=>doc('SOP: Daily Store Tasks',[
 info([['Who','Every shift. Often one person is alone - in busy season two people close.'],['When','Every day. One sheet covers Monday to Sunday.'],['Form','**VM Daily Task Sheet (weekly)** - 05 Forms & Templates. Print one every Monday; keep it with the binders under the OLG terminal.'],['Time','Opening and closing lists take about 20 minutes each']]),
 H('Why we do it'),
 P('Guests at the resort expect a clean, full and well-priced store at every visit. The sheet makes sure nothing is missed between shifts, and the store is safe and locked at night.'),
 H('How to use the sheet'),
 B('As you finish each task, initial the box for today.'),B('If a task doesn\'t apply today (e.g. no delivery came in), write N/A. Never leave a box blank.'),B('Opener and closer initial the bottom rows.'),B('If you can\'t finish a task, tell the next shift or the manager.'),
 H('Opening - the must-dos'),
 ...N(['Tobacco OPEN count before the first sale (SOP - Tobacco Counts).','Count the float into the till: **$200**.','Temperatures for all 7 units (SOP - Temperature Log).',
  'Floor check and sweep, logged (SOP - Daily Floor Checks & Sweep Log). Staff washroom checked.','OLG and EXIT signs out. Then face and stock: impulse areas, perishables (first in, first out).']),
 H('During the shift'),
 B('**Deliveries come Wednesday and Thursday.** Check the delivery against the invoice, put it away the same day, and scan the invoice (SOP - Scanning Invoices). Sealed mail goes in the invoice binder unopened.'),
 B('Restock drinks, Grab n Go, chips, tobacco and coolers from the back room. Fill the front water cooler fridge and the Arctic Ice freezer.'),
 B('Pull expired product and log it on the Waste Report.'),
 B('Face every aisle. Do **today\'s deep-clean job** from the rotation at the bottom of the sheet: dusting and wiping shelves, price-tag checks, cooler doors.'),
 B('Midday temperatures, floor check and sweep.'),
 H('Closing - the must-dos'),
 ...N(['Tobacco CLOSE count after the last sale; binder back in the drawer under the OLG terminal.','Closing temperatures, floor check and sweep. **Mop** the entrance and any wet or sticky spots.',
  'Scales off; garbage out; back room fans off. Signs in; garage door locked.',
  'Count cash, fill in a **Cash Count Slip**, leave the **$200 float**, and put the cash, slip and close-out report in the **drop safe** (SOP - Daily Close-Out & Cash Drop).',
  'Drawers locked, screens down, lights off.','**The alarm cannot be set until the front door is repaired.** Lock the front door and push on it to make sure it is locked. Check every other door before you leave.']),
 H('Washroom'),
 B('The washroom is staff only and shared with Craig\'s Cookies. The two teams take turns cleaning - note whose turn it was on the Washroom Check Log. Spare paper, soap and wet-floor signs are in the back room.'),
 H('Manager'),
 B('Every Monday, Chrissan reviews last week\'s sheet, follows up on blanks, initials it and keeps it for 4 weeks.'),
 B('Tasks change with the season. Tell Jeff, and the sheet will be updated. Don\'t hand-write new tasks on the sheet.'),
 H('Questions'),P('Ask Chrissan. If she is not available, text Jeff.')]);
(async()=>{for(const [name,fn] of Object.entries(docs)){fs.writeFileSync(name+'.docx',await Packer.toBuffer(fn()));console.log('ok',name);}})();
