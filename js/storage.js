// Adapter penyimpanan lokal; ganti implementasi ini saat backend tersedia.
const SHEStorage = {
    getItem(key) { return localStorage.getItem(key) },
    setItem(key, value) { localStorage.setItem(key, value) },
    removeItem(key) { localStorage.removeItem(key) },
    getJSON(key) {
        const value = this.getItem(key);
        return value == null ? null : JSON.parse(value)
    },
    setJSON(key, value) { this.setItem(key, JSON.stringify(value)) }
};
