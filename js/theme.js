// ===== Mode terang / gelap =====
// Dimuat di <head> setiap halaman supaya tema langsung terpasang (tanpa kedip).
(function () {
  var K = 'she_theme', d = document.documentElement;
  var SUN = '<svg class="si" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>';
  var MOON = '<svg class="si" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/></svg>';
  function saved() { try { return localStorage.getItem(K); } catch (e) { return null; } }
  function cur() { return d.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'; }
  function label() { return cur() === 'dark' ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'; }
  function paint() {
    document.querySelectorAll('.theme-btn').forEach(function (b) {
      b.innerHTML = cur() === 'dark' ? SUN : MOON; b.title = label(); b.setAttribute('aria-label', label());
    });
  }
  function apply(t) { d.setAttribute('data-theme', t); paint(); }
  window.toggleTheme = function () {
    var t = cur() === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem(K, t); } catch (e) {}
    apply(t);
  };
  // HTML tombol (dipakai topbar & halaman lain)
  window.themeBtn = function () {
    return '<button type="button" class="btn g s ib theme-btn" onclick="toggleTheme()" title="' + label() + '" aria-label="' + label() + '">' + (cur() === 'dark' ? SUN : MOON) + '</button>';
  };
  // pasang tema awal: pilihan tersimpan, kalau belum ada ikut pengaturan sistem
  var s = saved();
  d.setAttribute('data-theme', s || (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  document.addEventListener('DOMContentLoaded', function () {
    var slot = document.getElementById('themeSlot'); if (slot) slot.innerHTML = themeBtn();   // halaman APAR
    if (document.body.classList.contains('login')) {                                          // halaman login
      document.body.insertAdjacentHTML('beforeend', '<div class="theme-fab">' + themeBtn() + '</div>');
    }
    paint();
  });
  window.addEventListener('storage', function (e) { if (e.key === K && e.newValue) apply(e.newValue); });
})();