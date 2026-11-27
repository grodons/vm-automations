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
// ---- 1. Floor checks
docs['SOP - Daily Floor Checks']=()=>doc('SOP: Daily Floor Checks',[
 info([['Who','Whoever is opening, working midday and closing'],['When','At OPEN, MIDDAY and CLOSE. Every hour when it is snowing or raining.'],['Form','**VM Daily Floor Check Log** (one sheet per month) - Operations > 05 Forms & Templates'],['Time','About 3 minutes']]),
 H('Why we do it'),
 P('Ski boots, snow and slush make our floor slippery all winter. A fall can hurt a guest or a co-worker. The log is also our proof that we check the floor, which we need if there is ever a slip-and-fall claim.'),
 H('How to do a floor check'),
 ...N(['Walk the **whole store**: entrance, every aisle, coolers, cash area, back room, stairs and washroom.',
  'Look for: **snow or water at the door**, entrance **mats** curled or soaked, spills, boxes or stock on the floor, cords, ice by the doors, blocked **fire exits** or aisles.',
  '**Fix anything you find right away**: mop it, put out the yellow wet-floor sign, flatten or swap the mat, move the box.',
  'On the log, write the **time** and your **initials**. Put a ✓ if all clear, or ✗ if you found something.',
  'If you put ✗, write in **NOTES** what you found and what you did, e.g. "Slush at door - mopped, sign out".']),
 H('In winter'),
 B('Check the entrance **every hour** while it is snowing, raining or the hill is busy.'),
 B('Swap soaked mats for dry ones from the back.'),
 B('Leave the wet-floor sign out until the floor is completely dry.'),
 H('If someone falls or is hurt'),
 ...N(['Help them first. Call 911 if they need it.','Tell the manager right away.',
  'Fill in the **Slip and Fall Incident Report** (customer) or **Incident Report Template** (staff) the same day. Both are in 05 Forms & Templates.',
  'Take a photo of the spot if it is safe to do so.','Attach a copy of that day\'s Floor Check Log to the report.','Do not say whose fault it was. Just record the facts.']),
 H('End of the month'),
 B('Chrissan checks the log is complete, initials the bottom and files it in the **Health & Safety binder**.'),
 B('Keep every month. Never throw a log away.'),
 H('Questions'),P('Ask Chrissan. If she is not available, text Jeff.')]);
// ---- 2. OLG
docs['SOP - OLG Scratch Ticket Weekly Reconciliation']=()=>doc('SOP: OLG Scratch Ticket Weekly Reconciliation',[
 info([['Who','Chrissan, or a trained key holder she names'],['When','Every **Sunday morning before opening** for the week Sunday to Saturday'],['Form','**VM OLG Scratch Weekly Reconciliation** (spreadsheet) - Operations > 05 Forms & Templates'],['Time','About 20 minutes']]),
 H('Why we do it'),
 P('Scratch tickets are cash. Every ticket we activate is billed to us by OLG whether it is sold, lost or stolen. This check shows within a week if any tickets are missing.'),
 H('The formula'),
 P('**Last week\'s count + Activations - POS scratch sales - Returns - Free tickets = what we should have.** The spreadsheet does the math. The difference should be **$0.00**.'),
 H('Steps'),
 ...N(['**Before the store opens**, count every activated scratch ticket: the displays **and** the activated packs in the drawer. Add up the dollar value. This is the **Actual count**.',
  'Open the spreadsheet and go to this Sunday\'s row. The dates are already filled in. **Beginning inventory** fills itself from last week\'s count.',
  '**Activations**: the total dollar value of packs activated Sunday to Saturday, from the OLG terminal activation report or the activation slips.',
  '**POS scratch sales**: total scratch ticket sales in L-BOSS for Sunday to Saturday (the LOTTERY department on each day\'s report).',
  '**Returns**: the value of packs pulled for return that OLG has not picked up yet.',
  '**Free tickets**: at the OLG terminal print **Reports > Daily Sales** for each of the 7 days. Add up the Free Tickets section.',
  'Type the **Actual count** and your initials. Check the **Difference** column.']),
 H('If the difference is not $0.00'),
 P('The difference turns **red** when it is not zero.'),
 ...N(['Recount the tickets.','Check that you didn\'t count unactivated packs or packs set aside for return.','Check that every activation slip for the week is included.','Recheck the 7 days of free tickets and the L-BOSS lottery sales.',
  'Still off? Write what you checked in **NOTES** and tell Jeff the same day. **Never change a number to make it balance.**']),
 H('Keep'),
 B('Staple the week\'s OLG terminal reports and activation slips together and file them in the OLG binder.'),
 B('The spreadsheet keeps the whole year. Never delete a row.'),
 B('Never write POS or OLG passwords in this SOP or the spreadsheet.'),
 H('Questions'),P('Ask Jeff.')]);
// ---- 3. Daily tasks
docs['SOP - Daily Store Tasks']=()=>doc('SOP: Daily Store Tasks',[
 info([['Who','Every shift: opener, mid and closer'],['When','Every day. One sheet covers Monday to Sunday.'],['Form','**VM Daily Task Sheet (weekly)** - Operations > 05 Forms & Templates. Print one every Monday and keep it at the cash desk.'],['Time','Opening and closing lists take about 20 minutes each']]),
 H('Why we do it'),
 P('Guests at the resort expect a clean, full and well-priced store at every visit. The sheet makes sure nothing is missed between shifts, and the store is safe and locked at night.'),
 H('How to use the sheet'),
 B('As you finish each task, **initial** the box for today.'),
 B('If a task doesn\'t apply today (e.g. the slushie machine is off for the season), write **N/A**. Never leave a box blank.'),
 B('Opener and closer initial the bottom rows at the end of their shift.'),
 B('If you can\'t finish a task, tell the next shift or the manager.'),
 H('Opening - the must-dos'),
 ...N(['**Tobacco OPEN count before the first sale** (see SOP - Tobacco Counts).','Count the float into the till: $200.','Log fridge and freezer temperatures and do the **opening floor check**.','OLG and EXIT signs out. Washroom checked. Sweep the floor and entrance.','Then face and stock: impulse areas, perishables (first in, first out).']),
 H('During the shift'),
 B('**Scan every delivery invoice the same day** using the "Invoice" preset (see SOP - Scanning Invoices).'),
 B('Keep the cash area stocked and clean: scratch tickets, bags, receipt rolls, lighters, tobacco wall, front cooler.'),
 B('Work through the store tasks during quiet times: coolers, chips, bread, overstock, Grab n Go, expiry dates and shelf tags.'),
 B('Do the midday temperatures and the midday floor check.'),
 H('Closing - the must-dos'),
 ...N(['**Tobacco CLOSE count after the last sale**; binder back in the drawer under the OLG terminal.','Closing temperatures and floor check.','Equipment off; garbage out; floors and staff washroom clean.',
  'Signs in; garage door locked.','Print the OLG terminal daily report and the L-BOSS end-of-day report.','Count cash and return the float(s) to $200.','ATM cassette locked in the safe. Drawers locked. Screens down, lights out.','**Check every door is locked** before you leave.']),
 H('Manager'),
 B('Every Monday, Chrissan reviews last week\'s sheet, follows up on blanks, initials it and keeps it for 4 weeks.'),
 B('Tasks change with the season. Tell Jeff, and the sheet will be updated. Don\'t hand-write new tasks on the sheet.'),
 H('Questions'),P('Ask Chrissan. If she is not available, text Jeff.')]);
(async()=>{for(const [name,fn] of Object.entries(docs)){fs.writeFileSync(name+'.docx',await Packer.toBuffer(fn()));console.log('ok',name);}})();
