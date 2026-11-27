const THEME_KEY = 'she_theme';
const savedTheme = SHEStorage.getItem(THEME_KEY);
document.documentElement.dataset.theme = savedTheme === 'dark' ? 'dark' : 'light';

function themeToggleButton() {
    const dark = document.documentElement.dataset.theme === 'dark';
    return `<button type="button" class="theme-toggle" onclick="toggleTheme()" aria-label="Ganti ke mode ${dark ? 'terang' : 'gelap'}">${dark ? '☀️ Terang' : '🌙 Gelap'}</button>`;
}

function toggleTheme() {
    const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = theme;
    SHEStorage.setItem(THEME_KEY, theme);
    document.querySelectorAll('.theme-toggle').forEach(button => {
        const dark = theme === 'dark';
        button.textContent = dark ? '☀️ Terang' : '🌙 Gelap';
        button.setAttribute('aria-label', `Ganti ke mode ${dark ? 'terang' : 'gelap'}`);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.theme-toggle')) return;
    const aparHeader = document.querySelector('.apar-header > div:last-child');
    if (aparHeader) {
        aparHeader.insertAdjacentHTML('afterbegin', themeToggleButton());
        return;
    }
    document.body.insertAdjacentHTML('beforeend', `<div class="theme-floating">${themeToggleButton()}</div>`);
});
