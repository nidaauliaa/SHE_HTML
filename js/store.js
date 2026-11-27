const DB_KEY = 'she_db_v3';
let ACTIVE_DB = null;
function getAreas(data) {
    const source = data || ACTIVE_DB;
    return source && Array.isArray(source.areaMaster) ? source.areaMaster : AREAS;
}
function getDepts(data) {
    return [...new Set([...DEPTS, ...getAreas(data).map(area => area.d).filter(Boolean)])];
}
function applyTpl(d) { for (const k in (d.tpl || {})) if (TPL[k]) TPL[k].g = d.tpl[k] }
function migrateFindingStatus(finding) {
    if (!Array.isArray(finding.history)) finding.history = [];
    if (finding.status === 'closed') {
        finding.status = 'selesai';
        finding.history.push({ by: 'Migrasi sistem', at: new Date().toISOString(), change: 'Status lama closed dipetakan menjadi selesai.' });
    } else if (!finding.status) {
        finding.status = 'open';
        finding.history.push({ by: 'Migrasi sistem', at: new Date().toISOString(), change: 'Status awal: open.' });
    } else if (!finding.history.length) {
        finding.history.push({ by: 'Migrasi sistem', at: new Date().toISOString(), change: `Status awal: ${finding.status}.` });
    }
}
function load() {
    let d = SHEStorage.getJSON(DB_KEY);
    if (!d) { SHEStorage.setJSON(DB_KEY, SEED); d = SHEStorage.getJSON(DB_KEY) }
    let changed = false;
    if ((d.v || 0) < 4) { d.users = SEED.users; d.tpl = d.tpl || {}; d.v = 4; changed = true }
    if ((d.v || 0) < 5) {
        d.users = (d.users || []).map(user => {
            let roles = normalizeRoles(user);
            if (!Array.isArray(user.roles) && user.role === 'karyawan' && user.divisi === 'APAR') roles = ['petugas_apar'];
            return {
                ...user,
                roles,
                role: roles[0] || '',
                scope: {
                    ...(user.scope || {}),
                    aparAreaIds: Array.isArray(user.scope && user.scope.aparAreaIds) ? [...new Set(user.scope.aparAreaIds)] : [],
                    patrolAreaIds: Array.isArray(user.scope && user.scope.patrolAreaIds) ? [...new Set(user.scope.patrolAreaIds)] : [],
                    picAreaIds: Array.isArray(user.scope && user.scope.picAreaIds) ? [...new Set(user.scope.picAreaIds)] : []
                }
            }
        });
        const pics = d.areaPics || {};
        Object.keys(pics).forEach(areaId => {
            const user = d.users.find(item => item.nik === pics[areaId] || item.nama === pics[areaId]);
            if (user && user.roles.includes('pic_area')) pics[areaId] = user.nik;
        });
        d.users.filter(user => user.roles.includes('pic_area')).forEach(user => {
            user.scope.picAreaIds = Object.keys(pics).filter(areaId => pics[areaId] === user.nik);
        });
        d.areaPics = pics;
        (d.p5 || []).forEach(patrol => (patrol.tm || []).forEach(migrateFindingStatus));
        (d.inspections || []).forEach(inspection => (inspection.tm || []).forEach(migrateFindingStatus));
        d.v = 5;
        changed = true;
    }
    if ((d.v || 0) < 6) {
        d.users = (d.users || []).map(user => {
            const account = { ...user, roles: normalizeRoles(user) };
            account.role = account.roles[0] || '';
            account.scope = {
                ...(account.scope || {}),
                aparAreaIds: Array.isArray(account.scope && account.scope.aparAreaIds) ? [...new Set(account.scope.aparAreaIds)] : [],
                patrolAreaIds: Array.isArray(account.scope && account.scope.patrolAreaIds) ? [...new Set(account.scope.patrolAreaIds)] : [],
                picAreaIds: Array.isArray(account.scope && account.scope.picAreaIds) ? [...new Set(account.scope.picAreaIds)] : []
            };
            if (!account.passwordHash && typeof account.pass === 'string') account.passwordHash = hashPassword(account.pass);
            delete account.pass;
            return account;
        });
        SEED.users.forEach(seedUser => {
            if (!d.users.some(user => user.nik === seedUser.nik)) d.users.push(JSON.parse(JSON.stringify(seedUser)));
        });
        d.v = 6;
        changed = true;
    }
    if ((d.v || 0) < 7) {
        d.users = (d.users || []).map(user => ({ ...user, username: String(user.username || user.nik || '') }));
        d.areaMaster = Array.isArray(d.areaMaster) ? d.areaMaster : AREAS.map(area => ({ ...area }));
        d.areaPics = d.areaPics || {};
        d.users.filter(user => normalizeRoles(user).includes('pic_area')).forEach(user => {
            user.scope = user.scope || { aparAreaIds: [], patrolAreaIds: [], picAreaIds: [] };
            user.scope.picAreaIds = Object.keys(d.areaPics).filter(areaId => d.areaPics[areaId] === user.nik);
        });
        d.v = 7;
        changed = true;
    }
    if ((d.v || 0) < 8) {
        (d.p5 || []).forEach(patrol => (patrol.tm || []).forEach(migrateFindingStatus));
        (d.inspections || []).forEach(inspection => (inspection.tm || []).forEach(migrateFindingStatus));
        d.v = 8;
        changed = true;
    }
    if ((d.v || 0) < 9) {
        d.users = d.users || [];
        SEED.users.forEach(seedUser => {
            if (!d.users.some(user => user.nik === seedUser.nik)) d.users.push(JSON.parse(JSON.stringify(seedUser)));
        });
        d.users = d.users.map(user => {
            const account = { ...user, roles: normalizeRoles(user) };
            account.role = account.roles[0] || '';
            account.username = String(account.username || account.nik || '');
            account.scope = {
                ...(account.scope || {}),
                aparAreaIds: Array.isArray(account.scope && account.scope.aparAreaIds) ? [...new Set(account.scope.aparAreaIds)] : [],
                patrolAreaIds: Array.isArray(account.scope && account.scope.patrolAreaIds) ? [...new Set(account.scope.patrolAreaIds)] : [],
                picAreaIds: Array.isArray(account.scope && account.scope.picAreaIds) ? [...new Set(account.scope.picAreaIds)] : []
            };
            if (!account.passwordHash && typeof account.pass === 'string') account.passwordHash = hashPassword(account.pass);
            delete account.pass;
            return account;
        });
        d.v = 9;
        changed = true;
    }
    if ((d.v || 0) < 10) {
        const validModuleIds = new Set((d.forms || []).map(form => form.id));
        d.users = (d.users || []).map(user => {
            const account = { ...user };
            if (!Array.isArray(account.moduleIds)) {
                const canAccessCustomModules = normalizeRoles(account).some(role => ['petugas_she', 'supervisor'].includes(role));
                account.moduleIds = canAccessCustomModules ? [...validModuleIds] : [];
            } else {
                account.moduleIds = [...new Set(account.moduleIds.filter(id => validModuleIds.has(id)))];
            }
            return account;
        });
        d.v = 10;
        changed = true;
    }
    if (changed) SHEStorage.setJSON(DB_KEY, d);
    applyTpl(d);
    ACTIVE_DB = d;
    return d
}
function save(d) {
    try { SHEStorage.setJSON(DB_KEY, d); ACTIVE_DB = d; return true }
    catch (e) { alert('Penyimpanan browser penuh. Hapus data lama / reset demo.'); return false }
}
function resetDemo() { SHEStorage.removeItem(DB_KEY); location.reload() }
function uid() { return 'x' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5) }
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
function topbar(title, back) { const u = me(); document.body.insertAdjacentHTML('afterbegin', `<div class="top">${back ? `<a href="${ROOT}launcher.html" class="btn g s">← Apps</a>` : ''}<div class="top-brand"><img class="top-brand-logo" src="${ROOT}assets/she-logo.svg" alt="Logo SHE"><h1>${title}</h1></div><span class="u">${u.nama} · ${u.roles.map(role => ROLE_LABELS[role] || role).join(', ')}</span>${themeToggleButton()}<button class="btn g s" onclick="logout()">Keluar</button></div>`) }
const tmPhotos = t => Array.isArray(t.fotos) ? t.fotos.filter(Boolean) : t.foto ? [t.foto] : [];
const tmUpdatePhotos = t => Array.isArray(t.upds) && t.upds.length ? t.upds.filter(Boolean) : t.upd ? [t.upd] : [];
function readPhoto(file) {
  return new Promise((resolve, reject) => {
    const img = new Image(), fr = new FileReader();
    fr.onerror = () => reject(new Error('File gambar gagal dibaca.'));
    img.onerror = () => reject(new Error('File tidak dapat dibuka sebagai gambar.'));
    fr.onload = () => {
      if (typeof fr.result !== 'string') return reject(new Error('File gambar tidak valid.'));
      img.onload = () => {
        try {
          const s = Math.min(1, 720 / img.width), c = document.createElement('canvas');
          c.width = img.width * s; c.height = img.height * s;
          const context = c.getContext('2d');
          if (!context) return reject(new Error('Browser tidak dapat memproses gambar.'));
          context.drawImage(img, 0, 0, c.width, c.height);
          resolve(c.toDataURL('image/jpeg', .7));
        } catch (e) { reject(e); }
      };
      img.src = fr.result;
    };
    fr.readAsDataURL(file);
  });
}
function bigPhoto(src) { let d = document.getElementById('bigdlg'); if (!d) { document.body.insertAdjacentHTML('beforeend', '<dialog id="bigdlg" onclick="this.close()" style="width:min(760px,95vw)"><img id="bigimg" style="width:100%;border-radius:10px"></dialog>'); d = document.getElementById('bigdlg') } document.getElementById('bigimg').src = src; d.showModal() }
// form generik (pohon poin/sub-poin/pertanyaan): node {id,t,ch?}
function flat(n, p = []) { return n.flatMap(x => x.ch ? flat(x.ch, [...p, x.t]) : [{ id: x.id, t: x.t, path: p }]) }
function calcG(F, ans) {
    const g = {}, all = []; flat(F.tree).forEach(i => { const v = ans[i.id]; if (v == null) return; const n = F.scale === 'ng' ? (v === 'G' ? 1 : 0) : +v; all.push(n); const k = i.path[0] || 'Umum'; (g[k] = g[k] || []).push(n) });
    const groups = {}; for (const k in g) groups[k] = mean(g[k]); return { groups, overall: mean(all) || 0 }
}
const fmtG = (F, v) => F.scale === 'ng' ? Math.round(v * 100) + '%' : v.toFixed(2);
const isFind = (F, v) => F.scale === 'ng' ? v === 'NG' : (+v <= (F.threshold || 3));

const AR = id => getAreas().find(a => a.id === id) || { n: id || '-', d: '-', b: '-', f: 'umum' };
// bar chart VERTIKAL (dipakai semua modul). o: {max,step,fmt,yfmt}
const BAR_PALETTE = [
    { fade: '#f2f6fd', base: '#648acb' },
    { fade: '#f1f8f6', base: '#6fa99a' },
    { fade: '#f5f4fa', base: '#8983bd' },
    { fade: '#f4f6f9', base: '#8292a8' },
    { fade: '#f2f8fa', base: '#6f9fb4' },
    { fade: '#f6f8f1', base: '#91a477' },
    { fade: '#faf5f8', base: '#b085a0' },
    { fade: '#faf8f3', base: '#b49a70' }
];
let barChartSequence = 0;
function vbar(cats, series, o = {}) {
    const max = o.max || 5, step = o.step || 1, fm = o.fmt || (v => v.toFixed(1)), yf = o.yfmt || (y => y), n = cats.length, W = Math.max(760, n * (series.length * 22 + 26) + 60), H = 310, l = 44, b = n > 7 ? 64 : 38, t = 18, pw = W - l - 10, ph_ = H - t - b, gw = pw / n, bw = Math.min(30, (gw - 14) / series.length), chartId = ++barChartSequence;
    let s = `<div class="tw"><svg viewBox="0 0 ${W} ${H}" style="width:100%;min-width:${Math.min(W, n * 58)}px;height:auto"><defs>${series.map((_, j) => { const c = BAR_PALETTE[j % BAR_PALETTE.length]; return `<linearGradient id="bar-${chartId}-${j}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${c.base}"/><stop offset="100%" stop-color="${c.fade}"/></linearGradient>` }).join('')}</defs>`;
    for (let y = 0; y <= max; y += step) { const yy = t + ph_ - y / max * ph_; s += `<line x1="${l}" x2="${W - 10}" y1="${yy}" y2="${yy}" stroke="#e6ebf4"/><text x="${l - 7}" y="${yy + 4}" font-size="11" text-anchor="end" fill="#8492a6">${yf(y)}</text>` }
    cats.forEach((c, i) => {
        const x0 = l + i * gw + (gw - bw * series.length) / 2, cx = l + i * gw + gw / 2, lb = c.length > 24 ? c.slice(0, 23) + '…' : c;
        series.forEach((se, j) => { const v = se.values[i]; if (v == null) return; const h = Math.max(0, v / max * ph_); s += `<rect x="${x0 + j * bw}" y="${t + ph_ - h}" width="${bw - 3}" height="${h}" rx="4" fill="url(#bar-${chartId}-${j})"><title>${esc(se.name)}: ${fm(v)}</title></rect><text x="${x0 + j * bw + (bw - 3) / 2}" y="${t + ph_ - h - 4}" font-size="10" text-anchor="middle" fill="#4a5a73">${fm(v)}</text>` });
        s += n > 7 ? `<text transform="rotate(-30 ${cx} ${H - b + 16})" x="${cx}" y="${H - b + 16}" font-size="11" text-anchor="end" fill="#33435c"><title>${esc(c)}</title>${esc(lb)}</text>` : `<text x="${cx}" y="${H - 12}" font-size="12" text-anchor="middle" font-weight="650" fill="#33435c">${esc(lb)}</text>`
    });
    s += '</svg></div>'; if (series.length > 1) s += '<div class="leg">' + series.map((se, j) => `<span><i style="background:${BAR_PALETTE[j % BAR_PALETTE.length].base}"></i>${esc(se.name)}</span>`).join('') + '</div>'; return s
}
