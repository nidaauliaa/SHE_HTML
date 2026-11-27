// ===== DATA AWAL (seed): area, template form 5R (Umum/Putty/Fiber/Gudang/Office), form lain =====
const APAR_URL = '#'; // ganti dengan URL web APAR yang sudah ada
const MODULE_ICON_OPTIONS = [
  { value: 'fa-clipboard-list', label: 'Clipboard' }, { value: 'fa-helmet-safety', label: 'Safety' },
  { value: 'fa-truck', label: 'Kendaraan' }, { value: 'fa-recycle', label: 'Daur ulang' },
  { value: 'fa-bolt', label: 'Listrik' }, { value: 'fa-industry', label: 'Industri' },
  { value: 'fa-flask', label: 'Laboratorium' }, { value: 'fa-fire', label: 'Kebakaran' },
  { value: 'fa-road', label: 'Area kerja' }, { value: 'fa-toolbox', label: 'Peralatan' }
];
const LEGACY_MODULE_ICONS = { '📋': 'fa-clipboard-list', '🦺': 'fa-helmet-safety', '🚛': 'fa-truck', '🗑️': 'fa-recycle', '⚡': 'fa-bolt', '🏗️': 'fa-industry', '🧪': 'fa-flask', '🔥': 'fa-fire', '🚧': 'fa-road', '🧰': 'fa-toolbox' };
const moduleIconClass = icon => LEGACY_MODULE_ICONS[icon] || (MODULE_ICON_OPTIONS.some(x => x.value === icon) ? icon : MODULE_ICON_OPTIONS[0].value);
const DEPTS = ['Bus', 'Minibus', 'Bus & Box HD', 'Production Component', 'Office', 'Gudang'], TIMS = ['A', 'B', 'C', 'D'];
const DCOL = { 'Bus': '#1e5bd8', 'Minibus': '#16a679', 'Bus & Box HD': '#f59e0b', 'Production Component': '#8b5cf6', 'Office': '#ec4899', 'Gudang': '#0891b2' };
const STD = [['Body', 'umum'], ['Putty', 'putty'], ['Painting', 'umum'], ['Finishing', 'umum']];
const MAP = {
  'Bus': STD, 'Minibus': STD, 'Bus & Box HD': [...STD, ['Body Bus (Space Frame)', 'umum']],
  'Production Component': [['Fiber', 'fiber'], ['Komponen', 'umum'], ['Vacuum', 'umum'], ['Interior', 'umum']],
  'Office': ['HCGA', 'Purchasing', 'Sales', 'Marketing', 'Finance', 'Accounting'].map(b => [b, 'office']),
  'Gudang': ['1004 Body', '1002 Plat Pipa', '1003 Dempul Cat', '1006 Raw dan Alat', '1001 Sentral', '1005 Elektrik', '1008 Kaca', '1004 Interior Jok'].map(b => [b, 'gudang'])
};
// satu entri = satu Bagian (id dipakai sebagai referensi di semua data)
const AREAS = Object.entries(MAP).flatMap(([d, l]) => l.map(([b, f]) => ({ d, b, f, n: d + ' - ' + b }))).map((a, i) => ({ ...a, id: 'b' + (i + 1) }));
// warna konsisten: dept tetap (DCOL), bagian unik per nama (BNAMES)
const BNAMES = [...new Set(AREAS.map(a => a.b))];
const hue = i => `hsl(${Math.round((i * 137.508) % 360)},62%,${i % 2 ? 44 : 54}%)`;
const bcol = b => hue(BNAMES.indexOf(b));
const R5 = ['RINGKAS', 'RAPI', 'RESIK', 'RAWAT', 'RAJIN', 'K3'];
const K3c = ['Apakah APAR/APAB di area kerja terlihat jelas dan tidak terhalang benda apapun?', 'Apakah pekerja tertib menggunakan APD yang sesuai pekerjaannya dengan baik dan benar?', 'Apakah tempat air minum dalam keadaan bersih dan terawat?'];
const TPL = {
  umum: { name: '5R K3 Umum (Produksi)', g: { RINGKAS: ['Apakah barang di area kerja adalah barang yang dibutuhkan (tidak ada palet bekas, kemasan part, dll)?', 'Apakah barang yang tidak terpakai dipisahkan dan diberi label/tanda?'], RAPI: ['Apakah terdapat penamaan pada masing-masing area produksi?', 'Apakah terdapat tempat untuk menyimpan alat-alat produksi dan sesuai dengan labelnya?', 'Apakah layout / tata letak tempat kerja diberi batas yang jelas?'], RESIK: ['Apakah mesin dan peralatan kerja telah dibersihkan dari sisa-sisa bahan kerja?', 'Apakah lantai, dinding, dan langit-langit telah bersih dari debu dan kotoran?', 'Apakah terdapat alat kebersihan di masing-masing area kerja?'], RAWAT: ['Apakah terdapat penanggung jawab dan jadwal pelaksanaan 3R (Ringkas, Rapi, Resik) pada area kerja?', 'Apakah peralatan dan perlengkapan kebersihan dikondisikan dengan baik?'], RAJIN: ['Apakah papan informasi menyajikan informasi area kerja yang diperbarui secara berkala?', 'Apakah sikap karyawan menunjukkan kebiasaan positif (pakaian rapi dan sopan, menjaga kebersihan, memilah sampah)?'], K3: K3c } },
  putty: { name: '5R K3 Putty', g: { RINGKAS: ['Apakah bahan dan alat kerja yang tidak digunakan tidak berserakan? (Kaleng bekas kemasan putty tidak berserakan; yang sudah tidak digunakan dibuang / diletakkan di tempat sampah)', 'Apakah barang yang tidak terpakai dipisahkan dan diberi label / tanda / keterangan?'], RAPI: ['Apakah terdapat penamaan pada masing-masing area produksi?', 'Apakah terdapat tempat untuk menyimpan alat produksi dan sesuai dengan labelnya?'], RESIK: ['Apakah ada amplas bekas berserakan di lantai area kerja? (Dibuang ke tempat sampah / tempat pengumpulan amplas bekas pakai di setiap line)', 'Apakah terdapat alat kebersihan di area kerja?'], RAWAT: ['Apakah terdapat penanggung jawab dan jadwal pelaksanaan 3R (Ringkas, Rapi, Resik) pada area kerja?', 'Apakah peralatan dan perlengkapan kebersihan dikondisikan dengan baik? (Adanya tempat untuk menyimpan alat kebersihan)'], RAJIN: ['Apakah papan informasi menyajikan informasi area kerja yang diperbarui secara berkala?', 'Apakah sikap karyawan menunjukkan kebiasaan positif? (pakaian rapi dan sopan, menjaga kebersihan area kerjanya, memilah sampah sesuai jenisnya)'], K3: K3c } },
  fiber: { name: '5R K3 Fiber', g: { RINGKAS: ['Apakah barang yang ada di area kerja adalah barang yang dibutuhkan untuk proses kerja?', 'Apakah tidak ada item / peralatan kerja yang rusak dibiarkan begitu saja di area kerja?', 'Apakah barang yang tidak terpakai (moulding, produk fiber yang tidak terpakai) dipisahkan dan diberi label/tanda keterangan?'], RAPI: ['Apakah terdapat penamaan pada masing-masing area produksi?', 'Apakah terdapat tempat untuk menyimpan alat produksi dan sesuai dengan labelnya?', 'Apakah layout / tata letak tempat kerja diberi batas yang jelas?'], RESIK: ['Apakah amplas bekas, kuas, dan kain majun tidak berserakan di lantai area kerja (dibuang ke tempat sampah / tempat pengumpulan material bekas pakai)?', 'Apakah terdapat alat kebersihan di semua line area kerja?'], RAWAT: ['Apakah terdapat penanggung jawab dan jadwal kebersihan 3R (Ringkas, Rapi, Resik) pada area kerja?', 'Apakah sarana alat kebersihan terkondisikan dengan baik serta terdapat alokasi untuk penyimpanan di area kerja?'], RAJIN: ['Apakah papan informasi (Activity Board) menyajikan informasi area kerja yang diperbarui secara berkala?', 'Apakah sikap kerja personil menunjukkan kebiasaan positif? (pembuangan aval tidak tercampur)'], K3: ['Apakah lokasi APAR dan APAB terlihat jelas dan tidak terhalang benda apapun?', 'Apakah pekerja tertib menggunakan APD dengan baik dan benar?', 'Apakah tempat air minum dalam keadaan bersih dan terawat?'] } },
  gudang: { name: '5R K3 Gudang', g: { RINGKAS: ['Apakah terdapat prosedur penanganan material dead stock atau rusak?', 'Apakah palet dan kemasan bekas yang tidak terpakai disingkirkan?'], RAPI: ['Apakah kabel / instalasi listrik tidak ada yang melintang di jalur pejalan kaki?', 'Apakah soket listrik jauh dari area air menggenang?', 'Apakah ketersediaan rak material mencukupi (tidak overload)?', 'Apakah terdapat penamaan bahan/material sesuai jenisnya (labeling)?', 'Apakah tidak ada barang yang menutupi akses jalan?'], RESIK: ['Apakah debu dan sarang laba-laba telah dibersihkan?', 'Apakah terdapat alat kebersihan di area kerja?'], RAWAT: ['Apakah tidak ada kerusakan pada kabel / instalasi listrik?', 'Apakah terdapat prosedur pengendalian hama?'], RAJIN: ['Apakah papan informasi menyajikan informasi area kerja yang diperbarui secara berkala?'], K3: ['Apakah lokasi APAR terlihat jelas dan tidak terhalang benda apapun?', 'Apakah terdapat Spill Kit B3 (alat penanganan tumpahan B3)?', 'Apakah terdapat kotak P3K yang dirawat dengan baik?'] } },
  office: { name: '5R K3 Office', g: { RINGKAS: ['Apakah barang/dokumen yang berada di area kerja merupakan barang/dokumen yang masih diperlukan?', 'Apakah barang/dokumen yang tidak diperlukan telah dipisahkan dan ditempatkan pada tempat yang sesuai?'], RAPI: ['Apakah dokumen, alat tulis, dan perlengkapan kerja memiliki tempat penyimpanan yang jelas dan tertata?', 'Apakah meja kerja, lemari, rak, dan area kerja tertata sesuai dengan fungsinya?'], RESIK: ['Apakah meja, lantai, lemari, rak, dan peralatan kerja dalam keadaan bersih dari debu dan kotoran?', 'Apakah sampah pada area kerja telah dibuang pada tempat yang sesuai dan tidak berserakan?'], RAWAT: ['Apakah terdapat penanggung jawab dan jadwal Pelaksanaan 3R (Ringkas, Rapi, Resik) pada area kerja?', 'Apakah peralatan dan perlengkapan kebersihan dikondisikan dengan baik?'], RAJIN: ['Apakah papan informasi menyajikan informasi area kerja yang masih relevan dan diperbarui secara berkala?', 'Apakah sikap karyawan menunjukkan kebiasaan menjaga kerapian dan kebersihan area kerja?'], K3: ['Apakah APAR/APAB di area office terlihat jelas, mudah diakses, dan tidak terhalang?', 'Apakah jalur akses dan jalur evakuasi di area office bebas dari hambatan?', 'Apakah tempat air minum dalam keadaan bersih dan terawat?'] } }
};
const TPL0 = JSON.parse(JSON.stringify(TPL)); // salinan standar (untuk tombol 'Kembalikan ke standar')
const itemsOf = k => Object.entries(TPL[k].g).flatMap(([r, a]) => a.map((t, i) => ({ id: r + i, r, t })));
// ---- Ketentuan penilaian
const mean = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : null;
const nCount = n => n <= 2 ? 5 : n <= 6 ? 4 : n <= 10 ? 3 : n <= 15 ? 2 : 1;
const nPct = p => p >= 100 ? 5 : p >= 75 ? 4 : p >= 50 ? 3 : p >= 30 ? 2 : 1;
function nilaiItem(r, i) { if (!i) return null; if (r === 'RINGKAS') return i.n === '' || i.n == null ? null : nCount(+i.n); if (!(+i.d > 0) || i.s === '' || i.s == null) return null; return nPct(Math.min(100, i.s / i.d * 100)) }
const kat = v => { v = Math.round(v * 10) / 10; return v >= 4.5 ? 'Sangat Baik' : v >= 3.5 ? 'Baik' : v >= 2.5 ? 'Cukup' : v >= 1.5 ? 'Kurang' : 'Sangat Kurang' };
const ph = t => 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260"><rect width="100%" height="100%" fill="#dbe4f3"/><text x="50%" y="50%" text-anchor="middle" font-family="Arial" font-size="16" fill="#5a6b85">[foto demo] ${t}</text></svg>`);
function seedP5() {
  const tg = { 'Bus': 3.3, 'Minibus': 3.3, 'Bus & Box HD': 3.3, 'Production Component': 3.7, 'Office': 3.6, 'Gudang': 3.2 }, out = []; let k = 0;
  ['2026-08', '2026-09'].forEach((m, mi) => AREAS.forEach((a, ai) => {
    const sc = {}; R5.forEach(r => sc[r] = TPL[a.f].g[r].map(() => Math.max(1, Math.min(5, Math.round(tg[a.d] + (Math.random() * 2.6 - 1.3) - (mi ? 0 : .2))))));
    const tm = [], bad = R5.find(r => mean(sc[r]) <= 3);
    if (bad) { const c = Math.random() < .55; tm.push({ id: 't' + k, r: bad, q: TPL[a.f].g[bad][0], ket: 'Temuan demo di ' + a.n, perb: 'Perapihan dan pelabelan ulang', pic: 'SPV ' + a.b, due: m + '-20', foto: ph(a.n), upd: c ? ph('Sesudah perbaikan') : null, status: c ? 'closed' : 'open' }) }
    out.push({ id: 'p' + (k++), date: m + '-' + String(3 + DEPTS.indexOf(a.d) * 3).padStart(2, '0'), bag: a.id, form: a.f, tim: TIMS[ai % 4], by: 'Admin SHE', sc, tm })
  })); return out
}
// Jadwal patroli tahunan (dari gambar). Format baris: [nama A, jab A, nama B, jab B, ...]
const JR = [['Tri Putra Irwan S', 'Body Mini Bus', 'Yohanes Anang P', 'Finishing Bus', 'Agus Santoso', 'Finishing Minibus', 'Tugino', 'Tecknical Data Management'],
['Mahmud Lathoif', 'Body Box', 'Thomas Febriamarta A B', 'Vaum Forming & Furnitur', 'Praptono', 'Product Engineering', 'Eko Setijono', 'Security'],
['M Nur Salam', 'Componen', 'Eko Ari Wibowo', 'Facilities', 'Rudi Hartanto', 'Logistik', 'Sigit Listiyo', 'Maintenance'],
['Muhamad Ghozi', 'Product Development', 'Ika Rahmawati', 'Iventory', 'Galih Purbo Utomo', 'Fiber', 'Antonius MP Sirait', 'Quality Control'],
['Iwan Susanto', 'Seat, Foam, Int', 'A Agus Purwanta', 'Body Bus', 'Kuncoro Jati', 'Maintenance', 'Choiril Anam', 'Putty Minibus'],
['Khusen Mahmud', 'PPID', 'Ahmad Ridho Nurohman', 'Quality Assurance', 'Muhammad Raihan AR Razi', 'Building', 'Tri Handoko', 'Painting Minibus'],
Array(4).fill(['Aditya Saputra', 'SHE']).flat()];
const JAD = JR.map(r => Object.fromEntries(TIMS.map((t, i) => [t, { n: r[i * 2], j: 'SPV. ' + r[i * 2 + 1] }])));
const SEED = {
  users: [
    { nik: '100001', passwordHash: 'sha256$240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', nama: 'Admin SHE', roles: ['admin'], role: 'admin', scope: { aparAreaIds: [], patrolAreaIds: [], picAreaIds: [] } },
    { nik: '200001', passwordHash: 'sha256$e606e38b0d8c19b24cf0ee3808183162ea7cd63ff7912dbb22b5e803286b4446', nama: 'Petugas SHE', roles: ['petugas_she'], role: 'petugas_she', scope: { aparAreaIds: [], patrolAreaIds: [], picAreaIds: [] } },
    { nik: '300001', passwordHash: 'sha256$76f010b58a264236acefe5ffc971654d1f5f76fa0449b71e61e05356efb88020', nama: 'Petugas APAR', roles: ['petugas_apar'], role: 'petugas_apar', divisi: 'APAR', scope: { aparAreaIds: [], patrolAreaIds: [], picAreaIds: [] } },
    { nik: '400001', passwordHash: 'sha256$22d66a8ed2c59b2b98ee1a86713ac52c1c1e530e88343604c5ff0d71f29ed662', nama: 'Supervisor PPC', roles: ['supervisor'], role: 'supervisor', divisi: 'PPC', scope: { aparAreaIds: [], patrolAreaIds: [], picAreaIds: [] } },
    { nik: '500001', passwordHash: 'sha256$37a3406d73c0f39e73a19006e2c687863760a65f10d97147d490852280a4b621', nama: 'PIC Area IT', roles: ['pic_area'], role: 'pic_area', divisi: 'IT', scope: { aparAreaIds: [], patrolAreaIds: [], picAreaIds: [] } }
  ], tpl: {}, v: 6,
  forms: [
    { id: 'f_apd', name: 'Inspeksi APD', icon: 'fa-helmet-safety', color: '#e8a03a', scale: 'ng', threshold: 3, tree: [{ id: 'n1', t: 'Kepala & Wajah', ch: [{ id: 'n2', t: 'Helm safety dipakai dengan benar' }, { id: 'n3', t: 'Kacamata / face shield di area grinding' }, { id: 'n4', t: 'Masker / respirator di area painting' }] }, { id: 'n5', t: 'Tangan & Kaki', ch: [{ id: 'n6', t: 'Sarung tangan sesuai pekerjaan' }, { id: 'n7', t: 'Sepatu safety sesuai standar' }] }] },
    { id: 'f_veh', name: 'Inspeksi Kendaraan', icon: 'fa-truck', color: '#16a679', scale: '5', threshold: 3, tree: [{ id: 'n1', t: 'Kondisi Fisik', ch: [{ id: 'n2', t: 'Kondisi ban & tekanan angin' }, { id: 'n3', t: 'Lampu, sein, dan klakson berfungsi' }, { id: 'n4', t: 'Rem berfungsi baik' }] }, { id: 'n5', t: 'Kelengkapan', ch: [{ id: 'n6', t: 'APAR tersedia di kendaraan' }, { id: 'n7', t: 'SIM/SIO operator berlaku' }] }] }],
  inspections: [], p5: seedP5(), jadwal: { '2026': JAD }
};
