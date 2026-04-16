/**
 * Flag em memória — zera a cada reload de página.
 * Só é ativada após login explícito via modal.
 */
let _granted = false;

export const grantAdminSession  = () => { _granted = true; };
export const clearAdminSession  = () => { _granted = false; };
export const isAdminSessionGranted = () => _granted;
