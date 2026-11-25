const ROOT=location.pathname.includes('/pages/')?'../':'';
const DB_KEY='she_db_v3',SES='she_session';
function applyTpl(d){for(const k in (d.tpl||{}))if(TPL[k])TPL[k].g=d.tpl[k]}
function load(){let d=localStorage.getItem(DB_KEY);if(!d){localStorage.setItem(DB_KEY,JSON.stringify(SEED));d=localStorage.getItem(DB_KEY)}d=JSON.parse(d);
 if((d.v||0)<4){d.users=SEED.users;d.tpl=d.tpl||{};d.v=4;localStorage.setItem(DB_KEY,JSON.stringify(d))}
 applyTpl(d);return d}
function save(d){try{localStorage.setItem(DB_KEY,JSON.stringify(d));return true}catch(e){alert('Penyimpanan browser penuh. Hapus data lama / reset demo.');return false}}
function resetDemo(){localStorage.removeItem(DB_KEY);location.reload()}
const ROLE_LBL={admin:'Admin SHE',superadmin:'Admin SHE',karyawan:'Karyawan SHE'};
const isAdmin=()=>{const u=me();return !!u&&(u.role==='admin'||u.role==='superadmin')};
function guardAdmin(){if(!isAdmin()){alert('Halaman ini hanya untuk Admin SHE.');location.href=ROOT+'launcher.html'}}
function me(){return JSON.parse(sessionStorage.getItem(SES)||'null')}
function guard(){if(!me())location.href=ROOT+'index.html'}
function logout(){sessionStorage.removeItem(SES);location.href=ROOT+'index.html'}
function uid(){return 'x'+Date.now().toString(36)+Math.random().toString(36).slice(2,5)}
const esc=s=>String(s??'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
function topbar(title,back){const u=me(),ini=(u.nama||'?').trim().split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase();
 document.body.insertAdjacentHTML('afterbegin',`<header class="top"><div class="top-in">${back?`<a href="${ROOT}launcher.html" class="btn g s" title="Kembali ke daftar Apps">${ico('arrow-left')}<span class="hide-m">Apps</span></a>`:''}<a class="brand" href="${ROOT}launcher.html" title="Beranda"><span class="lg">${ico('shield-check')}</span><span class="bt"><b>SHE</b><small>New Armada</small></span></a><span class="sep"></span><h1>${title}</h1><div class="usr"><span class="av">${esc(ini)}</span><span class="un">${esc(u.nama)}<small>${ROLE_LBL[u.role]||u.role}</small></span></div>${typeof themeBtn==='function'?themeBtn():''}<button class="btn g s" onclick="logout()" title="Keluar">${ico('log-out')}<span class="hide-m">Keluar</span></button></div></header>`)}
function readPhoto(file){return new Promise(r=>{const img=new Image(),fr=new FileReader();fr.onload=()=>{img.onload=()=>{const s=Math.min(1,720/img.width),c=document.createElement('canvas');c.width=img.width*s;c.height=img.height*s;c.getContext('2d').drawImage(img,0,0,c.width,c.height);r(c.toDataURL('image/jpeg',.7))};img.src=fr.result};fr.readAsDataURL(file)})}
function bigPhoto(src){let d=document.getElementById('bigdlg');if(!d){document.body.insertAdjacentHTML('beforeend','<dialog id="bigdlg" onclick="this.close()" style="width:min(760px,95vw)"><img id="bigimg" style="width:100%;border-radius:10px"></dialog>');d=document.getElementById('bigdlg')}document.getElementById('bigimg').src=src;d.showModal()}
// form generik (pohon poin/sub-poin/pertanyaan): node {id,t,ch?}
function flat(n,p=[]){return n.flatMap(x=>x.ch?flat(x.ch,[...p,x.t]):[{id:x.id,t:x.t,path:p}])}
function calcG(F,ans){const g={},all=[];flat(F.tree).forEach(i=>{const v=ans[i.id];if(v==null)return;const n=F.scale==='ng'?(v==='G'?1:0):+v;all.push(n);const k=i.path[0]||'Umum';(g[k]=g[k]||[]).push(n)});
 const groups={};for(const k in g)groups[k]=mean(g[k]);return {groups,overall:mean(all)||0}}
const fmtG=(F,v)=>F.scale==='ng'?Math.round(v*100)+'%':v.toFixed(2);
const isFind=(F,v)=>F.scale==='ng'?v==='NG':(+v<=(F.threshold||3));

const AR=id=>AREAS.find(a=>a.id===id)||{n:id||'-',d:'-',b:'-',f:'umum'};
// bar chart VERTIKAL (dipakai semua modul). o: {max,step,fmt,yfmt}
function vbar(cats,series,o={}){const max=o.max||5,step=o.step||1,fm=o.fmt||(v=>v.toFixed(1)),yf=o.yfmt||(y=>y),n=cats.length,W=Math.max(760,n*(series.length*22+26)+60),H=310,l=44,b=n>7?64:38,t=18,pw=W-l-10,ph_=H-t-b,gw=pw/n,bw=Math.min(30,(gw-14)/series.length);
 let s=`<div class="tw"><svg viewBox="0 0 ${W} ${H}" style="width:100%;min-width:${Math.min(W,n*58)}px;height:auto">`;
 for(let y=0;y<=max;y+=step){const yy=t+ph_-y/max*ph_;s+=`<line x1="${l}" x2="${W-10}" y1="${yy}" y2="${yy}" stroke="#e8eef8"/><text x="${l-7}" y="${yy+4}" font-size="11" text-anchor="end" fill="#7a88a3">${yf(y)}</text>`}
 cats.forEach((c,i)=>{const x0=l+i*gw+(gw-bw*series.length)/2,cx=l+i*gw+gw/2,lb=c.length>24?c.slice(0,23)+'…':c;
  series.forEach((se,j)=>{const v=se.values[i];if(v==null)return;const h=Math.max(0,v/max*ph_);s+=`<rect x="${x0+j*bw}" y="${t+ph_-h}" width="${bw-3}" height="${h}" rx="4" fill="${o.colors?o.colors[i]:se.color}"><title>${esc(se.name)}: ${fm(v)}</title></rect><text x="${x0+j*bw+(bw-3)/2}" y="${t+ph_-h-4}" font-size="10" text-anchor="middle" fill="#46587a">${fm(v)}</text>`});
  s+=n>7?`<text transform="rotate(-30 ${cx} ${H-b+16})" x="${cx}" y="${H-b+16}" font-size="11" text-anchor="end" fill="#2a3a5c"><title>${esc(c)}</title>${esc(lb)}</text>`:`<text x="${cx}" y="${H-12}" font-size="12" text-anchor="middle" font-weight="650" fill="#2a3a5c">${esc(lb)}</text>`});
 s+='</svg></div>';if(series.length>1)s+='<div class="leg">'+series.map(se=>`<span><i style="background:${se.color}"></i>${esc(se.name)}</span>`).join('')+'</div>';return s}
