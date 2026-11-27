SHE New Armada - versi tampilan baru
Jalankan: buka index.html (atau pakai Live Server di VS Code).
Login demo:
Admin 100001 / admin123
Petugas SHE 200001 / user123
Petugas APAR 300001 / apar123
Supervisor PPC 400001 / ppc123
PIC Area IT 500001 / it123
Data aplikasi disimpan melalui js/storage.js agar mudah diganti ke API.
Autentikasi berada di js/auth.js; password demo disimpan sebagai SHA-256, sesi memakai sessionStorage, dan hak akses modul/data berada di js/permissions.js.
Atur akun dengan username dan peran majemuk melalui halaman Manajemen User. Scope APAR diatur untuk Petugas SHE, scope Patrol menentukan area yang dapat diakses dan dipatroli oleh Supervisor, sedangkan scope PIC mengikuti penugasan area.
Kelola nama area, bagian, serta satu PIC per area pada tab Area & PIC di halaman Manajemen User. Area yang sudah dipakai pada riwayat tidak dapat dihapus.
Kolom input Patrol 5R dikelola admin dari tab Kolom Input. Departemen, Bagian, Tanggal, dan Tim selalu wajib; admin dapat mengubah labelnya serta menambah kolom tambahan. Kelola Form digunakan khusus untuk pertanyaan penilaian. Perubahan kolom berlaku untuk patroli baru; nilai kolom pada riwayat lama tetap tersimpan.
Foto temuan mendukung multi-upload; tiap gambar dibatasi 5 MB dan diproses sebelum disimpan.
Inspeksi APAR baru tersedia di menu Inspeksi Baru; tanggal kadaluarsa dan area yang diubah memperbarui data utama APAR, sementara riwayat inspeksi menyimpan snapshot pada saat pemeriksaan.
Data APAR mencakup nomor, area, bagian pemilik, tanggal kadaluarsa, latitude, dan longitude. Form inspeksi dapat memperbarui tanggal/lokasi, menyimpan riwayat perpindahan, dan memperingatkan bila area, koordinat, atau tanggal kadaluarsa berubah.
Peta APAR memakai Leaflet dan OpenStreetMap; APAR perlu koordinat, dan geolokasi memerlukan izin browser serta koneksi internet.
Admin dan Petugas APAR dapat mengelola APAR/inspeksi. Petugas SHE dapat melihat APAR sesuai scope; Supervisor tidak memiliki akses ke modul APAR. Akses ke modul inspeksi tambahan diatur per pengguna pada Manajemen User. Admin memiliki akses ke semua modul; Petugas SHE dapat menginput inspeksi pada modul tambahan yang ditugaskan serta Patrol 5R. Supervisor hanya dapat melihat modul tambahan yang ditugaskan sesuai scope area, dan dapat menginput Patrol 5R pada area scope-nya. Akun lama mempertahankan akses ke modul tambahan yang sudah ada; modul yang dibuat kemudian harus ditugaskan lewat Manajemen User. PIC hanya dapat membuka riwayat Patrol 5R dan temuan pada area yang ditugaskan, serta menjadi satu-satunya peran yang dapat memperbarui temuan di area tersebut.
