# SHE New Armada — Prototype
Buka `index.html` di browser (tanpa server / internet).

| Akun | NIK / Password | Akses |
|---|---|---|
| Admin SHE | 100001 / admin123 | Semua fitur: Kelola Form, edit jadwal, hapus riwayat, buat/edit/hapus modul, Manajemen User |
| Karyawan SHE | 200001 / user123 | Dashboard, input patroli, riwayat (tanpa hapus), temuan, jadwal, ketentuan |

```
index.html            login
launcher.html         landing Apps
css/style.css         tema dasar
css/layout.css        layout & proporsi (dipakai Patrol 5R dan semua modul)
js/icons.js           pustaka 108 ikon SVG (offline) + pemilih ikon (grid, cari, kategori)
js/data.js            Dept > Bagian > Form, template 5R, jadwal
js/store.js           penyimpanan (localStorage), login/role, chart vertikal
js/ui.js              komponen bersama: filter, form skala + temuan, tab Temuan
js/xlsx-lite.js       penulis .xlsx tanpa library (style, merge, foto, grafik)
js/report.js          ekspor harian per departemen: Excel (HASIL TEMUAN) & PDF, popup pilih tanggal+departemen
pages/patrol5r.html   Patrol 5R & K3
pages/module.html     modul buatan sendiri (format sama dgn 5R, + Kelola Form)
pages/form-builder.html  buat modul baru (form masih kosong)
pages/users.html      manajemen user (admin)
```
Data tersimpan di browser (localStorage) — hanya untuk demo.

Catatan: ikon modul disimpan sebagai kunci (mis. `bus`), bukan emoji. Data lama berisi emoji otomatis dipetakan ke ikon yang sesuai.
`pages/apar.html` tetap memakai Tailwind/Font Awesome/Chart.js via CDN (butuh internet).
