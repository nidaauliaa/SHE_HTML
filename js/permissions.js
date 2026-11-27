const ROLE_DEFINITIONS = [
    { id: 'admin', label: 'Admin SHE', description: 'Kelola semua data dan modul.' },
    { id: 'petugas_she', label: 'Petugas SHE', description: 'Menginput inspeksi SHE dan Patrol 5R serta memverifikasi temuan.' },
    { id: 'petugas_apar', label: 'Petugas APAR', description: 'Mengelola data dan inspeksi APAR.' },
    { id: 'supervisor', label: 'Supervisor', description: 'Menginput patroli 5R dan temuan pada area sesuai scope.' },
    { id: 'pic_area', label: 'PIC Area', description: 'Melihat riwayat inspeksi area yang ditugaskan dan memperbarui temuannya.' }
];
const ROLE_LABELS = Object.fromEntries(ROLE_DEFINITIONS.map(role => [role.id, role.label]));
const MODULE_ROLE_ACCESS = {
    peta_apar: ['admin', 'petugas_she', 'petugas_apar'],
    apar: ['petugas_apar', 'petugas_she'],
    inspeksi_apar: ['petugas_apar', 'petugas_she'],
    riwayat_apar: ['petugas_apar', 'petugas_she'],
    laporan_apar: ['petugas_apar', 'petugas_she'],
    itemcheck: ['petugas_apar'],
    vendor: ['petugas_apar'],
    kebutuhan: ['petugas_apar'],
    keuangan: ['petugas_apar'],
    inspeksi_baru_apar: ['petugas_apar'],
    area_apar: [],
    patrol5r: ['petugas_she', 'supervisor', 'pic_area'],
    users: [],
    'form-builder': [],
    area_management: []
};
const CUSTOM_MODULE_ROLES = ['petugas_she', 'supervisor'];

function permissionUser(user, data) {
    const candidate = user || me();
    if (!candidate) return null;
    const db = data || (typeof load === 'function' ? load() : null);
    const stored = db && (db.users || []).find(item => item.nik === candidate.nik);
    const current = stored || candidate;
    return { ...current, roles: normalizeRoles(current), scope: current.scope || {} };
}

function hasRole(user, role, data) {
    const current = permissionUser(user, data);
    return !!current && current.roles.includes(role);
}

function isAdmin() {
    return hasRole(me(), 'admin');
}

function canAccessModule(user, module, data) {
    const current = permissionUser(user, data);
    if (!current) return false;
    if (current.roles.includes('admin')) return true;

    if (Object.prototype.hasOwnProperty.call(MODULE_ROLE_ACCESS, module)) {
        return MODULE_ROLE_ACCESS[module].some(role => current.roles.includes(role));
    }

    const db = data || (typeof load === 'function' ? load() : null);
    const isCustomModule = db && (db.forms || []).some(form => form.id === module);
    const hasModuleAccess = Array.isArray(current.moduleIds) && current.moduleIds.includes(module);
    return !!isCustomModule && hasModuleAccess && CUSTOM_MODULE_ROLES.some(role => current.roles.includes(role));
}

function canManageModule(user, module, data) {
    const current = permissionUser(user, data);
    if (!current) return false;
    if (current.roles.includes('admin')) return true;
    if (['apar', 'apar_master', 'itemcheck', 'vendor', 'kebutuhan', 'keuangan'].includes(module)) {
        return current.roles.includes('petugas_apar');
    }
    if (module === 'patrol5r') return current.roles.includes('petugas_she');
    const db = data || (typeof load === 'function' ? load() : null);
    const isCustomModule = db && (db.forms || []).some(form => form.id === module);
    return !!isCustomModule && current.roles.includes('petugas_she') && canAccessModule(current, module, db);
}

function canViewData(user, item, module, data) {
    const current = permissionUser(user, data);
    if (!current || !item) return false;
    if (current.roles.includes('admin')) return true;

    const scope = current.scope || {};
    const inferredModule = module || (item.bag ? 'patrol5r' : 'apar');
    if (inferredModule === 'apar') {
        if (current.roles.includes('petugas_apar')) return true;
        if (!current.roles.includes('petugas_she')) return false;
        return Array.isArray(scope.aparAreaIds) && scope.aparAreaIds.includes(item.areaId);
    }
    if (inferredModule === 'patrol5r') {
        if (current.roles.includes('petugas_she')) return true;
        const patrolScopes = [
            ...(current.roles.includes('supervisor') && Array.isArray(scope.patrolAreaIds) ? scope.patrolAreaIds : []),
            ...(current.roles.includes('pic_area') && Array.isArray(scope.picAreaIds) ? scope.picAreaIds : [])
        ];
        return patrolScopes.includes(item.bag);
    }
    return false;
}

function canUpdateFinding(user, finding, data) {
    const current = permissionUser(user, data);
    if (!current || !finding) return false;
    const item = finding.x || finding;
    return current.roles.includes('pic_area') && Array.isArray(current.scope.picAreaIds) && current.scope.picAreaIds.includes(item.bag);
}

function canVerifyFinding(user, finding, data) {
    const current = permissionUser(user, data);
    if (!current || !finding) return false;
    return current.roles.some(role => ['admin', 'petugas_she'].includes(role));
}

function guardModule(module) {
    if (canAccessModule(me(), module)) return true;
    alert('Akses ditolak');
    location.href = ROOT + 'launcher.html';
    return false;
}

function guardAdmin() {
    if (isAdmin()) return true;
    alert('Akses ditolak');
    location.href = ROOT + 'launcher.html';
    return false;
}
