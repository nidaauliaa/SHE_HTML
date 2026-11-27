// Nilai standar kolom patroli; Admin dapat mengatur label dan kolom tambahan dari aplikasi.
const PATROL_CORE_FIELD_KEYS = ['dept', 'bag', 'date', 'tim'];
const PATROL_FORM_FIELDS = [
  { key: 'dept', label: 'Departemen', type: 'department', required: true },
  { key: 'bag', label: 'Bagian', type: 'area', required: true },
  { key: 'date', label: 'Tanggal', type: 'date', required: true },
  { key: 'tim', label: 'Tim', type: 'team', required: true }
];
