// ===== Komponen bersama: filter, form input (skala + temuan), tab Temuan =====
const today = () => new Date().toISOString().slice(0, 10);
const ML = m => new Date(m + '-01').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
const od = t => ['open', 'diproses'].includes(t.status) && t.due && t.due < today();
const odDays = t => Math.floor((new Date(today()) - new Date(t.due)) / 864e5);
const deptOpts = (sel, ph) => (ph != null ? `<option value="">${ph}</option>` : '') + getDepts().map(d => `<option ${d === sel ? 'selected' : ''}>${esc(d)}</option>`).join('');
const bagOpts = (d, sel, ph) => (ph != null ? `<option value="">${ph}</option>` : '') + getAreas().filter(a => !d || a.d === d).map(a => `<option value="${esc(a.id)}" ${a.id === sel ? 'selected' : ''}>${esc(a.b)}${d ? '' : ' · ' + esc(a.d)}</option>`).join('');
const fmatch = (f, x) => (!f.from || x.date >= f.from) && (!f.to || x.date <= f.to) && (!f.dept || AR(x.bag).d === f.dept) && (!f.bag || x.bag === f.bag);
// kartu filter: f=objek state, n=nama variabelnya, cb=kode rerender
function fbar(f, n, cb, o = {}) {
  const z = {}; Object.keys(f).forEach(k => z[k] = '');
  const areas = o.areas || getAreas(), depts = [...new Set(areas.map(area => area.d))],
        deptOptions = (o.areas ? depts.map(d => `<option ${d === f.dept ? 'selected' : ''}>${esc(d)}</option>`).join('') : deptOpts(f.dept)),
        bagOptions = (o.areas ? areas.filter(area => !f.dept || area.d === f.dept).map(area => `<option value="${esc(area.id)}" ${area.id === f.bag ? 'selected' : ''}>${esc(area.b)}${f.dept ? '' : ' · ' + esc(area.d)}</option>`).join('') : bagOpts(f.dept, f.bag));
  return `<div class="card"><div class="grid g4">${o.dates ? `<div><label>Dari tanggal</label><input type="date" value="${f.from || ''}" onchange="${n}.from=this.value;${cb}"></div><div><label>Sampai tanggal</label><input type="date" value="${f.to || ''}" onchange="${n}.to=this.value;${cb}"></div>` : ''}<div><label>Departemen</label><select onchange="${n}.dept=this.value;${n}.bag='';${cb}"><option value="">Semua departemen</option>${deptOptions}</select></div><div><label>Bagian</label><select onchange="${n}.bag=this.value;${cb}"><option value="">Semua bagian</option>${bagOptions}</select></div>${o.extra || ''}</div><div style="margin-top:12px"><button class="btn g s" onclick="Object.assign(${n},${JSON.stringify(z).replace(/"/g, '&quot;')});${cb}">Reset filter</button></div></div>`
}
// ---- form input: skala di kanan pertanyaan + tombol temuan (halaman mendefinisikan: dr, lowFn, grpOf, qText, sum)
const SCL = ['Sangat Kurang', 'Kurang', 'Cukup', 'Bagus', 'Sangat Bagus'];
function qrow(id, lb, txt, st) {
  const cur = dr.sc[id];
  const o = st === 'ng' ? [['G', 'Good', 'sg'], ['NG', 'Not Good', 'sn']].map(([v, l, c]) => `<label><input type="radio" name="${id}" ${cur === v ? 'checked' : ''} onchange="setSc('${id}','${v}')"><span class="${c} wd">${l}</span></label>`).join('') : [1, 2, 3, 4, 5].map(n => `<label title="${SCL[n - 1]}"><input type="radio" name="${id}" ${cur === n ? 'checked' : ''} onchange="setSc('${id}',${n})"><span class="s${n}">${n}</span></label>`).join('');
  return `<div class="q"><div class="qr"><p><b>${lb}</b> ${txt}</p><div class="scale">${o}</div><button class="btn g s" onclick="addTm('${id}')">📷 Temuan</button></div><div id="tm_${id}"></div></div>`
}
function setSc(id, val) { dr.sc[id] = val; if (lowFn(val) && !dr.tm.some(t => t.q === id)) addTm(id); else tmq(id); sum() }
function addTm(id) { dr.tm.push({ id: uid(), q: id, r: grpOf(id), ket: '', perb: '', pic: '', due: '', fotos: [] }); tmq(id) }
const tf = (id, k, val) => { dr.tm.find(t => t.id === id)[k] = val };
function rmTm(id) { const t = dr.tm.find(z => z.id === id); dr.tm = dr.tm.filter(z => z.id !== id); tmq(t.q) }
const MAX_FINDING_IMAGE_BYTES = 5 * 1024 * 1024;
function imageFileError(files) {
  if (files.some(file => !file.type || !file.type.startsWith('image/'))) return 'Pilih file gambar dengan tipe yang didukung.';
  if (files.some(file => file.size > MAX_FINDING_IMAGE_BYTES)) return 'Ukuran setiap gambar maksimal 5 MB.';
  return '';
}
async function tp(id, el) {
  const files = Array.from(el.files || []);
  el.value = '';
  if (!files.length) return;
  const error = imageFileError(files);
  if (error) return alert(error);
  const t = dr.tm.find(z => z.id === id);
  try {
    t.fotos = tmPhotos(t).concat(await Promise.all(files.map(readPhoto)));
    delete t.foto;
    tmq(t.q);
  } catch (e) { alert(e.message || 'Gagal memuat gambar.'); }
}
function rmTmPhoto(id, index) {
  const t = dr.tm.find(z => z.id === id), photos = tmPhotos(t).slice();
  photos.splice(index, 1);
  t.fotos = photos;
  delete t.foto;
  tmq(t.q);
}
function tmq(id) {
  const e = document.getElementById('tm_' + id); if (!e) return; const need = lowFn(dr.sc[id]);
  e.innerHTML = dr.tm.filter(t => t.q === id).map(t => `<div class="find"><div class="tmg">
    <div><small>Foto temuan${need ? ' (wajib)' : ''}</small><input type="file" accept="image/*" multiple onchange="tp('${t.id}',this)">
      <div class="photo-gallery">${tmPhotos(t).map((src, i) => `<div class="photo-item"><img class="thumb" src="${src}" onclick="bigPhoto(this.src)"><button class="btn r s" onclick="rmTmPhoto('${t.id}',${i})" aria-label="Hapus foto">×</button></div>`).join('')}</div>
    </div><div><small>Keterangan temuan (wajib)</small><input placeholder="Temuannya apa? mis. APAR tertutup pintu" value="${esc(t.ket)}" oninput="tf('${t.id}','ket',this.value)"></div>
    <input placeholder="Rencana perbaikan" value="${esc(t.perb)}" oninput="tf('${t.id}','perb',this.value)"><input placeholder="PIC" value="${esc(t.pic)}" oninput="tf('${t.id}','pic',this.value)"><input type="date" value="${t.due}" onchange="tf('${t.id}','due',this.value)"><button class="btn r s" onclick="rmTm('${t.id}')">×</button>
  </div></div>`).join('')
}
// validasi: nilai rendah wajib temuan berfoto. return pesan error / null
function chkTm(ids, txt) {
  for (const id of ids) if (lowFn(dr.sc[id])) {
    const L = dr.tm.filter(t => t.q === id); if (!L.length) return 'Nilai rendah wajib ada temuan (foto + keterangan):\n' + txt(id);
    if (L.some(t => !tmPhotos(t).length)) return 'Foto temuan wajib diisi untuk butir:\n' + txt(id); if (L.some(t => !(t.ket || '').trim())) return 'Keterangan temuan wajib diisi (tulis temuannya apa) untuk butir:\n' + txt(id)
  }
  if (dr.tm.some(t => !tmPhotos(t).length)) return 'Setiap temuan wajib disertai foto.'; return dr.tm.some(t => !(t.ket || '').trim()) ? 'Setiap temuan wajib disertai keterangan temuan.' : null
}
const packTm = () => dr.tm.map(t => ({ id: t.id, r: t.r, q: qText(t.q), ket: t.ket, perb: t.perb, pic: t.pic, due: t.due, fotos: tmPhotos(t), upds: [], status: 'open', history: [{ by: me().nama, at: new Date().toISOString(), change: 'Status awal: open.' }] }));
// ---- tab Temuan (dipakai Patrol 5R & modul lain). c:{el,get:()=>[{x,t}],grp,save,redo}
let tfl = { dept: '', bag: '', m: '', st: '' }, TMC = null, cur = null;
const FINDING_STATUS_LABEL = { open: 'Open', diproses: 'Diproses', selesai: 'Selesai', terverifikasi: 'Terverifikasi' };
const findingDateValid = value => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '');
  if (!value) return true;
  if (!match) return false;
  const date = new Date(+match[1], +match[2] - 1, +match[3]);
  return date.getFullYear() === +match[1] && date.getMonth() === +match[2] - 1 && date.getDate() === +match[3];
};
const findingHistoryRow = entry => `<tr><td>${new Date(entry.at).toLocaleString('id-ID')}</td><td>${esc(entry.by)}</td><td>${esc(entry.change)}</td></tr>`;
function temuanTab(c) {
  TMC = c; const all = c.get().filter(r => canViewData(me(), r.x, 'patrol5r', c.data)), ms = [...new Set(all.map(r => r.x.date.slice(0, 7)))].sort(), nOd = all.filter(r => od(r.t)).length;
  const R = all.filter(({ x, t }) => (!tfl.dept || AR(x.bag).d === tfl.dept) && (!tfl.bag || x.bag === tfl.bag) && (!tfl.m || x.date.slice(0, 7) === tfl.m) && (!tfl.st || (tfl.st === 'overdue' ? od(t) : t.status === tfl.st))).sort((a, b) => b.x.date.localeCompare(a.x.date));
  const ex = `<div><label>Periode</label><select onchange="tfl.m=this.value;TMC.redo()"><option value="">Semua periode</option>${ms.map(m => `<option value="${m}" ${m === tfl.m ? 'selected' : ''}>${ML(m)}</option>`).join('')}</select></div><div><label>Status</label><select onchange="tfl.st=this.value;TMC.redo()">${[['', 'Semua status'], ['open', 'Open'], ['diproses', 'Diproses'], ['selesai', 'Selesai'], ['terverifikasi', 'Terverifikasi'], ['overdue', '⚠ Overdue']].map(([v, l]) => `<option value="${v}" ${v === tfl.st ? 'selected' : ''}>${l}</option>`).join('')}</select></div>`;
  c.el.innerHTML = (nOd ? `<div class="alertbar">⚠ <b>${nOd}</b> temuan masih open dan melewati due date <button class="btn s r" onclick="tfl.st='overdue';TMC.redo()">Tampilkan</button></div>` : '') + fbar(tfl, 'tfl', 'TMC.redo()', { extra: ex, areas: c.areas }) +
    `<div class="card tw"><table><tr><th>Dept</th><th>Bagian</th><th>Temuan (foto)</th><th>Keterangan</th><th>Perbaikan</th><th>${c.grp}</th><th>PIC</th><th>Due date</th><th>Update (foto)</th><th>Status</th><th>Aksi</th></tr>${R.map(({ x, t }) => {
      const finding = { x, t }, actions = [
        canUpdateFinding(me(), finding, c.data) && ['open', 'diproses'].includes(t.status) ? `<button class="btn g s" onclick="ed('${t.id}')">Update</button>` : '',
        canVerifyFinding(me(), finding, c.data) && t.status === 'selesai' ? `<button class="btn s" onclick="verifyFinding('${t.id}')">Verifikasi</button>` : ''
      ].filter(Boolean).join(' ');
      return `<tr class="${od(t) ? 'odr' : ''}"><td>${AR(x.bag).d}</td><td>${AR(x.bag).b}<br><small style="color:var(--mut)">${x.date}</small></td><td><div class="photo-gallery compact">${tmPhotos(t).map(src => `<img class="thumb" src="${src}" onclick="bigPhoto(this.src)">`).join('')}</div></td><td>${t.ket ? esc(t.ket) : '-'}</td><td>${esc(t.perb)}</td><td><span class="chip chipw">${esc(t.r)}</span></td><td>${esc(t.pic)}</td><td class="${od(t) ? 'late' : ''}">${t.due || '-'}${od(t) ? `<br><span class="pill open">OVERDUE ${odDays(t)} hari</span>` : ''}</td><td><div class="photo-gallery compact">${tmUpdatePhotos(t).map(src => `<img class="thumb" src="${src}" onclick="bigPhoto(this.src)">`).join('') || '-'}</div></td><td><span class="pill ${t.status}">${FINDING_STATUS_LABEL[t.status] || esc(t.status)}</span></td><td><button class="btn g s" onclick="viewFindingHistory('${t.id}')">Riwayat</button> ${actions}</td></tr>`;
    }).join('') || '<tr><td colspan=11>Belum ada temuan</td></tr>'}</table></div>`
}
function ed(id) {
  const record = TMC.get().find(r => r.t.id === id);
  if (!record || !['open', 'diproses'].includes(record.t.status) || !canUpdateFinding(me(), record, TMC.data)) return alert('Akses ditolak');
  const t = record.t; cur = t; draftUpdatePhotos = tmUpdatePhotos(t).slice();
  curSnapshot = { perb: t.perb, pic: t.pic, due: t.due, upds: draftUpdatePhotos.slice(), status: t.status, history: [...(t.history || [])] };
  let dg = document.getElementById('dg'); if (!dg) { document.body.insertAdjacentHTML('beforeend', '<dialog id="dg"></dialog>'); dg = document.getElementById('dg') }
  const nextStatus = { open: 'diproses', diproses: 'selesai' }[t.status];
  dg.innerHTML = `<h3 style="margin-top:0">Update temuan</h3><label>Rencana perbaikan</label><input id="e1" value="${esc(t.perb)}"><label>PIC</label><input id="e2" value="${esc(t.pic)}"><label>Due date</label><input type="date" id="e3" value="${t.due || ''}"><label>Foto perbaikan (wajib saat menandai selesai)</label><input type="file" accept="image/*" multiple onchange="epk(this)"><div id="e4" class="photo-gallery"></div><label>Status</label><select id="e5"><option value="${t.status}" selected>${FINDING_STATUS_LABEL[t.status] || esc(t.status)}</option>${nextStatus ? `<option value="${nextStatus}">${FINDING_STATUS_LABEL[nextStatus]}</option>` : ''}</select><div style="margin-top:16px;display:flex;gap:8px;justify-content:flex-end"><button class="btn g" onclick="dg.close()">Batal</button><button class="btn" onclick="es()">Simpan</button></div>`;
  dg.showModal(); updatePhotoPreview();
}
let curSnapshot = null, draftUpdatePhotos = [];
function editableCurrentFinding() {
  if (!cur || !TMC) return null;
  const record = TMC.get().find(row => row.t.id === cur.id);
  return record && record.t === cur && ['open', 'diproses'].includes(cur.status) && canUpdateFinding(me(), record, TMC.data) ? record : null;
}
function updatePhotoPreview() {
  const host = document.getElementById('e4');
  if (!host) return;
  host.innerHTML = draftUpdatePhotos.map((src, index) => `<div class="photo-item"><img class="thumb" src="${src}" onclick="bigPhoto(this.src)"><button class="btn r s" onclick="rmUpdatePhoto(${index})" aria-label="Hapus foto perbaikan">×</button></div>`).join('');
}
async function epk(el) {
  if (!editableCurrentFinding()) { el.value = ''; return alert('Akses ditolak'); }
  const files = Array.from(el.files || []);
  el.value = '';
  if (!files.length) return;
  const error = imageFileError(files);
  if (error) { el.value = ''; return alert(error); }
  try {
    const photos = await Promise.all(files.map(readPhoto));
    if (!editableCurrentFinding()) return alert('Akses ditolak');
    draftUpdatePhotos.push(...photos);
    updatePhotoPreview();
  } catch (e) { alert(e.message || 'Gagal memuat gambar.'); }
}
function rmUpdatePhoto(index) {
  if (!editableCurrentFinding()) return alert('Akses ditolak');
  draftUpdatePhotos.splice(index, 1);
  updatePhotoPreview();
}
function es() {
  if (!editableCurrentFinding()) return alert('Akses ditolak');
  const nextStatus = { open: 'diproses', diproses: 'selesai' }[cur.status];
  if (e5.value !== cur.status && e5.value !== nextStatus) return alert('Status temuan hanya dapat bergerak ke tahap berikutnya.');
  if (!findingDateValid(e3.value)) return alert('Tanggal target perbaikan tidak valid.');
  if (e5.value === 'selesai' && !draftUpdatePhotos.length) return alert('Foto perbaikan wajib diisi sebelum temuan ditandai selesai.');
  const changes = [];
  if (cur.perb !== e1.value.trim()) changes.push('Rencana perbaikan diperbarui.');
  if (cur.pic !== e2.value.trim()) changes.push('PIC diperbarui.');
  if ((cur.due || '') !== e3.value) changes.push('Due date diperbarui.');
  if (JSON.stringify(draftUpdatePhotos) !== JSON.stringify(curSnapshot.upds)) changes.push('Foto perbaikan diperbarui.');
  if (cur.status !== e5.value) changes.push(`Status: ${FINDING_STATUS_LABEL[cur.status]} → ${FINDING_STATUS_LABEL[e5.value]}.`);
  if (!changes.length) return alert('Tidak ada perubahan untuk disimpan.');
  const previous = { perb: cur.perb, pic: cur.pic, due: cur.due, upd: cur.upd, upds: cur.upds, status: cur.status, history: [...(cur.history || [])] };
  cur.perb = e1.value.trim(); cur.pic = e2.value.trim(); cur.due = e3.value; cur.status = e5.value;
  cur.upds = draftUpdatePhotos.slice();
  delete cur.upd;
  cur.history = [...(cur.history || []), { by: me().nama, at: new Date().toISOString(), change: changes.join(' ') }];
  if (!TMC.save()) {
    Object.assign(cur, previous);
    return;
  }
  document.getElementById('dg').close(); draftUpdatePhotos = []; TMC.redo();
}
function verifyFinding(id) {
  const record = TMC.get().find(row => row.t.id === id);
  if (!record || record.t.status !== 'selesai' || !canVerifyFinding(me(), record, TMC.data)) return alert('Akses ditolak');
  const previousStatus = record.t.status, previousHistory = [...(record.t.history || [])];
  record.t.status = 'terverifikasi';
  record.t.history = [...previousHistory, { by: me().nama, at: new Date().toISOString(), change: 'Status: Selesai → Terverifikasi.' }];
  if (!TMC.save()) { record.t.status = previousStatus; record.t.history = previousHistory; return }
  TMC.redo();
}
function viewFindingHistory(id) {
  const record = TMC.get().find(row => row.t.id === id);
  if (!record || !canViewData(me(), record.x, 'patrol5r', TMC.data)) return alert('Akses ditolak');
  const dg = document.getElementById('dg') || (() => { document.body.insertAdjacentHTML('beforeend', '<dialog id="dg"></dialog>'); return document.getElementById('dg') })();
  const history = record.t.history || [];
  dg.innerHTML = `<h3>Riwayat Temuan</h3><div class="tw"><table><tr><th>Waktu</th><th>Pengguna</th><th>Perubahan</th></tr>${history.map(findingHistoryRow).join('') || '<tr><td colspan="3">Belum ada riwayat.</td></tr>'}</table></div><div style="margin-top:12px;text-align:right"><button class="btn g" onclick="dg.close()">Tutup</button></div>`;
  dg.showModal();
}
