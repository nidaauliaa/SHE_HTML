// ===== Laporan harian per Departemen: Excel (.xlsx, format "HASIL TEMUAN") & PDF =====
const TARGET=3,RL={RINGKAS:'R1',RAPI:'R2',RESIK:'R3',RAWAT:'R4',RAJIN:'R5',K3:'K3'};
const MON=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'],MONS=['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sept','Okt','Nov','Des'];
const dLong=d=>{const [y,m,x]=d.split('-');return `${x} ${MON[+m-1]} ${y}`},dShort=d=>{const [y,m,x]=d.split('-');return `${x} ${MONS[+m-1]} ${y.slice(2)}`},dSlash=d=>d?d.split('-').reverse().join('/'):'';
const SIGN0={n1:'Aditya Saputra',j1:'SPV SHE',n2:'...............',j2:'SPV/ Leader Dept.'};
const SHORT={'Bus':'BUS','Minibus':'MINIBUS','Bus & Box HD':'BUS BOX HD','Production Component':'COMPONENT','Office':'OFFICE','Gudang':'GUDANG'};
const BCX={Body:'ED7D31',Putty:'548235',Painting:'FFD966',Finishing:'FF3399'},PALX=['5B9BD5','A5A5A5','70AD47','9E480E','7030A0','00B0F0','C00000','FFC000','264478','636363'];
const bcx=b=>BCX[b]||PALX[BNAMES.indexOf(b)%PALX.length],rd2=z=>z==null?null:Math.round(z*100)/100,cm=z=>z==null?'-':z.toFixed(2).replace('.',',');
// ---------- data satu hari untuk satu departemen
const datesFor=(p5,d)=>[...new Set(p5.filter(x=>AR(x.bag).d===d).map(x=>x.date))].sort().reverse();
function dayData(p5,date,dept){const L=p5.filter(x=>x.date===date&&AR(x.bag).d===dept);
 const bags=AREAS.filter(a=>a.d===dept&&L.some(x=>x.bag===a.id)).map(a=>{const l=L.filter(x=>x.bag===a.id);
  return {a,b:a.b,v:R5.map(r=>rd2(mean(l.map(x=>mean(x.sc[r]||[])).filter(q=>q!=null)))),tm:l.flatMap(x=>x.tm)}});
 return {date,dept,bags}}
// ---------- foto -> bytes + ukuran (JPEG/PNG langsung; format lain dirasterisasi via canvas)
const b64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
function jpgSize(b){let i=2;while(i+9<b.length){if(b[i]!==0xFF)return null;const m=b[i+1];if(m>=0xC0&&m<=0xCF&&![0xC4,0xC8,0xCC].includes(m))return {h:(b[i+5]<<8)|b[i+6],w:(b[i+7]<<8)|b[i+8]};i+=2+((b[i+2]<<8)|b[i+3])}return null}
const pngSize=b=>({w:((b[16]<<24)|(b[17]<<16)|(b[18]<<8)|b[19])>>>0,h:((b[20]<<24)|(b[21]<<16)|(b[22]<<8)|b[23])>>>0});
async function photoInfo(uri){if(!uri)return null;const m=/^data:image\/(jpeg|jpg|png);base64,(.+)$/.exec(uri);
 if(m){const by=b64(m[2]),png=m[1]==='png',sz=png?pngSize(by):jpgSize(by);if(sz&&sz.w&&sz.h)return {bytes:by,ext:png?'png':'jpeg',...sz}}
 if(typeof Image==='undefined')return null;
 return new Promise(res=>{const im=new Image();im.onload=()=>{const c=document.createElement('canvas');c.width=im.naturalWidth||400;c.height=im.naturalHeight||260;const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(im,0,0,c.width,c.height);res({bytes:b64(c.toDataURL('image/png').split(',')[1]),ext:'png',w:c.width,h:c.height})};im.onerror=()=>res(null);im.src=uri})}
// ================= EXCEL =================
async function buildExcelDay(D,sg){
 const n=D.bags.length,cO=3+n,cA=4+n,cl=XL.col,dept=D.dept.toUpperCase(),SN='GRAFIK ALL AREA';
 const T4={l:'thin',r:'thin',t:'thin',b:'thin'},C={h:'center',v:'center'},H={font:{sz:14,b:1},al:C,bd:T4},V={font:{sz:12},al:C,bd:T4,fmt:'0.00'};
 const g=XL.Sheet(SN,{zoom:55,grid:false,fit:'page'});g.colW(0,2.6).colW(1,13.1).colW(2,11.8);for(let i=0;i<n;i++)g.colW(3+i,18);g.colW(cO,13.2).colW(cA,13.3).colW(cA+1,2);
 g.rowH(0,8.15).rowH(1,20.25).rowH(2,24).rowH(3,18.75);for(let r=4;r<=10;r++)g.rowH(r,18);
 const ttl={font:{sz:16,b:1},al:C};g.set(1,1,`HASIL SAFETY PATROL 5RK3 ${dept}`,ttl);for(let c=2;c<=cA;c++)g.style(1,c,ttl);g.merge(1,1,1,cA);
 g.set(2,cO,`Tanggal : ${dShort(D.date)}`,{font:{sz:14,b:1},al:C});g.style(2,cA,{font:{sz:14,b:1},al:C});g.merge(2,cO,2,cA);
 g.style(3,1,H).set(3,2,'TARGET',H);D.bags.forEach((b,j)=>g.set(3,3+j,b.b.toUpperCase(),H));g.set(3,cO,'AVERAGE',H).style(3,cA,H).merge(3,cO,3,cA);
 const L0=cl(3),L1=cl(2+n),all=rd2(mean(D.bags.flatMap(b=>b.v.filter(z=>z!=null))));
 R5.forEach((r,i)=>{const row=4+i;g.set(row,1,r,{font:{sz:14,b:1},al:{h:'left',v:'center'},bd:T4}).set(row,2,TARGET,{font:{sz:14},al:C,bd:T4});
  D.bags.forEach((b,j)=>g.set(row,3+j,b.v[i],V));
  g.set(row,cA,rd2(mean(D.bags.map(b=>b.v[i]).filter(z=>z!=null))),V,`AVERAGE(${L0}${row+1}:${L1}${row+1})`);
  if(i===0)g.set(row,cO,all,{font:{sz:14,b:1},al:C,bd:T4,fmt:'0.00'},`AVERAGE(${L0}5:${L1}10)`);else g.style(row,cO,{font:{sz:14,b:1},al:C,bd:T4})});
 g.merge(4,cO,9,cO);
 g.set(10,1,'AVERAGE',H).style(10,2,H);g.merge(10,1,10,2);D.bags.forEach((b,j)=>g.set(10,3+j,rd2(mean(b.v.filter(z=>z!=null))),V,`AVERAGE(${cl(3+j)}5:${cl(3+j)}10)`));g.style(10,cO,H).style(10,cA,V);
 // grafik: 2 per baris
 let tot=0;for(let c=0;c<=cA+1;c++)tot+=g.colPx(c);const cw=Math.floor((tot-30)/2),ch=Math.round(cw*0.58),y0=g.topPx(12)+8;
 D.bags.forEach((b,j)=>g.chart({sheet:SN,catCol:'B',r1:5,r2:10,hr:4,valCol:cl(3+j),tgtCol:'C',cats:R5,vals:b.v,tgt:R5.map(()=>TARGET),name:b.b.toUpperCase(),color:bcx(b.b),t1:'HASIL SAFETY PATROL 5RK3 ',t2:`${b.b.toUpperCase()} ${dept}`},10+(j%2)*(cw+10),y0+Math.floor(j/2)*(ch+10),cw,ch));
 const yEnd=y0+Math.ceil(n/2)*(ch+10),sr=12+Math.ceil((yEnd-g.topPx(12))/21)+2,sc=Math.max(3,cO-1);
 g.set(sr,1,'Dibuat oleh,').set(sr,sc,'Menyetujui,').rowH(sr+1,22);
 g.set(sr+3,1,sg.n1,{font:{b:1,u:1}}).style(sr+3,2,{font:{b:1,u:1}}).set(sr+3,sc,sg.n2,{font:{u:1}}).set(sr+4,1,sg.j1).set(sr+4,sc,sg.j2);
 const sheets=[g],used=new Set([SN]);
 // ---- sheet temuan per bagian
 for(const b of D.bags){let nm=`FT ${SHORT[D.dept]} ${b.b.toUpperCase()}`.replace(/[\\\/?*\[\]:]/g,' ').slice(0,31),k=2;while(used.has(nm))nm=nm.slice(0,28)+' '+(k++);used.add(nm);
  const s=XL.Sheet(nm,{zoom:40,fit:'width'});[[0,9],[1,20.6],[2,20],[3,7.2],[4,50.2],[5,48.6],[6,48.6],[7,16.2],[8,22.1],[9,19],[10,47.3],[11,15]].forEach(([c,w])=>s.colW(c,w));
  s.rowH(0,16.5).rowH(3,30).rowH(4,29.15);
  const tt=`HASIL TEMUAN PATROL 5RK3 ${b.b.toUpperCase()} ${dept}`,tb=(r,c)=>({l:c===1?'medium':null,r:c===11?'medium':null,t:r===1?'medium':null,b:r===3?'thin':null});
  for(let r=1;r<=3;r++)for(let c=1;c<=11;c++)s.style(r,c,{font:{sz:r===1&&c===1?26:12,b:r===1&&c===1},al:C,bd:tb(r,c)});
  s.set(1,1,tt,{font:{sz:26,b:1},al:C,bd:tb(1,1)}).merge(1,1,3,11);
  const hd=['Departemen','Bagian','No','Temuan','Keterangan','Perbaikan','5R','PIC','Due Date','Update','Status'];
  hd.forEach((h,i)=>s.set(4,1+i,h,{font:{sz:16,b:1},al:C,fill:h==='5R'?'00FF00':null,bd:{l:i===0?'medium':'thin',r:i===10?'medium':'thin',t:'medium',b:'thin'}}));
  const N=Math.max(1,b.tm.length),R1=5,R2=R1+N-1,bd=(r,c)=>({l:c===1?'medium':'thin',r:c===11?'medium':'thin',t:'thin',b:r===R2?'medium':'thin'});
  const fit=(p,W)=>p?(sc=>({w:Math.round(p.w*sc),h:Math.round(p.h*sc)}))(Math.min((W-16)/p.w,430/p.h,1.5)):null,WE=XL.px(50.2),WK=XL.px(47.3),inf=[];
  for(const t of b.tm)inf.push({f:await photoInfo(t.foto),u:await photoInfo(t.upd)});
  for(let i=0;i<N;i++){const r=R1+i,t=b.tm[i],P=inf[i]||{},df=fit(P.f,WE),du=fit(P.u,WK);
   s.rowH(r,t?Math.max(96,Math.round((Math.max(df?df.h:0,du?du.h:0)+16)*.75)):60);
   const F=(sz,o={})=>({font:{sz},bd:bd(r,0),...o});
   for(let c=1;c<=11;c++)s.style(r,c,{font:{sz:16},al:C,bd:bd(r,c)});
   if(i===0){s.set(r,1,D.dept.toUpperCase(),{font:{sz:20},al:{h:'center',v:'center',rot:255},bd:bd(r,1)}).set(r,2,b.b.toUpperCase(),{font:{sz:24},al:{h:'center',v:'center',rot:255},bd:bd(r,2)})}
   if(!t){s.set(r,3,'-',{font:{sz:24},al:C,bd:bd(r,3)}).set(r,5,'Tidak ada temuan',{font:{sz:24},al:{v:'center',wrap:1},bd:bd(r,5)});continue}
   s.set(r,3,i+1,{font:{sz:24},al:C,bd:bd(r,3)}).set(r,5,t.ket||'',{font:{sz:24},al:{v:'center',wrap:1},bd:bd(r,5)}).set(r,6,t.perb||'',{font:{sz:16},al:{v:'center',wrap:1},bd:bd(r,6)})
    .set(r,7,RL[t.r]||t.r,{font:{sz:24},al:{h:'center',v:'center',wrap:1},bd:bd(r,7)}).set(r,8,t.pic||'',{font:{sz:16},al:{h:'center',v:'center',wrap:1},bd:bd(r,8)}).set(r,9,dSlash(t.due),{font:{sz:16},al:C,bd:bd(r,9)})
    .set(r,11,String(t.status).toUpperCase(),{font:{sz:16},al:C,bd:bd(r,11)});
   const ph=(p,d,col,W)=>{if(p&&d)s.image(p.bytes,p.ext,s.leftPx(col)+Math.round((W-d.w)/2),s.topPx(r)+Math.round((s.rowPx(r)-d.h)/2),d.w,d.h)};ph(P.f,df,4,WE);ph(P.u,du,10,WK)}
  if(N>1){s.merge(R1,1,R2,1).merge(R1,2,R2,2)}
  sheets.push(s)}
 return {sheets}}
async function exportExcelDay(p5,date,dept,sg){const D=dayData(p5,date,dept);if(!D.bags.length)return alert(`Tidak ada inspeksi ${dept} pada ${dLong(date)}.`);
 XL.download(`HASIL TEMUAN ${dLong(date)} (${dept}).xlsx`,await buildExcelDay(D,sg))}
// ================= PDF =================
function svgChart(t1,t2,cats,vals,color,name){const W=470,l=82,r=14,top=50,ph=100,y0=top+ph,pw=W-l-r,gw=pw/cats.length,bw=Math.min(34,gw*.5),H=y0+88,mx=Math.max(4,Math.ceil(Math.max(...vals.filter(z=>z!=null),TARGET)+.6)),Y=v=>y0-v/mx*ph,col='#'+color;
 let s=`<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" width="430" height="${Math.round(430*H/W)}" style="border:1px solid #d9d9d9;background:#fff"><text x="${W/2}" y="20" font-size="13" font-weight="700" fill="#595959" text-anchor="middle">${esc(t1)}</text><text x="${W/2}" y="38" font-size="13" font-weight="700" fill="#595959" text-anchor="middle">${esc(t2)}</text>`;
 for(let k=0;k<=mx;k++)s+=`<line x1="${l}" x2="${W-r}" y1="${Y(k)}" y2="${Y(k)}" stroke="#e3e3e3"/><text x="${l-6}" y="${Y(k)+3}" font-size="9" fill="#595959" text-anchor="end">${cm(k)}</text>`;
 const cx=i=>l+gw*i+gw/2;
 cats.forEach((c,i)=>{const v=vals[i];if(v!=null)s+=`<rect x="${cx(i)-bw/2}" y="${Y(v)}" width="${bw}" height="${y0-Y(v)}" fill="${col}"/><text x="${cx(i)}" y="${Y(v)-4}" font-size="9" fill="#404040" text-anchor="middle">${cm(v)}</text>`;
  s+=`<text x="${cx(i)}" y="${y0+13}" font-size="9" fill="#595959" text-anchor="middle">${c}</text><text x="${cx(i)}" y="${y0+31}" font-size="9" fill="#404040" text-anchor="middle">${cm(v)}</text><text x="${cx(i)}" y="${y0+49}" font-size="9" fill="#404040" text-anchor="middle">${TARGET}</text>`});
 s+=`<polyline fill="none" stroke="#4472C4" stroke-width="2" points="${cats.map((c,i)=>cx(i)+','+Y(TARGET)).join(' ')}"/>`+cats.map((c,i)=>`<text x="${cx(i)+bw/2+3}" y="${Y(TARGET)+3}" font-size="9" fill="#404040">${TARGET}</text>`).join('');
 s+=[18,36,54].map(d=>`<line x1="${l-76}" x2="${W-r}" y1="${y0+d}" y2="${y0+d}" stroke="#d0d0d0"/>`).join('')+`<line x1="${l-76}" x2="${l-76}" y1="${y0+18}" y2="${y0+54}" stroke="#d0d0d0"/><line x1="${W-r}" x2="${W-r}" y1="${y0+18}" y2="${y0+54}" stroke="#d0d0d0"/>`+Array.from({length:cats.length+1},(_,i)=>`<line x1="${i?l+gw*i:l}" x2="${i?l+gw*i:l}" y1="${y0+18}" y2="${y0+54}" stroke="#d0d0d0"/>`).join('');
 s+=`<rect x="${l-72}" y="${y0+25}" width="8" height="8" fill="${col}"/><text x="${l-61}" y="${y0+32}" font-size="9" fill="#404040">${esc(name)}</text><line x1="${l-72}" x2="${l-64}" y1="${y0+47}" y2="${y0+47}" stroke="#4472C4" stroke-width="2"/><text x="${l-61}" y="${y0+50}" font-size="9" fill="#404040">TARGET</text>`;
 s+=`<rect x="${W/2-62}" y="${H-16}" width="8" height="8" fill="${col}"/><text x="${W/2-51}" y="${H-9}" font-size="9" fill="#595959">${esc(name)}</text><line x1="${W/2+8}" x2="${W/2+20}" y1="${H-12}" y2="${H-12}" stroke="#4472C4" stroke-width="2"/><text x="${W/2+25}" y="${H-9}" font-size="9" fill="#595959">TARGET</text></svg>`;return s}
function pdfHtml(D,sg){const n=D.bags.length,dept=D.dept.toUpperCase(),all=mean(D.bags.flatMap(b=>b.v.filter(z=>z!=null)));
 let h=`<div class="pr"><h1 class="c">HASIL SAFETY PATROL 5RK3 ${esc(dept)}</h1><div class="rt">Tanggal : ${dShort(D.date)}</div>
 <table class="gt"><tr><th></th><th>TARGET</th>${D.bags.map(b=>`<th>${esc(b.b.toUpperCase())}</th>`).join('')}<th colspan="2">AVERAGE</th></tr>${R5.map((r,i)=>`<tr><td class="l"><b>${r}</b></td><td>${TARGET}</td>${D.bags.map(b=>`<td>${cm(b.v[i])}</td>`).join('')}${i===0?`<td rowspan="6" class="ov">${cm(all)}</td>`:''}<td>${cm(mean(D.bags.map(b=>b.v[i]).filter(z=>z!=null)))}</td></tr>`).join('')}<tr><td colspan="2"><b>AVERAGE</b></td>${D.bags.map(b=>`<td>${cm(mean(b.v.filter(z=>z!=null)))}</td>`).join('')}<td></td><td></td></tr></table>
 <div class="chs">${D.bags.map(b=>svgChart('HASIL SAFETY PATROL 5RK3 ',`${b.b.toUpperCase()} ${dept}`,R5,b.v,bcx(b.b),b.b.toUpperCase())).join('')}</div>
 <div class="sig"><div><div>Dibuat oleh,</div><div class="sp"></div><div class="nm"><b><u>${esc(sg.n1)}</u></b></div><div>${esc(sg.j1)}</div></div><div><div>Menyetujui,</div><div class="sp"></div><div class="nm"><u>${esc(sg.n2)}</u></div><div>${esc(sg.j2)}</div></div></div></div>`;
 for(const b of D.bags){const N=Math.max(1,b.tm.length);
  h+=`<div class="pr pb"><table class="ft"><tr><th colspan="11" class="tt">HASIL TEMUAN PATROL 5RK3 ${esc(b.b.toUpperCase())} ${esc(dept)}</th></tr><tr><th>Departemen</th><th>Bagian</th><th>No</th><th>Temuan</th><th>Keterangan</th><th>Perbaikan</th><th class="g5">5R</th><th>PIC</th><th>Due Date</th><th>Update</th><th>Status</th></tr>`+
  (b.tm.length?b.tm.map((t,i)=>`<tr>${i===0?`<td rowspan="${N}" class="vt">${esc(D.dept.toUpperCase())}</td><td rowspan="${N}" class="vt">${esc(b.b.toUpperCase())}</td>`:''}<td class="c">${i+1}</td><td class="ph">${t.foto?`<img src="${t.foto}">`:''}</td><td>${esc(t.ket||'')}</td><td>${esc(t.perb||'')}</td><td class="c"><b>${RL[t.r]||t.r}</b></td><td>${esc(t.pic||'')}</td><td class="c">${dSlash(t.due)}</td><td class="ph">${t.upd?`<img src="${t.upd}">`:''}</td><td>${String(t.status).toUpperCase()}</td></tr>`).join(''):`<tr><td class="vt">${esc(D.dept.toUpperCase())}</td><td class="vt">${esc(b.b.toUpperCase())}</td><td class="c">-</td><td colspan="8">Tidak ada temuan</td></tr>`)+`</table></div>`}
 return h}
function exportPdfDay(p5,date,dept,sg){const D=dayData(p5,date,dept);if(!D.bags.length)return alert(`Tidak ada inspeksi ${dept} pada ${dLong(date)}.`);
 if(!document.getElementById('prStyle2'))document.head.insertAdjacentHTML('beforeend',`<style id="prStyle2">#printArea{display:none}@page{size:A4 landscape;margin:7mm}@media print{body>*:not(#printArea){display:none!important}#printArea{display:block!important}#printArea *{-webkit-print-color-adjust:exact;print-color-adjust:exact}.pb{page-break-before:always}}
 .pr{font-family:"Times New Roman",serif;color:#000;font-size:11px}.pr h1{font-size:19px;margin:0 0 4px}.pr .c{text-align:center}.pr .rt{text-align:right;font-weight:700;font-size:13px;margin-bottom:4px}
 .pr table{border-collapse:collapse;width:100%}.pr .gt{margin-bottom:8px}.pr .gt th,.pr .gt td{border:1px solid #000;padding:2px 8px;text-align:center;font-size:12px}.pr .gt td.l{text-align:left}.pr .gt .ov{font-size:15px;font-weight:700}
 .pr .chs{text-align:center;font-size:0}.pr .chs svg{display:inline-block;margin:0 4px 6px;vertical-align:top;break-inside:avoid}.pr .sig{display:flex;justify-content:space-between;margin:10px 90px 0 30px;font-size:12px;break-inside:avoid}.pr .sig .sp{height:34px}
 .pr .ft{table-layout:fixed}.pr .ft th,.pr .ft td{border:1px solid #000;padding:5px 6px;font-size:11px;vertical-align:middle;overflow-wrap:anywhere}.pr .ft .tt{font-size:20px;text-align:center;padding:10px;border-width:2px 2px 1px}.pr .ft th{text-align:center;font-size:11px}.pr .ft .g5{background:#0f0}
 .pr .ft .c{text-align:center;font-size:16px}.pr .ft .vt{writing-mode:vertical-rl;text-orientation:upright;text-align:center;font-size:15px;letter-spacing:1px;width:34px}.pr .ft .ph{text-align:center;padding:4px}.pr .ft .ph img{max-width:100%;max-height:230px;object-fit:contain}.pr .ft tr{break-inside:avoid}</style>`);
 let pa=document.getElementById('printArea');if(!pa){document.body.insertAdjacentHTML('beforeend','<div id="printArea"></div>');pa=document.getElementById('printArea')}
 pa.innerHTML=pdfHtml(D,sg);document.title=`HASIL TEMUAN ${dLong(date)} (${dept})`;window.addEventListener('afterprint',()=>{pa.innerHTML=''},{once:true});setTimeout(()=>window.print(),250)}
// ================= POPUP EXPORT =================
let EXP=null;
function openExport(kind,p5){let dg=document.getElementById('expDlg');if(!dg){document.body.insertAdjacentHTML('beforeend','<dialog id="expDlg" style="width:min(520px,94vw)"></dialog>');dg=document.getElementById('expDlg')}
 const dep=DEPTS.find(d=>p5.some(x=>AR(x.bag).d===d))||DEPTS[0];EXP={kind,p5,dept:dep,date:datesFor(p5,dep)[0]||today()};
 let sg;try{sg=JSON.parse(localStorage.getItem('she_sign'))}catch(e){}sg=sg||SIGN0;
 dg.innerHTML=`<h3 style="margin:0 0 4px">${kind==='excel'?ico('download')+' Export Excel':ico('printer')+' Export PDF'} — Hasil Temuan</h3><p style="margin:0 0 6px;color:var(--mut);font-size:12.5px">Laporan untuk <b>satu departemen</b> pada <b>satu tanggal</b> inspeksi.</p>
 <div class="grid g2" style="gap:10px"><div><label>Departemen</label><select id="exDept" onchange="expSet('dept',this.value)">${deptOpts(dep)}</select></div><div><label>Tanggal inspeksi</label><input type="date" id="exDate" value="${EXP.date}" onchange="expSet('date',this.value)"></div></div>
 <div id="exInfo" style="margin:10px 0 0;font-size:12.5px"></div>
 <div class="grid g2" style="gap:10px"><div><label>Dibuat oleh (nama)</label><input id="exN1" value="${esc(sg.n1)}"></div><div><label>Jabatan</label><input id="exJ1" value="${esc(sg.j1)}"></div><div><label>Menyetujui (nama)</label><input id="exN2" value="${esc(sg.n2)}"></div><div><label>Jabatan</label><input id="exJ2" value="${esc(sg.j2)}"></div></div>
 <div style="margin-top:18px;display:flex;gap:8px;justify-content:flex-end"><button class="btn g" onclick="expDlg.close()">Batal</button><button class="btn" id="exGo" onclick="expGo()">Export ${kind==='excel'?'Excel':'PDF'}</button></div>`;
 dg.showModal();expInfo()}
function expSet(k,v){EXP[k]=v;if(k==='dept'){EXP.date=datesFor(EXP.p5,v)[0]||EXP.date;document.getElementById('exDate').value=EXP.date}expInfo()}
function expInfo(){const D=dayData(EXP.p5,EXP.date,EXP.dept),ds=datesFor(EXP.p5,EXP.dept).slice(0,6),tm=D.bags.reduce((a,b)=>a+b.tm.length,0);
 document.getElementById('exInfo').innerHTML=(D.bags.length?`<span style="color:#23785a">${ico('check-circle')} ${D.bags.length} bagian diinspeksi (${D.bags.map(b=>esc(b.b)).join(', ')}) · ${tm} temuan</span>`:`<span style="color:var(--bad)">${ico('alert')} Tidak ada inspeksi ${esc(EXP.dept)} pada tanggal ini.</span>`)+(ds.length?`<div style="margin-top:6px;color:var(--mut)">Tanggal tersedia: ${ds.map(d=>`<button class="btn g s" style="margin:2px" onclick="expSet('date','${d}');document.getElementById('exDate').value='${d}'">${dShort(d)}</button>`).join('')}</div>`:'<div style="margin-top:6px;color:var(--mut)">Belum ada data inspeksi untuk departemen ini.</div>')}
async function expGo(){const sg={n1:exN1.value,j1:exJ1.value,n2:exN2.value,j2:exJ2.value};try{localStorage.setItem('she_sign',JSON.stringify(sg))}catch(e){}
 const D=dayData(EXP.p5,EXP.date,EXP.dept);if(!D.bags.length)return alert(`Tidak ada inspeksi ${EXP.dept} pada ${dLong(EXP.date)}.`);
 const b=document.getElementById('exGo');b.disabled=true;b.textContent='Memproses…';
 try{if(EXP.kind==='excel')await exportExcelDay(EXP.p5,EXP.date,EXP.dept,sg);else exportPdfDay(EXP.p5,EXP.date,EXP.dept,sg);document.getElementById('expDlg').close()}catch(e){console.error(e);alert('Gagal membuat file: '+e.message)}finally{b.disabled=false;b.textContent='Export '+(EXP.kind==='excel'?'Excel':'PDF')}}
